import { BadRequestException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ReleaseJob } from '@prisma/admin-client';
import { validate } from 'class-validator';
import { PrismaService } from '../../services/prisma.service';
import { CicdService } from './cicd.service';
import { DeployReleaseDto } from './cicd.dto';

const companyId = '11111111-1111-4111-8111-111111111111';
const commit = 'a'.repeat(40);
const originalFetch = global.fetch;
const originalEnv = { ...process.env };
type NewJob = Omit<
  ReleaseJob,
  'id' | 'status' | 'runId' | 'runUrl' | 'createdAt' | 'updatedAt'
>;

function fixture() {
  const rows: ReleaseJob[] = [];
  const prisma = {
    company: { findUnique: jest.fn(async () => ({ id: companyId })) },
    releaseJob: {
      findUnique: jest.fn(
        async ({ where }: { where: { requestKey: string } }) =>
          rows.find((row) => row.requestKey === where.requestKey) || null,
      ),
      findMany: jest.fn(
        async (args: { where?: { activeTarget?: unknown; kind?: string } }) =>
          rows.filter(
            (row) =>
              (!args.where?.activeTarget || row.activeTarget !== null) &&
              (!args.where?.kind || row.kind === args.where.kind),
          ),
      ),
      create: jest.fn(async ({ data }: { data: NewJob }) => {
        if (
          rows.some(
            (row) =>
              row.requestKey === data.requestKey ||
              row.activeTarget === data.activeTarget,
          )
        )
          throw { code: 'P2002' };
        const row: ReleaseJob = {
          ...data,
          id: randomUUID(),
          status: 'REQUESTED',
          runId: null,
          runUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        rows.push(row);
        return row;
      }),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Partial<ReleaseJob>;
        }) => {
          const row = rows.find((row) => row.id === where.id)!;
          Object.assign(row, data);
          return row;
        },
      ),
    },
  };
  const calls: { url: string; options?: RequestInit }[] = [];
  let dispatchResponse: () => Promise<Response> = async () =>
    new Response(null, { status: 204 });
  let workflowRuns: unknown[] = [];
  global.fetch = jest.fn(async (url, options) => {
    const route = String(url);
    calls.push({ url: route, options });
    if (route.endsWith('/dispatches')) return dispatchResponse();
    const data = route.includes('/commits/')
      ? { sha: commit }
      : route.includes('/runs?')
        ? { workflow_runs: workflowRuns }
        : { tag_name: 'v1.0.0', draft: false, prerelease: false, assets: [] };
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
  return {
    rows,
    prisma,
    calls,
    service: new CicdService(prisma as unknown as PrismaService),
    dispatch: (callback: () => Promise<Response>) => {
      dispatchResponse = callback;
    },
    runs: (value: unknown[]) => {
      workflowRuns = value;
    },
    input: () => ({
      companyId,
      packageVersion: '1.0.0',
      requestKey: randomUUID(),
      strategy: 'MAINTENANCE' as const,
    }),
  };
}

beforeEach(() => {
  process.env.EVERGREEN_GITHUB_REPOSITORY = 'example/evergreen';
  process.env.EVERGREEN_GITHUB_TOKEN = 'server-only-test-credential';
  process.env.EVERGREEN_DEPLOY_TARGETS = JSON.stringify({
    [companyId]: 'test-installation',
  });
});
afterEach(() => {
  global.fetch = originalFetch;
  process.env = { ...originalEnv };
});

describe('Release job execution', () => {
  it('dispatches a published commit to the server-owned company target and records its actor', async () => {
    const f = fixture();
    const result = await f.service.deployPackage(f.input(), 'Release operator');
    expect(result).toMatchObject({
      status: 'QUEUED',
      triggeredBy: 'Release operator',
    });
    const dispatch = f.calls.find((call) => call.url.endsWith('/dispatches'))!;
    expect(JSON.parse(String(dispatch.options?.body))).toEqual({
      ref: 'main',
      inputs: {
        request_id: result.id,
        target: 'test-installation',
        release: commit,
      },
    });
    expect(JSON.stringify(result)).not.toContain('server-only-test-credential');
    expect(f.rows[0].activeTarget).toBe('DEPLOY:test-installation');
  });
  it('an unchanged retry never dispatches twice or re-reads the upstream release', async () => {
    const f = fixture(),
      input = f.input();
    const first = await f.service.deployPackage(input);
    const callCount = f.calls.length;
    expect((await f.service.deployPackage(input)).id).toBe(first.id);
    expect(f.calls.length).toBe(callCount);
  });
  it('simultaneous duplicate requests dispatch at most once', async () => {
    const f = fixture(),
      input = f.input();
    const results = await Promise.all([
      f.service.deployPackage(input),
      f.service.deployPackage(input),
    ]);
    expect(results[0].id).toBe(results[1].id);
    expect(
      f.calls.filter((call) => call.url.endsWith('/dispatches')),
    ).toHaveLength(1);
  });
  it('another request for an active company is rejected', async () => {
    const f = fixture();
    await f.service.deployPackage(f.input());
    await expect(f.service.deployPackage(f.input())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(
      f.calls.filter((call) => call.url.endsWith('/dispatches')),
    ).toHaveLength(1);
  });
  it('request keys cannot be reused for a changed version', async () => {
    const f = fixture(),
      input = f.input();
    await f.service.deployPackage(input);
    await expect(
      f.service.deployPackage({ ...input, packageVersion: '2.0.0' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('lost acknowledgement retains UNKNOWN and its target lock until workflow evidence arrives', async () => {
    const f = fixture();
    f.dispatch(async () => {
      throw new Error('network lost');
    });
    const job = await f.service.deployPackage(f.input());
    expect(job.status).toBe('UNKNOWN');
    expect(f.rows[0].activeTarget).not.toBeNull();
    f.runs([
      {
        id: 17,
        display_title: `deploy:${job.id}:test-installation:${commit}`,
        status: 'completed',
        conclusion: 'success',
        html_url: 'https://github.com/example/evergreen/actions/runs/17',
      },
    ]);
    expect((await f.service.getDeployments())[0].status).toBe('SUCCESS');
    expect(f.rows[0].activeTarget).toBeNull();
  });
  it('an explicit provider rejection is failed and permits a corrected future request', async () => {
    const f = fixture();
    f.dispatch(async () => new Response('{}', { status: 422 }));
    expect((await f.service.deployPackage(f.input())).status).toBe('FAILED');
    expect(f.rows[0].activeTarget).toBeNull();
  });
  it('unrelated workflow completion never marks this deployment successful', async () => {
    const f = fixture();
    await f.service.deployPackage(f.input());
    f.runs([
      {
        id: 20,
        display_title: 'other-job',
        status: 'completed',
        conclusion: 'success',
      },
    ]);
    expect((await f.service.getDeployments())[0].status).toBe('QUEUED');
  });
  it('unmapped companies and unsupported versions are rejected before dispatch', async () => {
    const f = fixture();
    await expect(
      f.service.deployPackage({ ...f.input(), companyId: randomUUID() }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      f.service.deployPackage({ ...f.input(), packageVersion: '../main' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(f.calls).toHaveLength(0);
  });
  it('DTOs reject caller-selected execution details and invalid request keys', async () => {
    const dto = Object.assign(new DeployReleaseDto(), {
      ...fixture().input(),
      requestKey: 'bad',
      triggeredBy: 'spoofed',
      target: 'another-installation',
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['requestKey', 'triggeredBy', 'target']),
    );
  });
});
