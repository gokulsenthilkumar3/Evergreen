import bcrypt from 'bcryptjs';
import { PrismaClient, InspectionEntity, InspectionStatus, InspectionResult, DefectSeverity, ActionStatus } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function upsertPermission(code: string, name: string) {
  return prisma.permission.upsert({
    where: { code },
    update: { name },
    create: { code, name },
    select: { id: true, code: true },
  });
}

async function upsertRole(code: string, name: string) {
  return prisma.role.upsert({
    where: { code },
    update: { name },
    create: { code, name },
    select: { id: true, code: true },
  });
}

async function main() {
  // 1. Roles & Permissions
  const permissions = [
    await upsertPermission('users.read', 'Read users'),
    await upsertPermission('users.create', 'Create users'),
    await upsertPermission('users.update', 'Update users'),
    await upsertPermission('users.delete', 'Delete users'),
    await upsertPermission('suppliers.read', 'Read suppliers'),
    await upsertPermission('suppliers.create', 'Create suppliers'),
    await upsertPermission('suppliers.update', 'Update suppliers'),
    await upsertPermission('suppliers.delete', 'Delete suppliers'),
    await upsertPermission('raw-materials.create', 'Create and import raw materials'),
  ];

  const adminRole = await upsertRole('ADMIN', 'Administrator');

  for (const p of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    });
  }

  // Create other roles
  await upsertRole('MANAGER', 'Manager');
  await upsertRole('USER', 'Standard User');
  await upsertRole('VIEWER', 'Read-Only Viewer');

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { passwordHash, status: 'ACTIVE' },
    create: {
      email: env.ADMIN_EMAIL,
      passwordHash,
      status: 'ACTIVE',
      roles: {
        create: [{ roleId: adminRole.id }],
      },
    },
    select: { id: true, email: true },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log('--- Seeding Master Data ---');

  // 2. Suppliers
  const suppliersData = [
    { name: 'Global Cotton Co', code: 'SUP-001', type: 'Raw Material', city: 'Mumbai' },
    { name: 'Silk Road Traders', code: 'SUP-002', type: 'Raw Material', city: 'Bangalore' },
    { name: 'PolySynth Ltd', code: 'SUP-003', type: 'Raw Material', city: 'Surat' },
    { name: 'Coimbatore Yarns', code: 'SUP-004', type: 'Raw Material', city: 'Coimbatore' },
    { name: 'Tirupur Dyes', code: 'SUP-005', type: 'Chemicals', city: 'Tirupur' },
  ];

  const suppliers = [];
  for (const s of suppliersData) {
    console.log(`Seeding Supplier: ${s.name}`); // ADDED LOG
    const supplier = await prisma.supplier.upsert({
      where: { supplierCode: s.code },
      update: {},
      create: {
        name: s.name,
        supplierCode: s.code,
        supplierType: s.type,
        businessType: 'Manufacturer',
        billingCity: s.city,
        email: `contact@${s.code.toLowerCase()}.com`.replace('-', ''),
        phone: '9876543210'
      }
    });
    suppliers.push(supplier);
  }

  // 3. Raw Materials (Spread across last 7 months)
  const materialTypes = ['Cotton Bale', 'Silk Yarn', 'Polyester Fiber', 'Viscose', 'Linen'];
  const grades = ['Premium', 'Standard', 'Grade A', 'Grade B'];
  const locations = ['Warehouse A', 'Warehouse B', 'Zone 1', 'Zone 2'];

  const rawMaterials = [];

  // Helper to get date X months ago
  const getDate = (monthsAgo: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    return d;
  };

  for (let i = 0; i < 20; i++) {
    const monthsAgo = i % 7;
    const supplier = suppliers[i % suppliers.length];

    // Check if exists to avoid unique constraint error on re-seed
    const batchNo = `RM-${202400 + i}`;
    const existing = await prisma.rawMaterial.findUnique({ where: { batchNo } });

    if (!existing) {
      const qty = 500 + Math.random() * 4500;
      const price = 100 + Math.random() * 400;

      const rm = await prisma.rawMaterial.create({
        data: {
          batchNo,
          supplierId: supplier.id,
          materialType: materialTypes[i % materialTypes.length],
          quantity: qty.toFixed(2),
          costPerUnit: price.toFixed(2),
          totalCost: (qty * price).toFixed(2),
          qualityScore: (8 + Math.random() * 2).toFixed(2),
          receivedDate: getDate(monthsAgo),
          legacyLocation: locations[i % locations.length],
          status: 'IN_STOCK',
        }
      });
      rawMaterials.push(rm);
    }
  }

  // 4. Production Batches, Wastage & Finished Goods
  // We need to fetch all RM again to be sure
  const allRMs = await prisma.rawMaterial.findMany();

  for (let i = 0; i < 50; i++) {
    const rm = allRMs[i % allRMs.length];
    const statusIdx = i % 3; // 0: PENDING, 1: IN_PROGRESS, 2: COMPLETED
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const currentStatus = statuses[statusIdx];

    const batchNum = `B-${1000 + i}`;
    const existingBatch = await prisma.productionBatch.findUnique({ where: { batchNumber: batchNum } });

    if (!existingBatch) {
      const batch = await prisma.productionBatch.create({
        data: {
          batchNumber: batchNum,
          rawMaterialId: rm.id,
          inputQuantity: 100 + Math.random() * 400,
          status: currentStatus as any,
          currentStage: currentStatus === 'COMPLETED' ? 'COMPLETED' : 'SPINNING',
          startDate: getDate(1),
          endDate: currentStatus === 'COMPLETED' ? new Date() : null,
        }
      });

      // Add Logic for Completed Batches
      if (currentStatus === 'COMPLETED') {
        // Create Wastage
        await prisma.wastageLog.create({
          data: {
            batchId: batch.id,
            stage: 'SPINNING',
            quantity: 5 + Math.random() * 20,
            wasteType: 'Hard Waste',
            reason: 'Machine Calibration'
          }
        });

        // Create Finished Good
        await prisma.finishedGood.create({
          data: {
            batchId: batch.id,
            yarnCount: ['30s', '40s', '60s', '80s'][i % 4],
            producedQuantity: (Number(batch.inputQuantity) * 0.9).toFixed(2), // 90% yield
            qualityGrade: i % 5 === 0 ? 'B' : 'A',
            packingDate: new Date(),
            legacyLocation: 'FG Store'
          }
        });
      }
    }
  }

  // 5. Quality Control Data
  console.log('--- Seeding Quality Control Data ---');

  // 5.1 Inspection Templates
  const templatesData = [
    {
      name: 'Raw Material Incoming Inspection',
      description: 'Standard inspection for incoming raw materials',
      entityType: 'RAW_MATERIAL',
      checklistItems: [
        { name: 'Visual Inspection', description: 'Check for visible defects, contamination', required: true },
        { name: 'Weight Verification', description: 'Verify weight matches documentation', required: true },
        { name: 'Color Consistency', description: 'Check color uniformity', required: true },
        { name: 'Moisture Content', description: 'Measure moisture level', required: false },
        { name: 'Fiber Length Test', description: 'Sample fiber length measurement', required: false },
      ],
      testParameters: [
        { name: 'Tensile Strength', minValue: 25, maxValue: 40, unit: 'g/tex' },
        { name: 'Elongation', minValue: 5, maxValue: 8, unit: '%' },
        { name: 'Moisture', minValue: 6, maxValue: 8.5, unit: '%' },
      ],
    },
    {
      name: 'Production Batch Quality Check',
      description: 'Quality inspection for production batches',
      entityType: 'PRODUCTION_BATCH',
      checklistItems: [
        { name: 'Yarn Count Verification', description: 'Verify yarn count matches specification', required: true },
        { name: 'Twist Per Inch', description: 'Check TPI is within tolerance', required: true },
        { name: 'Surface Quality', description: 'Visual check for neps and imperfections', required: true },
        { name: 'Package Weight', description: 'Verify package weight consistency', required: true },
      ],
      testParameters: [
        { name: 'Count CV%', minValue: 0, maxValue: 2, unit: '%' },
        { name: 'Strength CV%', minValue: 0, maxValue: 10, unit: '%' },
        { name: 'Elongation CV%', minValue: 0, maxValue: 8, unit: '%' },
      ],
    },
  ];

  const templates = [];
  for (const t of templatesData) {
    const existing = await prisma.inspectionTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      const template = await prisma.inspectionTemplate.create({
        data: {
          name: t.name,
          description: t.description,
          entityType: t.entityType as InspectionEntity,
          checklistItems: t.checklistItems,
          testParameters: t.testParameters,
          isActive: true,
        },
      });
      templates.push(template);
      console.log(`Created template: ${t.name}`);
    } else {
      templates.push(existing);
    }
  }

  // 5.2 Quality Inspections
  const inspectorUser = await prisma.user.findFirst();
  const allRMsForQC = await prisma.rawMaterial.findMany({ take: 15 });
  const allBatches = await prisma.productionBatch.findMany({ take: 15 });

  // Skip if no data to link to
  if (allRMsForQC.length === 0 || allBatches.length === 0) {
    console.log('Skipping quality control seeding - no raw materials or batches found');
  } else {
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'COMPLETED'];
    const results = ['PASS', 'PASS', 'PASS', 'CONDITIONAL_PASS', 'FAIL'];

    for (let i = 0; i < 20; i++) {
      const inspNum = `INS-${2024000 + i}`;
      const existing = await prisma.qualityInspection.findFirst({ where: { inspectionNumber: inspNum } });

      if (!existing) {
        const isRawMaterial = i < 12;
        const entity = isRawMaterial ? allRMsForQC[i % allRMsForQC.length] : allBatches[(i - 12) % allBatches.length];
        if (!entity) continue;

        const status = statuses[i % statuses.length];
        const result = status === 'COMPLETED' ? results[i % results.length] : null;
        const template = isRawMaterial ? templates[0] : templates[1];

        const daysAgo = Math.floor(Math.random() * 30);
        const inspDate = new Date();
        inspDate.setDate(inspDate.getDate() - daysAgo);

        await prisma.qualityInspection.create({
          data: {
            inspectionNumber: inspNum,
            entityType: isRawMaterial ? InspectionEntity.RAW_MATERIAL : InspectionEntity.PRODUCTION_BATCH,
            entityId: entity.id,
            templateId: template?.id || null,
            inspectorId: inspectorUser?.id || null,
            status: status as InspectionStatus,
            result: result as InspectionResult | null,
            inspectionDate: inspDate,
            checklistItems: template?.checklistItems ? (template.checklistItems as any[]).map((item: any, idx: number) => ({
              ...item,
              passed: result !== 'FAIL' || idx < 3,
              notes: idx === 0 ? 'Looks good' : null,
            })) : [],
            notes: result === 'FAIL' ? 'Failed due to quality issues' : (result === 'CONDITIONAL_PASS' ? 'Minor issues noted' : null),
          },
        });
        console.log(`Created inspection: ${inspNum}`);
      }
    }
  }

  // 5.3 Quality Tests
  for (let i = 0; i < 15; i++) {
    const testNum = `QT-${2024000 + i}`;
    const existing = await prisma.qualityTest.findFirst({ where: { testNumber: testNum } });

    if (!existing) {
      const isRawMaterial = i < 10;
      const entity = isRawMaterial ? allRMsForQC[i % allRMsForQC.length] : allBatches[(i - 10) % allBatches.length];
      const score = 65 + Math.random() * 35;
      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

      const daysAgo = Math.floor(Math.random() * 30);
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - daysAgo);

      await prisma.qualityTest.create({
        data: {
          testNumber: testNum,
          entityType: isRawMaterial ? 'RAW_MATERIAL' : 'PRODUCTION_BATCH',
          entityId: entity?.id || '',
          testDate,
          testParameters: {
            tensileStrength: 28 + Math.random() * 10,
            elongation: 5 + Math.random() * 3,
            moisture: 6.5 + Math.random() * 1.5,
          },
          qualityScore: Math.round(score * 100) / 100,
          qualityGrade: grade,
          testedBy: inspectorUser?.id,
          status: 'COMPLETED',
        },
      });
      console.log(`Created quality test: ${testNum}`);
    }
  }

  // 5.4 Defect Logs
  const defectCategories = ['Color Variation', 'Contamination', 'Count Deviation', 'Strength Issue', 'Packaging Damage'];
  const defectTypes = ['Visual', 'Physical', 'Measurement', 'Structural', 'Packaging'];
  const severities: DefectSeverity[] = [DefectSeverity.CRITICAL, DefectSeverity.MAJOR, DefectSeverity.MINOR, DefectSeverity.MINOR, DefectSeverity.MINOR];
  const actionStatuses: ActionStatus[] = [ActionStatus.PENDING, ActionStatus.IN_PROGRESS, ActionStatus.COMPLETED, ActionStatus.COMPLETED, ActionStatus.COMPLETED];

  for (let i = 0; i < 12; i++) {
    const defectNum = `DEF-${2024000 + i}`;
    const existing = await prisma.defectLog.findFirst({ where: { defectNumber: defectNum } });

    if (!existing) {
      const isRawMaterial = i < 8;
      const entity = isRawMaterial ? allRMsForQC[i % allRMsForQC.length] : allBatches[(i - 8) % allBatches.length];

      const daysAgo = Math.floor(Math.random() * 30);
      const defectDate = new Date();
      defectDate.setDate(defectDate.getDate() - daysAgo);

      await prisma.defectLog.create({
        data: {
          defectNumber: defectNum,
          entityType: isRawMaterial ? 'RAW_MATERIAL' : 'PRODUCTION_BATCH',
          entityId: entity?.id || '',
          defectCategory: defectCategories[i % defectCategories.length],
          defectType: defectTypes[i % defectTypes.length],
          description: `${defectCategories[i % defectCategories.length]} detected during inspection`,
          severity: severities[i % severities.length],
          quantity: 10 + Math.random() * 50,
          rootCause: i % 3 === 0 ? 'Supplier quality issue' : (i % 3 === 1 ? 'Machine malfunction' : 'Process deviation'),
          correctiveAction: actionStatuses[i % actionStatuses.length] === ActionStatus.COMPLETED ? 'Issue addressed and corrected' : null,
          actionStatus: actionStatuses[i % actionStatuses.length],
          reportedBy: inspectorUser?.id,
          createdAt: defectDate,
        },
      });
      console.log(`Created defect log: ${defectNum}`);
    }
  }

  // 6. Billing Data
  console.log('--- Seeding Billing Data ---');
  const invoiceData = [
    { customerName: 'Global Cotton Co', totalAmount: 150000, status: 'PAID', items: { create: [{ description: 'Cotton Yarn 40s', quantity: 1000, price: 150 }] } },
    { customerName: 'Silk Road Traders', totalAmount: 75000, status: 'PENDING', items: { create: [{ description: 'Silk Yarn Premium', quantity: 50, price: 1500 }] } },
    { customerName: 'PolySynth Ltd', totalAmount: 200000, status: 'OVERDUE', items: { create: [{ description: 'Polyester Raw', quantity: 5000, price: 40 }] } },
  ];

  for (const inv of invoiceData) {
    const existing = await prisma.invoice.findFirst({ where: { customerName: inv.customerName } });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: inv.customerName,
          totalAmount: inv.totalAmount,
          status: inv.status as any,
          date: new Date(),
          taxAmount: Number(inv.totalAmount) * 0.18,
          billingCycle: 'Jan 2026',
          items: {
            create: inv.items.create.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.quantity * item.price
            }))
          }
        }
      });
    }
  }

  // 7. App Settings
  console.log('--- Seeding App Settings ---');

  await prisma.appSettings.upsert({
    where: { key: 'general' },
    update: {}, // Don't overwrite existing user settings
    create: {
      key: 'general',
      value: {
        companyName: 'Yarn Management',
        taxId: '',
        adminEmail: 'gokulkangeyan@gmail.com', // Updated from user context
        notifications: true,
        logoUrl: ''
      },
      description: 'General application settings'
    }
  });

  const DEFAULT_MODULES = {
    procurement: true,
    inventory: true,
    warehouse: true,
    manufacturing: true,
    quality: true,
    sales: true,
    customers: true,
    finance: true,
    hr: true,
    documents: true,
    communication: true,
    reports: true,
    integrations: true,
    developer: true,
  };

  await prisma.appSettings.upsert({
    where: { key: 'modules' },
    update: {},
    create: {
      key: 'modules',
      value: DEFAULT_MODULES,
      description: 'Module visibility settings'
    }
  });

  // 8. Notifications
  console.log('--- Seeding Notifications ---');
  const adminUserToNotify = await prisma.user.findUnique({ where: { email: env.ADMIN_EMAIL } });

  if (adminUserToNotify) {
    const notifCount = await prisma.notification.count({ where: { userId: adminUserToNotify.id } });

    if (notifCount === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: adminUserToNotify.id,
            type: 'LOW_STOCK',
            title: 'Critical Stock Alert',
            message: 'Cotton Bale (Grade A) inventory has dropped below 10%. Reorder immediately.',
            read: false
          },
          {
            userId: adminUserToNotify.id,
            type: 'SUCCESS',
            title: 'Payment Confirmed',
            message: 'Global Cotton Co has settled Invoice #INV-2024-001 for ₹12,50,000.',
            read: false
          },
          {
            userId: adminUserToNotify.id,
            type: 'INFO',
            title: 'Market Intelligence',
            message: 'New export duties announced for cotton yarn. Check News Intelligence for details.',
            read: true
          }
        ]
      });
      console.log('Seeded 3 sample notifications');
    }
  }

  console.log('--- Seeding Completed ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
