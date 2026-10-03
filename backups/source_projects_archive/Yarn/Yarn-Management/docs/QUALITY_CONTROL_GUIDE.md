# Quality Control System Documentation

## Overview
The Quality Control (QC) System in the Yarn Management System provides a comprehensive framework for managing inspections, tests, and defects throughout the production lifecycle.

## 1. Inspection Workflow
1. **Creation**: Navigate to Quality Control > Inspections. Click "New Inspection".
2. **Template Selection**: Select a pre-defined Inspection Template (e.g., Raw Material Incoming).
3. **Inspector Assignment**: Assign the inspection to an active user.
4. **Execution**: Fill out the checklist items (Pass/Fail) and upload photos if necessary.
5. **Results**:
   - **PASS**: If the entity is a Raw Material in `QUALITY_CHECK` status, it auto-updates to `IN_STOCK`.
   - **FAIL**: A notification is triggered to all active users.

## 2. Quality Testing & Scoring
1. **Tests**: Located under the "Quality Tests" tab. Used for physical/chemical parameters.
2. **Automated Scoring**:
   - Scores are calculated based on weighted test parameters.
   - Grades are assigned automatically: A (≥90), B (≥80), C (≥70), D (≥60), F (<60).
3. **Module Propagation**:
   - Raw Material `qualityScore` is updated automatically.
   - Production Batch `qualityScore` and `qualityGrade` are updated automatically.
4. **Alerts**: Scores below 70 trigger a Quality Alert notification.

## 3. Defect Management
1. **Logging**: Tab "Defect Logs". Click "Log Defect".
2. **Severity**: Minor, Major, or Critical.
3. **Notifications**: Major and Critical defects trigger immediate system-wide alerts.
4. **Corrective Action**: Track root cause and preventive measures within the defect log.

## 4. Template Management
- Create reusable templates for consistent inspection standards.
- Define mandatory checklist items and parameter weights.
- Activate/Deactivate templates to control their visibility in forms.

## 5. API Reference
- `GET /api/quality-control/inspections`: List all inspections.
- `POST /api/quality-control/tests`: Create a new quality test.
- `GET /api/quality-control/analytics/overview`: Get QC metrics summary.
- `GET /api/quality-control/defects/analytics`: Get defect trend analysis.
