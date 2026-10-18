import { ServiceUnavailableException } from '@nestjs/common';

export interface GithubRelease {
  id: number; tag_name: string; name: string; body: string; draft: boolean; prerelease: boolean;
  published_at: string; target_commitish: string;
  assets: { name: string; browser_download_url: string; size: number; digest?: string }[];
}
export interface GithubRun {
  id: number; display_title: string; html_url: string; status: string; conclusion: string | null;
}

export function githubConfig() {
  const repository = process.env.EVERGREEN_GITHUB_REPOSITORY?.trim();
  const token = process.env.EVERGREEN_GITHUB_TOKEN?.trim();
  if (!repository && !token) return null;
  if (!repository || !/^[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !token) {
    throw new ServiceUnavailableException('Configure the release repository and server-side GitHub credential');
  }
  return { repository, token };
}

export async function githubRequest<T>(route: string, body?: object): Promise<T> {
  const config = githubConfig();
  if (!config) throw new ServiceUnavailableException('Release provider is not configured');
  try {
    const response = await fetch(`https://api.github.com/repos/${config.repository}${route}`, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${config.token}`, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error('Provider request failed');
    if (response.status === 204) return undefined as T;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Missing provider body');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 2_000_000) { await reader.cancel(); throw new Error('Provider body too large'); }
      chunks.push(part.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
  } catch {
    // A dispatch failure may occur after GitHub accepted it. The caller retains UNKNOWN.
    throw new ServiceUnavailableException('Release provider request failed; inspect the recorded job before retrying');
  }
}
