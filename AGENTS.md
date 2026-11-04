# EverGreen repository instructions

Read `agent-system/CONTEXT.md` and `agent-system/SYSTEM_PROMPT.md` before making changes. Preserve user edits and the existing modular-monolith, separate-customer-installation and separate-provider boundaries.

The owner requires Graphify for architecture work and **every commit**:

- Query the current graph before investigating code relationships; verify important `INFERRED` edges against source. Shared names such as `PrismaService` exist in both APIs: use the node ID or full source path.
- After code changes, run `graphify update .`. Use `npm run graph:build` for a new graph or a fresh broad architecture report.
- Before each commit, run `npm run graph:check` and review the reported related files and `.evergreen/graphify/` evidence. The tracked `.githooks/pre-commit` runs this against the actual Git index, including partially staged changes. Enable it once per clone with `npm run graph:hooks`.
- Do not bypass the Graphify gate or disable its CI check without an explicit owner instruction. A successful extraction is context for review, not proof of business correctness, security, performance or release readiness. Run the affected application checks separately.
- Keep `graphify-out/` and local commit evidence untracked. Commit the hook, pinned tool requirements, configuration, assistant skill and maintained review findings.
- For existing architecture concerns, consult `docs/EverGreen — Full Technical & Business Review.md`, `docs/Reface.md`, and their source-verified follow-up at `docs/audits/2026-11-04/GRAPHIFY_REVIEW.md`. Treat original review counts, test results, timings and market/legal claims as dated evidence until revalidated.

Setup and troubleshooting: [Graphify workflow](docs/GRAPHIFY.md).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
