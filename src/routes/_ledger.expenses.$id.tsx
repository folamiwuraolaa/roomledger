import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, CategoryIcon, Empty, Panel, StatusBadge, useLedger } from "@/components/ledger/bits";
import { CATEGORIES, fmtDate } from "@/lib/categories";
import { formatNaira } from "@/lib/ledger";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/_ledger/expenses/$id")({
  head: () => ({ meta: [{ title: "Expense details · Roommate Ledger" }, { name: "description", content: "How this shared expense was split." }, { property: "og:title", content: "Expense details · Roommate Ledger" }, { property: "og:description", content: "How this shared expense was split." }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { expenses, name, debts, me, myRole } = useLedger();
  const navigate = useNavigate();
  const e = expenses.find((x) => x.id === id);
  if (!e) return <Empty title="This expense doesn't exist anymore." body="It may have been deleted."><Button asChild variant="outline"><Link to="/expenses">Back to expenses</Link></Button></Empty>;
  const canDelete = e.createdBy === me!.id || myRole === "admin";
  const others = Object.keys(e.shares).filter((p) => p !== e.paidBy);

  return (
    <div className="space-y-6">
      <Link to="/expenses" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All expenses</Link>
      <Panel>
        <div className="flex flex-wrap items-start gap-4">
          <CategoryIcon category={e.category} className="size-14" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{e.title}</h1>
            <p className="num mt-1 text-4xl font-bold">{formatNaira(e.amount)}</p>
          </div>
          {canDelete && (
            <Button variant="outline" onClick={async () => { if (confirm("Delete this expense? Balances will be recalculated.")) { await actions.deleteExpense(e.id); toast.success("Expense deleted."); navigate({ to: "/expenses" }); } }}>
              <Trash2 /> Delete
            </Button>
          )}
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[["Paid by", name(e.paidBy)], ["Category", CATEGORIES[e.category].label], ["Date", fmtDate(e.date)]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-muted p-4"><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>
          ))}
        </dl>
      </Panel>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Split">
          <ul className="space-y-2">
            {Object.entries(e.shares).map(([p, s]) => (
              <li key={p} className="flex items-center gap-3"><Avatar name={name(p)} className="size-8" /><span className="flex-1">{name(p)}</span><span className="num font-semibold">{formatNaira(s)}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel title="Settlement status">
          {others.length === 0 ? <p className="text-sm text-muted-foreground">Only the payer shared this expense — nothing to settle.</p> : (
            <ul className="space-y-3">
              {others.map((p) => {
                const paid = !debts.some((d) => d.from === p && d.to === e.paidBy);
                return (
                  <li key={p} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex-1">{name(p)} → {name(e.paidBy)}: <b className="num">{formatNaira(e.shares[p] ?? 0)}</b></span>
                    <StatusBadge paid={paid} />
                    {!paid && p === me!.id && <Button size="sm" variant="hero" asChild><Link to="/settle" search={{ to: e.paidBy }}>Settle</Link></Button>}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Status reflects each person's overall balance with the payer.</p>
        </Panel>
      </div>
    </div>
  );
}
