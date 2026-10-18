# Documentation coverage

Generated source reference coverage (not test coverage or delivery certification).

- 38 page files with individual wiki entries.
- 34 direct page render expressions.
- 661 UI controls and tab containers.
- 141 controller HTTP handlers.
- 30 business workflow actions.
- 53 database models.

Run `npm run docs:check` in CI. It fails when source changes make generated references stale. Generated page actions are technical references; the operating guide explains cross-page handoffs.
