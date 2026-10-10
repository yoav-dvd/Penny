# Penny desktop POC

A local, synthetic-data workflow for reviewing two separately owned portfolios together. This is the active development entry point. The older role definitions are retained as research artifacts; the app does not run agents or call a model.

## Run

Use Node.js 22 or newer:

```sh
npm ci --ignore-scripts
npm run poc
```

Open http://127.0.0.1:4317. Load the example or download the Excel template. Keep all template cells as text, including numbers and dates. Only the exact `Accounts` format is supported. Use synthetic data only; checking the household identifier is not a privacy detector.

The app keeps original observations, file hashes, cell references, snapshot dates, conflicting values, corrections with reasons, evidence requests and activity in `.penny-poc/state.json` (Git-ignored). It stores normalized values, not original XLSX bytes. Keep original files separately for future reprocessing. Run one server per state file. An unreadable saved file stops startup rather than silently resetting it.

## Current behavior and boundaries

- Household and individual views; household totals only for aligned snapshot dates and resolved balances/ownership. Totals cover received accounts only.
- Decimal balances use exact minor units; percentages retain original precision. No silent conversion into the older integer-basis-point fee engine.
- Duplicate files are idempotent. Same-date disagreements need explicit correction. New evidence invalidates corrections whose source fingerprint changed; original history remains.
- Unknown, missing and unproven `NA` are distinct. Corrections are user assertions, not professional validation. Evidence requests are a manual checklist; nothing is sent.
- Bound to loopback, with origin/host checks, restricted static routes and bounded XLSX parsing. No accounts, authentication, encryption, multi-user permissions or production deployment. The two portfolio filters are views, not access controls.
- No XML/payroll importer, provider integration, verified professional rules, product selection, live advice or monitoring yet. These are separate increments, not claims of this POC.
- Account grouping uses exact provider name plus account ID. Name changes can create separate groups; cross-provider matching requires future reconciliation.

## Validation

`npm test` runs existing core regression tests and the POC parser, state, persistence and HTTP tests. `npm run test:poc` runs the POC suite alone. These are software checks, not evidence of pension expertise. The test workbook generator and demonstration workbook contain wholly synthetic values.

Next product gate: demonstrate import, review, correction and a return visit; then add one sourced, bounded professional comparison with explicit acceptance cases. Retain XML, payroll and household optimization requirements for subsequent increments.
