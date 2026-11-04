-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdBy" TEXT NOT NULL,
    "resolution" TEXT,
    "requesterId" INTEGER,
    "assigneeId" INTEGER,
    "queue" TEXT NOT NULL DEFAULT 'TRIAGE',
    "resolvedById" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "confirmedById" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "customFieldsJson" TEXT NOT NULL DEFAULT '{}',
    "watchersJson" TEXT NOT NULL DEFAULT '[]',
    "dueAt" TIMESTAMP(3),
    "parentId" TEXT,
    "mergedIntoId" TEXT,
    "slaPolicyJson" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportResource" (
    "id" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'TEAM',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "data" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportResourceRevision" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "actorUsername" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportResourceRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "requestKey" TEXT,
    "actorId" INTEGER NOT NULL,
    "actorPublicId" TEXT,
    "actorUsername" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "payload" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "statusReason" TEXT,
    "statusChangedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "department" TEXT,
    "site" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "emailVerifiedAt" TIMESTAMP(3),
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "scopedAccess" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "currentChallenge" TEXT,
    "totpSecret" TEXT,
    "isTotpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAuthnCredential" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAuthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountActionToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "messageId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountActionToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExternalIdentity" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "issuer" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExternalIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccessRule" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAccessRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "device" TEXT,
    "userAgent" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSessionPolicy" (
    "role" TEXT NOT NULL,
    "absoluteMinutes" INTEGER NOT NULL DEFAULT 1440,
    "idleMinutes" INTEGER NOT NULL DEFAULT 0,
    "maxConcurrent" INTEGER NOT NULL DEFAULT 10,
    "limitAction" TEXT NOT NULL DEFAULT 'REVOKE_OLDEST',
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSessionPolicy_pkey" PRIMARY KEY ("role")
);

-- CreateTable
CREATE TABLE "CottonInventory" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "bale" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "balance" DECIMAL(24,6) NOT NULL,
    "reference" TEXT NOT NULL,
    "batchId" TEXT,
    "productionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CottonInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnInventory" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "balance" DECIMAL(24,6) NOT NULL,
    "reference" TEXT NOT NULL,
    "count" TEXT,
    "productionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "YarnInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteInventory" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "balance" DECIMAL(24,6) NOT NULL,
    "reference" TEXT NOT NULL,
    "wasteBlowRoom" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "wasteCarding" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "wasteOE" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "wasteOthers" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "productionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "WasteInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardBatch" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "supplier" TEXT NOT NULL,
    "bale" INTEGER NOT NULL,
    "kg" DECIMAL(24,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "mergedFrom" TEXT,
    "isMerged" BOOLEAN NOT NULL DEFAULT false,
    "catalogueItemId" INTEGER,
    "unitCost" DECIMAL(24,6),
    "weighbridgeReceipt" TEXT,

    CONSTRAINT "InwardBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Production" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalConsumed" DECIMAL(24,6) NOT NULL,
    "totalProduced" DECIMAL(24,6) NOT NULL,
    "totalWaste" DECIMAL(24,6) NOT NULL,
    "totalIntermediate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "processingCost" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "wasteBlowRoom" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "wasteCarding" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "wasteOE" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "wasteOthers" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionConsumption" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "batchNo" TEXT NOT NULL,
    "bale" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "weight" DECIMAL(24,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ProductionConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOutput" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "count" TEXT NOT NULL,
    "weight" DECIMAL(24,6) NOT NULL,
    "bags" INTEGER NOT NULL,
    "remainingLog" DECIMAL(24,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ProductionOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outward" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "driverName" TEXT,
    "totalBags" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Outward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutwardItem" (
    "id" SERIAL NOT NULL,
    "outwardId" INTEGER NOT NULL,
    "count" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "weight" DECIMAL(24,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "OutwardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_ledger" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "actorId" INTEGER,
    "actorPublicId" TEXT,
    "actorUsername" TEXT NOT NULL,
    "subjectUserId" INTEGER,
    "subjectPublicId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" SERIAL NOT NULL,
    "requestKey" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "recordIds" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "businessMode" TEXT NOT NULL DEFAULT 'INTEGRATED',
    "workspaceMode" TEXT NOT NULL DEFAULT 'FULL',
    "companyName" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "logo" TEXT,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "lowStockAlert" BOOLEAN NOT NULL DEFAULT true,
    "defaultInvoiceTheme" TEXT NOT NULL DEFAULT 'CLASSIC',
    "lowStockThreshold" TEXT NOT NULL DEFAULT '500',
    "maintenanceRate" TEXT NOT NULL DEFAULT '4',
    "ebRate" TEXT NOT NULL DEFAULT '10',
    "packageRate" TEXT NOT NULL DEFAULT '1.6',
    "gstPercent" TEXT NOT NULL DEFAULT '18',
    "language" TEXT NOT NULL DEFAULT 'en',
    "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "supportedCounts" TEXT DEFAULT '2,4,6,8,10',
    "plan" TEXT NOT NULL DEFAULT 'SEED',
    "pricingModel" TEXT NOT NULL DEFAULT 'TIERED',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "licenseExpiresAt" TIMESTAMP(3),
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 30,
    "graceExpiresAt" TIMESTAMP(3),
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxMachines" INTEGER NOT NULL DEFAULT 5,
    "maxDocsPerMonth" INTEGER NOT NULL DEFAULT 500,
    "allowedModules" TEXT NOT NULL DEFAULT 'CORE,INVENTORY,COMMERCE',
    "tier" TEXT NOT NULL DEFAULT 'TIER_2_CITY',
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "country" TEXT NOT NULL DEFAULT 'IN',
    "isMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostingEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "totalCost" DECIMAL(24,2) NOT NULL,
    "unitsConsumed" DECIMAL(24,6),
    "ratePerUnit" DECIMAL(24,6),
    "noOfShifts" INTEGER,
    "workers" INTEGER,
    "yarnProduced" DECIMAL(24,6),
    "rate" DECIMAL(24,6),
    "description" TEXT,
    "type" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CostingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT,
    "customerGSTIN" TEXT,
    "sellerName" TEXT,
    "sellerAddress" TEXT,
    "sellerGSTIN" TEXT,
    "customerId" INTEGER,
    "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "buyerState" TEXT,
    "dueDate" TIMESTAMP(3),
    "discount" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "documentHash" TEXT,
    "verificationKey" TEXT,
    "salesOrderId" INTEGER,
    "outwardId" INTEGER,
    "transportMode" TEXT,
    "vehicleNo" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'CLASSIC',
    "subtotal" DECIMAL(24,2) NOT NULL,
    "cgst" DECIMAL(24,2) NOT NULL,
    "sgst" DECIMAL(24,2) NOT NULL,
    "igst" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(24,2) NOT NULL,
    "issuerSignature" TEXT,
    "customerSignature" TEXT,
    "authorizedSignatory" TEXT,
    "senderName" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "amountPaid" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "creditTotal" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "requestKey" TEXT,
    "requestHash" TEXT,
    "fulfilmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "yarnCount" TEXT NOT NULL DEFAULT '',
    "bags" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "rate" DECIMAL(24,6) NOT NULL,
    "itemId" INTEGER,
    "description" TEXT,
    "hsnSac" TEXT,
    "uom" TEXT,
    "quantity" DECIMAL(24,6),
    "gstRate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "discount" DECIMAL(24,2) NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(24,2) NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogueCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogueItem" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "hsnSac" TEXT,
    "gstRate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "salePrice" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "reorderLevel" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "costPrice" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "shopVisible" BOOLEAN NOT NULL DEFAULT false,
    "legacySource" TEXT,
    "legacyId" TEXT,
    "brandId" INTEGER,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardReceipt" (
    "id" SERIAL NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplierName" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "total" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InwardReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardReceiptLine" (
    "id" SERIAL NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "unitCost" DECIMAL(24,6) NOT NULL,

    CONSTRAINT "InwardReceiptLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostingSheet" (
    "id" SERIAL NOT NULL,
    "styleCode" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "total" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "components" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostingSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DECIMAL(24,6) NOT NULL,
    "reservedQty" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "movementType" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "legacySource" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lotId" INTEGER,
    "unitCost" DECIMAL(24,6),

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "state" TEXT DEFAULT 'Tamil Nadu',
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerLedgerEntry" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "debit" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobWorker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobWorkChallan" (
    "id" SERIAL NOT NULL,
    "challanNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "jobWorkerId" INTEGER NOT NULL,
    "processType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobWorkChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobWorkDispatchLine" (
    "id" SERIAL NOT NULL,
    "challanId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobWorkDispatchLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobWorkReceiptLine" (
    "id" SERIAL NOT NULL,
    "challanId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "scrapQty" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobWorkReceiptLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" SERIAL NOT NULL,
    "orderNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderLine" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "invoicedQty" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "dispatchedQty" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "rate" DECIMAL(24,6) NOT NULL,
    "gstRate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "discount" DECIMAL(24,2) NOT NULL DEFAULT 0,

    CONSTRAINT "SalesOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseLocation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "zone" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "WarehouseLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseMovement" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "movementType" TEXT NOT NULL,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNo" TEXT,
    "manufacturer" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineInspection" (
    "id" SERIAL NOT NULL,
    "machineId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "cost" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "resolvedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MachineInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityInspection" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productionId" INTEGER,
    "batchId" TEXT,
    "yarnCount" TEXT,
    "sampleWeight" DECIMAL(24,6),
    "tenacity" DECIMAL(24,6),
    "elongation" DECIMAL(24,6),
    "imperfections" DECIMAL(24,6),
    "classimateFaults" DECIMAL(24,6),
    "unevenness" DECIMAL(24,6),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "disposition" TEXT,
    "remarks" TEXT,
    "inspectedBy" TEXT,
    "lotId" INTEGER,
    "holdQuantity" DECIMAL(24,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDocument" (
    "id" SERIAL NOT NULL,
    "documentNo" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "customerId" INTEGER,
    "supplierId" INTEGER,
    "invoiceId" INTEGER,
    "orderId" INTEGER,
    "originId" INTEGER,
    "subtotal" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "total" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowLine" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "sourceLineId" INTEGER,
    "invoiceItemId" INTEGER,
    "lotId" INTEGER,
    "quantity" DECIMAL(24,6) NOT NULL,
    "rejectedQty" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "rate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "gstRate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "discount" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "net" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "tax" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "direction" TEXT NOT NULL DEFAULT 'IN',

    CONSTRAINT "WorkflowLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "grade" TEXT,
    "colour" TEXT,
    "owner" TEXT NOT NULL DEFAULT 'COMPANY',
    "origin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockHold" (
    "id" SERIAL NOT NULL,
    "lotId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "inspectionId" INTEGER,
    "createdBy" TEXT NOT NULL,
    "releasedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "StockHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WipLot" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "remaining" DECIMAL(24,6) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "unitCost" DECIMAL(24,6),

    CONSTRAINT "WipLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" SERIAL NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "account" TEXT NOT NULL,
    "party" TEXT,
    "debit" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(24,2) NOT NULL DEFAULT 0,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockValuation" (
    "id" SERIAL NOT NULL,
    "movementId" INTEGER NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "unitCost" DECIMAL(24,6),
    "value" DECIMAL(24,6),
    "status" TEXT NOT NULL DEFAULT 'UNVALUED',

    CONSTRAINT "StockValuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingPeriod" (
    "id" SERIAL NOT NULL,
    "through" TIMESTAMP(3) NOT NULL,
    "closedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "phone" TEXT,
    "joinDate" TIMESTAMP(3),
    "salaryType" TEXT NOT NULL DEFAULT 'DAILY',
    "dailyRate" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "monthlySalary" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftAssignment" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "overtime" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollEntry" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "daysWorked" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "overtimeHrs" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "basicPay" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "overtime" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(24,6) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "PayrollEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_requestKey_key" ON "SupportTicket"("requestKey");

-- CreateIndex
CREATE INDEX "SupportTicket_createdBy_createdAt_idx" ON "SupportTicket"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_status_updatedAt_idx" ON "SupportTicket"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "SupportTicket_assigneeId_status_idx" ON "SupportTicket"("assigneeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SupportResource_scopeKey_key" ON "SupportResource"("scopeKey");

-- CreateIndex
CREATE INDEX "SupportResource_kind_status_visibility_idx" ON "SupportResource"("kind", "status", "visibility");

-- CreateIndex
CREATE UNIQUE INDEX "SupportResourceRevision_resourceId_version_key" ON "SupportResourceRevision"("resourceId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicketEvent_requestKey_key" ON "SupportTicketEvent"("requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicketEvent_hash_key" ON "SupportTicketEvent"("hash");

-- CreateIndex
CREATE INDEX "SupportTicketEvent_ticketId_createdAt_idx" ON "SupportTicketEvent"("ticketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicketEvent_ticketId_version_key" ON "SupportTicketEvent"("ticketId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicketEvent_ticketId_previousHash_key" ON "SupportTicketEvent"("ticketId", "previousHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AccountActionToken_tokenHash_key" ON "AccountActionToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AccountActionToken_userId_purpose_createdAt_idx" ON "AccountActionToken"("userId", "purpose", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserRecoveryCode_codeHash_key" ON "UserRecoveryCode"("codeHash");

-- CreateIndex
CREATE INDEX "UserRecoveryCode_userId_usedAt_idx" ON "UserRecoveryCode"("userId", "usedAt");

-- CreateIndex
CREATE INDEX "UserExternalIdentity_userId_idx" ON "UserExternalIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExternalIdentity_issuer_subject_key" ON "UserExternalIdentity"("issuer", "subject");

-- CreateIndex
CREATE INDEX "UserAccessRule_userId_revokedAt_idx" ON "UserAccessRule"("userId", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InwardBatch_batchId_key" ON "InwardBatch"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "audit_ledger_eventId_key" ON "audit_ledger"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "audit_ledger_previousHash_key" ON "audit_ledger"("previousHash");

-- CreateIndex
CREATE UNIQUE INDEX "audit_ledger_hash_key" ON "audit_ledger"("hash");

-- CreateIndex
CREATE INDEX "audit_ledger_subjectUserId_createdAt_idx" ON "audit_ledger"("subjectUserId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_ledger_actorId_createdAt_idx" ON "audit_ledger"("actorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImportBatch_requestKey_key" ON "ImportBatch"("requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "ImportBatch_fingerprint_key" ON "ImportBatch"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_requestKey_key" ON "Invoice"("requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueCategory_name_key" ON "CatalogueCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueItem_sku_key" ON "CatalogueItem"("sku");

-- CreateIndex
CREATE INDEX "CatalogueItem_type_idx" ON "CatalogueItem"("type");

-- CreateIndex
CREATE INDEX "CatalogueItem_name_idx" ON "CatalogueItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InwardReceipt_receiptNo_key" ON "InwardReceipt"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "CostingSheet_styleCode_key" ON "CostingSheet"("styleCode");

-- CreateIndex
CREATE INDEX "StockMovement_itemId_date_idx" ON "StockMovement"("itemId", "date");

-- CreateIndex
CREATE INDEX "StockMovement_referenceType_referenceId_idx" ON "StockMovement"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "CustomerLedgerEntry_customerId_date_idx" ON "CustomerLedgerEntry"("customerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "JobWorker_name_key" ON "JobWorker"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobWorkChallan_challanNo_key" ON "JobWorkChallan"("challanNo");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderNo_key" ON "SalesOrder"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseLocation_name_key" ON "WarehouseLocation"("name");

-- CreateIndex
CREATE INDEX "WarehouseMovement_locationId_idx" ON "WarehouseMovement"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_serialNo_key" ON "Machine"("serialNo");

-- CreateIndex
CREATE INDEX "MachineInspection_machineId_idx" ON "MachineInspection"("machineId");

-- CreateIndex
CREATE INDEX "QualityInspection_date_idx" ON "QualityInspection"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDocument_documentNo_key" ON "WorkflowDocument"("documentNo");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDocument_requestKey_key" ON "WorkflowDocument"("requestKey");

-- CreateIndex
CREATE INDEX "WorkflowDocument_kind_date_idx" ON "WorkflowDocument"("kind", "date");

-- CreateIndex
CREATE INDEX "WorkflowDocument_invoiceId_idx" ON "WorkflowDocument"("invoiceId");

-- CreateIndex
CREATE INDEX "WorkflowDocument_originId_idx" ON "WorkflowDocument"("originId");

-- CreateIndex
CREATE INDEX "WorkflowLine_sourceLineId_idx" ON "WorkflowLine"("sourceLineId");

-- CreateIndex
CREATE INDEX "WorkflowLine_invoiceItemId_idx" ON "WorkflowLine"("invoiceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StockLot_code_key" ON "StockLot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WipLot_productionId_key" ON "WipLot"("productionId");

-- CreateIndex
CREATE UNIQUE INDEX "WipLot_code_key" ON "WipLot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_sourceKey_key" ON "JournalEntry"("sourceKey");

-- CreateIndex
CREATE INDEX "JournalLine_account_idx" ON "JournalLine"("account");

-- CreateIndex
CREATE UNIQUE INDEX "StockValuation_movementId_key" ON "StockValuation"("movementId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingPeriod_through_key" ON "AccountingPeriod"("through");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_name_key" ON "Shift"("name");

-- CreateIndex
CREATE INDEX "ShiftAssignment_staffId_date_idx" ON "ShiftAssignment"("staffId", "date");

-- CreateIndex
CREATE INDEX "PayrollEntry_month_idx" ON "PayrollEntry"("month");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollEntry_staffId_month_key" ON "PayrollEntry"("staffId", "month");

-- AddForeignKey
ALTER TABLE "SupportResourceRevision" ADD CONSTRAINT "SupportResourceRevision_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "SupportResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "SupportTicketEvent" ADD CONSTRAINT "SupportTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WebAuthnCredential" ADD CONSTRAINT "WebAuthnCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "AccountActionToken" ADD CONSTRAINT "AccountActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "UserRecoveryCode" ADD CONSTRAINT "UserRecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "UserExternalIdentity" ADD CONSTRAINT "UserExternalIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "UserAccessRule" ADD CONSTRAINT "UserAccessRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "CottonInventory" ADD CONSTRAINT "CottonInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "YarnInventory" ADD CONSTRAINT "YarnInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WasteInventory" ADD CONSTRAINT "WasteInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "ProductionConsumption" ADD CONSTRAINT "ProductionConsumption_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "ProductionOutput" ADD CONSTRAINT "ProductionOutput_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "OutwardItem" ADD CONSTRAINT "OutwardItem_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "Outward"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "Outward"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_fulfilmentId_fkey" FOREIGN KEY ("fulfilmentId") REFERENCES "WorkflowDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "CatalogueItem" ADD CONSTRAINT "CatalogueItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "CatalogueItem" ADD CONSTRAINT "CatalogueItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CatalogueCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "InwardReceiptLine" ADD CONSTRAINT "InwardReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "InwardReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "InwardReceiptLine" ADD CONSTRAINT "InwardReceiptLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "StockLot"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "CustomerLedgerEntry" ADD CONSTRAINT "CustomerLedgerEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "JobWorkChallan" ADD CONSTRAINT "JobWorkChallan_jobWorkerId_fkey" FOREIGN KEY ("jobWorkerId") REFERENCES "JobWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "JobWorkDispatchLine" ADD CONSTRAINT "JobWorkDispatchLine_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "JobWorkChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "JobWorkDispatchLine" ADD CONSTRAINT "JobWorkDispatchLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "JobWorkReceiptLine" ADD CONSTRAINT "JobWorkReceiptLine_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "JobWorkChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "JobWorkReceiptLine" ADD CONSTRAINT "JobWorkReceiptLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WarehouseMovement" ADD CONSTRAINT "WarehouseMovement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "MachineInspection" ADD CONSTRAINT "MachineInspection_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WorkflowDocument" ADD CONSTRAINT "WorkflowDocument_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WorkflowDocument" ADD CONSTRAINT "WorkflowDocument_originId_fkey" FOREIGN KEY ("originId") REFERENCES "WorkflowDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WorkflowLine" ADD CONSTRAINT "WorkflowLine_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "WorkflowDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "WorkflowLine" ADD CONSTRAINT "WorkflowLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "StockHold" ADD CONSTRAINT "StockHold_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "StockLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "StockValuation" ADD CONSTRAINT "StockValuation_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "StockMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

