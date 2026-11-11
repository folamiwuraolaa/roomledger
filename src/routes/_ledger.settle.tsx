import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, PageHeader, Panel, useLedger } from "@/components/ledger/bits";
import { formatNaira, parseNaira } from "@/lib/ledger";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/_ledger/settle")({
  validateSearch: (s: Record<string, unknown>): { to?: string | undefined } => ({ to: typeof s["to"] === "string" ? s["to"] : undefined }),
  head: () => ({ meta: [{ title: "Settle up · Roommate Ledger" }, { name: "description", content: "Record a payment to a roommate." }, { property: "og:title", content: "Settle up · Roommate Ledger" }, { property: "og:description", content: "Record a payment to a roommate." }] }),
  component: Settle,
});

function Settle() {
  const { to } = Route.useSearch();
  const { iOwe, name, me } = useLedger();
  const [target, setTarget] = useState(to ?? iOwe[0]?.to ?? "");
  const debt = iOwe.find((d) => d.to === target);
  const [amt, setAmt] = useState(debt ? String(debt.amount / 100) : "");
  const [done, setDone] = useState<{ to: string; amount: number; full: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) return (
    <Panel className="mx-auto max-w-md text-center">
      <CheckCircle2 className="mx-auto size-14 text-positive" aria-hidden />
      <h1 className="mt-3 text-2xl font-bold">Payment recorded</h1>
      <p className="mt-2 text-muted-foreground">
        {done.full ? `You no longer owe ${name(done.to)} ${formatNaira(done.amount)}.` : `You paid ${name(done.to)} ${formatNaira(done.amount)}.`} Your balance has been updated.
      </p>
      <Button variant="hero" className="mt-6" asChild><Link to="/dashboard">Back to dashboard</Link></Button>
    </Panel>
  );

  if (iOwe.length === 0) return <Empty title="You're all settled 🎉" body="You don't owe anyone right now."><Button variant="outline" asChild><Link to="/dashboard">Back to dashboard</Link></Button></Empty>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = parseNaira(amt);
    if (!debt) return setError("Please choose who you're paying.");
    if (!a) return setError("Please enter an amount greater than ₦0.");
    if (a > debt.amount) return setError(`You only owe ${name(debt.to)} ${formatNaira(debt.amount)}. Please enter that amount or less.`);
    await actions.settle(me!.id, debt.to, a);
    toast.success("Settlement recorded.");
    setDone({ to: debt.to, amount: a, full: a === debt.amount });
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Settle up" />
      <Panel>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="text-center">
            <p className="text-muted-foreground">You owe {debt ? name(debt.to) : "…"}</p>
            <p className="num text-5xl font-bold">{formatNaira(debt?.amount ?? 0)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-3"><p className="text-xs uppercase text-muted-foreground">From</p><p className="font-semibold">You</p></div>
            <div><Label htmlFor="to" className="text-xs uppercase text-muted-foreground">To</Label>
              <select id="to" className="mt-1 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm font-semibold" value={target} onChange={(e) => { setTarget(e.target.value); const d = iOwe.find((x) => x.to === e.target.value); setAmt(d ? String(d.amount / 100) : ""); }}>
                {iOwe.map((d) => <option key={d.to} value={d.to}>{name(d.to)}</option>)}
              </select>
            </div>
          </div>
          <div><Label htmlFor="amt">Amount</Label>
            <div className="relative mt-1.5"><span className="num absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span><Input id="amt" inputMode="decimal" className="num h-12 pl-8 text-lg" value={amt} onChange={(e) => setAmt(e.target.value)} /></div>
          </div>
          {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full">Mark as settled</Button>
          <Button type="button" variant="outline" size="lg" className="w-full" disabled>Pay online — coming soon</Button>
          <p className="text-center text-xs text-muted-foreground">Pay your roommate in cash or by transfer, then record it here.</p>
        </form>
      </Panel>
    </div>
  );
}
