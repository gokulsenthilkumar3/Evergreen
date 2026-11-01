import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type SupportTicket,
  type SupportTicketEvent,
} from '@prisma/client';
import { randomUUID, createHash } from 'node:crypto';
import { PrismaService } from '../../services/prisma.service';
import { appendUserAudit, userAuditHash } from '../../utils/user-audit';
import { supportSla } from './helpdesk-resources';
import { supportText } from './helpdesk-content';
import { HELP_DESK_INTEGRATION_ACTOR } from './helpdesk-ingress-auth';
import {
  checkTicketChain,
  deriveHelpdeskProof,
  ticketEventHash,
  TICKET_AUDIT_ROOT,
} from './helpdesk-proof';
import type {
  AssignTicketDto,
  CreateTicketDto,
  HelpdeskActor,
  TicketFeedbackDto,
  TicketMessageDto,
  UpdateTicketDto,
} from './helpdesk.dto';

const snapshot = (ticket: SupportTicket) =>
  JSON.stringify({
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    createdBy: ticket.createdBy,
    requesterId: ticket.requesterId,
    assigneeId: ticket.assigneeId,
    queue: ticket.queue,
    resolution: ticket.resolution,
    resolvedById: ticket.resolvedById,
    resolvedAt: ticket.resolvedAt,
    confirmedById: ticket.confirmedById,
    confirmedAt: ticket.confirmedAt,
    closedAt: ticket.closedAt,
    version: ticket.version,
    ...((ticket.tagsJson && ticket.tagsJson !== '[]') ||
    (ticket.customFieldsJson && ticket.customFieldsJson !== '{}') ||
    (ticket.watchersJson && ticket.watchersJson !== '[]') ||
    ticket.dueAt ||
    ticket.parentId ||
    ticket.mergedIntoId ||
    ticket.slaPolicyJson
      ? {
          extensions: {
            tagsJson: ticket.tagsJson,
            customFieldsJson: ticket.customFieldsJson,
            watchersJson: ticket.watchersJson,
            dueAt: ticket.dueAt,
            parentId: ticket.parentId,
            mergedIntoId: ticket.mergedIntoId,
            slaPolicyJson: ticket.slaPolicyJson,
          },
        }
      : {}),
  });
const transitions: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'PENDING', 'ON_HOLD', 'RESOLVED'],
  IN_PROGRESS: ['OPEN', 'PENDING', 'ON_HOLD', 'RESOLVED'],
  PENDING: ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED'],
  ON_HOLD: ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['OPEN', 'IN_PROGRESS', 'PENDING', 'ON_HOLD', 'RESOLVED'],
};
@Injectable()
export class HelpdeskService {
  constructor(protected readonly prisma: PrismaService) {}
  protected scope(actor: HelpdeskActor): Prisma.SupportTicketWhereInput {
    if (!Number.isInteger(actor.userId) || actor.userId < 1 || !actor.username)
      throw new ForbiddenException('Authenticated staff identity is required');
    return actor.role === 'ADMIN'
      ? {}
      : {
          OR: [
            { requesterId: actor.userId },
            { requesterId: null, createdBy: actor.username },
          ],
        };
  }
  protected async visible(
    db: Prisma.TransactionClient,
    id: string,
    actor: HelpdeskActor,
  ) {
    const ticket = await db.supportTicket.findFirst({
      where: { id, ...this.scope(actor) },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
  protected async principal(
    tx: Prisma.TransactionClient,
    actor: HelpdeskActor,
  ) {
    const source = (
      actor as HelpdeskActor & { [HELP_DESK_INTEGRATION_ACTOR]?: string }
    )[HELP_DESK_INTEGRATION_ACTOR];
    if (source && actor.userId === 0 && actor.role === 'INTEGRATION')
      return {
        id: 0,
        publicId: `integration:${source}`,
        username: actor.username,
        status: 'ACTIVE',
        role: 'INTEGRATION',
      };
    const user = await tx.user.findUnique({
      where: { id: actor.userId },
      select: {
        id: true,
        publicId: true,
        username: true,
        status: true,
        role: true,
      },
    });
    if (
      !user ||
      user.status !== 'ACTIVE' ||
      user.username !== actor.username ||
      user.role !== actor.role
    )
      throw new ForbiddenException(
        'Account authorization changed; sign in again',
      );
    return user;
  }
  protected requireAdmin(actor: HelpdeskActor) {
    if (actor.role !== 'ADMIN')
      throw new ForbiddenException(
        'Only installation administrators can triage tickets',
      );
  }
  protected async event(
    tx: Prisma.TransactionClient,
    ticket: SupportTicket,
    actor: HelpdeskActor,
    kind: string,
    payload: Record<string, unknown>,
    visibility = 'PUBLIC',
    requestKey: string | null = null,
  ) {
    const principal = await this.principal(tx, actor);
    const previous = await tx.supportTicketEvent.findFirst({
      where: { ticketId: ticket.id },
      orderBy: { version: 'desc' },
    });
    const event = {
      id: randomUUID(),
      ticketId: ticket.id,
      version: ticket.version,
      requestKey,
      actorId: actor.userId,
      actorPublicId: principal.publicId,
      actorUsername: actor.username,
      kind,
      visibility,
      payload: JSON.stringify({ ...payload, snapshot: snapshot(ticket) }),
      previousHash: previous?.hash || TICKET_AUDIT_ROOT,
      createdAt: new Date(),
    };
    const saved = await tx.supportTicketEvent.create({
      data: { ...event, hash: ticketEventHash(event) },
    });
    await appendUserAudit(tx, {
      data: {
        username: actor.username,
        action: 'HELPDESK_EVENT',
        module: 'HELPDESK',
        details: `Ticket ${ticket.id}: ${kind}; event ${saved.id}; hash ${saved.hash}`,
      },
    });
    const recipients = new Set<number>([
      ...(ticket.requesterId ? [ticket.requesterId] : []),
      ...(ticket.assigneeId ? [ticket.assigneeId] : []),
      ...JSON.parse(ticket.watchersJson || '[]'),
    ]);
    if (['CREATED','OWNER_ATTENTION_REQUESTED','REJECTED_FIX','SLA_THRESHOLD_REACHED'].includes(kind)) {
      const queue = await tx.supportResource.findFirst({
        where: { kind: 'QUEUE', key: ticket.queue, status: 'ACTIVE' },
      });
      const members = queue ? JSON.parse(queue.data).members : [];
      if (members.length) members.forEach((id: number) => recipients.add(id));
      else
        (
          await tx.user.findMany({
            where: { status: 'ACTIVE', role: 'ADMIN' },
            select: { id: true },
            take: 100,
          })
        ).forEach((person) => recipients.add(person.id));
    }
    const mentioned =
      typeof payload.text === 'string'
        ? [...payload.text.matchAll(/@([A-Za-z0-9._-]{1,100})\b/g)].map(
            (match) => match[1],
          )
        : [];
    if (mentioned.length) {
      const people = await tx.user.findMany({
        where: {
          username: { in: mentioned.slice(0, 20) },
          status: 'ACTIVE',
          role: 'ADMIN',
        },
        select: { id: true },
      });
      for (const person of people) recipients.add(person.id);
    }
    for (const userId of recipients) {
      if (userId === actor.userId) continue;
      const recipient = await tx.user.findUnique({
        where: { id: userId },
        select: { role: true, status: true },
      });
      if (
        !recipient ||
        recipient.status !== 'ACTIVE' ||
        (recipient.role !== 'ADMIN' &&
          (visibility === 'INTERNAL' || ticket.requesterId !== userId))
      )
        continue;
      const pref = await tx.supportResource.findUnique({
        where: { scopeKey: `PREFERENCE:${userId}:DEFAULT` },
      });
      if (pref && JSON.parse(pref.data).portalUpdates === false) continue;
      await tx.supportResource.create({
        data: {
          scopeKey: `NOTIFICATION:${userId}:${saved.id}`,
          kind: 'NOTIFICATION',
          key: saved.id,
          title: ticket.subject,
          ownerId: userId,
          visibility: 'PRIVATE',
          data: JSON.stringify({
            ticketId: ticket.id,
            eventId: saved.id,
            kind,
          }),
        },
      });
    }
    return saved;
  }
  protected async integrity(
    db: Prisma.TransactionClient,
    ticket: SupportTicket,
    events: SupportTicketEvent[],
  ) {
    const chain = checkTicketChain(events, ticket.version);
    if (!chain.valid)
      return { ...chain, projectionValid: false, ledgerLinked: false };
    let projectionValid = false;
    try {
      projectionValid =
        JSON.parse(events[events.length - 1].payload).snapshot ===
        snapshot(ticket);
    } catch {
      /* Unparseable payload is not evidence. */
    }
    const links = await db.userAuditLedger.findMany({
      where: {
        module: 'HELPDESK',
        action: 'HELPDESK_EVENT',
        details: { startsWith: `Ticket ${ticket.id}: ` },
      },
    });
    const receipts = new Set(
      links
        .filter((row) => userAuditHash(row) === row.hash)
        .map((row) => row.details),
    );
    const ledgerLinked = events.every((event) =>
      receipts.has(
        `Ticket ${ticket.id}: ${event.kind}; event ${event.id}; hash ${event.hash}`,
      ),
    );
    return {
      ...chain,
      valid: chain.valid && projectionValid && ledgerLinked,
      projectionValid,
      ledgerLinked,
    };
  }
  list(actor: HelpdeskActor) {
    // Installation databases are isolated. No provider ticket or claimed external delivery is introduced.
    return this.prisma.supportTicket.findMany({
      where: this.scope(actor),
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }
  async detail(id: string, actor: HelpdeskActor) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await this.visible(tx, id, actor);
      const events = await tx.supportTicketEvent.findMany({
        where: { ticketId: id },
        orderBy: { version: 'asc' },
      });
      const integrity = await this.integrity(tx, ticket, events);
      return {
        ...ticket,
        sla: integrity.valid
          ? supportSla(ticket, events, ticket.requesterId)
          : null,
        proof: deriveHelpdeskProof(ticket, events, integrity.valid),
        integrity,
        canConfirm:
          (ticket.requesterId === actor.userId ||
            (!ticket.requesterId && ticket.createdBy === actor.username)) &&
          ticket.resolvedById !== null &&
          ticket.resolvedById !== actor.userId &&
          ['RESOLVED', 'CLOSED'].includes(ticket.status) &&
          integrity.valid,
        events: events
          .filter(
            (event) => actor.role === 'ADMIN' || event.visibility === 'PUBLIC',
          )
          .map((event) => ({
            id: event.id,
            version: event.version,
            kind: event.kind,
            visibility: event.visibility,
            actorUsername: event.actorUsername,
            createdAt: event.createdAt,
            ...this.publicPayload(event.payload),
          })),
      };
    });
  }
  private publicPayload(payload: string) {
    try {
      const { snapshot: _snapshot, ...display } = JSON.parse(payload);
      return display;
    } catch {
      return {};
    }
  }
  protected async intakeConfiguration(
    tx: Prisma.TransactionClient,
    category: string,
    priority: string,
  ) {
    if (
      !['BUG', 'QUESTION', 'ACCESS', 'INTEGRATION', 'BILLING', 'DATA'].includes(
        category,
      ) &&
      !(await tx.supportResource.findFirst({
        where: { kind: 'CATEGORY', key: category, status: 'ACTIVE' },
      }))
    )
      throw new BadRequestException('Unknown active support category');
    const rules = await tx.supportResource.findMany({
      where: { kind: 'RULE', status: 'ACTIVE' },
      orderBy: { key: 'asc' },
    });
    let queue = 'TRIAGE';
    for (const rule of rules) {
      const data = JSON.parse(rule.data);
      if (
        data.enabled &&
        (data.category === '*' || data.category === category) &&
        (data.priority === '*' || data.priority === priority)
      ) {
        queue = data.queue;
        break;
      }
    }
    const configured = await tx.supportResource.findFirst({
      where: { kind: 'QUEUE', key: queue, status: 'ACTIVE' },
    });
    let assigneeId: number | null = null;
    if (configured) {
      const data = JSON.parse(configured.data);
      if (data.routing !== 'MANUAL') {
        const available: { id: number; load: number }[] = [];
        for (const id of data.members) {
          const user = await tx.user.findUnique({
            where: { id },
            select: { status: true, role: true },
          });
          if (user?.status !== 'ACTIVE' || user.role !== 'ADMIN') continue;
          const load = await tx.supportTicket.count({
            where: {
              assigneeId: id,
              status: { notIn: ['RESOLVED', 'CLOSED'] },
              mergedIntoId: null,
            },
          });
          if (load < data.capacity) available.push({ id, load });
        }
        if (data.routing === 'LEAST_LOADED')
          available.sort((a, b) => a.load - b.load || a.id - b.id);
        if (data.routing === 'ROUND_ROBIN' && available.length) {
          const last = await tx.supportTicket.findFirst({
            where: { queue, assigneeId: { in: available.map((a) => a.id) } },
            orderBy: { createdAt: 'desc' },
            select: { assigneeId: true },
          });
          const index = available.findIndex((a) => a.id === last?.assigneeId);
          assigneeId = available[(index + 1) % available.length].id;
        } else assigneeId = available[0]?.id ?? null;
      }
    }
    const policies = await tx.supportResource.findMany({
      where: { kind: 'SLA', status: 'ACTIVE' },
      orderBy: { key: 'asc' },
    });
    const selected = policies
      .filter((p) => JSON.parse(p.data).priority === priority)
      .sort(
        (a, b) =>
          Number(JSON.parse(b.data).queue === queue) -
          Number(JSON.parse(a.data).queue === queue),
      )
      .find((p) => ['*', queue].includes(JSON.parse(p.data).queue));
    let slaPolicyJson: string | null = null;
    if (selected) {
      const policy = JSON.parse(selected.data);
      const calendar = policy.calendarKey
        ? await tx.supportResource.findFirst({
            where: {
              kind: 'CALENDAR',
              key: policy.calendarKey,
              status: 'ACTIVE',
            },
          })
        : null;
      if (policy.calendarKey && !calendar)
        throw new BadRequestException('SLA calendar is not configured');
      slaPolicyJson = JSON.stringify({
        ...policy,
        title: selected.title,
        revision: selected.version,
        calendar: calendar ? JSON.parse(calendar.data) : null,
      });
    }
    return { queue, assigneeId, slaPolicyJson };
  }
  async create(body: CreateTicketDto, actor: HelpdeskActor) {
    const data = {
      subject: supportText(body.subject.trim()),
      description: supportText(body.description.trim()),
      category: body.category,
      priority: body.priority,
      createdBy: actor.username,
      requesterId: actor.userId,
    };
    if (data.subject.length < 3 || data.description.length < 10)
      throw new BadRequestException(
        'Describe the issue with a meaningful subject and steps.',
      );
    const replay = async (row: SupportTicket) => {
      if (row.requesterId !== actor.userId || row.createdBy !== actor.username)
        throw new ConflictException(
          'This submission key was already used. Start a new ticket.',
        );
      const intake = await this.prisma.supportTicketEvent.findFirst({
        where: { ticketId: row.id, kind: 'CREATED' },
        orderBy: { version: 'asc' },
      });
      let original: Record<string, unknown> = row as unknown as Record<
        string,
        unknown
      >;
      if (intake) {
        if (ticketEventHash(intake) !== intake.hash)
          throw new ConflictException(
            'The original submission receipt failed its integrity check',
          );
        try {
          original = JSON.parse(JSON.parse(intake.payload).snapshot);
        } catch {
          throw new ConflictException(
            'The original submission receipt is invalid',
          );
        }
      }
      if (Object.entries(data).some(([key, value]) => original[key] !== value))
        throw new ConflictException(
          'This submission key was already used. Start a new ticket.',
        );
      return row;
    };
    const existing = await this.prisma.supportTicket.findUnique({
      where: { requestKey: body.requestKey },
    });
    if (existing) return replay(existing);
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.principal(tx, actor);
        const ticket = await tx.supportTicket.create({
          data: {
            ...data,
            requestKey: body.requestKey,
            ...(await this.intakeConfiguration(
              tx,
              body.category,
              body.priority,
            )),
          },
        });
        await this.event(tx, ticket, actor, 'CREATED', {});
        return ticket;
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        const row = await this.prisma.supportTicket.findUnique({
          where: { requestKey: body.requestKey },
        });
        if (row) return replay(row);
      }
      throw error;
    }
  }
  protected async change(
    tx: Prisma.TransactionClient,
    ticket: SupportTicket,
    version: number,
    data: Prisma.SupportTicketUpdateManyMutationInput,
  ) {
    if (ticket.mergedIntoId)
      throw new ConflictException(
        'Merged tickets are read-only. Continue on the primary ticket.',
      );
    const changed = await tx.supportTicket.updateMany({
      where: { id: ticket.id, version },
      data: { ...data, version: { increment: 1 } },
    });
    if (changed.count !== 1)
      throw new ConflictException('The ticket changed. Refresh before saving.');
    return tx.supportTicket.findUniqueOrThrow({ where: { id: ticket.id } });
  }
  async update(id: string, body: UpdateTicketDto, actor: HelpdeskActor) {
    this.requireAdmin(actor);
    return this.prisma.$transaction(async (tx) => {
      const ticket = await this.visible(tx, id, actor);
      if (ticket.mergedIntoId)
        throw new ConflictException(
          'This ticket was merged. Continue on the primary ticket.',
        );
      const reason = supportText(body.resolution?.trim() || '');
      if (
        ticket.status !== body.status &&
        !transitions[ticket.status]?.includes(body.status)
      )
        throw new ConflictException(
          'This ticket status transition is not allowed',
        );
      if (!reason)
        throw new BadRequestException(
          'Add a resolution or reason for this status update.',
        );
      if (
        ['RESOLVED', 'CLOSED'].includes(ticket.status) &&
        ticket.status === body.status
      )
        throw new ConflictException(
          'Reopen the ticket before changing a resolution.',
        );
      const data: Prisma.SupportTicketUpdateManyMutationInput = {
        status: body.status,
      };
      if (body.status === 'RESOLVED') {
        Object.assign(data, {
          resolution: reason,
          resolvedById: actor.userId,
          resolvedAt: new Date(),
          confirmedAt: null,
          confirmedById: null,
          closedAt: null,
        });
      }
      if (body.status === 'REOPENED') {
        Object.assign(data, {
          resolution: null,
          resolvedById: null,
          resolvedAt: null,
          confirmedAt: null,
          confirmedById: null,
          closedAt: null,
        });
      }
      if (body.status === 'CLOSED') data.closedAt = new Date();
      const updated = await this.change(tx, ticket, body.version, data);
      await this.event(
        tx,
        updated,
        actor,
        body.status === ticket.status ? 'PROGRESS_NOTE' : body.status,
        { status: body.status, text: reason },
      );
      return updated;
    });
  }
  async message(id: string, body: TicketMessageDto, actor: HelpdeskActor) {
    if (body.visibility === 'INTERNAL') this.requireAdmin(actor);
    const text = supportText(body.text.trim());
    if (!text) throw new BadRequestException('Reply text is required');
    const kind =
      body.visibility === 'INTERNAL' ? 'INTERNAL_NOTE' : 'PUBLIC_REPLY';
    const replay = (event: SupportTicketEvent) => {
      let payload: any;
      try {
        payload = JSON.parse(event.payload);
      } catch {
        throw new ConflictException('Invalid message receipt');
      }
      if (
        event.ticketId !== id ||
        event.actorId !== actor.userId ||
        event.kind !== kind ||
        payload.text !== text || (payload.aiDraftId??null)!==(body.aiDraftId??null)
      )
        throw new ConflictException(
          'This reply key was already used. Start a new reply.',
        );
      return { id: event.id, saved: true };
    };
    try {
      return await this.prisma.$transaction(async (tx) => {
        const ticket = await this.visible(tx, id, actor);
        const previous = await tx.supportTicketEvent.findUnique({
          where: { requestKey: body.requestKey },
        });
        if (previous) return replay(previous);
        if(body.aiDraftId){
          const draft=await tx.supportResource.findFirst({where:{id:body.aiDraftId,kind:'AI_DRAFT',ownerId:actor.userId,key:id}});if(!draft)throw new ForbiddenException('AI draft does not belong to this account and ticket');
          const origins=await tx.supportTicketEvent.findMany({where:{ticketId:id,kind:'AI_DRAFT_GENERATED',payload:{contains:body.aiDraftId}}});
          const digest=createHash('sha256').update(draft.data).digest('hex');
          if(!origins.some(origin=>{try{const data=JSON.parse(origin.payload);return data.draftId===draft.id&&data.draftHash===digest&&ticketEventHash(origin)===origin.hash;}catch{return false;}}))throw new ConflictException('AI draft integrity check failed');
        }
        if (ticket.status === 'CLOSED' || ticket.mergedIntoId)
          throw new ConflictException(
            'Reopen this closed ticket before replying.',
          );
        const updated = await this.change(tx, ticket, body.version, {});
        const event = await this.event(
          tx,
          updated,
          actor,
          kind,
          { text,...(body.aiDraftId?{aiDraftId:body.aiDraftId,aiAssisted:true}:{}) },
          body.visibility,
          body.requestKey,
        );
        return { id: event.id, saved: true };
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        const prior = await this.prisma.supportTicketEvent.findUnique({
          where: { requestKey: body.requestKey },
        });
        if (prior) return replay(prior);
      }
      throw error;
    }
  }
  async agents(actor: HelpdeskActor) {
    this.requireAdmin(actor);
    return this.prisma.user.findMany({
      where: { role: 'ADMIN', status: 'ACTIVE' },
      select: { id: true, username: true, name: true },
      orderBy: { username: 'asc' },
    });
  }
  async assign(id: string, body: AssignTicketDto, actor: HelpdeskActor) {
    this.requireAdmin(actor);
    if (body.reason.trim().length < 5)
      throw new BadRequestException('A reason is required');
    return this.prisma.$transaction(async (tx) => {
      const ticket = await this.visible(tx, id, actor);
      const queueConfig = await tx.supportResource.findFirst({
        where: { kind: 'QUEUE', key: body.queue, status: 'ACTIVE' },
      });
      if (
        !queueConfig &&
        !['TRIAGE', 'TECHNICAL', 'ACCESS', 'BILLING'].includes(body.queue)
      )
        throw new BadRequestException('Unknown active support queue');
      if (body.assigneeId) {
        const user = await tx.user.findUnique({
          where: { id: body.assigneeId },
          select: { role: true, status: true },
        });
        if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE')
          throw new BadRequestException(
            'Assignee must be an active installation administrator',
          );
        if (queueConfig) {
          const config = JSON.parse(queueConfig.data);
          if (
            config.members.length &&
            !config.members.includes(body.assigneeId)
          )
            throw new BadRequestException(
              'Assignee is not a member of the selected queue',
            );
          const load = await tx.supportTicket.count({
            where: {
              assigneeId: body.assigneeId,
              id: { not: id },
              status: { notIn: ['RESOLVED', 'CLOSED'] },
              mergedIntoId: null,
            },
          });
          if (load >= config.capacity)
            throw new ConflictException(
              'Assignee has reached the configured active-ticket capacity',
            );
        }
      }
      const updated = await this.change(tx, ticket, body.version, {
        assigneeId: body.assigneeId ?? null,
        queue: body.queue,
        priority: body.priority,
      });
      await this.event(tx, updated, actor, 'ASSIGNED', {
        assigneeId: body.assigneeId ?? null,
        queue: body.queue,
        priority: body.priority,
        text: body.reason.trim(),
      });
      return updated;
    });
  }
  async feedback(id: string, body: TicketFeedbackDto, actor: HelpdeskActor) {
    if (body.reason.trim().length < 5)
      throw new BadRequestException('Describe the outcome');
    return this.prisma.$transaction(async (tx) => {
      const ticket = await this.visible(tx, id, actor);
      if (
        ticket.requesterId !== actor.userId &&
        (ticket.requesterId !== null || ticket.createdBy !== actor.username)
      )
        throw new ForbiddenException(
          'Only the requester can confirm or reject a fix',
        );
      if (
        !['RESOLVED', 'CLOSED'].includes(ticket.status) ||
        (ticket.confirmedAt && body.outcome === 'FIXED')
      )
        throw new ConflictException(
          'This ticket has no unconfirmed resolution',
        );
      if (ticket.resolvedById === null || ticket.resolvedById === actor.userId)
        throw new ForbiddenException(
          'Confirmation must be independent of the resolving administrator',
        );
      const events = await tx.supportTicketEvent.findMany({
        where: { ticketId: id },
        orderBy: { version: 'asc' },
      });
      if (!(await this.integrity(tx, ticket, events)).valid)
        throw new ConflictException(
          'Ticket evidence did not pass the local integrity check',
        );
      const fixed = body.outcome === 'FIXED';
      const updated = await this.change(
        tx,
        ticket,
        body.version,
        fixed
          ? { confirmedById: actor.userId, confirmedAt: new Date() }
          : {
              status: 'REOPENED',
              resolution: null,
              resolvedAt: null,
              resolvedById: null,
              confirmedAt: null,
              confirmedById: null,
              closedAt: null,
            },
      );
      await this.event(
        tx,
        updated,
        actor,
        fixed ? 'CONFIRMED_FIXED' : 'REJECTED_FIX',
        {
          text: body.reason.trim(),
          source: 'AUTHENTICATED_REQUESTER_PORTAL',
          resolutionVersion: ticket.version,
        },
      );
      return updated;
    });
  }
}
