# Documentation coverage

Generated source reference coverage (not test coverage or delivery certification).

- 47 page files with individual wiki entries.
- 34 direct page render expressions.
- 955 UI controls and tab containers.
- 144 controller HTTP handlers.
- 30 business workflow actions.
- 53 database models.

Run `npm run docs:check` in CI. It fails when source changes make generated references stale. Generated page actions are technical references; the operating guide explains cross-page handoffs.
