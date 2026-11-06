-- =================================================================
--  EverGreen Enterprise Textile ERP - SQL Server (SSMS) Schema
--  Engineered for Microsoft SQL Server 2017+ / Azure SQL / SSMS
-- =================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EverGreen')
BEGIN
    CREATE DATABASE [EverGreen];
END;
GO

USE [EverGreen];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- CreateTable
CREATE TABLE [SupportTicket] (
    [id] NVARCHAR(255) NOT NULL,
    [requestKey] NVARCHAR(255) NOT NULL,
    [subject] NVARCHAR(MAX) NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [category] NVARCHAR(255) NOT NULL,
    [priority] NVARCHAR(255) NOT NULL DEFAULT 'NORMAL',
    [status] NVARCHAR(255) NOT NULL DEFAULT 'OPEN',
    [createdBy] NVARCHAR(255) NOT NULL,
    [resolution] NVARCHAR(MAX),
    [requesterId] INT,
    [assigneeId] INT,
    [queue] NVARCHAR(255) NOT NULL DEFAULT 'TRIAGE',
    [resolvedById] INT,
    [resolvedAt] DATETIME2(3),
    [confirmedById] INT,
    [confirmedAt] DATETIME2(3),
    [closedAt] DATETIME2(3),
    [tagsJson] NVARCHAR(MAX) NOT NULL DEFAULT '[]',
    [customFieldsJson] NVARCHAR(MAX) NOT NULL DEFAULT '{}',
    [watchersJson] NVARCHAR(MAX) NOT NULL DEFAULT '[]',
    [dueAt] DATETIME2(3),
    [parentId] NVARCHAR(MAX),
    [mergedIntoId] NVARCHAR(MAX),
    [slaPolicyJson] NVARCHAR(MAX),
    [version] INT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [SupportTicket_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [SupportResource] (
    [id] NVARCHAR(255) NOT NULL,
    [scopeKey] NVARCHAR(255) NOT NULL,
    [kind] NVARCHAR(255) NOT NULL,
    [key] NVARCHAR(255) NOT NULL,
    [title] NVARCHAR(MAX) NOT NULL,
    [ownerId] INT NOT NULL,
    [visibility] NVARCHAR(255) NOT NULL DEFAULT 'TEAM',
    [status] NVARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    [data] NVARCHAR(MAX) NOT NULL,
    [version] INT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [SupportResource_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [SupportResourceRevision] (
    [id] NVARCHAR(255) NOT NULL,
    [resourceId] NVARCHAR(255) NOT NULL,
    [version] INT NOT NULL,
    [actorId] INT NOT NULL,
    [actorUsername] NVARCHAR(255) NOT NULL,
    [snapshot] NVARCHAR(MAX) NOT NULL,
    [reason] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [SupportResourceRevision_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [SupportTicketEvent] (
    [id] NVARCHAR(255) NOT NULL,
    [ticketId] NVARCHAR(255) NOT NULL,
    [version] INT NOT NULL,
    [requestKey] NVARCHAR(MAX),
    [actorId] INT NOT NULL,
    [actorPublicId] NVARCHAR(MAX),
    [actorUsername] NVARCHAR(255) NOT NULL,
    [kind] NVARCHAR(255) NOT NULL,
    [visibility] NVARCHAR(255) NOT NULL DEFAULT 'PUBLIC',
    [payload] NVARCHAR(MAX) NOT NULL,
    [previousHash] NVARCHAR(255) NOT NULL,
    [hash] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [SupportTicketEvent_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [User] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [publicId] NVARCHAR(MAX),
    [status] NVARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    [statusReason] NVARCHAR(MAX),
    [statusChangedAt] DATETIME2(3),
    [deletedAt] DATETIME2(3),
    [department] NVARCHAR(MAX),
    [site] NVARCHAR(MAX),
    [locale] NVARCHAR(MAX) NOT NULL DEFAULT 'en',
    [timezone] NVARCHAR(MAX) NOT NULL DEFAULT 'Asia/Kolkata',
    [emailVerifiedAt] DATETIME2(3),
    [failedLogins] INT NOT NULL DEFAULT 0,
    [lockedUntil] DATETIME2(3),
    [scopedAccess] BIT NOT NULL DEFAULT 0,
    [email] NVARCHAR(255) NOT NULL,
    [username] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(MAX),
    [password] NVARCHAR(MAX) NOT NULL,
    [role] NVARCHAR(MAX) NOT NULL DEFAULT 'VIEWER',
    [currentChallenge] NVARCHAR(MAX),
    [totpSecret] NVARCHAR(MAX),
    [isTotpEnabled] BIT NOT NULL DEFAULT 0,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [User_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WebAuthnCredential] (
    [id] NVARCHAR(255) NOT NULL,
    [userId] INT NOT NULL,
    [publicKey] BYTEA NOT NULL,
    [counter] BIGINT NOT NULL,
    [deviceType] NVARCHAR(255) NOT NULL,
    [backedUp] BIT NOT NULL,
    [transports] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [lastUsed] DATETIME2(3) NOT NULL,

    CONSTRAINT [WebAuthnCredential_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [AccountActionToken] (
    [id] NVARCHAR(255) NOT NULL,
    [tokenHash] NVARCHAR(255) NOT NULL,
    [userId] INT NOT NULL,
    [purpose] NVARCHAR(MAX) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [expiresAt] DATETIME2(3) NOT NULL,
    [usedAt] DATETIME2(3),
    [revokedAt] DATETIME2(3),
    [deliveryStatus] NVARCHAR(255) NOT NULL DEFAULT 'PENDING',
    [messageId] NVARCHAR(MAX),
    [createdBy] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [AccountActionToken_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [UserRecoveryCode] (
    [id] NVARCHAR(255) NOT NULL,
    [userId] INT NOT NULL,
    [codeHash] NVARCHAR(255) NOT NULL,
    [usedAt] DATETIME2(3),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [UserRecoveryCode_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [UserExternalIdentity] (
    [id] NVARCHAR(255) NOT NULL,
    [userId] INT NOT NULL,
    [issuer] NVARCHAR(MAX) NOT NULL,
    [subject] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [UserExternalIdentity_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [UserAccessRule] (
    [id] NVARCHAR(255) NOT NULL,
    [userId] INT NOT NULL,
    [method] NVARCHAR(MAX) NOT NULL,
    [path] NVARCHAR(MAX) NOT NULL,
    [effect] NVARCHAR(MAX) NOT NULL,
    [expiresAt] DATETIME2(3),
    [revokedAt] DATETIME2(3),
    [createdBy] NVARCHAR(255) NOT NULL,
    [reason] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [UserAccessRule_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Session] (
    [id] NVARCHAR(255) NOT NULL,
    [userId] INT NOT NULL,
    [token] NVARCHAR(MAX),
    [ipAddress] NVARCHAR(MAX),
    [location] NVARCHAR(MAX),
    [device] NVARCHAR(MAX),
    [userAgent] NVARCHAR(MAX),
    [isValid] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [lastActive] DATETIME2(3) NOT NULL,
    [expiresAt] DATETIME2(3),
    [lastSeenAt] DATETIME2(3),

    CONSTRAINT [Session_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [UserSessionPolicy] (
    [role] NVARCHAR(MAX) NOT NULL,
    [absoluteMinutes] INT NOT NULL DEFAULT 1440,
    [idleMinutes] INT NOT NULL DEFAULT 0,
    [maxConcurrent] INT NOT NULL DEFAULT 10,
    [limitAction] NVARCHAR(MAX) NOT NULL DEFAULT 'REVOKE_OLDEST',
    [updatedBy] NVARCHAR(MAX) NOT NULL,
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [UserSessionPolicy_pkey] PRIMARY KEY ([role])
);
GO


-- CreateTable
CREATE TABLE [CottonInventory] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [bale] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [balance] DECIMAL(24,6) NOT NULL,
    [reference] NVARCHAR(MAX) NOT NULL,
    [batchId] NVARCHAR(MAX),
    [productionId] INT,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [CottonInventory_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [YarnInventory] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [balance] DECIMAL(24,6) NOT NULL,
    [reference] NVARCHAR(MAX) NOT NULL,
    [count] NVARCHAR(MAX),
    [productionId] INT,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [YarnInventory_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WasteInventory] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [balance] DECIMAL(24,6) NOT NULL,
    [reference] NVARCHAR(MAX) NOT NULL,
    [wasteBlowRoom] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [wasteCarding] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [wasteOE] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [wasteOthers] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [productionId] INT,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [WasteInventory_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [InwardBatch] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [batchId] NVARCHAR(255) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [supplier] NVARCHAR(MAX) NOT NULL,
    [bale] INT NOT NULL,
    [kg] DECIMAL(24,6) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),
    [mergedFrom] NVARCHAR(MAX),
    [isMerged] BIT NOT NULL DEFAULT 0,
    [catalogueItemId] INT,
    [unitCost] DECIMAL(24,6),
    [weighbridgeReceipt] NVARCHAR(MAX),

    CONSTRAINT [InwardBatch_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Production] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [totalConsumed] DECIMAL(24,6) NOT NULL,
    [totalProduced] DECIMAL(24,6) NOT NULL,
    [totalWaste] DECIMAL(24,6) NOT NULL,
    [totalIntermediate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [processingCost] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [wasteBlowRoom] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [wasteCarding] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [wasteOE] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [wasteOthers] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [Production_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [ProductionConsumption] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [productionId] INT NOT NULL,
    [batchNo] NVARCHAR(MAX) NOT NULL,
    [bale] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [weight] DECIMAL(24,6) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [ProductionConsumption_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [ProductionOutput] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [productionId] INT NOT NULL,
    [count] NVARCHAR(MAX) NOT NULL,
    [weight] DECIMAL(24,6) NOT NULL,
    [bags] INT NOT NULL,
    [remainingLog] DECIMAL(24,6) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [ProductionOutput_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Outward] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [customerName] NVARCHAR(255) NOT NULL,
    [vehicleNo] NVARCHAR(MAX) NOT NULL,
    [driverName] NVARCHAR(MAX),
    [totalBags] INT NOT NULL DEFAULT 0,
    [totalWeight] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'DISPATCHED',
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [Outward_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [OutwardItem] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [outwardId] INT NOT NULL,
    [count] NVARCHAR(MAX) NOT NULL,
    [bags] INT NOT NULL,
    [weight] DECIMAL(24,6) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [OutwardItem_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [ActivityLog] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [action] NVARCHAR(MAX) NOT NULL,
    [module] NVARCHAR(MAX) NOT NULL,
    [details] NVARCHAR(MAX) NOT NULL,
    [username] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [ActivityLog_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [audit_ledger] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [eventId] NVARCHAR(255) NOT NULL,
    [actorId] INT,
    [actorPublicId] NVARCHAR(MAX),
    [actorUsername] NVARCHAR(255) NOT NULL,
    [subjectUserId] INT,
    [subjectPublicId] NVARCHAR(MAX),
    [action] NVARCHAR(MAX) NOT NULL,
    [module] NVARCHAR(MAX) NOT NULL,
    [details] NVARCHAR(MAX) NOT NULL,
    [previousHash] NVARCHAR(255) NOT NULL,
    [hash] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [audit_ledger_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [ImportBatch] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [requestKey] NVARCHAR(255) NOT NULL,
    [fingerprint] NVARCHAR(MAX) NOT NULL,
    [source] NVARCHAR(MAX) NOT NULL,
    [entity] NVARCHAR(MAX) NOT NULL,
    [rowCount] INT NOT NULL,
    [recordIds] NVARCHAR(MAX) NOT NULL,
    [createdBy] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [ImportBatch_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [SystemSettings] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [businessMode] NVARCHAR(MAX) NOT NULL DEFAULT 'INTEGRATED',
    [workspaceMode] NVARCHAR(MAX) NOT NULL DEFAULT 'FULL',
    [companyName] NVARCHAR(255) NOT NULL DEFAULT '',
    [address] NVARCHAR(MAX) NOT NULL DEFAULT '',
    [gstin] NVARCHAR(255) NOT NULL DEFAULT '',
    [phone] NVARCHAR(MAX) NOT NULL DEFAULT '',
    [email] NVARCHAR(255) NOT NULL DEFAULT '',
    [logo] NVARCHAR(MAX),
    [autoBackup] BIT NOT NULL DEFAULT 1,
    [emailNotifications] BIT NOT NULL DEFAULT 1,
    [lowStockAlert] BIT NOT NULL DEFAULT 1,
    [defaultInvoiceTheme] NVARCHAR(MAX) NOT NULL DEFAULT 'CLASSIC',
    [lowStockThreshold] NVARCHAR(MAX) NOT NULL DEFAULT '500',
    [maintenanceRate] NVARCHAR(MAX) NOT NULL DEFAULT '4',
    [ebRate] NVARCHAR(MAX) NOT NULL DEFAULT '10',
    [packageRate] NVARCHAR(MAX) NOT NULL DEFAULT '1.6',
    [gstPercent] NVARCHAR(MAX) NOT NULL DEFAULT '18',
    [language] NVARCHAR(MAX) NOT NULL DEFAULT 'en',
    [sellerState] NVARCHAR(MAX) NOT NULL DEFAULT 'Tamil Nadu',
    [supportedCounts] NVARCHAR(MAX) DEFAULT '2,4,6,8,10',
    [plan] NVARCHAR(MAX) NOT NULL DEFAULT 'SEED',
    [pricingModel] NVARCHAR(MAX) NOT NULL DEFAULT 'TIERED',
    [status] NVARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    [licenseExpiresAt] DATETIME2(3),
    [gracePeriodDays] INT NOT NULL DEFAULT 30,
    [graceExpiresAt] DATETIME2(3),
    [maxUsers] INT NOT NULL DEFAULT 1,
    [maxMachines] INT NOT NULL DEFAULT 5,
    [maxDocsPerMonth] INT NOT NULL DEFAULT 500,
    [allowedModules] NVARCHAR(MAX) NOT NULL DEFAULT 'CORE,INVENTORY,COMMERCE',
    [tier] NVARCHAR(MAX) NOT NULL DEFAULT 'TIER_2_CITY',
    [state] NVARCHAR(MAX) NOT NULL DEFAULT 'Tamil Nadu',
    [country] NVARCHAR(MAX) NOT NULL DEFAULT 'IN',
    [isMaintenance] BIT NOT NULL DEFAULT 0,
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [SystemSettings_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [CostingEntry] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [category] NVARCHAR(255) NOT NULL,
    [details] NVARCHAR(MAX),
    [totalCost] DECIMAL(24,2) NOT NULL,
    [unitsConsumed] DECIMAL(24,6),
    [ratePerUnit] DECIMAL(24,6),
    [noOfShifts] INT,
    [workers] INT,
    [yarnProduced] DECIMAL(24,6),
    [rate] DECIMAL(24,6),
    [description] NVARCHAR(MAX),
    [type] NVARCHAR(MAX),
    [title] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [CostingEntry_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [DocumentSequence] (
    [key] NVARCHAR(255) NOT NULL,
    [value] INT NOT NULL,

    CONSTRAINT [DocumentSequence_pkey] PRIMARY KEY ([key])
);
GO


-- CreateTable
CREATE TABLE [Invoice] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [invoiceNo] NVARCHAR(MAX) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [customerName] NVARCHAR(255) NOT NULL,
    [customerAddress] NVARCHAR(MAX),
    [customerGSTIN] NVARCHAR(MAX),
    [sellerName] NVARCHAR(MAX),
    [sellerAddress] NVARCHAR(MAX),
    [sellerGSTIN] NVARCHAR(MAX),
    [customerId] INT,
    [sellerState] NVARCHAR(MAX) NOT NULL DEFAULT 'Tamil Nadu',
    [buyerState] NVARCHAR(MAX),
    [dueDate] DATETIME2(3),
    [discount] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [currency] NVARCHAR(MAX) NOT NULL DEFAULT 'INR',
    [documentHash] NVARCHAR(MAX),
    [verificationKey] NVARCHAR(MAX),
    [salesOrderId] INT,
    [outwardId] INT,
    [transportMode] NVARCHAR(MAX),
    [vehicleNo] NVARCHAR(MAX),
    [theme] NVARCHAR(MAX) NOT NULL DEFAULT 'CLASSIC',
    [subtotal] DECIMAL(24,2) NOT NULL,
    [cgst] DECIMAL(24,2) NOT NULL,
    [sgst] DECIMAL(24,2) NOT NULL,
    [igst] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [total] DECIMAL(24,2) NOT NULL,
    [issuerSignature] NVARCHAR(MAX),
    [customerSignature] NVARCHAR(MAX),
    [authorizedSignatory] NVARCHAR(MAX),
    [senderName] NVARCHAR(MAX),
    [notes] NVARCHAR(MAX),
    [terms] NVARCHAR(MAX),
    [status] NVARCHAR(255) NOT NULL DEFAULT 'UNPAID',
    [amountPaid] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [creditTotal] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [requestKey] NVARCHAR(MAX),
    [requestHash] NVARCHAR(MAX),
    [fulfilmentId] INT,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [entryTimestamp] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),
    [updatedBy] NVARCHAR(MAX),

    CONSTRAINT [Invoice_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [InvoiceItem] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [invoiceId] INT NOT NULL,
    [yarnCount] NVARCHAR(MAX) NOT NULL DEFAULT '',
    [bags] INT NOT NULL DEFAULT 0,
    [weight] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [rate] DECIMAL(24,6) NOT NULL,
    [itemId] INT,
    [description] NVARCHAR(MAX),
    [hsnSac] NVARCHAR(MAX),
    [uom] NVARCHAR(MAX),
    [quantity] DECIMAL(24,6),
    [gstRate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [discount] DECIMAL(24,2) NOT NULL DEFAULT 0,

    CONSTRAINT [InvoiceItem_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Payment] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [invoiceId] INT NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [amount] DECIMAL(24,2) NOT NULL,
    [method] NVARCHAR(MAX) NOT NULL DEFAULT 'CASH',
    [reference] NVARCHAR(MAX),
    [notes] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),

    CONSTRAINT [Payment_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Brand] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [active] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [Brand_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [CatalogueCategory] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [active] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [CatalogueCategory_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [CatalogueItem] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [sku] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX),
    [uom] NVARCHAR(MAX) NOT NULL DEFAULT 'KG',
    [hsnSac] NVARCHAR(MAX),
    [gstRate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [salePrice] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [reorderLevel] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [costPrice] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [imageUrl] NVARCHAR(MAX),
    [active] BIT NOT NULL DEFAULT 1,
    [shopVisible] BIT NOT NULL DEFAULT 0,
    [legacySource] NVARCHAR(MAX),
    [legacyId] NVARCHAR(MAX),
    [brandId] INT,
    [categoryId] INT,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [CatalogueItem_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [InwardReceipt] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [receiptNo] NVARCHAR(MAX) NOT NULL,
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [supplierName] NVARCHAR(255) NOT NULL,
    [referenceNumber] NVARCHAR(MAX),
    [notes] NVARCHAR(MAX),
    [total] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [InwardReceipt_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [InwardReceiptLine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [receiptId] INT NOT NULL,
    [itemId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [unitCost] DECIMAL(24,6) NOT NULL,

    CONSTRAINT [InwardReceiptLine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [CostingSheet] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [styleCode] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX),
    [status] NVARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    [total] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [components] NVARCHAR(MAX) NOT NULL,
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [CostingSheet_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [StockMovement] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [itemId] INT NOT NULL,
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [quantity] DECIMAL(24,6) NOT NULL,
    [reservedQty] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [movementType] NVARCHAR(255) NOT NULL,
    [referenceType] NVARCHAR(MAX),
    [referenceId] NVARCHAR(MAX),
    [notes] NVARCHAR(MAX),
    [legacySource] NVARCHAR(MAX),
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [lotId] INT,
    [unitCost] DECIMAL(24,6),

    CONSTRAINT [StockMovement_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Customer] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(MAX),
    [email] NVARCHAR(MAX),
    [gstin] NVARCHAR(MAX),
    [state] NVARCHAR(MAX) DEFAULT 'Tamil Nadu',
    [address] NVARCHAR(MAX),
    [active] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [Customer_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [CustomerLedgerEntry] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [customerId] INT NOT NULL,
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [type] NVARCHAR(255) NOT NULL,
    [debit] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [credit] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [reference] NVARCHAR(MAX),
    [notes] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [CustomerLedgerEntry_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [JobWorker] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(MAX),
    [address] NVARCHAR(MAX),
    [gstin] NVARCHAR(MAX),
    [active] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [JobWorker_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [JobWorkChallan] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [challanNo] NVARCHAR(MAX) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [jobWorkerId] INT NOT NULL,
    [processType] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'DISPATCHED',
    [notes] NVARCHAR(MAX),
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [JobWorkChallan_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [JobWorkDispatchLine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [challanId] INT NOT NULL,
    [itemId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [JobWorkDispatchLine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [JobWorkReceiptLine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [challanId] INT NOT NULL,
    [itemId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [scrapQty] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [JobWorkReceiptLine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [SalesOrder] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [orderNo] NVARCHAR(MAX) NOT NULL,
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [customerId] INT NOT NULL,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'DRAFT',
    [subtotal] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [discount] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [total] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [notes] NVARCHAR(MAX),
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [SalesOrder_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [SalesOrderLine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [orderId] INT NOT NULL,
    [itemId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [invoicedQty] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [dispatchedQty] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [rate] DECIMAL(24,6) NOT NULL,
    [gstRate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [discount] DECIMAL(24,2) NOT NULL DEFAULT 0,

    CONSTRAINT [SalesOrderLine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WarehouseLocation] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [zone] NVARCHAR(MAX),
    [description] NVARCHAR(MAX),
    [active] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [createdBy] NVARCHAR(MAX),

    CONSTRAINT [WarehouseLocation_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WarehouseMovement] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [locationId] INT NOT NULL,
    [itemId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [movementType] NVARCHAR(255) NOT NULL,
    [referenceId] NVARCHAR(MAX),
    [notes] NVARCHAR(MAX),
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [WarehouseMovement_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Machine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(255) NOT NULL,
    [serialNo] NVARCHAR(MAX),
    [manufacturer] NVARCHAR(MAX),
    [purchasedAt] DATETIME2(3),
    [active] BIT NOT NULL DEFAULT 1,
    [notes] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [createdBy] NVARCHAR(MAX),

    CONSTRAINT [Machine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [MachineInspection] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [machineId] INT NOT NULL,
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [type] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'PENDING',
    [description] NVARCHAR(MAX),
    [cost] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [resolvedAt] DATETIME2(3),
    [createdBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [MachineInspection_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [QualityInspection] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [productionId] INT,
    [batchId] NVARCHAR(MAX),
    [yarnCount] NVARCHAR(MAX),
    [sampleWeight] DECIMAL(24,6),
    [tenacity] DECIMAL(24,6),
    [elongation] DECIMAL(24,6),
    [imperfections] DECIMAL(24,6),
    [classimateFaults] DECIMAL(24,6),
    [unevenness] DECIMAL(24,6),
    [status] NVARCHAR(255) NOT NULL DEFAULT 'PENDING',
    [disposition] NVARCHAR(MAX),
    [remarks] NVARCHAR(MAX),
    [inspectedBy] NVARCHAR(MAX),
    [lotId] INT,
    [holdQuantity] DECIMAL(24,6),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,

    CONSTRAINT [QualityInspection_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WorkflowDocument] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [documentNo] NVARCHAR(MAX) NOT NULL,
    [kind] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'POSTED',
    [date] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [requestKey] NVARCHAR(255) NOT NULL,
    [requestHash] NVARCHAR(255) NOT NULL,
    [customerId] INT,
    [supplierId] INT,
    [invoiceId] INT,
    [orderId] INT,
    [originId] INT,
    [subtotal] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [tax] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [total] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [amountPaid] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [metadata] NVARCHAR(MAX) NOT NULL DEFAULT '{}',
    [notes] NVARCHAR(MAX),
    [createdBy] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [WorkflowDocument_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WorkflowLine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [documentId] INT NOT NULL,
    [itemId] INT NOT NULL,
    [sourceLineId] INT,
    [invoiceItemId] INT,
    [lotId] INT,
    [quantity] DECIMAL(24,6) NOT NULL,
    [rejectedQty] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [rate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [gstRate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [discount] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [net] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [tax] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [direction] NVARCHAR(MAX) NOT NULL DEFAULT 'IN',

    CONSTRAINT [WorkflowLine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Supplier] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [code] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [gstin] NVARCHAR(MAX),
    [address] NVARCHAR(MAX),
    [active] BIT NOT NULL DEFAULT 1,

    CONSTRAINT [Supplier_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [StockLot] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [code] NVARCHAR(255) NOT NULL,
    [itemId] INT NOT NULL,
    [grade] NVARCHAR(MAX),
    [colour] NVARCHAR(MAX),
    [owner] NVARCHAR(MAX) NOT NULL DEFAULT 'COMPANY',
    [origin] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [StockLot_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [StockHold] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [lotId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [reason] NVARCHAR(MAX) NOT NULL,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'HELD',
    [inspectionId] INT,
    [createdBy] NVARCHAR(255) NOT NULL,
    [releasedBy] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [releasedAt] DATETIME2(3),

    CONSTRAINT [StockHold_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [WipLot] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [productionId] INT NOT NULL,
    [code] NVARCHAR(255) NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [remaining] DECIMAL(24,6) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [status] NVARCHAR(255) NOT NULL DEFAULT 'OPEN',
    [unitCost] DECIMAL(24,6),

    CONSTRAINT [WipLot_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [JournalEntry] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [sourceKey] NVARCHAR(255) NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [createdBy] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [JournalEntry_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [JournalLine] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [entryId] INT NOT NULL,
    [account] NVARCHAR(MAX) NOT NULL,
    [party] NVARCHAR(MAX),
    [debit] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [credit] DECIMAL(24,2) NOT NULL DEFAULT 0,

    CONSTRAINT [JournalLine_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [StockValuation] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [movementId] INT NOT NULL,
    [quantity] DECIMAL(24,6) NOT NULL,
    [unitCost] DECIMAL(24,6),
    [value] DECIMAL(24,6),
    [status] NVARCHAR(255) NOT NULL DEFAULT 'UNVALUED',

    CONSTRAINT [StockValuation_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [AccountingPeriod] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [through] DATETIME2(3) NOT NULL,
    [closedBy] NVARCHAR(MAX) NOT NULL,
    [reason] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT [AccountingPeriod_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Staff] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [employeeId] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(MAX) NOT NULL,
    [department] NVARCHAR(MAX),
    [phone] NVARCHAR(MAX),
    [joinDate] DATETIME2(3),
    [salaryType] NVARCHAR(255) NOT NULL DEFAULT 'DAILY',
    [dailyRate] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [monthlySalary] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [active] BIT NOT NULL DEFAULT 1,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [createdBy] NVARCHAR(MAX),

    CONSTRAINT [Staff_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [Shift] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [startTime] NVARCHAR(MAX) NOT NULL,
    [endTime] NVARCHAR(MAX) NOT NULL,
    [active] BIT NOT NULL DEFAULT 1,

    CONSTRAINT [Shift_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [ShiftAssignment] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [staffId] INT NOT NULL,
    [shiftId] INT NOT NULL,
    [date] DATETIME2(3) NOT NULL,
    [present] BIT NOT NULL DEFAULT 1,
    [overtime] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [createdBy] NVARCHAR(MAX),

    CONSTRAINT [ShiftAssignment_pkey] PRIMARY KEY ([id])
);
GO


-- CreateTable
CREATE TABLE [PayrollEntry] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [staffId] INT NOT NULL,
    [month] NVARCHAR(MAX) NOT NULL,
    [daysWorked] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [overtimeHrs] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [basicPay] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [overtime] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [deductions] DECIMAL(24,6) NOT NULL DEFAULT 0,
    [netPay] DECIMAL(24,2) NOT NULL DEFAULT 0,
    [paid] BIT NOT NULL DEFAULT 0,
    [paidAt] DATETIME2(3),
    [notes] NVARCHAR(MAX),
    [createdAt] DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    [updatedAt] DATETIME2(3) NOT NULL,
    [createdBy] NVARCHAR(MAX),

    CONSTRAINT [PayrollEntry_pkey] PRIMARY KEY ([id])
);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportTicket_requestKey_key] ON [SupportTicket]([requestKey]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [SupportTicket_createdBy_createdAt_idx] ON [SupportTicket]([createdBy], [createdAt]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [SupportTicket_status_updatedAt_idx] ON [SupportTicket]([status], [updatedAt]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [SupportTicket_assigneeId_status_idx] ON [SupportTicket]([assigneeId], [status]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportResource_scopeKey_key] ON [SupportResource]([scopeKey]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [SupportResource_kind_status_visibility_idx] ON [SupportResource]([kind], [status], [visibility]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportResourceRevision_resourceId_version_key] ON [SupportResourceRevision]([resourceId], [version]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportTicketEvent_requestKey_key] ON [SupportTicketEvent]([requestKey]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportTicketEvent_hash_key] ON [SupportTicketEvent]([hash]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [SupportTicketEvent_ticketId_createdAt_idx] ON [SupportTicketEvent]([ticketId], [createdAt]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportTicketEvent_ticketId_version_key] ON [SupportTicketEvent]([ticketId], [version]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SupportTicketEvent_ticketId_previousHash_key] ON [SupportTicketEvent]([ticketId], [previousHash]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [User_publicId_key] ON [User]([publicId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [User_email_key] ON [User]([email]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [User_username_key] ON [User]([username]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [AccountActionToken_tokenHash_key] ON [AccountActionToken]([tokenHash]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [AccountActionToken_userId_purpose_createdAt_idx] ON [AccountActionToken]([userId], [purpose], [createdAt]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [UserRecoveryCode_codeHash_key] ON [UserRecoveryCode]([codeHash]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [UserRecoveryCode_userId_usedAt_idx] ON [UserRecoveryCode]([userId], [usedAt]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [UserExternalIdentity_userId_idx] ON [UserExternalIdentity]([userId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [UserExternalIdentity_issuer_subject_key] ON [UserExternalIdentity]([issuer], [subject]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [UserAccessRule_userId_revokedAt_idx] ON [UserAccessRule]([userId], [revokedAt]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [InwardBatch_batchId_key] ON [InwardBatch]([batchId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [audit_ledger_eventId_key] ON [audit_ledger]([eventId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [audit_ledger_previousHash_key] ON [audit_ledger]([previousHash]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [audit_ledger_hash_key] ON [audit_ledger]([hash]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_ledger_subjectUserId_createdAt_idx] ON [audit_ledger]([subjectUserId], [createdAt]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_ledger_actorId_createdAt_idx] ON [audit_ledger]([actorId], [createdAt]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [ImportBatch_requestKey_key] ON [ImportBatch]([requestKey]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [ImportBatch_fingerprint_key] ON [ImportBatch]([fingerprint]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Invoice_invoiceNo_key] ON [Invoice]([invoiceNo]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Invoice_requestKey_key] ON [Invoice]([requestKey]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Brand_name_key] ON [Brand]([name]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [CatalogueCategory_name_key] ON [CatalogueCategory]([name]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [CatalogueItem_sku_key] ON [CatalogueItem]([sku]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [CatalogueItem_type_idx] ON [CatalogueItem]([type]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [CatalogueItem_name_idx] ON [CatalogueItem]([name]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [InwardReceipt_receiptNo_key] ON [InwardReceipt]([receiptNo]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [CostingSheet_styleCode_key] ON [CostingSheet]([styleCode]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [StockMovement_itemId_date_idx] ON [StockMovement]([itemId], [date]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [StockMovement_referenceType_referenceId_idx] ON [StockMovement]([referenceType], [referenceId]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [Customer_name_idx] ON [Customer]([name]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [CustomerLedgerEntry_customerId_date_idx] ON [CustomerLedgerEntry]([customerId], [date]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [JobWorker_name_key] ON [JobWorker]([name]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [JobWorkChallan_challanNo_key] ON [JobWorkChallan]([challanNo]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [SalesOrder_orderNo_key] ON [SalesOrder]([orderNo]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [WarehouseLocation_name_key] ON [WarehouseLocation]([name]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [WarehouseMovement_locationId_idx] ON [WarehouseMovement]([locationId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Machine_serialNo_key] ON [Machine]([serialNo]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [MachineInspection_machineId_idx] ON [MachineInspection]([machineId]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [QualityInspection_date_idx] ON [QualityInspection]([date]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [WorkflowDocument_documentNo_key] ON [WorkflowDocument]([documentNo]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [WorkflowDocument_requestKey_key] ON [WorkflowDocument]([requestKey]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [WorkflowDocument_kind_date_idx] ON [WorkflowDocument]([kind], [date]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [WorkflowDocument_invoiceId_idx] ON [WorkflowDocument]([invoiceId]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [WorkflowDocument_originId_idx] ON [WorkflowDocument]([originId]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [WorkflowLine_sourceLineId_idx] ON [WorkflowLine]([sourceLineId]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [WorkflowLine_invoiceItemId_idx] ON [WorkflowLine]([invoiceItemId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Supplier_code_key] ON [Supplier]([code]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [StockLot_code_key] ON [StockLot]([code]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [WipLot_productionId_key] ON [WipLot]([productionId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [WipLot_code_key] ON [WipLot]([code]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [JournalEntry_sourceKey_key] ON [JournalEntry]([sourceKey]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [JournalLine_account_idx] ON [JournalLine]([account]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [StockValuation_movementId_key] ON [StockValuation]([movementId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [AccountingPeriod_through_key] ON [AccountingPeriod]([through]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Staff_employeeId_key] ON [Staff]([employeeId]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [Shift_name_key] ON [Shift]([name]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [ShiftAssignment_staffId_date_idx] ON [ShiftAssignment]([staffId], [date]);
GO


-- CreateIndex
CREATE NONCLUSTERED INDEX [PayrollEntry_month_idx] ON [PayrollEntry]([month]);
GO


-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [PayrollEntry_staffId_month_key] ON [PayrollEntry]([staffId], [month]);
GO


-- AddForeignKey
ALTER TABLE [SupportResourceRevision] ADD CONSTRAINT [SupportResourceRevision_resourceId_fkey] FOREIGN KEY ([resourceId]) REFERENCES [SupportResource]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [SupportTicketEvent] ADD CONSTRAINT [SupportTicketEvent_ticketId_fkey] FOREIGN KEY ([ticketId]) REFERENCES [SupportTicket]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WebAuthnCredential] ADD CONSTRAINT [WebAuthnCredential_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [AccountActionToken] ADD CONSTRAINT [AccountActionToken_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [UserRecoveryCode] ADD CONSTRAINT [UserRecoveryCode_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [UserExternalIdentity] ADD CONSTRAINT [UserExternalIdentity_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [UserAccessRule] ADD CONSTRAINT [UserAccessRule_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [CottonInventory] ADD CONSTRAINT [CottonInventory_productionId_fkey] FOREIGN KEY ([productionId]) REFERENCES [Production]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [YarnInventory] ADD CONSTRAINT [YarnInventory_productionId_fkey] FOREIGN KEY ([productionId]) REFERENCES [Production]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WasteInventory] ADD CONSTRAINT [WasteInventory_productionId_fkey] FOREIGN KEY ([productionId]) REFERENCES [Production]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [ProductionConsumption] ADD CONSTRAINT [ProductionConsumption_productionId_fkey] FOREIGN KEY ([productionId]) REFERENCES [Production]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [ProductionOutput] ADD CONSTRAINT [ProductionOutput_productionId_fkey] FOREIGN KEY ([productionId]) REFERENCES [Production]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [OutwardItem] ADD CONSTRAINT [OutwardItem_outwardId_fkey] FOREIGN KEY ([outwardId]) REFERENCES [Outward]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [Invoice] ADD CONSTRAINT [Invoice_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [Customer]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [Invoice] ADD CONSTRAINT [Invoice_salesOrderId_fkey] FOREIGN KEY ([salesOrderId]) REFERENCES [SalesOrder]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [Invoice] ADD CONSTRAINT [Invoice_outwardId_fkey] FOREIGN KEY ([outwardId]) REFERENCES [Outward]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [Invoice] ADD CONSTRAINT [Invoice_fulfilmentId_fkey] FOREIGN KEY ([fulfilmentId]) REFERENCES [WorkflowDocument]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [InvoiceItem] ADD CONSTRAINT [InvoiceItem_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [InvoiceItem] ADD CONSTRAINT [InvoiceItem_invoiceId_fkey] FOREIGN KEY ([invoiceId]) REFERENCES [Invoice]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [Payment] ADD CONSTRAINT [Payment_invoiceId_fkey] FOREIGN KEY ([invoiceId]) REFERENCES [Invoice]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [CatalogueItem] ADD CONSTRAINT [CatalogueItem_brandId_fkey] FOREIGN KEY ([brandId]) REFERENCES [Brand]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [CatalogueItem] ADD CONSTRAINT [CatalogueItem_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [CatalogueCategory]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [InwardReceiptLine] ADD CONSTRAINT [InwardReceiptLine_receiptId_fkey] FOREIGN KEY ([receiptId]) REFERENCES [InwardReceipt]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [InwardReceiptLine] ADD CONSTRAINT [InwardReceiptLine_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [StockMovement] ADD CONSTRAINT [StockMovement_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [StockMovement] ADD CONSTRAINT [StockMovement_lotId_fkey] FOREIGN KEY ([lotId]) REFERENCES [StockLot]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [CustomerLedgerEntry] ADD CONSTRAINT [CustomerLedgerEntry_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [Customer]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [JobWorkChallan] ADD CONSTRAINT [JobWorkChallan_jobWorkerId_fkey] FOREIGN KEY ([jobWorkerId]) REFERENCES [JobWorker]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [JobWorkDispatchLine] ADD CONSTRAINT [JobWorkDispatchLine_challanId_fkey] FOREIGN KEY ([challanId]) REFERENCES [JobWorkChallan]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [JobWorkDispatchLine] ADD CONSTRAINT [JobWorkDispatchLine_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [JobWorkReceiptLine] ADD CONSTRAINT [JobWorkReceiptLine_challanId_fkey] FOREIGN KEY ([challanId]) REFERENCES [JobWorkChallan]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [JobWorkReceiptLine] ADD CONSTRAINT [JobWorkReceiptLine_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [SalesOrder] ADD CONSTRAINT [SalesOrder_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [Customer]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [SalesOrderLine] ADD CONSTRAINT [SalesOrderLine_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [SalesOrder]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [SalesOrderLine] ADD CONSTRAINT [SalesOrderLine_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WarehouseMovement] ADD CONSTRAINT [WarehouseMovement_locationId_fkey] FOREIGN KEY ([locationId]) REFERENCES [WarehouseLocation]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [MachineInspection] ADD CONSTRAINT [MachineInspection_machineId_fkey] FOREIGN KEY ([machineId]) REFERENCES [Machine]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WorkflowDocument] ADD CONSTRAINT [WorkflowDocument_supplierId_fkey] FOREIGN KEY ([supplierId]) REFERENCES [Supplier]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WorkflowDocument] ADD CONSTRAINT [WorkflowDocument_originId_fkey] FOREIGN KEY ([originId]) REFERENCES [WorkflowDocument]([id]) ON DELETE SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WorkflowLine] ADD CONSTRAINT [WorkflowLine_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [WorkflowDocument]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [WorkflowLine] ADD CONSTRAINT [WorkflowLine_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [StockLot] ADD CONSTRAINT [StockLot_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [CatalogueItem]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [StockHold] ADD CONSTRAINT [StockHold_lotId_fkey] FOREIGN KEY ([lotId]) REFERENCES [StockLot]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [JournalLine] ADD CONSTRAINT [JournalLine_entryId_fkey] FOREIGN KEY ([entryId]) REFERENCES [JournalEntry]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [StockValuation] ADD CONSTRAINT [StockValuation_movementId_fkey] FOREIGN KEY ([movementId]) REFERENCES [StockMovement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [ShiftAssignment] ADD CONSTRAINT [ShiftAssignment_staffId_fkey] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [ShiftAssignment] ADD CONSTRAINT [ShiftAssignment_shiftId_fkey] FOREIGN KEY ([shiftId]) REFERENCES [Shift]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


-- AddForeignKey
ALTER TABLE [PayrollEntry] ADD CONSTRAINT [PayrollEntry_staffId_fkey] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]) ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
GO


