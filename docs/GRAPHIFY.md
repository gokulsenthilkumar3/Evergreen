# Graphify architecture and commit workflow

Graphify 0.9.102 is a development tool, separate from the application's npm dependencies. We use local AST extraction, including SQL migrations, without a model or API key. The canonical implementation remains the modular monolith described in [Architecture](ARCHITECTURE.md); graph communities are navigation aids, not proposed services.

## Setup once per developer checkout

With Python managed by uv, run from the repository root:

```powershell
uv tool install --python 3.12 "graphifyy[sql]==0.9.102"
graphify install --project --platform codex
npm run graph:hooks
npm run graph:build
```

The package is `graphifyy` (double y); the executable is `graphify`. The requirements in [scripts/graphify/requirements.txt](../scripts/graphify/requirements.txt) pin the version used by the local gate and CI. Existing compatible uv installations can be replaced with `uv tool install --reinstall --python 3.12 "graphifyy[sql]==0.9.102"`. If the launcher is missing from PATH, run `uv tool update-shell` and reopen the terminal. Restart the coding assistant to discover the installed repository-local skill.

Registration installs `.codex/skills/graphify/` and Graphify's section in [AGENTS.md](../AGENTS.md). Its generated Codex `PreToolUse` hook is intentionally a no-op; persistent agent instructions provide graph-first guidance. The Git commit gate described below supplies the actual blocking check.

`graph:hooks` selects the tracked `.githooks` directory through repository-local `core.hooksPath`. It refuses to replace an existing custom hook directory or active default hooks. Integrate `node scripts/graphify/commit-check.mjs staged` into the existing pre-commit chain in that case. Hook installation also sets the executable permission on POSIX systems. No npm dependency installation is needed for these Node scripts.

## Before and after editing code

```powershell
graphify query "stockTransaction reconcileFinance" --context call --budget 1500
graphify explain apps_api_src_services_prisma_service_prismaservice_stocktransaction --all
graphify update .
```

Use source paths or exact node IDs to distinguish customer and provider classes with the same name. Query results include source locations and confidence. Confirm consequential inferred relationships in source. The tool matches symbol words; a long natural-language question does not guarantee a better match. Some queries exceed their requested budget when all matching nodes fit and every edge is then included.

`npm run graph:build` extracts code and regenerates a report and HTML with automatic model-based labels disabled. Open `graphify-out/graph.html` for communities and `graphify-out/GRAPH_REPORT.md` for broad navigation. Large graphs use an aggregated HTML view. These generated files are ignored by Git, as are `.evergreen/` commit records.

[.graphifyignore](../.graphifyignore) excludes duplicated marketing demo trees and coverage. Production source, application tests, SQL migrations and delivery configuration remain available to the graph. CSS and Prisma schema syntax are not fully represented by this code graph; inspect the schemas directly. The two supplied review documents are read as human evidence; their prose is not semantically indexed or sent to a model by this workflow.

## Every commit

The owner requested Graphify on every commit, including documentation commits. Normal `git commit` invokes [.githooks/pre-commit](../.githooks/pre-commit). To run the same gate manually:

```powershell
npm run graph:check
```

The gate:

1. Requires the pinned CLI version and fingerprints the actual Git index.
2. Exports the index to a unique temporary directory using `git checkout-index`. It respects Git's alternate commit index and preserves partial staging, unstaged edits and user files.
3. Builds a fresh code-only Graphify graph of that snapshot. No stashing, auto-staging, model/backend call or application database access occurs.
4. Calculates graph neighbors across all changed files and makes bounded scoped queries for up to three changed source files. Files without nodes, including documents and deletions, are listed explicitly. Their absence from the graph is not approval of their contents.
5. Blocks on process failure, missing/empty/invalid graph, CLI mismatch, failed scoped query or an index changed during analysis. Parser warnings are retained as limitations; this gate is not a TypeScript compiler.
6. Writes `.evergreen/graphify/<index-sha256>.json` with version, staged fingerprint, changed and related paths, counts, warnings and scoped query evidence. It removes only its own temporary directory. The regular working-tree graph is kept separate.

Read the related files and run tests appropriate to the change before committing. The hook provides graph context and reproducible evidence; it cannot decide whether a business invariant is correct. A cold full snapshot analysis takes longer than the regular incremental working-tree update.

New clones must run `npm run graph:hooks`; Git does not enable tracked hooks automatically. The [Graphify architecture check](../.github/workflows/graphify.yml) also builds and queries the checked-out commit on every push and pull request. It installs the pinned tool in an isolated Python environment, runs gate tests and retains impact evidence for 14 days. Mark `Graphify architecture check / architecture` as a required check in repository branch protection if server-side enforcement is desired. Repository files alone cannot set that remote policy or prevent an explicitly bypassed local hook.

## Verify and recover

```powershell
npm run graph:test
graphify --version
git config --local --get core.hooksPath
```

The expected hook path is `.githooks`. The CLI can be selected with `GRAPHIFY_BIN` set to a single executable path when a GUI Git client has a different PATH. Do not put arguments or a shell command in that variable. The gate never downloads tools while committing; install the pinned version first. If Graphify cannot launch from a restricted coding-agent sandbox, use the host's normal approval mechanism to run the same tool with access to its uv environment.

Set `GRAPHIFY_INTEGRATION=1` when running the Node tests to include a real CLI test in a disposable repository. CI enables it too. The tests cover partial staging, unchanged index/worktree, extraction/output/version failures, changing indexes, warning retention, documentation commits, clean CI snapshots and preservation of existing hooks.

For parsing limitations or changed ignore rules, inspect the warnings and rebuild with `npm run graph:build`; do not interpret graph silence as proof that code is unused. Upgrades require changing the pinned requirements, reinstalling the CLI, refreshing assistant registration, rebuilding the graph and rerunning gate checks together.

The source-verified review is [4 November architecture review](audits/2026-11-04/GRAPHIFY_REVIEW.md). Official references: [installation](https://docs.graphify.com/open-source/installation), [CLI](https://docs.graphify.com/reference/overview), and [ignore rules](https://docs.graphify.com/open-source/configuration/ignoring-files).
