# 💰 Expense Tracker

Record expenses in plain language. In the App's Use chat, say “lunch 25” or “taxi yesterday 38”; the Agent writes one normalized Base row with date, amount, category, and note. The detail view shows the ledger, while the analysis view shows category share and daily spending.

## Use it

1. Install the App and inspect the six sample rows.
2. Delete the `sample-*` rows before recording real expenses.
3. Open Use chat and describe expenses, corrections, or questions.
4. Open Analysis to review category and daily trends.

Built-in categories are food, transport, shopping, housing, health, entertainment, and other. Refunds or reimbursements received are recorded as negative amounts.

## Requirements

Bottega 0.1.3 or later. The package uses manifest schema v2 and built-in Base tools.

### Dependencies

React, TypeScript, Tailwind CSS, and shadcn components are supplied by the host. No App-specific service or dependency installation is required.

## Interface

The React interface provides month/category/search filters, a paginated ledger, and category/day analysis. Spending and refunds are reported separately; net totals preserve negative amounts. The existing schema does not declare a currency, so the interface does not invent a currency symbol. It reads complete Base snapshots through the host SDK. The existing Data tab and Use chat remain the editing surfaces.

Source and component provenance are documented in [gui/README.md](gui/README.md).

## License

MIT

## Minimum Bottega version

This release requires Bottega **0.1.3** or later, declared in `app.compat.json`.
Keep this minimum for styling, copy, and business changes that use existing host capabilities. Raise it only when a new host API, package format, or build capability is required, and test against that minimum. Publish the compatible Bottega release before publishing an App that requires it. Editing, rebuilding, and sharing preserve this declaration.
