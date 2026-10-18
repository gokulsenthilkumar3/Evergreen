import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { ReleaseJob } from '@prisma/admin-client';
import { PrismaService } from '../../services/prisma.service';
import { BuildReleaseDto, DeployReleaseDto } from './cicd.dto';
import {
  githubConfig,
  githubRequest,
  GithubRequestRejected,
  type GithubRelease,
  type GithubRun,
} from './github-release.service';

const releaseTag = (value: string) => {
  if (!/^v?\d+\.\d+\.\d+$/.test(value))
    throw new BadRequestException('Use a stable release version such as 1.0.0');
  return value.startsWith('v') ? value : 'v' + value;
};
const terminal = ['SUCCESS', 'FAILED', 'CANCELLED'];

@Injectable()
export class CicdService {
  private refreshing: Promise<void> | null = null;
  private refreshedAt = 0;
  private releaseCache: { at: number; rows: GithubRelease[] } | null = null;
  constructor(private readonly prisma: PrismaService) {}

  async getPackages() {
    if (!githubConfig()) return [];
    if (!this.releaseCache || Date.now() - this.releaseCache.at > 30_000) {
      const rows = await githubRequest<GithubRelease[]>(
        '/releases?per_page=50',
      );
      if (!Array.isArray(rows))
        throw new ServiceUnavailableException(
          'Invalid release registry response',
        );
      this.releaseCache = { at: Date.now(), rows };
    }
    return this.releaseCache.rows
      .filter(
        (row) =>
          !row.draft &&
          !row.prerelease &&
          /^v\d+\.\d+\.\d+$/.test(row.tag_name),
      )
      .map((row) => ({
        id: String(row.id),
        version: row.tag_name,
        name: row.name || row.tag_name,
        branch: row.target_commitish,
        commit: row.target_commitish,
        targets: ['DOCKER', 'WINDOWS'],
        changelog: row.body || '',
        status: 'RELEASED',
        createdAt: row.published_at,
        artifacts: (row.assets || []).map((asset) => ({
          format: asset.name.split('.').pop(),
          identifier: asset.browser_download_url,
          checksumSha256: asset.digest?.startsWith('sha256:')
            ? asset.digest.slice(7)
            : '',
          sizeMB: asset.size / 1_048_576,
        })),
      }));
  }

  private async refresh() {
    if (!githubConfig() || Date.now() - this.refreshedAt < 10_000) return;
    if (this.refreshing) return this.refreshing;
    this.refreshing = (async () => {
      const jobs = await this.prisma.releaseJob.findMany({
        where: { activeTarget: { not: null } },
        take: 100,
      });
      for (const kind of ['BUILD', 'DEPLOY']) {
        const pending = jobs.filter((job) => job.kind === kind);
        if (!pending.length) continue;
        const workflow = kind === 'BUILD' ? 'release.yml' : 'deploy.yml';
        const data = await githubRequest<{ workflow_runs: GithubRun[] }>(
          `/actions/workflows/${workflow}/runs?event=workflow_dispatch&per_page=100`,
        );
        if (!Array.isArray(data.workflow_runs))
          throw new ServiceUnavailableException('Invalid workflow response');
        for (const job of pending) {
          const run = data.workflow_runs.find(
            (run) => run.display_title === this.runTitle(job),
          );
          if (!run) continue; // Absence is not failure or permission to dispatch again.
          const status =
            run.status !== 'completed'
              ? 'IN_PROGRESS'
              : run.conclusion === 'success'
                ? 'SUCCESS'
                : run.conclusion === 'cancelled'
                  ? 'CANCELLED'
                  : 'FAILED';
          await this.prisma.releaseJob.update({
            where: { id: job.id },
            data: {
              status,
              runId: String(run.id),
              runUrl: run.html_url,
              ...(terminal.includes(status) ? { activeTarget: null } : {}),
            },
          });
        }
      }
      this.refreshedAt = Date.now();
    })();
    try {
      await this.refreshing;
    } finally {
      this.refreshing = null;
    }
  }

  private runTitle(job: ReleaseJob) {
    return job.kind === 'BUILD'
      ? `release:${job.id}:${job.version}`
      : `deploy:${job.id}:${job.target}:${job.commit}`;
  }

  private view(job: ReleaseJob) {
    return {
      id: job.id,
      companyId: job.companyId || '',
      companyName: job.companyId || 'Release build',
      cloudProvider: 'DOCKER',
      packageVersion: job.version,
      strategy: 'MAINTENANCE',
      status: job.status,
      triggeredBy: job.actor,
      startedAt: job.createdAt.toISOString(),
      ...(terminal.includes(job.status)
        ? { completedAt: job.updatedAt.toISOString() }
        : {}),
      details:
        job.runUrl ||
        (job.status === 'UNKNOWN'
          ? 'Dispatch acknowledgement was lost. Inspect the workflow; this request will not be sent twice.'
          : 'Awaiting workflow evidence'),
      runUrl: job.runUrl,
    };
  }

  async getDeployments() {
    if (!githubConfig()) return [];
    await this.refresh();
    return (
      await this.prisma.releaseJob.findMany({
        where: { kind: 'DEPLOY' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    ).map((job) => this.view(job));
  }

  async getLogs(limit = 100) {
    if (!githubConfig()) return [];
    const take = Number.isSafeInteger(limit)
      ? Math.max(1, Math.min(250, limit))
      : 100;
    return (
      await this.prisma.releaseJob.findMany({
        orderBy: { updatedAt: 'desc' },
        take,
      })
    ).map((job) => ({
      id: job.id,
      timestamp: job.updatedAt.toISOString(),
      level:
        job.status === 'SUCCESS'
          ? 'SUCCESS'
          : ['FAILED', 'UNKNOWN'].includes(job.status)
            ? 'WARN'
            : 'INFO',
      category: job.kind,
      companyId: job.companyId,
      message: `${job.kind} ${job.version}: ${job.status}. ${job.runUrl || 'Workflow acknowledgement pending.'}`,
    }));
  }

  async triggerBuild(data: BuildReleaseDto, actor = 'Provider operator') {
    if (!githubConfig())
      throw new ServiceUnavailableException(
        'Release provider is not configured',
      );
    const version = releaseTag(data.version);
    return this.dispatch({
      requestKey: data.requestKey,
      kind: 'BUILD',
      version,
      target: 'release',
      commit: 'main',
      actor,
      companyId: null,
      title: data.name,
      notes: data.changelog,
    });
  }

  async deployPackage(data: DeployReleaseDto, actor = 'Provider operator') {
    if (!githubConfig())
      throw new ServiceUnavailableException(
        'Release provider is not configured',
      );
    if (data.strategy && data.strategy !== 'MAINTENANCE')
      throw new BadRequestException(
        'Only a maintenance-window deployment is supported',
      );
    const version = releaseTag(data.packageVersion);
    let targets: Record<string, string>;
    try {
      targets = JSON.parse(
        process.env.EVERGREEN_DEPLOY_TARGETS || '{}',
      ) as Record<string, string>;
    } catch {
      throw new ServiceUnavailableException(
        'Deployment target mapping is invalid',
      );
    }
    const target = targets?.[data.companyId];
    if (typeof target !== 'string' || !/^[a-z][a-z0-9-]{0,50}$/.test(target))
      throw new BadRequestException(
        'This company has no configured deployment target',
      );
    if (
      !(await this.prisma.company.findUnique({
        where: { id: data.companyId },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Company not found');
    const prior = await this.prisma.releaseJob.findUnique({
      where: { requestKey: data.requestKey },
    });
    if (prior) {
      if (
        prior.kind !== 'DEPLOY' ||
        prior.version !== version ||
        prior.companyId !== data.companyId ||
        prior.target !== target
      )
        throw new ConflictException(
          'Request key belongs to a different release or target',
        );
      return this.view(prior);
    }
    const release = await githubRequest<GithubRelease>(
      `/releases/tags/${version}`,
    );
    if (release.draft || release.prerelease || release.tag_name !== version)
      throw new BadRequestException('Select a published stable release');
    const revision = await githubRequest<{ sha: string }>(
      `/commits/${version}`,
    );
    if (!/^[a-f0-9]{40}$/.test(revision.sha))
      throw new ServiceUnavailableException('Release commit is invalid');
    return this.dispatch({
      requestKey: data.requestKey,
      kind: 'DEPLOY',
      version,
      target,
      commit: revision.sha,
      actor,
      companyId: data.companyId,
    });
  }

  private async dispatch(input: {
    requestKey: string;
    kind: string;
    version: string;
    target: string;
    commit: string;
    actor: string;
    companyId: string | null;
    title?: string;
    notes?: string;
  }) {
    const { title, notes, ...record } = input;
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify([
          input.kind,
          input.version,
          input.target,
          input.commit,
          input.companyId,
          title,
          notes,
        ]),
      )
      .digest('hex');
    const prior = await this.prisma.releaseJob.findUnique({
      where: { requestKey: input.requestKey },
    });
    if (prior) {
      if (prior.fingerprint !== fingerprint)
        throw new ConflictException(
          'Request key belongs to a different release or target',
        );
      return this.view(prior);
    }
    let job: ReleaseJob;
    try {
      job = await this.prisma.releaseJob.create({
        data: {
          ...record,
          fingerprint,
          activeTarget: `${input.kind}:${input.target}`,
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        const concurrent = await this.prisma.releaseJob.findUnique({
          where: { requestKey: input.requestKey },
        });
        if (concurrent?.fingerprint === fingerprint)
          return this.view(concurrent);
        throw new ConflictException(
          'A release operation is already recorded or active for this target',
        );
      }
      throw error;
    }
    try {
      await githubRequest<void>(
        `/actions/workflows/${input.kind === 'BUILD' ? 'release.yml' : 'deploy.yml'}/dispatches`,
        {
          ref: 'main',
          inputs:
            input.kind === 'BUILD'
              ? {
                  request_id: job.id,
                  version: input.version,
                  title: title || input.version,
                  notes: notes || '',
                }
              : {
                  request_id: job.id,
                  target: input.target,
                  release: input.commit,
                },
        },
      );
      job = await this.prisma.releaseJob.update({
        where: { id: job.id },
        data: { status: 'QUEUED' },
      });
    } catch (error) {
      job = await this.prisma.releaseJob.update({
        where: { id: job.id },
        data:
          error instanceof GithubRequestRejected
            ? { status: 'FAILED', activeTarget: null }
            : { status: 'UNKNOWN' },
      });
    }
    this.refreshedAt = 0;
    return this.view(job);
  }
}
