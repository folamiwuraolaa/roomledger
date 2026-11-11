import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Empty, ExpenseRow, Panel, useLedger } from "@/components/ledger/bits";
import { formatNaira } from "@/lib/ledger";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ledger/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Roommate Ledger" }, { name: "description", content: "See what you owe, who owes you and your recent shared expenses." }, { property: "og:title", content: "Dashboard · Roommate Ledger" }, { property: "og:description", content: "Your household balances at a glance." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { me, balances, iOwe, owedToMe, expenses, name } = useLedger();
  const net = balances[me!.id] ?? 0;
  const owe = iOwe.reduce((a, d) => a + d.amount, 0);
  const owed = owedToMe.reduce((a, d) => a + d.amount, 0);
  const rel = [...owedToMe.map((d) => ({ ...d, mine: false })), ...iOwe.map((d) => ({ ...d, mine: true }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground">Hi {me!.name} 👋</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Here's where things stand</h1>
        </div>
        <Button variant="add" size="lg" asChild><Link to="/expenses/new"><Plus /> Add expense</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={cn("rounded-3xl p-6 shadow-soft", net > 0 ? "bg-positive-soft" : net < 0 ? "bg-negative-soft" : "bg-card border")}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My net balance</p>
          <p className={cn("num mt-2 text-4xl font-bold", net > 0 ? "text-positive" : net < 0 ? "text-negative" : "")}>{formatNaira(net, { sign: true })}</p>
          <p className="mt-1 text-sm font-medium">{net > 0 ? "You are owed overall" : net < 0 ? "You owe overall" : "You're all settled"}</p>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">I owe</p>
          <p className="num mt-2 text-4xl font-bold">{formatNaira(owe)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{iOwe.length} {iOwe.length === 1 ? "person" : "people"}</p>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owed to me</p>
          <p className="num mt-2 text-4xl font-bold">{formatNaira(owed)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{owedToMe.length} {owedToMe.length === 1 ? "person" : "people"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Who owes whom?" action={<Link to="/balances" className="text-sm font-semibold text-primary-strong">All balances</Link>}>
          {rel.length === 0 ? (
            <Empty title="You're all settled 🎉" body="Nobody currently owes you and you don't owe anyone." />
          ) : (
            <ul className="space-y-2">
              {rel.map((d) => {
                const other = d.mine ? d.to : d.from;
                return (
                  <li key={d.from + d.to} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                    <Avatar name={name(other)} />
                    <p className="flex-1 text-sm">
                      {d.mine ? <>You owe <b>{name(other)}</b></> : <><b>{name(other)}</b> owes you</>}
                      <span className={cn("num block text-lg font-bold", d.mine ? "text-negative" : "text-positive")}>{formatNaira(d.amount)}</span>
                    </p>
                    {d.mine ? (
                      <Button variant="hero" size="sm" asChild><Link to="/settle" search={{ to: other }}>Settle</Link></Button>
                    ) : (
                      <Button variant="outline" size="sm" asChild><Link to="/balances">View</Link></Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Recent expenses" action={<Link to="/expenses" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-strong">See all <ArrowRight className="size-4" /></Link>}>
          {expenses.length === 0 ? (
            <Empty title="No shared expenses yet." body="Start by adding your first grocery, utility or household expense.">
              <Button variant="add" asChild><Link to="/expenses/new"><Plus /> Add expense</Link></Button>
            </Empty>
          ) : (
            <div className="-mx-3">{expenses.slice(0, 5).map((e) => <ExpenseRow key={e.id} e={e} />)}</div>
          )}
        </Panel>
      </div>
    </div>
  );
}
