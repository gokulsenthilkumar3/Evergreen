# Implementation Plan: Quality Management Module

## Goal Description

Implement a comprehensive Quality Management Module that enables textile manufacturers to track quality metrics throughout the production process. This module will:

1. **Quality Inspection System**: Structured inspection workflows with checklists
2. **Test Tracking**: Lab test results and quality certificates
3. **Defect Management**: Categorize, track, and analyze defects
4. **Quality Analytics**: Dashboards and reports for quality trends

This feature is critical for attracting enterprise customers who require strict quality control and compliance.

---

## User Review Required

> [!IMPORTANT]
> **Quality Standards**
> - Should we support industry-standard quality frameworks (ISO 9001, Six Sigma)?
> - Do you need integration with external lab testing systems?
> - Should quality certificates be digitally signed?

> [!WARNING]
> **Data Volume Considerations**
> - Quality inspections can generate large amounts of data (photos, test results)
> - May require object storage (MinIO/S3) for inspection photos
> - Consider data retention policies for old inspection records

---

## Proposed Changes

### Component 1: Database Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/api/prisma/schema.prisma)

**Add Quality Management Models**:

```prisma
model QualityInspection {
  id                String              @id @default(uuid())
  inspectionNumber  String              @unique
  entityType        InspectionEntity    // RAW_MATERIAL, PRODUCTION_BATCH, FINISHED_GOOD
  entityId          String
  inspectorId       String?
  inspectionDate    DateTime            @default(now())
  status            InspectionStatus    @default(PENDING)
  overallResult     InspectionResult?
  notes             String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  inspector         User?               @relation(fields: [inspectorId], references: [id])
  checklistItems    QualityChecklistItem[]
  testResults       QualityTestResult[]
  defects           QualityDefect[]
  
  @@index([entityType, entityId])
  @@index([inspectionDate])
  @@index([status])
}

model QualityChecklistItem {
  id            String            @id @default(uuid())
  inspectionId  String
  parameter     String
  specification String?
  actualValue   String?
  result        CheckResult       @default(PENDING)
  remarks       String?
  
  inspection    QualityInspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  @@index([inspectionId])
}

model QualityTestResult {
  id            String            @id @default(uuid())
  inspectionId  String
  testName      String
  testMethod    String?
  parameter     String
  unit          String?
  expectedValue String?
  actualValue   String
  result        CheckResult
  testedBy      String?
  testedAt      DateTime          @default(now())
  certificateUrl String?
  
  inspection    QualityInspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  @@index([inspectionId])
}

model QualityDefect {
  id              String            @id @default(uuid())
  inspectionId    String
  defectType      String
  severity        DefectSeverity
  description     String
  location        String?
  quantity        Decimal?          @db.Decimal(10, 2)
  photoUrls       String[]
  rootCause       String?
  correctiveAction String?
  status          DefectStatus      @default(OPEN)
  resolvedAt      DateTime?
  
  inspection      QualityInspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  @@index([inspectionId])
  @@index([status])
  @@index([severity])
}

model QualityTemplate {
  id          String   @id @default(uuid())
  name        String
  entityType  InspectionEntity
  parameters  Json     // Array of {parameter, specification, required}
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([entityType])
}

enum InspectionEntity {
  RAW_MATERIAL
  PRODUCTION_BATCH
  FINISHED_GOOD
}

enum InspectionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum InspectionResult {
  PASSED
  FAILED
  CONDITIONAL
}

enum CheckResult {
  PENDING
  PASS
  FAIL
  NA
}

enum DefectSeverity {
  CRITICAL
  MAJOR
  MINOR
}

enum DefectStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

**Update Existing Models**:
```prisma
model User {
  // ... existing fields
  qualityInspections QualityInspection[]
}

model RawMaterial {
  // ... existing fields
  lastQualityScore   Decimal?  @db.Decimal(4, 2)
  lastInspectionDate DateTime?
}

model ProductionBatch {
  // ... existing fields
  qualityScore       Decimal?  @db.Decimal(4, 2)
}

model FinishedGood {
  // ... existing fields
  qualityInspectionId String?
}
```

---

### Component 2: Backend Services

#### [NEW] [quality.service.ts](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/api/src/modules/quality/quality.service.ts)

**Core Functions**:

```typescript
// Inspection Management
export async function createInspection(data: CreateInspectionDto)
export async function getInspection(id: string)
export async function updateInspection(id: string, data: UpdateInspectionDto)
export async function listInspections(filters: InspectionFilters)
export async function completeInspection(id: string, result: InspectionResult)

// Template Management
export async function createTemplate(data: CreateTemplateDto)
export async function getTemplates(entityType?: InspectionEntity)
export async function applyTemplate(inspectionId: string, templateId: string)

// Test Results
export async function addTestResult(inspectionId: string, data: TestResultDto)
export async function updateTestResult(id: string, data: UpdateTestResultDto)
export async function uploadCertificate(testResultId: string, file: File)

// Defect Management
export async function addDefect(inspectionId: string, data: DefectDto)
export async function updateDefect(id: string, data: UpdateDefectDto)
export async function resolveDefect(id: string, resolution: string)
export async function uploadDefectPhotos(defectId: string, files: File[])

// Analytics
export async function getQualityMetrics(filters: MetricsFilters)
export async function getDefectAnalysis(filters: AnalysisFilters)
export async function getSupplierQualityComparison()
export async function getQualityTrends(period: 'week' | 'month' | 'year')
```

**Quality Score Calculation**:
```typescript
function calculateQualityScore(inspection: QualityInspection): number {
  const checklistScore = calculateChecklistScore(inspection.checklistItems);
  const testScore = calculateTestScore(inspection.testResults);
  const defectPenalty = calculateDefectPenalty(inspection.defects);
  
  return Math.max(0, (checklistScore * 0.4 + testScore * 0.4) - defectPenalty);
}
```

---

#### [NEW] [quality.routes.ts](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/api/src/modules/quality/quality.routes.ts)

**API Endpoints**:

```typescript
// Inspections
GET    /api/quality/inspections
POST   /api/quality/inspections
GET    /api/quality/inspections/:id
PATCH  /api/quality/inspections/:id
DELETE /api/quality/inspections/:id
POST   /api/quality/inspections/:id/complete

// Checklist Items
POST   /api/quality/inspections/:id/checklist
PATCH  /api/quality/checklist-items/:id
DELETE /api/quality/checklist-items/:id

// Test Results
POST   /api/quality/inspections/:id/tests
PATCH  /api/quality/test-results/:id
POST   /api/quality/test-results/:id/certificate
DELETE /api/quality/test-results/:id

// Defects
POST   /api/quality/inspections/:id/defects
PATCH  /api/quality/defects/:id
POST   /api/quality/defects/:id/resolve
POST   /api/quality/defects/:id/photos
DELETE /api/quality/defects/:id

// Templates
GET    /api/quality/templates
POST   /api/quality/templates
GET    /api/quality/templates/:id
PATCH  /api/quality/templates/:id
DELETE /api/quality/templates/:id
POST   /api/quality/inspections/:id/apply-template

// Analytics
GET    /api/quality/metrics
GET    /api/quality/defect-analysis
GET    /api/quality/supplier-comparison
GET    /api/quality/trends
```

---

### Component 3: Frontend Pages

#### [NEW] [QualityInspectionPage.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/pages/QualityInspectionPage.tsx)

**Purpose**: Main quality inspection management page.

**Layout**:
- Header with "New Inspection" button
- Filter bar (entity type, status, date range)
- Inspection list table
- Pagination

**Table Columns**:
- Inspection Number
- Entity Type & ID
- Inspector
- Date
- Status
- Result
- Actions (View, Edit, Delete)

---

#### [NEW] [InspectionDetailPage.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/pages/InspectionDetailPage.tsx)

**Purpose**: Detailed inspection view and editing.

**Sections**:
1. **Header**: Inspection number, status, result
2. **Entity Information**: Link to raw material/batch/finished good
3. **Checklist**: Table of parameters with pass/fail
4. **Test Results**: Lab test results with certificates
5. **Defects**: List of identified defects with photos
6. **Actions**: Complete inspection, print report

---

#### [NEW] [QualityAnalyticsPage.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/pages/QualityAnalyticsPage.tsx)

**Purpose**: Quality metrics and analytics dashboard.

**Widgets**:
1. **Quality Score Trend**: Line chart over time
2. **Pass/Fail Distribution**: Pie chart
3. **Defect Analysis**: Bar chart by type and severity
4. **Supplier Quality Comparison**: Horizontal bar chart
5. **Top Defects**: Table with counts
6. **Quality by Stage**: Heatmap

---

### Component 4: Frontend Components

#### [NEW] [InspectionForm.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/quality/InspectionForm.tsx)

**Purpose**: Create/edit inspection form.

**Fields**:
- Entity Type (dropdown)
- Entity Selection (autocomplete)
- Inspector (user dropdown)
- Inspection Date (date picker)
- Template (optional, applies checklist)
- Notes (textarea)

**Features**:
- Template application
- Dynamic checklist loading
- Validation
- Auto-save draft

---

#### [NEW] [ChecklistTable.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/quality/ChecklistTable.tsx)

**Purpose**: Editable checklist table.

**Columns**:
- Parameter
- Specification
- Actual Value (editable)
- Result (Pass/Fail/NA dropdown)
- Remarks (editable)
- Actions

**Features**:
- Inline editing
- Auto-save on blur
- Color-coded results
- Add/remove items

---

#### [NEW] [DefectCard.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/quality/DefectCard.tsx)

**Purpose**: Display and manage defects.

**Content**:
- Defect type and severity badge
- Description
- Photo gallery
- Root cause
- Corrective action
- Status and resolution

**Actions**:
- Edit defect
- Upload photos
- Mark as resolved
- Delete

---

#### [NEW] [QualityScoreIndicator.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/quality/QualityScoreIndicator.tsx)

**Purpose**: Visual quality score display.

**Design**:
- Circular progress indicator
- Color-coded (green >80, yellow 60-80, red <60)
- Score number in center
- Trend arrow (up/down)

---

### Component 5: Integration Points

#### [MODIFY] [RawMaterialForm.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/RawMaterialForm.tsx)

**Add**:
- "Create Quality Inspection" button
- Display last quality score
- Link to inspection history

---

#### [MODIFY] [ProductionBatchDetail.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/ProductionBatchDetail.tsx)

**Add**:
- Quality inspection tab
- Stage-wise quality scores
- Defect summary

---

#### [MODIFY] [SupplierPerformance.tsx](file:///c:/Users/gokul/Downloads/Yarn%20Management/Yarn-Management/apps/web/src/components/SupplierPerformance.tsx)

**Add**:
- Average quality score
- Quality trend chart
- Defect rate

---

## Verification Plan

### Automated Tests

#### Backend Tests

**File**: `apps/api/src/modules/quality/__tests__/quality.service.test.ts`

**Test Cases**:
```typescript
describe('Quality Service', () => {
  test('creates inspection with checklist', async () => {
    const inspection = await createInspection({
      entityType: 'RAW_MATERIAL',
      entityId: 'test-id',
      checklistItems: [...]
    });
    expect(inspection.checklistItems).toHaveLength(3);
  });
  
  test('calculates quality score correctly', () => {
    const score = calculateQualityScore(mockInspection);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
  
  test('applies template to inspection', async () => {
    const inspection = await applyTemplate(inspectionId, templateId);
    expect(inspection.checklistItems).toBeDefined();
  });
});
```

**Run Command**: `cd apps/api && npm test -- quality.service.test.ts`

---

#### Frontend Tests

**File**: `apps/web/src/components/quality/__tests__/InspectionForm.test.tsx`

**Test Cases**:
```typescript
describe('InspectionForm', () => {
  test('renders form fields', () => {
    render(<InspectionForm />);
    expect(screen.getByLabelText('Entity Type')).toBeInTheDocument();
  });
  
  test('applies template on selection', async () => {
    render(<InspectionForm />);
    const templateSelect = screen.getByLabelText('Template');
    await userEvent.selectOptions(templateSelect, 'template-1');
    expect(screen.getByText('Parameter 1')).toBeInTheDocument();
  });
});
```

**Run Command**: `cd apps/web && npm test -- InspectionForm.test.tsx`

---

### Manual Verification

#### 1. Create Quality Inspection

**Steps**:
1. Navigate to `/quality/inspections`
2. Click "New Inspection" button
3. Select "Raw Material" as entity type
4. Select a raw material from dropdown
5. Select a template (if available)
6. Verify checklist items populate
7. Fill in actual values for each parameter
8. Mark results as Pass/Fail
9. Add a test result with certificate upload
10. Add a defect with photo upload
11. Click "Save"
12. Verify inspection appears in list

**Expected Results**:
- Form validates required fields
- Template applies correctly
- File uploads work
- Inspection saves successfully
- Quality score calculates automatically

---

#### 2. Complete Inspection Workflow

**Steps**:
1. Open a pending inspection
2. Complete all checklist items
3. Add at least one test result
4. Upload a certificate PDF
5. Add a defect with severity "Major"
6. Upload 2 defect photos
7. Click "Complete Inspection"
8. Select overall result "Conditional"
9. Verify status changes to "Completed"
10. Check that quality score updated on entity

**Expected Results**:
- All sections can be completed
- Files upload successfully
- Completion triggers score calculation
- Entity (raw material/batch) shows updated score
- Cannot edit completed inspection

---

#### 3. Quality Analytics Dashboard

**Steps**:
1. Navigate to `/quality/analytics`
2. Verify all widgets load
3. Check quality score trend chart
4. Verify data matches inspections
5. Click on a defect type in chart
6. Verify drill-down to defect list
7. Change date range filter
8. Verify charts update
9. Export quality report to PDF

**Expected Results**:
- All charts render correctly
- Data is accurate
- Filters work
- Drill-down navigation works
- Export generates PDF

---

#### 4. Integration with Raw Materials

**Steps**:
1. Go to Raw Materials page
2. Open a raw material detail
3. Verify quality score displays
4. Click "Create Inspection" button
5. Verify inspection form pre-fills entity
6. Complete and save inspection
7. Return to raw material
8. Verify quality score updated
9. Click "Inspection History"
10. Verify all inspections listed

**Expected Results**:
- Quality score visible on raw material
- Quick inspection creation works
- Score updates in real-time
- History shows all inspections
- Can navigate to inspection details

---

### Performance Testing

**Metrics**:
1. Inspection list page load: <2 seconds (100 records)
2. Inspection detail load: <1 second
3. Photo upload: <3 seconds per photo (5MB)
4. Quality score calculation: <100ms
5. Analytics dashboard load: <3 seconds

**Load Testing**:
- Create 1000 inspections
- Verify list pagination works
- Verify search/filter performance
- Check database query performance

---

## Migration Steps

### 1. Database Migration

```bash
cd apps/api
npx prisma migrate dev --name add-quality-management
npx prisma generate
```

### 2. Seed Quality Templates

**File**: `apps/api/prisma/seed-quality-templates.ts`

```typescript
const templates = [
  {
    name: 'Raw Material - Cotton',
    entityType: 'RAW_MATERIAL',
    parameters: [
      { parameter: 'Moisture Content', specification: '<8%', required: true },
      { parameter: 'Trash Content', specification: '<2%', required: true },
      { parameter: 'Fiber Length', specification: '28-32mm', required: true },
      { parameter: 'Color', specification: 'White/Cream', required: true },
    ]
  },
  // ... more templates
];

await prisma.qualityTemplate.createMany({ data: templates });
```

**Run**: `npx tsx prisma/seed-quality-templates.ts`

### 3. Install Dependencies

```bash
cd apps/web
npm install react-image-gallery @mui/x-date-pickers
```

### 4. Update Routes

**File**: `apps/web/src/App.tsx`

```typescript
<Route path="/quality/inspections" element={<QualityInspectionPage />} />
<Route path="/quality/inspections/:id" element={<InspectionDetailPage />} />
<Route path="/quality/analytics" element={<QualityAnalyticsPage />} />
```

---

## Success Criteria

- [ ] Can create quality inspections for all entity types
- [ ] Templates apply correctly and speed up data entry
- [ ] Quality scores calculate accurately
- [ ] Defect photos upload and display
- [ ] Quality analytics dashboard shows meaningful insights
- [ ] Integration with raw materials/batches works seamlessly
- [ ] All manual tests pass
- [ ] Performance metrics met
- [ ] Code coverage >80%
