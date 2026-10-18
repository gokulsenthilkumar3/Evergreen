#!/usr/bin/env bash
# Compatibility launcher for the reproducible Docker deployment helper.
set -euo pipefail
if [[ $# -lt 2 ]]; then
  echo 'Usage: deploy-factory-vm.sh <installation-slug> <release-sha> [absolute-state-directory]' >&2
  exit 1
fi
command -v node >/dev/null || { echo 'Install Node.js 22.12+ first.' >&2; exit 1; }
command -v docker >/dev/null || { echo 'Install Docker Engine with Compose v2 first.' >&2; exit 1; }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22 || (major===22 && minor<12)) process.exit(1)'
script_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
state_directory="${3:-${script_root}/.evergreen/deploy/${1}}"
operation=install
if [[ -f "${state_directory}/state.json" ]]; then operation=update; fi
exec node "${script_root}/scripts/release/deploy.mjs" "$operation" --project "$1" --release "$2" --state "$state_directory"
