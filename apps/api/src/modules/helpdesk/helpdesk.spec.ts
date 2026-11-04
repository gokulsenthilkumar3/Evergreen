import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HelpdeskService } from './helpdesk.service';
import { HelpdeskOperationsService } from './helpdesk-operations.service';
import type { HelpdeskActor } from './helpdesk.dto';
describe('Installation helpdesk workflow with real SQLite transactions', () => {
  let db: PrismaClient, service: HelpdeskOperationsService;
  const alice: HelpdeskActor = { userId: 1, username: 'alice', role: 'VIEWER' },
    bob: HelpdeskActor = { userId: 2, username: 'bob', role: 'VIEWER' },
    admin: HelpdeskActor = { userId: 3, username: 'owner', role: 'ADMIN' };
  const previewDispatch = async (sender:HelpdeskOperationsService,id:string,body:Omit<import('./helpdesk-operations.dto').DispatchTicketEmailDto,'previewHash'>)=>{const preview=await sender.emailPreview(id,admin);const reply=preview.replies.find(row=>row.id===body.eventId)!;return sender.dispatchEmail(id,{...body,previewHash:reply.previewHash},admin);};
  beforeAll(async () => {
    const root = resolve(__dirname, '../../../../..'),
      dir = resolve(root, '.evergreen/helpdesk-tests');
    mkdirSync(dir, { recursive: true });
    db = new PrismaClient({
      datasources: {
        db: {
          url: `file:${resolve(dir, randomUUID() + '.db').replace(/\\/g, '/')}`,
        },
      },
    });
    service = new HelpdeskOperationsService(db as any);
    await db.$executeRawUnsafe(
      'CREATE TABLE "User" ("id" INTEGER PRIMARY KEY, "publicId" TEXT UNIQUE, "username" TEXT UNIQUE, "name" TEXT, "role" TEXT, "status" TEXT, "email" TEXT, "emailVerifiedAt" DATETIME)',
    );
    await db.$executeRawUnsafe(
      `INSERT INTO "User" (id,publicId,username,name,role,status) VALUES (1,'alice-id','alice','Alice','VIEWER','ACTIVE'),(2,'bob-id','bob','Bob','VIEWER','ACTIVE'),(3,'owner-id','owner','Owner','ADMIN','ACTIVE'),(4,'inactive-id','inactive','Inactive','ADMIN','DISABLED'),(5,'fail-id','failagent','Fail','ADMIN','ACTIVE')`,
    );
    await db.$executeRawUnsafe(
      'CREATE TABLE "SupportTicket" ("id" TEXT PRIMARY KEY, "requestKey" TEXT NOT NULL UNIQUE, "subject" TEXT NOT NULL, "description" TEXT NOT NULL, "category" TEXT NOT NULL, "priority" TEXT NOT NULL DEFAULT \'NORMAL\', "status" TEXT NOT NULL DEFAULT \'OPEN\', "createdBy" TEXT NOT NULL, "resolution" TEXT, "version" INTEGER NOT NULL DEFAULT 1, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)',
    );
    await db.$executeRawUnsafe(
      'CREATE TABLE "ActivityLog" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "username" TEXT NOT NULL, "action" TEXT NOT NULL, "module" TEXT NOT NULL, "details" TEXT NOT NULL, "createdAt" DATETIME NOT NULL, "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    );
    for (const name of [
      '20261101070000_user_audit_ledger',
      '20261101080000_helpdesk_workflow',
      '20261101090000_helpdesk_operations',
    ]) {
      const sql = readFileSync(
        resolve(
          root,
          'packages/database/prisma/migrations',
          name,
          'migration.sql',
        ),
        'utf8',
      );
      for (const statement of sql.split(';').filter((s) => s.trim()))
        await db.$executeRawUnsafe(statement);
    }
    await db.$executeRawUnsafe(
      `CREATE TRIGGER reject_test_actor_audit BEFORE INSERT ON "audit_ledger" WHEN NEW."actorUsername"='failagent' BEGIN SELECT RAISE(ABORT,'simulated audit failure'); END`,
    );
  });
  afterAll(async () => {
    await db?.$disconnect();
  });
  const create = (actor = alice) =>
    service.create(
      {
        requestKey: randomUUID(),
        subject: 'Invoice error',
        description: 'Create an invoice and observe the error',
        category: 'BUG',
        priority: 'NORMAL',
      },
      actor,
    );
  it('isolates tickets by requester and replays intake without a second event', async () => {
    const body = {
      requestKey: randomUUID(),
      subject: 'Retry-safe ticket',
      description: 'Detailed issue for retry test',
      category: 'BUG',
      priority: 'NORMAL',
    };
    const first = await service.create(body, alice);
    expect((await service.create(body, alice)).id).toBe(first.id);
    expect(
      await db.supportTicketEvent.count({ where: { ticketId: first.id } }),
    ).toBe(1);
    expect(
      (await service.list(bob)).some((ticket) => ticket.id === first.id),
    ).toBe(false);
    await expect(service.detail(first.id, bob)).rejects.toThrow(
      'Ticket not found',
    );
    await expect(service.create(body, bob)).rejects.toThrow('already used');
  });
  it('keeps internal notes out of requester responses and rejects staff private notes', async () => {
    const ticket = await create();
    await service.message(
      ticket.id,
      {
        requestKey: randomUUID(),
        version: 1,
        text: 'Private administrator investigation',
        visibility: 'INTERNAL',
      },
      admin,
    );
    expect((await service.detail(ticket.id, alice)).events).toHaveLength(1);
    expect(
      JSON.stringify(await service.detail(ticket.id, alice)),
    ).not.toContain('Private administrator investigation');
    expect((await service.detail(ticket.id, admin)).events).toHaveLength(2);
    await expect(
      service.message(
        ticket.id,
        {
          requestKey: randomUUID(),
          version: 2,
          text: 'Invalid private note',
          visibility: 'INTERNAL',
        },
        alice,
      ),
    ).rejects.toThrow('Only installation administrators');
  });
  it('replays the original intake after triage changes its priority', async () => {
    const body = {
      requestKey: randomUUID(),
      subject: 'Original submission',
      description: 'An issue retried after agent triage',
      category: 'BUG',
      priority: 'NORMAL',
    };
    const ticket = await service.create(body, alice);
    await service.assign(
      ticket.id,
      {
        version: 1,
        assigneeId: 3,
        queue: 'TECHNICAL',
        priority: 'URGENT',
        reason: 'Important issue for immediate review',
      },
      admin,
    );
    expect(await service.create(body, alice)).toMatchObject({
      id: ticket.id,
      priority: 'URGENT',
      version: 2,
    });
    expect(
      await db.supportTicketEvent.count({ where: { ticketId: ticket.id } }),
    ).toBe(2);
  });
  it('replays replies after ambiguous network failure and rejects stale concurrent replies', async () => {
    const ticket = await create(),
      body = {
        requestKey: randomUUID(),
        version: 1,
        text: 'Please check these reproduction steps',
        visibility: 'PUBLIC',
      };
    const result = await service.message(ticket.id, body, alice);
    expect(await service.message(ticket.id, body, alice)).toEqual(result);
    await expect(
      service.message(ticket.id, { ...body, requestKey: randomUUID() }, admin),
    ).rejects.toThrow('Refresh before saving');
    expect(
      await db.supportTicketEvent.count({ where: { ticketId: ticket.id } }),
    ).toBe(2);
  });
  it('keeps resolution as a claim until a different authenticated requester confirms', async () => {
    const ticket = await create();
    await service.update(
      ticket.id,
      {
        version: 1,
        status: 'RESOLVED',
        resolution: 'Corrected invoice configuration',
      },
      admin,
    );
    expect((await service.detail(ticket.id, alice)).proof).toBe('requested');
    await expect(
      service.feedback(
        ticket.id,
        { version: 2, outcome: 'FIXED', reason: 'Confirmed invoice now saves' },
        admin,
      ),
    ).rejects.toThrow('Only the requester');
    await service.feedback(
      ticket.id,
      { version: 2, outcome: 'FIXED', reason: 'Confirmed invoice now saves' },
      alice,
    );
    expect(await service.detail(ticket.id, alice)).toMatchObject({
      proof: 'verified',
      integrity: { valid: true, complete: true },
    });
  });
  it('rejects self-verification and untracked legacy resolution claims', async () => {
    const own = await create(admin);
    await service.update(
      own.id,
      {
        version: 1,
        status: 'RESOLVED',
        resolution: 'Self-resolved configuration',
      },
      admin,
    );
    await expect(
      service.feedback(
        own.id,
        { version: 2, outcome: 'FIXED', reason: 'Claim my own fix' },
        admin,
      ),
    ).rejects.toThrow('independent');
  });
  it('reopens a rejected fix and prevents shortcuts from open straight to closed', async () => {
    const ticket = await create();
    await expect(
      service.update(
        ticket.id,
        {
          version: 1,
          status: 'CLOSED',
          resolution: 'Close without a resolution',
        },
        admin,
      ),
    ).rejects.toThrow('transition');
    await service.update(
      ticket.id,
      { version: 1, status: 'RESOLVED', resolution: 'Claimed fix was applied' },
      admin,
    );
    await service.feedback(
      ticket.id,
      { version: 2, outcome: 'BROKEN', reason: 'The same error still occurs' },
      alice,
    );
    expect(await service.detail(ticket.id, alice)).toMatchObject({
      status: 'REOPENED',
      proof: 'failed',
      resolution: null,
    });
  });
  it('validates assignee eligibility and keeps the reason in the audit history', async () => {
    const ticket = await create();
    const body = {
      version: 1,
      assigneeId: 4,
      queue: 'TECHNICAL',
      priority: 'HIGH',
      reason: 'Technical investigation required',
    };
    await expect(service.assign(ticket.id, body, admin)).rejects.toThrow(
      'active installation administrator',
    );
    await service.assign(ticket.id, { ...body, assigneeId: 3 }, admin);
    expect(await service.detail(ticket.id, admin)).toMatchObject({
      assigneeId: 3,
      queue: 'TECHNICAL',
      priority: 'HIGH',
      integrity: { valid: true },
    });
  });
  it('detects event or ticket projection tampering and refuses verification', async () => {
    const ticket = await create();
    await service.update(
      ticket.id,
      {
        version: 1,
        status: 'RESOLVED',
        resolution: 'Configured expected settings',
      },
      admin,
    );
    await db.supportTicket.update({
      where: { id: ticket.id },
      data: { subject: 'Unaudited tampered subject' },
    });
    expect(await service.detail(ticket.id, alice)).toMatchObject({
      proof: 'recorded',
      integrity: { valid: false },
    });
    await expect(
      service.feedback(
        ticket.id,
        {
          version: 2,
          outcome: 'FIXED',
          reason: 'Cannot verify altered evidence',
        },
        alice,
      ),
    ).rejects.toThrow('integrity');
  });
  it('rolls back intake and its ticket event when the global audit write fails', async () => {
    const key = randomUUID();
    await expect(
      service.create(
        {
          requestKey: key,
          subject: 'Must roll back',
          description: 'Test the audit failure transaction',
          category: 'BUG',
          priority: 'NORMAL',
        },
        { userId: 5, username: 'failagent', role: 'ADMIN' },
      ),
    ).rejects.toThrow();
    expect(
      await db.supportTicket.findUnique({ where: { requestKey: key } }),
    ).toBeNull();
  });
  it('paginates all requester tickets without leaking another requester through a cursor', async () => {
    const one = await service.page({ limit: 1 }, alice);
    expect(one.items).toHaveLength(1);
    expect(one.nextCursor).not.toBeNull();
    const two = await service.page(
      { limit: 1, cursor: one.nextCursor! },
      alice,
    );
    expect(two.items[0].id).not.toBe(one.items[0].id);
    const other = await create(bob);
    await expect(
      service.page({ limit: 10, cursor: other.id }, alice),
    ).rejects.toThrow('Unknown queue cursor');
  });
  it('protects private saved views even when a search filter is present', async () => {
    await service.saveResource(
      {
        kind: 'VIEW',
        key: 'private-bob',
        title: 'Sensitive Bob view',
        visibility: 'PRIVATE',
        status: 'ACTIVE',
        data: { q: 'Sensitive Bob' },
        version: 0,
        reason: 'My private support search',
      },
      bob,
    );
    expect(
      await service.resourceList('VIEW', admin, 'Sensitive Bob'),
    ).toHaveLength(0);
    expect(
      await service.resourceList('VIEW', alice, 'Sensitive Bob'),
    ).toHaveLength(0);
    expect(
      await service.resourceList('VIEW', bob, 'Sensitive Bob'),
    ).toHaveLength(1);
  });
  it('publishes knowledge with revision history and rejects stale edits', async () => {
    const body = {
      kind: 'KB',
      key: 'invoice-guide',
      title: 'Invoice guide',
      visibility: 'PUBLIC',
      status: 'DRAFT',
      data: {
        body: 'Use the saved invoice workflow',
        category: 'BILLING',
        language: 'en',
      },
      version: 0,
      reason: 'Initial knowledge draft',
    };
    const draft = await service.saveResource(body, admin);
    expect(
      (await service.resourceList('KB', alice)).some((a) => a.id === draft.id),
    ).toBe(false);
    const published = await service.saveResource(
      {
        ...body,
        status: 'PUBLISHED',
        version: 1,
        reason: 'Reviewed and published guide',
      },
      admin,
    );
    expect(
      (await service.resourceList('KB', alice)).some((a) => a.id === draft.id),
    ).toBe(true);
    await expect(
      service.saveResource({ ...body, version: 1 }, admin),
    ).rejects.toThrow('changed');
    expect(await service.revisions(published.id, admin)).toHaveLength(2);
    await service.articleFeedback(published.id, true, alice);
  });
  it('rolls back a whole bulk operation when one selected ticket has a stale version', async () => {
    const first = await create(),
      second = await create();
    await expect(
      service.bulk(
        {
          tickets: [
            { id: first.id, version: 1 },
            { id: second.id, version: 99 },
          ],
          operation: 'TAG',
          value: 'review',
          reason: 'Review these related issues',
        },
        admin,
      ),
    ).rejects.toThrow('Refresh before saving');
    expect(
      (await db.supportTicket.findUnique({ where: { id: first.id } }))
        ?.tagsJson,
    ).toBe('[]');
    expect(
      await db.supportTicketEvent.count({ where: { ticketId: first.id } }),
    ).toBe(1);
  });
  it('retains both histories on merge and creates an explicitly linked subticket', async () => {
    const source = await create(),
      target = await create();
    await service.merge(
      source.id,
      {
        version: 1,
        targetId: target.id,
        targetVersion: 1,
        reason: 'Same requester and same issue',
      },
      admin,
    );
    expect((await service.detail(source.id, alice)).mergedIntoId).toBe(
      target.id,
    );
    await expect(
      service.message(
        source.id,
        {
          version: 2,
          requestKey: randomUUID(),
          visibility: 'PUBLIC',
          text: 'Do not reply to merged source',
        },
        alice,
      ),
    ).rejects.toThrow('Reopen');
    const child = await service.split(
      target.id,
      {
        version: 2,
        requestKey: randomUUID(),
        subject: 'Separate printing problem',
        description: 'Investigate the separate printing issue',
        reason: 'Separate work requires tracking',
      },
      admin,
    );
    expect(child.parentId).toBe(target.id);
    expect(child.requesterId).toBe(alice.userId);
  });
  it('requires a matching import preview and retries without duplicate tickets', async () => {
    const rows = [
      {
        requestKey: randomUUID(),
        subject: 'Migration issue',
        description: 'An existing issue imported for review',
        category: 'BUG',
        priority: 'NORMAL',
      },
    ];
    const preview: any = await service.importTickets(
      { rows, dryRun: true },
      admin,
    );
    await expect(
      service.importTickets(
        { rows, dryRun: false, previewHash: '0'.repeat(64) },
        admin,
      ),
    ).rejects.toThrow('matching valid');
    const committed: any = await service.importTickets(
      { rows, dryRun: false, previewHash: preview.previewHash },
      admin,
    );
    expect(committed.imported).toHaveLength(1);
    expect(
      await service.importTickets(
        { rows, dryRun: false, previewHash: preview.previewHash },
        admin,
      ),
    ).toEqual(committed);
  });
  it('creates private notifications but never exposes an internal note to the requester', async () => {
    const ticket = await create();
    await service.message(
      ticket.id,
      {
        version: 1,
        requestKey: randomUUID(),
        visibility: 'INTERNAL',
        text: 'Secret internal investigation',
      },
      admin,
    );
    const before = await service.resourceList('NOTIFICATION', alice);
    expect(before.some((row) => row.data.ticketId === ticket.id)).toBe(false);
    await service.message(
      ticket.id,
      {
        version: 2,
        requestKey: randomUUID(),
        visibility: 'PUBLIC',
        text: 'Please review the proposed steps',
      },
      admin,
    );
    const messages = await service.resourceList('NOTIFICATION', alice);
    const notification = messages.find(
      (row) => row.data.ticketId === ticket.id,
    )!;
    expect(notification).toBeDefined();
    await expect(
      service.notificationsRead(notification.id, bob),
    ).rejects.toThrow('not found');
  });
  it('quarantines attachments without antivirus and denies downloads or outsider access', async () => {
    const prior = process.env.HELPDESK_CLAMAV_HOST;
    delete process.env.HELPDESK_CLAMAV_HOST;
    try {
      const ticket = await create();
      const file = await service.upload(
        ticket.id,
        {
          version: 1,
          filename: 'proof.txt',
          mime: 'text/plain',
          base64: Buffer.from('Example attachment').toString('base64'),
          visibility: 'PUBLIC',
        },
        alice,
      );
      expect(file.status).toBe('QUARANTINED');
      await expect(service.download(ticket.id, file.id, alice)).rejects.toThrow(
        'quarantined',
      );
      await expect(service.download(ticket.id, file.id, bob)).rejects.toThrow(
        'Ticket not found',
      );
    } finally {
      if (prior) process.env.HELPDESK_CLAMAV_HOST = prior;
    }
  });
  it('redacts recognized secrets and personal data from exported ticket text', async () => {
    const ticket = await service.create(
      {
        requestKey: randomUUID(),
        subject: 'Credential accidentally pasted',
        description: 'password=SuperSecretValue123 email alice@example.com',
        category: 'ACCESS',
        priority: 'NORMAL',
      },
      alice,
    );
    expect(ticket.description).not.toContain('SuperSecretValue123');
    const exported = await service.exportTicket(ticket.id, alice);
    expect(JSON.stringify(exported)).not.toContain('alice@example.com');
    expect(exported.signature).toBeNull();
  });
  it('records a human-requested email acceptance once without claiming inbox delivery', async () => {
    await db.$executeRawUnsafe(
      "UPDATE User SET email='alice@example.com', emailVerifiedAt=CURRENT_TIMESTAMP WHERE id=1",
    );
    const mail = {
      readiness: () => [
        { name: 'primary', configured: true, sender: 'support@example.com' },
      ],
      sendAccountMessage: jest.fn(async () => ({
        messageId: 'smtp-receipt',
        accepted: true,
        sender: 'support@example.com',
      })),
    };
    const sender = new HelpdeskOperationsService(db as any, mail as any);
    const ticket = await create();
    const reply = await service.message(
      ticket.id,
      {
        version: 1,
        requestKey: randomUUID(),
        visibility: 'PUBLIC',
        text: 'Please try the corrected invoice settings',
      },
      admin,
    );
    await expect(sender.dispatchEmail(ticket.id, {
      version: 2, eventId: reply.id, sender: 'primary',
      confirmRecipient: 'alice@example.com', previewHash: '0'.repeat(64),
    }, admin)).rejects.toThrow('Email preview changed');
    expect(mail.sendAccountMessage).not.toHaveBeenCalled();
    expect((await service.detail(ticket.id, alice)).version).toBe(2);
    const result = await previewDispatch(sender,ticket.id,{
        version: 2,
        eventId: reply.id,
        sender: 'primary',
        confirmRecipient: 'alice@example.com',
      });
    expect(result).toMatchObject({
      status: 'ACCEPTED',
      inboxDeliveryVerified: false,
      automaticRetry: false,
    });
    expect(mail.sendAccountMessage).toHaveBeenCalledTimes(1);
    await expect(
      previewDispatch(sender,ticket.id,{
          version: 4,
          eventId: reply.id,
          sender: 'primary',
          confirmRecipient: 'alice@example.com',
        }),
    ).rejects.toThrow('already has a dispatch attempt');
    expect(mail.sendAccountMessage).toHaveBeenCalledTimes(1);
  });
  it('records ambiguous SMTP outcomes and never automatically resends a reply', async () => {
    const mail = {
      readiness: () => [{ name: 'primary', configured: true }],
      sendAccountMessage: jest.fn(async () => {
        throw Error('Connection closed after DATA');
      }),
    };
    const sender = new HelpdeskOperationsService(db as any, mail as any);
    const ticket = await create();
    const reply = await service.message(
      ticket.id,
      {
        version: 1,
        requestKey: randomUUID(),
        visibility: 'PUBLIC',
        text: 'Review this reply before dispatch',
      },
      admin,
    );
    expect(
      await previewDispatch(sender,ticket.id,{
          version: 2,
          eventId: reply.id,
          sender: 'primary',
          confirmRecipient: 'alice@example.com',
        }),
    ).toMatchObject({ status: 'AMBIGUOUS', automaticRetry: false });
    expect(mail.sendAccountMessage).toHaveBeenCalledTimes(1);
  });
  it('requires the requester to explicitly acknowledge an administrator portal reply', async () => {
    const ticket = await create();
    const reply = await service.message(
      ticket.id,
      {
        version: 1,
        requestKey: randomUUID(),
        visibility: 'PUBLIC',
        text: 'This is the recorded support answer',
      },
      admin,
    );
    await expect(
      service.acknowledge(ticket.id, { version: 2, eventId: reply.id }, admin),
    ).rejects.toThrow('Only the requester');
    await service.acknowledge(
      ticket.id,
      { version: 2, eventId: reply.id },
      alice,
    );
    expect(
      (await service.detail(ticket.id, alice)).events.some(
        (event) => event.kind === 'REPLY_ACKNOWLEDGED',
      ),
    ).toBe(true);
  });
  it('deduplicates signed-source intake without inventing a human requester',async()=>{
    const body={externalId:'failure-'+randomUUID(),subject:'Failed deployment reported',description:'A configured runner reported a failed deployment job',category:'BUG',priority:'HIGH'};
    const first=await service.ingest('DEPLOYMENT',body,'a'.repeat(64),'first_nonce_'+randomUUID());const again=await service.ingest('DEPLOYMENT',body,'a'.repeat(64),'second_nonce_'+randomUUID());expect(again).toMatchObject({ticketId:first.ticketId,replayed:true});
    const detail=await service.detail(first.ticketId,admin);expect(detail.createdBy).toBe('Integration:DEPLOYMENT');expect(detail.requesterId).toBeNull();expect(detail.proof).toBe('recorded');await expect(service.detail(first.ticketId,alice)).rejects.toThrow('not found');
  });
  it('requires aligned verified inbound email and rejects another requesters ticket',async()=>{
    const ticket=await create();const body={externalId:'mail-'+randomUUID(),subject:'Re: Invoice issue',description:'The requester supplied more reproduction details',category:'BUG',priority:'NORMAL',ticketId:ticket.id,senderEmail:'alice@example.com',senderAssurance:'DKIM_PASS_ALIGNED'};
    await service.ingest('EMAIL',body,'b'.repeat(64),'email_nonce_'+randomUUID());expect((await service.detail(ticket.id,alice)).events.some(event=>event.kind==='CUSTOMER_EMAIL')).toBe(true);
    await expect(service.ingest('EMAIL',{...body,externalId:'bad-'+randomUUID(),senderAssurance:undefined},'c'.repeat(64),'bad_nonce_'+randomUUID())).rejects.toThrow('aligned verified sender');
    const other=await create(bob);await expect(service.ingest('EMAIL',{...body,externalId:'bad-'+randomUUID(),ticketId:other.id},'d'.repeat(64),'bad_nonce_'+randomUUID())).rejects.toThrow('not found');
  });
  it('routes with capacity limits and preserves the initial SLA snapshot',async()=>{
    const load=await db.supportTicket.count({where:{assigneeId:3,status:{notIn:['RESOLVED','CLOSED']},mergedIntoId:null}});
    const save=(kind:string,key:string,data:Record<string,unknown>)=>service.saveResource({kind,key,title:'Configured '+kind,visibility:kind==='QUEUE'?'PUBLIC':'TEAM',status:'ACTIVE',data,version:0,reason:'Set up local test configuration'},admin);
    await save('QUEUE','ROUTED_TEST',{members:[3],capacity:load+1,routing:'LEAST_LOADED'});await save('RULE','urgent-routing',{category:'DATA',priority:'URGENT',queue:'ROUTED_TEST',enabled:true});const sla=await save('SLA','urgent-target',{priority:'URGENT',queue:'ROUTED_TEST',responseMinutes:30,resolutionMinutes:120,pausePending:true,calendarKey:''});
    const first=await service.create({requestKey:randomUUID(),subject:'Routed urgent data issue',description:'Reproduce the urgent issue for capacity checks',category:'DATA',priority:'URGENT'},alice);const second=await service.create({requestKey:randomUUID(),subject:'Second routed urgent issue',description:'Reproduce another urgent issue for capacity checks',category:'DATA',priority:'URGENT'},alice);
    expect(first.assigneeId).toBe(3);expect(second.assigneeId).toBeNull();expect(JSON.parse(first.slaPolicyJson!).responseMinutes).toBe(30);
    await service.saveResource({kind:'SLA',key:'urgent-target',title:sla.title,visibility:'TEAM',status:'ACTIVE',data:{...sla.data,responseMinutes:60},version:1,reason:'Adjust new-ticket targets after review'},admin);expect(JSON.parse((await db.supportTicket.findUniqueOrThrow({where:{id:first.id}})).slaPolicyJson!).responseMinutes).toBe(30);
  });
  it('keeps AI text private and advisory until an explicit human post',async()=>{
    const assistant=(service as any).advisory;const ready=jest.spyOn(assistant,'status').mockReturnValue({configured:true,provider:'Groq'} as any);const chat=jest.spyOn(assistant,'chat').mockResolvedValue({answer:'Advisory draft: the issue is verified according to a claim.',model:'test-only-model'} as any);
    try{const ticket=await create();const body={version:1,operation:'DRAFT',context:'Reviewed ticket context without secrets',consent:false,language:'en'};await expect(service.aiAssist(ticket.id,body,admin)).rejects.toThrow('Explicit consent');expect(chat).not.toHaveBeenCalled();const result=await service.aiAssist(ticket.id,{...body,consent:true},admin);expect(result.data.aiGenerated).toBe(true);expect(chat).toHaveBeenCalledTimes(1);expect((await service.detail(ticket.id,alice)).proof).toBe('recorded');expect(JSON.stringify((await service.detail(ticket.id,alice)).events)).not.toContain('Advisory draft');
      await expect(service.message(ticket.id,{version:3,requestKey:randomUUID(),text:'Try to steal a private AI draft',visibility:'PUBLIC',aiDraftId:result.id},alice)).rejects.toThrow('does not belong');await service.message(ticket.id,{version:3,requestKey:randomUUID(),text:result.data.text,visibility:'PUBLIC',aiDraftId:result.id},admin);expect((await service.detail(ticket.id,alice)).events.some(event=>(event as any).aiAssisted===true)).toBe(true);
    }finally{ready.mockRestore();chat.mockRestore();}
  });

  it('bulk merges atomically and bulk splits replay without duplicate children',async()=>{
    const one=await create(),two=await create();const merged:any=await service.bulk({tickets:[{id:one.id,version:1},{id:two.id,version:1}],operation:'MERGE',value:one.id,reason:'Same requester and duplicate issue'},admin);expect(merged.primaryId).toBe(one.id);expect((await service.detail(two.id,alice)).mergedIntoId).toBe(one.id);
    const first=await create(),second=await create(),body={tickets:[{id:first.id,version:1},{id:second.id,version:1}],operation:'SPLIT',value:'Follow-up',reason:'Separate the follow-up investigation',details:'Detailed follow-up issue for a separate investigation',requestKey:randomUUID()};const split:any=await service.bulk(body,admin);expect(split.children).toHaveLength(2);expect(await service.bulk(body,admin)).toEqual(split);
  });
  it('retains original replies while attributing corrections and private time records',async()=>{
    const ticket=await create();const reply=await service.message(ticket.id,{version:1,requestKey:randomUUID(),visibility:'PUBLIC',text:'Original customer reproduction steps'},alice);await expect(service.reviseReply(ticket.id,reply.id,{version:2,text:'Attempt to impersonate requester',reason:'Invalid author'},admin)).rejects.toThrow('original reply');await service.reviseReply(ticket.id,reply.id,{version:2,text:'Corrected customer reproduction steps',reason:'Clarify the actual reproduction sequence'},alice);await service.work(ticket.id,{version:3,operation:'TIME',minutes:25,reason:'Reviewed the saved invoice settings'},admin);
    const view=await service.detail(ticket.id,alice);expect(JSON.stringify(view.events)).toContain('Original customer reproduction steps');expect(JSON.stringify(view.events)).toContain('Corrected customer reproduction steps');expect(view.events.some(event=>event.kind==='TIME_TRACKED')).toBe(false);expect(view.proof).toBe('recorded');
  });
  it('records satisfaction only from the requester of a closed ticket and only once',async()=>{
    const ticket=await create();await service.update(ticket.id,{version:1,status:'RESOLVED',resolution:'Updated the saved invoice settings'},admin);await service.feedback(ticket.id,{version:2,outcome:'FIXED',reason:'Verified by saving the invoice again'},alice);await service.update(ticket.id,{version:3,status:'CLOSED',resolution:'Closed after requester confirmation'},admin);await service.csat(ticket.id,{version:4,rating:5,comment:'The explanation was useful'},alice);await expect(service.csat(ticket.id,{version:5,rating:3,comment:'Duplicate rating'},alice)).rejects.toThrow('already has');
  });
  it('emits SLA alerts once and keeps opt-in automatic closure stale rather than verified',async()=>{
    const checkAt=new Date(Date.now()+2*3600000);expect((await service.runAutomations(checkAt)).alerts).toBeGreaterThan(0);expect((await service.runAutomations(checkAt)).alerts).toBe(0);
    const ticket=await create();await service.update(ticket.id,{version:1,status:'RESOLVED',resolution:'A proposed fix awaiting requester review'},admin);await service.saveResource({kind:'RETENTION',key:'DEFAULT',title:'Reviewed support lifecycle policy',visibility:'TEAM',status:'ACTIVE',data:{closedDays:365,autoCloseResolvedDays:1},version:0,reason:'Enable automatic closure of unconfirmed old resolutions'},admin);await service.runAutomations(new Date(Date.now()+2*86400000));const detail=await service.detail(ticket.id,alice);expect(detail.status).toBe('CLOSED');expect(detail.proof).toBe('stale');expect(detail.confirmedAt).toBeNull();
  });

});
