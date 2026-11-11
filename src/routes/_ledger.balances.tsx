import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Avatar, Empty, PageHeader, Panel, useLedger } from "@/components/ledger/bits";
import { formatNaira } from "@/lib/ledger";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ledger/balances")({
  head: () => ({ meta: [{ title: "Balances · Roommate Ledger" }, { name: "description", content: "Your position and everyone you owe or who owes you." }, { property: "og:title", content: "Balances · Roommate Ledger" }, { property: "og:description", content: "Who owes whom in your household." }] }),
  component: Balances,
});

function Balances() {
  const { me, balances, iOwe, owedToMe, debts, name, settlements } = useLedger();
  const net = balances[me!.id] ?? 0;
  const owe = iOwe.reduce((a, d) => a + d.amount, 0);
  const owed = owedToMe.reduce((a, d) => a + d.amount, 0);
  const otherDebts = debts.filter((d) => d.from !== me!.id && d.to !== me!.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Balances" />
      <Panel className={cn(net > 0 ? "bg-positive-soft" : net < 0 ? "bg-negative-soft" : "")}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your position</p>
        <p className={cn("num mt-2 text-5xl font-bold", net > 0 ? "text-positive" : net < 0 ? "text-negative" : "")}>{formatNaira(net, { sign: true })}</p>
        <p className="mt-2">You are owed <b>{formatNaira(owed)}</b> and owe <b>{formatNaira(owe)}</b>.</p>
      </Panel>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="You owe">
          {iOwe.length === 0 ? <p className="text-sm text-muted-foreground">You don't owe anyone. Nice.</p> : (
            <ul className="space-y-2">{iOwe.map((d) => (
              <li key={d.to} className="flex items-center gap-3"><Avatar name={name(d.to)} /><span className="flex-1">You owe <b>{name(d.to)}</b></span><span className="num font-bold text-negative">{formatNaira(d.amount)}</span>
                <Button size="sm" variant="hero" asChild><Link to="/settle" search={{ to: d.to }}>Settle</Link></Button></li>
            ))}</ul>
          )}
        </Panel>
        <Panel title="Owed to you">
          {owedToMe.length === 0 ? <p className="text-sm text-muted-foreground">Nobody owes you right now.</p> : (
            <ul className="space-y-2">{owedToMe.map((d) => (
              <li key={d.from} className="flex items-center gap-3"><Avatar name={name(d.from)} /><span className="flex-1"><b>{name(d.from)}</b> owes you</span><span className="num font-bold text-positive">{formatNaira(d.amount)}</span></li>
            ))}</ul>
          )}
        </Panel>
      </div>
      <Panel title="Between other roommates">
        {otherDebts.length === 0 ? <Empty title="All clear" body="No other open balances in the household." /> : (
          <ul className="space-y-2 text-sm">{otherDebts.map((d) => <li key={d.from + d.to}><b>{name(d.from)}</b> owes <b>{name(d.to)}</b> <span className="num font-semibold">{formatNaira(d.amount)}</span></li>)}</ul>
        )}
      </Panel>
      <Panel title="Settlement history">
        {settlements.length === 0 ? <p className="text-sm text-muted-foreground">No settlements recorded yet.</p> : (
          <ul className="divide-y text-sm">{settlements.map((s) => (
            <li key={s.id} className="flex justify-between py-2.5"><span>{name(s.from)} paid {name(s.to)}</span><span><b className="num">{formatNaira(s.amount)}</b> <span className="text-muted-foreground">· {new Date(s.date).toLocaleDateString("en-GB")}</span></span></li>
          ))}</ul>
        )}
      </Panel>
    </div>
  );
}
