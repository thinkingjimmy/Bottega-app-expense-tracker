/**
 * [INPUT]: React, complete Base snapshots, host environment/actions, and shadcn views
 * [OUTPUT]: Default Expense Tracker with scoped totals, ledger, and analysis
 * [POS]: Host-mounted read-only GUI; existing Base and Use chat own mutations
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { useEffect, useMemo, useState } from "react";
import {
  useAppEnvironment,
  useBaseSnapshot,
  useHostAction,
} from "@bottega/app-react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { getCopy, label } from "./copy";
import { filterExpenses, ledger, summarize, validSchema } from "./domain";
import { Button, Input, Label } from "./components/ui/forms";
import { Card, Skeleton } from "./components/ui/surfaces";
import { Tabs } from "./components/ui/navigation";
import { Analysis, Ledger } from "./components/views";

const selectClass =
  "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-950";
export default function ExpenseTracker() {
  const environment = useAppEnvironment(),
    copy = getCopy(environment.language);
  const snapshot = useBaseSnapshot(),
    hostAction = useHostAction();
  const [month, setMonth] = useState(""),
    [category, setCategory] = useState(""),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const data = snapshot.status === "success" ? snapshot.data : null;
  const { items, invalid } = useMemo(
    () => (data ? ledger(data) : { items: [], invalid: 0 }),
    [data],
  );
  const filtered = useMemo(
    () => filterExpenses(items, month, category, query),
    [items, month, category, query],
  );
  const summary = useMemo(() => summarize(filtered), [filtered]);
  const format = useMemo(
    () =>
      new Intl.NumberFormat(environment.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [environment.locale],
  );
  const money = (cents: number) => format.format(cents / 100);
  useEffect(() => {
    document.title = copy.title;
    document.documentElement.lang = environment.language;
  }, [copy.title, environment.language]);
  const openData = () => {
    setError("");
    void hostAction({ type: "open-data" }).catch(() => setError(copy.error));
  };
  return (
    <main className="mx-auto grid grid-cols-1 max-w-6xl gap-6 p-5 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {copy.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={snapshot.retry} aria-label={copy.refresh}>
            <RefreshCw size={16} />
          </Button>
          <Button onClick={openData}>
            {copy.openData}
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </header>
      {error && <p role="alert">{error}</p>}
      {snapshot.status === "loading" ? (
        <div role="status" className="grid gap-4">
          <p>{copy.loading}</p>
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      ) : snapshot.status === "error" || (data && !validSchema(data)) ? (
        <Card role="alert">
          <p>{snapshot.status === "error" ? copy.error : copy.schema}</p>
          <Button className="mt-4" onClick={snapshot.retry}>
            {copy.refresh}
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-2 text-sm font-medium">
              {copy.month}
              <select
                className={selectClass}
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              >
                <option value="">{copy.allTime}</option>
                {[...new Set(items.map((item) => item.date.slice(0, 7)))]
                  .sort()
                  .reverse()
                  .map((value) => (
                    <option key={value}>{value}</option>
                  ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {copy.category}
              <select
                className={selectClass}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">{copy.allCategories}</option>
                {[
                  ...new Set(
                    items.map((item) => item.category).filter(Boolean),
                  ),
                ]
                  .sort()
                  .map((value) => (
                    <option key={value} value={value}>
                      {label(copy, value)}
                    </option>
                  ))}
              </select>
            </label>
            <div className="grid min-w-40 flex-1 gap-2">
              <Label htmlFor="search">{copy.search}</Label>
              <Input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {(month || category || query) && (
              <Button
                onClick={() => {
                  setMonth("");
                  setCategory("");
                  setQuery("");
                }}
              >
                {copy.clear}
              </Button>
            )}
          </div>
          {invalid > 0 && (
            <p
              role="status"
              className="text-sm text-amber-700 dark:text-amber-400"
            >
              {copy.invalid} ({invalid})
            </p>
          )}
          <section
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
            aria-label={copy.analysis}
          >
            {[
              [copy.net, money(summary.net)],
              [copy.spent, money(summary.spent)],
              [copy.refunded, money(summary.refunded)],
              [copy.count, String(filtered.length)],
            ].map(([title, value]) => (
              <Card key={title}>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {title}
                </p>
                <p className="mt-3 overflow-x-auto text-2xl font-semibold tabular-nums">
                  {value}
                </p>
              </Card>
            ))}
          </section>
          <Tabs.Root className="min-w-0" defaultValue="ledger">
            <Tabs.List aria-label={copy.title}>
              <Tabs.Tab value="ledger">{copy.ledger}</Tabs.Tab>
              <Tabs.Tab value="analysis">{copy.analysis}</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="ledger">
              {filtered.length ? (
                <Ledger
                  key={[month, category, query].join("/")}
                  items={filtered}
                  copy={copy}
                  money={money}
                />
              ) : (
                <Card className="py-16 text-center">
                  <h2 className="font-medium">{copy.empty}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {copy.emptyHint}
                  </p>
                </Card>
              )}
            </Tabs.Panel>
            <Tabs.Panel value="analysis">
              <Analysis summary={summary} copy={copy} money={money} />
            </Tabs.Panel>
          </Tabs.Root>
        </>
      )}
    </main>
  );
}
