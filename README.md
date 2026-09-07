# 💰 Expense Tracker

Record expenses in plain language. In the App's Use chat, say “lunch 25” or “taxi yesterday 38”; the Agent writes one normalized Base row with date, amount, category, and note. The detail view shows the ledger, while the analysis view shows category share and daily spending.

## Use it

1. Install the App and inspect the six sample rows.
2. Delete the `sample-*` rows before recording real expenses.
3. Open Use chat and describe expenses, corrections, or questions.
4. Open Analysis to review category and daily trends.

Built-in categories are food, transport, shopping, housing, health, entertainment, and other. Refunds or reimbursements received are recorded as negative amounts.

## Requirements

None. The package uses manifest schema v2 and Bottega's built-in Base tools.

## License

MIT

## Minimum Bottega version

This release requires Bottega **0.1.3** or later, declared in `app.compat.json`.
Keep this minimum for styling, copy, and business changes that use existing host capabilities. Raise it only when a new host API, package format, or build capability is required, and test against that minimum. Publish the compatible Bottega release before publishing an App that requires it. Editing, rebuilding, and sharing preserve this declaration.
