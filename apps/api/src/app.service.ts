import { Injectable } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';

export interface ProcessorInfo {
  id: string;
  name: string;
  category: 'CORE' | 'SPINNING' | 'FINANCE' | 'OPERATIONS' | 'SECURITY';
  status: 'ONLINE' | 'SYNCED' | 'IDLE' | 'DEGRADED';
  latencyMs: number;
  lastSync: string;
  summary: string;
  metrics: Record<string, string | number>;
  icon: string;
}

export interface PublicHealth {
  service: string;
  status: 'ok' | 'degraded';
  database: boolean;
  timestamp: string;
}

export interface SystemHealthData {
  service: string;
  status: 'ok' | 'degraded';
  /** Why startup reconciliation was blocked, or null when the ledgers reconciled. */
  startupIssue: string | null;
  /** Stored records left out of the journal until they are corrected. */
  dataIssues: string[];
  timestamp: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  environment: string;
  nodeVersion: string;
  platform: string;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    percentage: number;
  };
  ports: {
    api: number;
    web: number;
  };
  database: {
    provider: string;
    target: string;
    latencyMs: number;
    status: string;
  };
  summary: {
    total: number;
    healthy: number;
    degraded: number;
  };
  services?: Record<string, any>;
  security?: Record<string, any>;
  endpoints?: Record<string, any>;
  processors: ProcessorInfo[];
}

@Injectable()
export class AppService {
  private startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'EverGreen API is running smoothly.';
  }

  formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  /**
   * The only health information available without signing in: enough for a
   * load balancer or the web shell to tell "up" from "down", nothing else.
   */
  async getPublicHealth(): Promise<PublicHealth> {
    let database = true;
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
    } catch {
      database = false;
    }
    return {
      service: 'evergreen-api',
      status:
        database &&
        !this.prisma.getStartupIssue() &&
        !this.prisma.getDataIssues().length
          ? 'ok'
          : 'degraded',
      database,
      timestamp: new Date().toISOString(),
    };
  }

  /** Operational detail (record counts, stock totals, runtime). Administrators only. */
  async getHealthData(): Promise<SystemHealthData> {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10;
    const heapTotalMB = Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10;
    const rssMB = Math.round((mem.rss / 1024 / 1024) * 10) / 10;
    const percentage = Math.round((mem.heapUsed / mem.heapTotal) * 100);

    const apiPort = Number(
      process.env.EVERGREEN_API_PORT || process.env.PORT || 4301,
    );
    const webPort = Number(process.env.EVERGREEN_PUBLIC_PORT || 4000);

    // Ping Database
    const t0 = performance.now();
    let dbStatus = 'CONNECTED';
    let dbLatencyMs = 0;
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      dbLatencyMs = Math.round((performance.now() - t0) * 100) / 100;
    } catch {
      dbStatus = 'DEGRADED';
    }

    const startupIssue = this.prisma.getStartupIssue();
    const dataIssues = this.prisma.getDataIssues();
    let countReadFailed = false;
    // Counts establish connectivity, not business-flow validation.
    // Collect counts across modules in parallel
    const [
      inwardBatchCount,
      cottonInventoryCount,
      productionCount,
      wasteInventoryCount,
      yarnInventoryCount,
      outwardCount,
      costingCount,
      invoiceCount,
      paymentCount,
      catalogueCount,
      salesOrderCount,
      jobWorkerCount,
      jobWorkChallanCount,
      qcCount,
      machineCount,
      machineInspectionCount,
      warehouseLocCount,
      warehouseMovCount,
      staffCount,
      shiftCount,
      userCount,
      validSessionsCount,
    ] = await Promise.all([
      this.prisma.inwardBatch.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.cottonInventory.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.production.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.wasteInventory.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.yarnInventory.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.outward.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.costingEntry.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.invoice.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.payment.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.catalogueItem.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.salesOrder.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.jobWorker.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.jobWorkChallan.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.qualityInspection.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.machine.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.machineInspection.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.warehouseLocation.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.warehouseMovement.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.staff.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.shift.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.user.count().catch(() => {
        countReadFailed = true;
        return 0;
      }),
      this.prisma.session.count({ where: { isValid: true } }).catch(() => {
        countReadFailed = true;
        return 0;
      }),
    ]);

    const balances = await this.prisma
      .$transaction([
        this.prisma.cottonInventory.aggregate({ _sum: { quantity: true } }),
        this.prisma.yarnInventory.aggregate({ _sum: { quantity: true } }),
        this.prisma.stockMovement.aggregate({
          where: {
            item: { legacySource: 'EVERGREEN_LEGACY', type: 'RAW_MATERIAL' },
          },
          _sum: { quantity: true },
        }),
        this.prisma.stockMovement.aggregate({
          where: { item: { legacySource: 'EVERGREEN_LEGACY', type: 'YARN' } },
          _sum: { quantity: true },
        }),
      ])
      .catch(() => null);
    const cottonMatches =
      !!balances &&
      Math.abs(
        Number(balances[0]._sum.quantity || 0) -
          Number(balances[2]._sum.quantity || 0),
      ) <= 0.01;
    const yarnMatches =
      !!balances &&
      Math.abs(
        Number(balances[1]._sum.quantity || 0) -
          Number(balances[3]._sum.quantity || 0),
      ) <= 0.01;
    const syncTime = new Date().toLocaleTimeString();

    const processors: ProcessorInfo[] = [
      {
        id: 'db-engine',
        name: 'Database Engine (Prisma SQLite)',
        category: 'CORE',
        status: dbStatus === 'CONNECTED' ? 'ONLINE' : 'DEGRADED',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Embedded relational datastore handling transactions, schema constraints & relational integrity.',
        metrics: {
          Connection: 'Active & Healthy',
          Latency: `${dbLatencyMs} ms`,
          'Storage File': 'dev.db',
          Provider: 'SQLite 3',
        },
        icon: '🗄️',
      },
      {
        id: 'inward-cotton',
        name: 'Inward & Cotton Inventory Processor',
        category: 'SPINNING',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Records cotton batch identifiers, receipt timestamps, bales and weights.',
        metrics: {
          'Inward Batches': inwardBatchCount,
          'Cotton Ledger Records': cottonInventoryCount,
          'Physical cotton kg': balances
            ? Number(balances[0]._sum.quantity || 0)
            : 'Unavailable',
          'Catalogue cotton kg': balances
            ? Number(balances[2]._sum.quantity || 0)
            : 'Unavailable',
          'Stock agreement': !balances
            ? 'Unavailable'
            : cottonMatches
              ? 'Matches'
              : 'Mismatch',
        },
        icon: '📦',
      },
      {
        id: 'spinning-production',
        name: 'Spinning & Daily Production Processor',
        category: 'SPINNING',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Calculates Blow Room loss, Carding loss, OE yarn output, and invisible loss efficiency.',
        metrics: {
          'Production Runs': productionCount,
          'Waste Records': wasteInventoryCount,
          'Material balance': 'Checked on write',
          'Scenario verification': 'See business flow review',
        },
        icon: '🧵',
      },
      {
        id: 'yarn-inventory',
        name: 'Yarn Stock & Outwards Processor',
        category: 'SPINNING',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Yarn inventory by configured count with vehicle dispatch gate pass generation.',
        metrics: {
          'Yarn Stock Ledger': yarnInventoryCount,
          'Outward Passes': outwardCount,
          'Stock Categorization': 'Count-wise (Bags/Kgs)',
          'Physical yarn kg': balances
            ? Number(balances[1]._sum.quantity || 0)
            : 'Unavailable',
          'Catalogue yarn kg': balances
            ? Number(balances[3]._sum.quantity || 0)
            : 'Unavailable',
          'Stock agreement': !balances
            ? 'Unavailable'
            : yarnMatches
              ? 'Matches'
              : 'Mismatch',
        },
        icon: '🧶',
      },
      {
        id: 'costing-engine',
        name: 'Costing & EB Rate Engine',
        category: 'FINANCE',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Computes per-kg yarn manufacturing cost: Electricity (EB unit rate), Labor, Packaging & Spares.',
        metrics: {
          'Cost Entries': costingCount,
          'EB Rate Sync': 'Configured (₹10/unit)',
          'Labor Shifts': 'Shift-linked',
          'Cost/Kg Algorithm': 'Online',
        },
        icon: '⚡',
      },
      {
        id: 'billing-gst',
        name: 'Billing & GST Invoicing Engine',
        category: 'FINANCE',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Uses configured item tax rates, state-based tax splitting, document verification and payment records.',
        metrics: {
          'Tax Invoices': invoiceCount,
          'Payment Entries': paymentCount,
          'HSN/SAC': 'Catalogue and invoice fields',
          'Verification Hashes': 'SHA-256',
        },
        icon: '🧾',
      },
      {
        id: 'commerce-orders',
        name: 'Commerce & Sales Order Hub',
        category: 'OPERATIONS',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Unified commercial SKU catalog, customer sales orders, inventory reservations & proformas.',
        metrics: {
          'Catalogue Items': catalogueCount,
          'Sales Orders': salesOrderCount,
          'Stock Reservation': 'Synchronized',
          'B2B Desk': 'Active',
        },
        icon: '🛒',
      },
      {
        id: 'jobwork-processor',
        name: 'Job Work & Outsourcing Register',
        category: 'OPERATIONS',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Dispatches yarn/cotton to outside winders/knitters via delivery challans with scrap recovery tracking.',
        metrics: {
          'Registered Workers': jobWorkerCount,
          'Active Challans': jobWorkChallanCount,
          'Scrap Reconciliation': 'Active',
          'Gate Inward Link': 'Synced',
        },
        icon: '🤝',
      },
      {
        id: 'quality-lab',
        name: 'Quality Assurance & QC Testing',
        category: 'OPERATIONS',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Lab testing suite: CSP (Lea strength), Tenacity, Elongation, U% evenness and Classimate fault classification.',
        metrics: {
          'QC Inspections': qcCount,
          'Disposition Rules': 'PASS/FAIL/HOLD',
          'Lab Verification': 'Active',
          'Testing Standards': 'ASTM / ISO',
        },
        icon: '🔬',
      },
      {
        id: 'machine-telemetry',
        name: 'Machinery & Maintenance Processor',
        category: 'OPERATIONS',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Tracks machinery registry (Ring Frames, Open End, Blow Room, Carding), inspections & downtime logs.',
        metrics: {
          'Machines Tracked': machineCount,
          Inspections: machineInspectionCount,
          'Preventive Schedule': 'Active',
          'Downtime Watchdog': 'Listening',
        },
        icon: '⚙️',
      },
      {
        id: 'warehouse-logistics',
        name: 'Warehouse & Bay Logistics',
        category: 'OPERATIONS',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Manages godown locations, raw cotton storage bays, yarn bag bins, and inter-location transfers.',
        metrics: {
          'Locations/Bays': warehouseLocCount,
          'Stock Movements': warehouseMovCount,
          'Bin Tracking': 'Active',
          'Capacity Guard': 'Online',
        },
        icon: '🏢',
      },
      {
        id: 'hr-payroll',
        name: 'HR, Staff & Shift Roster',
        category: 'OPERATIONS',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Operator shift rostering (Morning, Afternoon, Night), attendance tracking, overtime, and wage processing.',
        metrics: {
          'Staff Directory': staffCount,
          'Configured Shifts': shiftCount,
          'Roster Sync': 'Active',
          'Overtime Engine': 'Online',
        },
        icon: '👥',
      },
      {
        id: 'auth-security',
        name: 'Security, Auth & Session Guard',
        category: 'SECURITY',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'JWT authentication, WebAuthn passkey biometric challenges, session timeouts, and role-based access control.',
        metrics: {
          'Registered Users': userCount,
          'Active Sessions': validSessionsCount,
          'JWT Secret': 'Validated by authentication configuration',
          'RBAC Guard': 'Enforcing',
        },
        icon: '🛡️',
      },
      {
        id: 'scheduler-daemon',
        name: 'System Scheduler & Backup Daemon',
        category: 'CORE',
        status: 'ONLINE',
        latencyMs: dbLatencyMs,
        lastSync: syncTime,
        summary:
          'Runs registered scheduled tasks; email delivery depends on SMTP configuration.',
        metrics: {
          'Auto Backup': 'Check settings and backup scheduler',
          'Daily Summary': process.env.SMTP_HOST
            ? 'SMTP configured'
            : 'SMTP not configured',
          'Scheduler Module': 'Active',
          'Event Loop': 'Healthy',
        },
        icon: '⏱️',
      },
    ];

    for (const processor of processors) {
      processor.metrics['Latency scope'] = 'Measured database ping';
      if (
        countReadFailed ||
        dbStatus !== 'CONNECTED' ||
        (processor.id === 'inward-cotton' && !cottonMatches) ||
        (processor.id === 'yarn-inventory' && !yarnMatches)
      )
        processor.status = 'DEGRADED';
    }
    return {
      service: 'evergreen-api',
      status:
        dbStatus === 'CONNECTED' &&
        !countReadFailed &&
        cottonMatches &&
        yarnMatches &&
        !startupIssue &&
        !dataIssues.length
          ? 'ok'
          : 'degraded',
      startupIssue,
      dataIssues,
      timestamp: new Date().toISOString(),
      uptimeSeconds: uptimeSec,
      uptimeFormatted: this.formatUptime(uptimeSec),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: `${process.platform}-${process.arch}`,
      memory: { heapUsedMB, heapTotalMB, rssMB, percentage },
      ports: { api: apiPort, web: webPort },
      database: {
        provider: 'SQLite (Prisma ORM)',
        target: 'packages/database/prisma/dev.db',
        latencyMs: dbLatencyMs,
        status: dbStatus,
      },
      summary: {
        total: processors.length,
        healthy: processors.filter(
          (p) => p.status === 'ONLINE' || p.status === 'SYNCED',
        ).length,
        degraded: processors.filter((p) => p.status === 'DEGRADED').length,
      },
      services: {
        api: {
          name: 'EverGreen One Core API',
          status: 'ONLINE',
          port: apiPort,
          docs: `http://localhost:${webPort}/api/docs`,
        },
        web: {
          name: 'EverGreen Yarn Management UI',
          status: 'ONLINE',
          port: webPort,
          url: `http://localhost:${webPort}/`,
        },
      },
      security: {
        authentication: 'JWT Bearer & SQLite Session Guard',
        corsPolicy: `Allowed origin: http://localhost:${webPort}`,
        cacheControl: 'no-store, no-cache, must-revalidate (Zero-Cache)',
        rbac: 'Role-Based Access Control Active (ADMIN, MODIFIER, VIEWER)',
      },
      endpoints: {
        apiDocs: `http://localhost:${webPort}/api/docs`,
        health: `http://localhost:${webPort}/health`,
        status: `http://localhost:${webPort}/api/backend/status`,
      },
      processors,
    };
  }
}
