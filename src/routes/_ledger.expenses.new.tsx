import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, PageHeader, Panel, useLedger } from "@/components/ledger/bits";
import { CATEGORIES } from "@/lib/categories";
import { formatNaira, parseNaira, splitEqual, type Category } from "@/lib/ledger";
import { actions } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ledger/expenses/new")({
  head: () => ({ meta: [{ title: "Add expense · Roommate Ledger" }, { name: "description", content: "Log a shared expense and split it automatically." }, { property: "og:title", content: "Add expense · Roommate Ledger" }, { property: "og:description", content: "Log a shared expense and split it automatically." }] }),
  component: AddExpense,
});

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t pt-5 first:border-0 first:pt-0">
      <legend className="mb-3 flex items-center gap-2 font-display font-bold">
        <span className="grid size-6 place-items-center rounded-full bg-ink text-xs text-ink-foreground">{n}</span>{title}
      </legend>
      {children}
    </fieldset>
  );
}

function AddExpense() {
  const { members, me, name } = useLedger();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("groceries");
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState(me!.id);
  const [who, setWho] = useState<string[]>(members.map((m) => m.id));
  const [mode, setMode] = useState<"equal" | "custom">("equal");
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const amount = parseNaira(amountStr) ?? 0;
  const parts = members.filter((m) => who.includes(m.id)).map((m) => m.id);
  const shares = mode === "equal" ? splitEqual(amount, parts) : Object.fromEntries(parts.map((p) => [p, parseNaira(custom[p] ?? "") ?? 0]));
  const sum = Object.values(shares).reduce((a, b) => a + b, 0);
  const diff = amount - sum;

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!title.trim()) return setError("Please give this expense a name, like “Groceries”.");
    if (!amount) return setError("Please enter an amount greater than ₦0.");
    if (!parts.length) return setError("Please select at least one person who shared this expense.");
    if (mode === "custom" && diff !== 0) return setError(`The custom amounts need to add up to ${formatNaira(amount)}. ${diff > 0 ? `${formatNaira(diff)} is still unassigned.` : `They are ${formatNaira(-diff)} over.`}`);
    const id = await actions.addExpense({ title, category, amount, paidBy, shares });
    toast.success("Expense added successfully.");
    navigate({ to: "/expenses/$id", params: { id } });
  }

  return (
    <div>
      <PageHeader title="Add an expense" subtitle="We'll work out who owes what." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]" noValidate>
        <Panel className="space-y-5">
          <Step n={1} title="What was purchased?">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="title">Expense name</Label><Input id="title" className="mt-1.5 h-11" placeholder="Groceries" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><Label htmlFor="cat">Category</Label>
                <select id="cat" className="mt-1.5 h-11 w-full rounded-md border border-input bg-card px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </Step>
          <Step n={2} title="How much?">
            <Label htmlFor="amt">Amount</Label>
            <div className="relative mt-1.5">
              <span className="num absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">₦</span>
              <Input id="amt" inputMode="decimal" className="num h-12 pl-8 text-lg" placeholder="40,000" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} />
            </div>
          </Step>
          <Step n={3} title="Who paid?">
            <Label htmlFor="payer" className="sr-only">Paid by</Label>
            <select id="payer" className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {members.map((m) => <option key={m.id} value={m.id}>{name(m.id)}</option>)}
            </select>
          </Step>
          <Step n={4} title="Who shared it?">
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => {
                const on = who.includes(m.id);
                return (
                  <button type="button" key={m.id} aria-pressed={on} onClick={() => setWho(on ? who.filter((x) => x !== m.id) : [...who, m.id])}
                    className={cn("flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm font-medium transition-colors", on ? "border-primary-strong bg-secondary" : "bg-card")}>
                    <span className={cn("grid size-5 place-items-center rounded-md border", on && "border-primary-strong bg-primary-strong text-ink-foreground")}>{on && <Check className="size-3.5" />}</span>
                    {name(m.id)}
                  </button>
                );
              })}
            </div>
          </Step>
          <Step n={5} title="How should it be split?">
            <div role="radiogroup" className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              {(["equal", "custom"] as const).map((k) => (
                <button type="button" role="radio" aria-checked={mode === k} key={k} onClick={() => setMode(k)}
                  className={cn("rounded-lg py-2 text-sm font-semibold", mode === k ? "bg-card shadow-soft" : "text-muted-foreground")}>
                  {k === "equal" ? "Equal split" : "Custom amounts"}
                </button>
              ))}
            </div>
            {mode === "custom" && (
              <div className="mt-3 space-y-2">
                {parts.map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <Label htmlFor={`c-${p}`} className="w-24">{name(p)}</Label>
                    <Input id={`c-${p}`} inputMode="decimal" placeholder="0" className="num" value={custom[p] ?? ""} onChange={(e) => setCustom({ ...custom, [p]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}
          </Step>
          {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        </Panel>

        <div className="lg:sticky lg:top-10 lg:self-start">
          <Panel className="bg-ink text-ink-foreground">
            <p className="text-xs uppercase tracking-wider opacity-60">Live split preview</p>
            <p className="num mt-2 text-4xl font-bold">{formatNaira(amount)}</p>
            <p className="mt-1 text-sm opacity-70">{parts.length} {parts.length === 1 ? "participant" : "participants"} · {mode === "equal" ? "Equal split" : "Custom amounts"}</p>
            {mode === "equal" && parts.length > 0 && amount > 0 && (
              <p className="mt-3 inline-block rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                {new Set(Object.values(shares)).size === 1 ? `${formatNaira(shares[parts[0]!] ?? 0)} each` : "Split as evenly as possible"}
              </p>
            )}
            <ul className="mt-5 space-y-2">
              {parts.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm">
                  <Avatar name={name(p)} className="size-8 bg-sidebar-accent text-ink-foreground" />
                  <span className="flex-1">{name(p)}{p === paidBy && <span className="opacity-60"> · paid</span>}</span>
                  <span className="num font-semibold">{formatNaira(shares[p] ?? 0)}</span>
                </li>
              ))}
            </ul>
            {amount > 0 && parts.length > 0 && (
              <div className="mt-5 space-y-1 border-t border-sidebar-border pt-4 text-sm">
                {parts.filter((p) => p !== paidBy && shares[p]).map((p) => (
                  <p key={p}>{name(p)} {p === me!.id ? "owe" : "owes"} {paidBy === me!.id ? "you" : name(paidBy)} <b className="num">{formatNaira(shares[p] ?? 0)}</b></p>
                ))}
                {mode === "custom" && diff !== 0 && <p className="text-accent">{diff > 0 ? `${formatNaira(diff)} left to assign` : `${formatNaira(-diff)} over the total`}</p>}
              </div>
            )}
            <Button type="submit" variant="add" size="lg" className="mt-6 w-full">Save expense</Button>
          </Panel>
        </div>
      </form>
    </div>
  );
}
