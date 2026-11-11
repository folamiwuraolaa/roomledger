import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryIcon, Empty, PageHeader, Panel, StatusBadge, useLedger } from "@/components/ledger/bits";
import { CATEGORIES, fmtDate } from "@/lib/categories";
import { formatNaira, type Debt, type Expense } from "@/lib/ledger";

export const Route = createFileRoute("/_ledger/expenses/")({
  head: () => ({ meta: [{ title: "Expense history · Roommate Ledger" }, { name: "description", content: "Every shared expense in your household." }, { property: "og:title", content: "Expense history · Roommate Ledger" }, { property: "og:description", content: "Every shared expense in your household." }] }),
  component: Expenses,
});

export const isSettled = (e: Expense, debts: Debt[]) =>
  Object.keys(e.shares).every((p) => p === e.paidBy || !debts.some((d) => d.from === p && d.to === e.paidBy));

const sel = "h-10 rounded-xl border border-input bg-card px-3 text-sm";

function Expenses() {
  const { expenses, members, me, name, debts } = useLedger();
  const [cat, setCat] = useState("all");
  const [person, setPerson] = useState("all");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("all");
  const months = [...new Set(expenses.map((e) => e.date.slice(0, 7)))];
  const list = expenses.filter((e) =>
    (cat === "all" || e.category === cat) &&
    (person === "all" || e.paidBy === person || person in e.shares) &&
    (month === "all" || e.date.startsWith(month)) &&
    (status === "all" || (status === "paid") === isSettled(e, debts)),
  );

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Everything your household has shared." action={<Button variant="add" asChild><Link to="/expenses/new"><Plus /> Add expense</Link></Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="f-cat">Category</label>
        <select id="f-cat" className={sel} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-month">Date</label>
        <select id="f-month" className={sel} value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">Any date</option>
          {months.map((m) => <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-person">Person</label>
        <select id="f-person" className={sel} value={person} onChange={(e) => setPerson(e.target.value)}>
          <option value="all">Everyone</option>
          {members.map((m) => <option key={m.id} value={m.id}>{name(m.id)}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-status">Status</label>
        <select id="f-status" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Any status</option>
          <option value="paid">Settled</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <Panel>
        {list.length === 0 ? (
          <Empty title={expenses.length ? "No expenses match these filters." : "No shared expenses yet."} body={expenses.length ? "Try clearing a filter." : "Start by adding your first grocery, utility or household expense."}>
            {!expenses.length && <Button variant="add" asChild><Link to="/expenses/new"><Plus /> Add expense</Link></Button>}
          </Empty>
        ) : (
          <>
            <table className="hidden w-full text-sm md:table">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>{["Expense", "Category", "Amount", "Paid by", "Date", "Your share", "Status"].map((h) => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="py-3"><Link to="/expenses/$id" params={{ id: e.id }} className="font-semibold hover:underline">{e.title}</Link></td>
                    <td>{CATEGORIES[e.category].label}</td>
                    <td className="num font-semibold">{formatNaira(e.amount)}</td>
                    <td>{name(e.paidBy)}</td>
                    <td className="text-muted-foreground">{fmtDate(e.date)}</td>
                    <td className="num">{e.shares[me!.id] ? formatNaira(e.shares[me!.id] ?? 0) : "—"}</td>
                    <td><StatusBadge paid={isSettled(e, debts)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="space-y-3 md:hidden">
              {list.map((e) => (
                <li key={e.id}>
                  <Link to="/expenses/$id" params={{ id: e.id }} className="flex gap-3 rounded-2xl border p-3">
                    <CategoryIcon category={e.category} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2"><p className="font-semibold">{e.title}</p><p className="num font-semibold">{formatNaira(e.amount)}</p></div>
                      <p className="text-sm text-muted-foreground">Paid by {name(e.paidBy)} · {fmtDate(e.date)}</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span>Your share {e.shares[me!.id] ? formatNaira(e.shares[me!.id] ?? 0) : "—"}</span>
                        <StatusBadge paid={isSettled(e, debts)} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}
