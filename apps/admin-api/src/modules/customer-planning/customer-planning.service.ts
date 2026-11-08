import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../services/prisma.service';
import {
  CreateMilestoneDto,
  CreatePlanFromTemplateDto,
  CreatePlanTemplateDto,
  CreatePlanTemplateMilestoneDto,
  CreateRiskDto,
  LIFECYCLE_STAGES,
  MILESTONE_STATUSES,
  RISK_STATUSES,
  SEVERITIES,
  UpdateCustomerPlanDto,
  UpdateMilestoneDto,
  UpdatePlanTemplateDto,
  UpdateRiskDto,
} from './customer-planning.dto';

type HealthFactor = { key: string; label: string; points: number; detail: string };

const iso = (value?: string | null) => value ? new Date(value).toISOString() : null;
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const band = (score: number) => score >= 80 ? 'HEALTHY' : score >= 60 ? 'WATCH' : 'AT_RISK';

@Injectable()
export class CustomerPlanningService {
  constructor(private readonly prisma: PrismaService) {}

  private async company(companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, deploymentUrl: true, status: true, isMaintenance: true, expiresAt: true, graceExpiresAt: true, lastSyncAt: true, plan: true, cloudProvider: true, lastMigrationStatus: true } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  private async planId(companyId: string) {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM CustomerAccountPlan WHERE companyId = ? LIMIT 1', companyId);
    return rows[0]?.id;
  }

  private async activity(planId: string, action: string, actor: string, details?: string) {
    await this.prisma.$executeRawUnsafe(
      'INSERT INTO CustomerPlanActivity (id, planId, action, actor, details, createdAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      crypto.randomUUID(), planId, action, actor, details || null,
    );
  }

  async templates() {
    const templates = await this.prisma.$queryRawUnsafe<any[]>(
      'SELECT id, key, name, description, kind, active, createdAt, updatedAt FROM CustomerPlanTemplate ORDER BY name ASC',
    );
    const milestones = await this.prisma.$queryRawUnsafe<any[]>(
      'SELECT id, templateId, title, phase, daysFromStart, priority FROM CustomerPlanTemplateMilestone ORDER BY daysFromStart ASC, title ASC',
    );
    return templates.map(template => ({ ...template, milestones: milestones.filter(item => item.templateId === template.id) }));
  }

  async createTemplate(data: CreatePlanTemplateDto) {
    const id = crypto.randomUUID();
    try {
      await this.prisma.$executeRawUnsafe(
        'INSERT INTO CustomerPlanTemplate (id, key, name, description, kind, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        id, data.key.toUpperCase(), data.name, data.description || null, data.kind.toUpperCase(), data.active ?? true ? 1 : 0,
      );
    } catch (error) {
      if (error instanceof Error && /unique|constraint/i.test(error.message)) throw new BadRequestException('Template key already exists');
      throw error;
    }
    return this.templates().then(items => items.find(item => item.id === id));
  }

  async updateTemplate(id: string, data: UpdatePlanTemplateDto) {
    const exists = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM CustomerPlanTemplate WHERE id = ? LIMIT 1', id);
    if (!exists[0]) throw new NotFoundException('Plan template not found');
    await this.prisma.$executeRawUnsafe(
      'UPDATE CustomerPlanTemplate SET key = ?, name = ?, description = ?, kind = ?, active = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      data.key.toUpperCase(), data.name, data.description || null, data.kind.toUpperCase(), data.active ?? true ? 1 : 0, id,
    );
    return this.templates().then(items => items.find(item => item.id === id));
  }

  async addTemplateMilestone(templateId: string, data: CreatePlanTemplateMilestoneDto) {
    const exists = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM CustomerPlanTemplate WHERE id = ? LIMIT 1', templateId);
    if (!exists[0]) throw new NotFoundException('Plan template not found');
    await this.prisma.$executeRawUnsafe(
      'INSERT INTO CustomerPlanTemplateMilestone (id, templateId, title, phase, daysFromStart, priority, createdAt) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      crypto.randomUUID(), templateId, data.title, data.phase, data.daysFromStart ?? 0, data.priority || 'NORMAL',
    );
    return this.templates().then(items => items.find(item => item.id === templateId));
  }

  async listAccounts() {
    const companies = await this.prisma.company.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, cloudProvider: true, status: true, plan: true, expiresAt: true, lastSyncAt: true, isMaintenance: true } });
    const plans = await this.prisma.$queryRawUnsafe<any[]>('SELECT id, companyId, lifecycleStage, summary, nextReviewAt, healthScore, healthBand, updatedAt FROM CustomerAccountPlan');
    const counts = await this.prisma.$queryRawUnsafe<any[]>(`SELECT p.companyId,
      COUNT(DISTINCT CASE WHEN m.status NOT IN ('DONE','CANCELLED') THEN m.id END) AS openMilestones,
      COUNT(DISTINCT CASE WHEN r.status NOT IN ('RESOLVED','MITIGATED') THEN r.id END) AS openRisks,
      COUNT(DISTINCT CASE WHEN a.status IN ('OPEN','ACKNOWLEDGED') THEN a.id END) AS openAlerts
      FROM CustomerAccountPlan p
      LEFT JOIN CustomerPlanMilestone m ON m.planId = p.id
      LEFT JOIN CustomerPlanRisk r ON r.planId = p.id
      LEFT JOIN CustomerAlert a ON a.planId = p.id
      GROUP BY p.companyId`);
    return companies.map(company => ({ ...company, subscriptionPlan: company.plan, plan: plans.find(plan => plan.companyId === company.id) || null, counts: counts.find(item => item.companyId === company.id) || { openMilestones: 0, openRisks: 0, openAlerts: 0 } }));
  }

  async getPlan(companyId: string) {
    const company = await this.company(companyId);
    const plan = await this.prisma.$queryRawUnsafe<any[]>('SELECT * FROM CustomerAccountPlan WHERE companyId = ? LIMIT 1', companyId);
    if (!plan[0]) return { company, plan: null, milestones: [], risks: [], alerts: [], activities: [] };
    const item = plan[0];
    const [milestones, risks, alerts, activities, factors] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>('SELECT * FROM CustomerPlanMilestone WHERE planId = ? ORDER BY CASE WHEN status = \'DONE\' THEN 1 ELSE 0 END, dueAt ASC, createdAt ASC', item.id),
      this.prisma.$queryRawUnsafe<any[]>('SELECT * FROM CustomerPlanRisk WHERE planId = ? ORDER BY CASE severity WHEN \'CRITICAL\' THEN 0 WHEN \'HIGH\' THEN 1 WHEN \'MEDIUM\' THEN 2 ELSE 3 END, createdAt DESC', item.id),
      this.prisma.$queryRawUnsafe<any[]>('SELECT * FROM CustomerAlert WHERE planId = ? ORDER BY CASE severity WHEN \'CRITICAL\' THEN 0 WHEN \'HIGH\' THEN 1 WHEN \'MEDIUM\' THEN 2 ELSE 3 END, createdAt DESC', item.id),
      this.prisma.$queryRawUnsafe<any[]>('SELECT * FROM CustomerPlanActivity WHERE planId = ? ORDER BY createdAt DESC LIMIT 100', item.id),
      this.healthFactors(companyId, item.id, company),
    ]);
    return { company, plan: { ...item, healthFactors: factors.factors }, milestones, risks, alerts, activities };
  }

  async createFromTemplate(companyId: string, data: CreatePlanFromTemplateDto, actor = 'Provider operator') {
    const company = await this.company(companyId);
    const existing = await this.planId(companyId);
    if (existing) throw new BadRequestException('Customer already has a plan');
    const templates = await this.templates();
    const template = templates.find(item => item.key === data.templateKey.toUpperCase() && item.active);
    if (!template) throw new BadRequestException('Active plan template not found');
    const planId = crypto.randomUUID();
    const start = new Date();
    const nextReview = data.nextReviewAt ? new Date(data.nextReviewAt) : new Date(start.getTime() + 14 * 86400000);
    await this.prisma.$transaction(async tx => {
      await tx.$executeRawUnsafe(
        'INSERT INTO CustomerAccountPlan (id, companyId, templateId, lifecycleStage, summary, nextReviewAt, healthScore, healthBand, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, \'AT_RISK\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        planId, companyId, template.id, template.kind === 'RENEWAL' ? 'RENEWAL' : template.kind === 'RECOVERY' ? 'AT_RISK' : 'ONBOARDING', data.summary || null, nextReview.toISOString(),
      );
      for (const milestone of template.milestones) {
        const due = new Date(start.getTime() + Number(milestone.daysFromStart || 0) * 86400000).toISOString();
        await tx.$executeRawUnsafe(
          'INSERT INTO CustomerPlanMilestone (id, planId, title, phase, owner, priority, status, dueAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, NULL, ?, \'OPEN\', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          crypto.randomUUID(), planId, milestone.title, milestone.phase, milestone.priority, due,
        );
      }
      await tx.$executeRawUnsafe('INSERT INTO CustomerPlanActivity (id, planId, action, actor, details, createdAt) VALUES (?, ?, \'PLAN_CREATED\', ?, ?, CURRENT_TIMESTAMP)', crypto.randomUUID(), planId, actor, `Created ${template.name} for ${company.name}`);
    });
    await this.refreshCompany(companyId);
    return this.getPlan(companyId);
  }

  async updatePlan(companyId: string, data: UpdateCustomerPlanDto, actor = 'Provider operator') {
    const planId = await this.planId(companyId);
    if (!planId) throw new NotFoundException('Customer plan not found');
    if (data.lifecycleStage && !LIFECYCLE_STAGES.includes(data.lifecycleStage as any)) throw new BadRequestException('Invalid lifecycle stage');
    if (data.nextReviewAt === undefined) {
      await this.prisma.$executeRawUnsafe(
        'UPDATE CustomerAccountPlan SET lifecycleStage = COALESCE(?, lifecycleStage), summary = COALESCE(?, summary), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        data.lifecycleStage || null, data.summary ?? null, planId,
      );
    } else {
      await this.prisma.$executeRawUnsafe(
        'UPDATE CustomerAccountPlan SET lifecycleStage = COALESCE(?, lifecycleStage), summary = COALESCE(?, summary), nextReviewAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        data.lifecycleStage || null, data.summary ?? null, iso(data.nextReviewAt), planId,
      );
    }
    await this.activity(planId, 'PLAN_UPDATED', actor, JSON.stringify(data));
    await this.refreshCompany(companyId);
    return this.getPlan(companyId);
  }

  async addMilestone(companyId: string, data: CreateMilestoneDto, actor = 'Provider operator') {
    const planId = await this.planId(companyId);
    if (!planId) throw new NotFoundException('Customer plan not found');
    const id = crypto.randomUUID();
    await this.prisma.$executeRawUnsafe(
      'INSERT INTO CustomerPlanMilestone (id, planId, title, phase, owner, priority, status, dueAt, blocker, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      id, planId, data.title, data.phase, data.owner || null, data.priority || 'NORMAL', data.status || 'OPEN', iso(data.dueAt), data.blocker || null,
    );
    await this.activity(planId, 'MILESTONE_CREATED', actor, data.title);
    return this.getPlan(companyId);
  }

  async updateMilestone(companyId: string, milestoneId: string, data: UpdateMilestoneDto, actor = 'Provider operator') {
    const planId = await this.planId(companyId);
    if (!planId) throw new NotFoundException('Customer plan not found');
    const status = data.status;
    await this.prisma.$executeRawUnsafe(
      'UPDATE CustomerPlanMilestone SET title = ?, phase = ?, owner = ?, priority = ?, status = ?, dueAt = ?, blocker = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND planId = ?',
      data.title, data.phase, data.owner || null, data.priority || 'NORMAL', status || 'OPEN', iso(data.dueAt), data.blocker || null, status === 'DONE' ? new Date().toISOString() : null, milestoneId, planId,
    );
    await this.activity(planId, 'MILESTONE_UPDATED', actor, milestoneId);
    await this.refreshCompany(companyId);
    return this.getPlan(companyId);
  }

  async addRisk(companyId: string, data: CreateRiskDto, actor = 'Provider operator') {
    const planId = await this.planId(companyId);
    if (!planId) throw new NotFoundException('Customer plan not found');
    const id = crypto.randomUUID();
    await this.prisma.$executeRawUnsafe(
      'INSERT INTO CustomerPlanRisk (id, planId, title, details, severity, status, mitigation, dueAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      id, planId, data.title, data.details || null, data.severity || 'MEDIUM', data.status || 'OPEN', data.mitigation || null, iso(data.dueAt),
    );
    await this.activity(planId, 'RISK_CREATED', actor, data.title);
    await this.refreshCompany(companyId);
    return this.getPlan(companyId);
  }

  async updateRisk(companyId: string, riskId: string, data: UpdateRiskDto, actor = 'Provider operator') {
    const planId = await this.planId(companyId);
    if (!planId) throw new NotFoundException('Customer plan not found');
    await this.prisma.$executeRawUnsafe(
      'UPDATE CustomerPlanRisk SET title = ?, details = ?, severity = ?, status = ?, mitigation = ?, dueAt = ?, resolvedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND planId = ?',
      data.title, data.details || null, data.severity || 'MEDIUM', data.status || 'OPEN', data.mitigation || null, iso(data.dueAt), ['RESOLVED', 'MITIGATED'].includes(data.status || '') ? new Date().toISOString() : null, riskId, planId,
    );
    await this.activity(planId, 'RISK_UPDATED', actor, riskId);
    await this.refreshCompany(companyId);
    return this.getPlan(companyId);
  }

  async alerts(companyId?: string, status?: string) {
    const where = companyId ? ' WHERE p.companyId = ?' : '';
    const suffix = status ? `${where ? ' AND' : ' WHERE'} a.status = ?` : '';
    return this.prisma.$queryRawUnsafe<any[]>(`SELECT a.*, p.companyId, c.name AS companyName FROM CustomerAlert a INNER JOIN CustomerAccountPlan p ON p.id = a.planId INNER JOIN Company c ON c.id = p.companyId${where}${suffix} ORDER BY CASE a.severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, a.createdAt DESC`, ...([...(companyId ? [companyId] : []), ...(status ? [status] : [])]));
  }

  async updateAlert(id: string, action: 'ACKNOWLEDGE' | 'RESOLVE', actor = 'Provider operator') {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ planId: string }>>('SELECT planId FROM CustomerAlert WHERE id = ? LIMIT 1', id);
    if (!rows[0]) throw new NotFoundException('Customer alert not found');
    const status = action === 'RESOLVE' ? 'RESOLVED' : 'ACKNOWLEDGED';
    await this.prisma.$executeRawUnsafe(`UPDATE CustomerAlert SET status = ?, ${action === 'RESOLVE' ? 'resolvedAt' : 'acknowledgedAt'} = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, status, id);
    await this.activity(rows[0].planId, `ALERT_${action}`, actor, id);
    return this.alerts();
  }

  private async healthFactors(companyId: string, planId: string, company: any): Promise<{ score: number; band: string; factors: HealthFactor[] }> {
    const factors: HealthFactor[] = [];
    let score = 100;
    const now = Date.now();
    const lastSync = company.lastSyncAt ? new Date(company.lastSyncAt).getTime() : 0;
    const syncAgeHours = lastSync ? (now - lastSync) / 3600000 : Infinity;
    const syncPenalty = syncAgeHours === Infinity ? 25 : syncAgeHours > 72 ? 25 : syncAgeHours > 24 ? 15 : 0;
    score -= syncPenalty;
    factors.push({ key: 'SYNC', label: 'Sync freshness', points: -syncPenalty, detail: lastSync ? `${Math.round(syncAgeHours)} hours since last sync` : 'No sync has been received' });

    let apiPenalty = 0;
    if (company.deploymentUrl) {
      try {
        const response = await fetch(`${company.deploymentUrl.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(3000), redirect: 'error' });
        if (!response.ok) apiPenalty = 20;
      } catch { apiPenalty = 20; }
    } else apiPenalty = 10;
    score -= apiPenalty;
    factors.push({ key: 'API', label: 'Customer API', points: -apiPenalty, detail: company.deploymentUrl ? (apiPenalty ? 'Health check failed' : 'Health check passed') : 'Deployment URL is not configured' });

    const failedJobs = await this.prisma.$queryRawUnsafe<Array<{ count: number }>>('SELECT COUNT(*) AS count FROM ReleaseJob WHERE companyId = ? AND status IN (\'FAILED\', \'CANCELLED\') AND createdAt >= datetime(\'now\', \'-30 day\')', companyId);
    const deploymentPenalty = Number(failedJobs[0]?.count || 0) > 0 ? 15 : 0;
    score -= deploymentPenalty;
    factors.push({ key: 'DEPLOYMENTS', label: 'Deployments', points: -deploymentPenalty, detail: deploymentPenalty ? `${failedJobs[0].count} failed deployment jobs in the last 30 days` : 'No failed deployment jobs in the last 30 days' });

    const risks = await this.prisma.$queryRawUnsafe<Array<{ severity: string; count: number }>>('SELECT severity, COUNT(*) AS count FROM CustomerPlanRisk WHERE planId = ? AND status NOT IN (\'RESOLVED\', \'MITIGATED\') GROUP BY severity', planId);
    const criticalRisks = risks.filter(risk => risk.severity === 'CRITICAL').reduce((sum, risk) => sum + Number(risk.count), 0);
    const highRisks = risks.filter(risk => risk.severity === 'HIGH').reduce((sum, risk) => sum + Number(risk.count), 0);
    const riskPenalty = Math.min(20, criticalRisks * 15 + highRisks * 8);
    score -= riskPenalty;
    factors.push({ key: 'RISKS', label: 'Open risks', points: -riskPenalty, detail: `${criticalRisks} critical and ${highRisks} high risks remain open` });

    let licensePenalty = company.status === 'SUSPENDED' ? 35 : company.status === 'GRACE_PERIOD' ? 15 : 0;
    if (company.expiresAt) {
      const days = (new Date(company.expiresAt).getTime() - now) / 86400000;
      if (days < 0) licensePenalty = Math.max(licensePenalty, 25);
      else if (days <= 30) licensePenalty = Math.max(licensePenalty, 10);
    }
    score -= licensePenalty;
    factors.push({ key: 'LICENSE', label: 'License and renewal', points: -licensePenalty, detail: licensePenalty ? `${company.status} or renewal requires attention` : 'License is active and outside the renewal window' });

    const overdue = await this.prisma.$queryRawUnsafe<Array<{ count: number }>>('SELECT COUNT(*) AS count FROM CustomerPlanMilestone WHERE planId = ? AND status NOT IN (\'DONE\', \'CANCELLED\') AND dueAt IS NOT NULL AND dueAt < CURRENT_TIMESTAMP', planId);
    const overduePenalty = Math.min(10, Number(overdue[0]?.count || 0) * 5);
    score -= overduePenalty;
    factors.push({ key: 'PLAN', label: 'Plan execution', points: -overduePenalty, detail: `${Number(overdue[0]?.count || 0)} overdue milestones` });

    const result = clamp(score);
    return { score: result, band: band(result), factors };
  }

  async refreshCompany(companyId: string) {
    const planId = await this.planId(companyId);
    if (!planId) return null;
    const company = await this.company(companyId);
    const health = await this.healthFactors(companyId, planId, company);
    await this.prisma.$executeRawUnsafe('UPDATE CustomerAccountPlan SET healthScore = ?, healthBand = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', health.score, health.band, planId);
    await this.syncAlerts(companyId, planId, company, health);
    return health;
  }

  private async syncAlerts(companyId: string, planId: string, company: any, health: { score: number; band: string; factors: HealthFactor[] }) {
    const syncAge = company.lastSyncAt ? (Date.now() - new Date(company.lastSyncAt).getTime()) / 3600000 : Infinity;
    await this.alert(planId, `sync-stale:${companyId}`, 'SYNC_STALE', syncAge > 72 ? 'HIGH' : 'MEDIUM', 'Customer sync is stale', syncAge === Infinity ? 'No customer sync has been received.' : `Last sync was ${Math.round(syncAge)} hours ago.`, syncAge > 24);
    await this.alert(planId, `license:${companyId}`, 'LICENSE', company.status === 'SUSPENDED' ? 'CRITICAL' : 'HIGH', 'Customer license needs attention', `Current status: ${company.status}.`, company.status !== 'ACTIVE');
    await this.alert(planId, `api:${companyId}`, 'API_HEALTH', 'HIGH', 'Customer API health check failed', 'The customer deployment did not return a healthy response.', health.factors.some(factor => factor.key === 'API' && factor.points < 0));
    const failedJobs = await this.prisma.$queryRawUnsafe<Array<{ count: number }>>('SELECT COUNT(*) AS count FROM ReleaseJob WHERE companyId = ? AND status IN (\'FAILED\', \'CANCELLED\') AND createdAt >= datetime(\'now\', \'-30 day\')', companyId);
    await this.alert(planId, `deployments:${companyId}`, 'DEPLOYMENT_FAILURE', 'HIGH', 'Customer deployment failures detected', `${failedJobs[0]?.count || 0} failed deployment jobs in the last 30 days.`, Number(failedJobs[0]?.count || 0) > 0);
    const overdue = await this.prisma.$queryRawUnsafe<Array<{ count: number }>>('SELECT COUNT(*) AS count FROM CustomerPlanMilestone WHERE planId = ? AND status NOT IN (\'DONE\', \'CANCELLED\') AND dueAt IS NOT NULL AND dueAt < CURRENT_TIMESTAMP', planId);
    await this.alert(planId, `milestones:${companyId}`, 'OVERDUE_MILESTONES', 'MEDIUM', 'Customer plan milestones are overdue', `${overdue[0]?.count || 0} milestones are past due.`, Number(overdue[0]?.count || 0) > 0);
  }

  private async alert(planId: string, fingerprint: string, type: string, severity: string, title: string, details: string, active: boolean) {
    if (active) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO CustomerAlert (id, planId, fingerprint, type, severity, status, title, details, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(fingerprint) DO UPDATE SET severity = excluded.severity, title = excluded.title, details = excluded.details, status = CASE WHEN CustomerAlert.status = 'ACKNOWLEDGED' THEN CustomerAlert.status ELSE 'OPEN' END, resolvedAt = NULL, updatedAt = CURRENT_TIMESTAMP`,
        crypto.randomUUID(), planId, fingerprint, type, severity, title, details,
      );
    } else {
      await this.prisma.$executeRawUnsafe("UPDATE CustomerAlert SET status = 'RESOLVED', resolvedAt = COALESCE(resolvedAt, CURRENT_TIMESTAMP), updatedAt = CURRENT_TIMESTAMP WHERE fingerprint = ? AND status <> 'RESOLVED'", fingerprint);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshAll() {
    const companies = await this.prisma.company.findMany({ select: { id: true } });
    for (const company of companies) await this.refreshCompany(company.id).catch(() => undefined);
  }
}
