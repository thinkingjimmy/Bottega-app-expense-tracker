/**
 * [INPUT]: Host Base snapshots with date, amount, category, and note columns
 * [OUTPUT]: Valid ledger rows, filter projections, and signed currency-safe summaries
 * [POS]: Expense business calculations independent of React presentation
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { BaseSnapshot } from "@bottega/app-react";

export type Expense = {
  id: string;
  date: string;
  cents: number;
  category: string;
  note: string;
};
export const categories = [
  "food",
  "transport",
  "shopping",
  "housing",
  "health",
  "entertainment",
  "other",
] as const;
export function validSchema(snapshot: BaseSnapshot) {
  return Object.entries({
    date: "date",
    amount: "number",
    category: "select",
    note: "text",
  }).every(([id, type]) =>
    snapshot.meta.columns.some(
      (column) => column.id === id && column.type === type,
    ),
  );
}
export function ledger(snapshot: BaseSnapshot) {
  const items: Expense[] = [];
  let invalid = 0;
  for (const { id, values } of snapshot.rows) {
    const date = typeof values.date === "string" ? values.date : "";
    const amount = values.amount;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      !Number.isSafeInteger(Math.round(amount * 100))
    ) {
      invalid += 1;
      continue;
    }
    const cents =
      Math.sign(amount) * Math.round((Math.abs(amount) + Number.EPSILON) * 100);
    items.push({
      id,
      date,
      cents,
      category: typeof values.category === "string" ? values.category : "",
      note: typeof values.note === "string" ? values.note : "",
    });
  }
  return {
    items: items.sort(
      (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
    ),
    invalid,
  };
}
export function filterExpenses(
  items: Expense[],
  month: string,
  category: string,
  query: string,
) {
  const needle = query.trim().toLocaleLowerCase();
  return items.filter(
    (item) =>
      (!month || item.date.startsWith(month)) &&
      (!category || item.category === category) &&
      (!needle || item.note.toLocaleLowerCase().includes(needle)),
  );
}
export function summarize(items: Expense[]) {
  let spent = 0,
    refunded = 0;
  const byCategory = new Map<string, number>(),
    byDay = new Map<string, number>();
  for (const item of items) {
    if (item.cents > 0) {
      spent += item.cents;
      byCategory.set(
        item.category,
        (byCategory.get(item.category) ?? 0) + item.cents,
      );
    } else refunded -= item.cents;
    byDay.set(item.date, (byDay.get(item.date) ?? 0) + item.cents);
  }
  return {
    spent,
    refunded,
    net: spent - refunded,
    byCategory: [...byCategory].sort((a, b) => b[1] - a[1]),
    byDay: [...byDay].sort((a, b) => a[0].localeCompare(b[0])),
  };
}
