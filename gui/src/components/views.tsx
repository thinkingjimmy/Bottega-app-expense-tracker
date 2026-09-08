/**
 * [INPUT]: Filtered ledger entries, signed summaries, localized copy, and shadcn surfaces
 * [OUTPUT]: Paginated ledger and accessible category/day analysis
 * [POS]: Expense presentation layer with integer-cent values supplied by domain.ts
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { useState } from "react";
import type { Expense } from "../domain";
import { summarize } from "../domain";
import { label, type Copy } from "../copy";
import { Button } from "./ui/forms";
import { Badge, Card, Table } from "./ui/surfaces";

export function Ledger({
  items,
  copy,
  money,
}: {
  items: Expense[];
  copy: Copy;
  money(cents: number): string;
}) {
  const [page, setPage] = useState(0),
    pageSize = 50;
  const current = Math.min(
    page,
    Math.max(0, Math.ceil(items.length / pageSize) - 1),
  );
  return (
    <Card>
      <Table>
        <caption className="sr-only">{copy.ledger}</caption>
        <thead>
          <tr>
            <th>{copy.date}</th>
            <th>{copy.category}</th>
            <th>{copy.note}</th>
            <th className="text-right">{copy.amount}</th>
          </tr>
        </thead>
        <tbody>
          {items
            .slice(current * pageSize, (current + 1) * pageSize)
            .map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap tabular-nums">{item.date}</td>
                <td>
                  <Badge className="whitespace-nowrap">
                    {label(copy, item.category) || copy.uncategorized}
                  </Badge>
                </td>
                <td className="min-w-40 max-w-lg whitespace-pre-wrap break-words">
                  {item.note || "—"}
                </td>
                <td
                  className={`text-right whitespace-nowrap tabular-nums ${item.cents < 0 ? "text-emerald-700 dark:text-emerald-400" : "font-medium"}`}
                >
                  {money(item.cents)}
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      {items.length > pageSize && (
        <nav
          className="mt-4 flex items-center justify-end gap-3"
          aria-label={copy.ledger}
        >
          <Button disabled={current === 0} onClick={() => setPage(current - 1)}>
            {copy.previous}
          </Button>
          <span className="tabular-nums">
            {current + 1} / {Math.ceil(items.length / pageSize)}
          </span>
          <Button
            disabled={(current + 1) * pageSize >= items.length}
            onClick={() => setPage(current + 1)}
          >
            {copy.next}
          </Button>
        </nav>
      )}
    </Card>
  );
}
export function Analysis({
  summary,
  copy,
  money,
}: {
  summary: ReturnType<typeof summarize>;
  copy: Copy;
  money(cents: number): string;
}) {
  const maxDay = Math.max(
    1,
    ...summary.byDay.map(([, amount]) => Math.abs(amount)),
  );
  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="mb-6 font-semibold">{copy.categories}</h2>
        <ul className="grid gap-5">
          {summary.byCategory.map(([category, amount]) => (
            <li key={category}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span>{label(copy, category) || copy.uncategorized}</span>
                <span className="tabular-nums">
                  {money(amount)} ·{" "}
                  {((amount / summary.spent) * 100).toFixed(1)}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${(amount / summary.spent) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {!summary.byCategory.length && (
          <p className="text-sm text-slate-500">
            {copy.spent}: {money(0)}
          </p>
        )}
      </Card>
      <Card>
        <h2 className="mb-6 font-semibold">{copy.days}</h2>
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <thead>
              <tr>
                <th>{copy.date}</th>
                <th className="text-right">{copy.net}</th>
              </tr>
            </thead>
            <tbody>
              {summary.byDay.map(([date, amount]) => (
                <tr key={date}>
                  <td className="tabular-nums">
                    {date}
                    <div
                      className="mt-2 h-1 rounded bg-slate-100 dark:bg-slate-800"
                      aria-hidden="true"
                    >
                      <div
                        className={`h-full rounded ${amount < 0 ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{
                          width: `${(Math.abs(amount) / maxDay) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="text-right tabular-nums">{money(amount)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
