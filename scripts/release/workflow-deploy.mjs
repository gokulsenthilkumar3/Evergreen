import fs from 'node:fs';
import path from 'node:path';
import { deploy, parseOptions } from './deploy.mjs';

const { TARGET, RELEASE_SHA, STATE_DIRECTORY } = process.env;
if (!TARGET || !RELEASE_SHA || !STATE_DIRECTORY || !path.isAbsolute(STATE_DIRECTORY) || path.resolve(STATE_DIRECTORY) === path.parse(STATE_DIRECTORY).root) {
  throw new Error('Configure a distinct absolute state directory in the protected installation environment');
}
const prefix = process.env.EVERGREEN_IMAGE_PREFIX;
if (!prefix || !/^ghcr\.io\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(prefix)) throw new Error('Use the release repository container registry');
process.env.EVERGREEN_IMAGE_PREFIX = prefix.toLowerCase();
const command = fs.existsSync(path.join(STATE_DIRECTORY, 'state.json')) ? 'update' : 'install';
await deploy(parseOptions([command, '--project', TARGET, '--state', STATE_DIRECTORY, '--release', RELEASE_SHA, '--pull']));
console.log('Installation is healthy. The deployment state and previous database are retained on this host.');
