import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftRight, Calculator, History, Plus, Receipt, Users, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Logo } from "@/components/ledger/bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roommate Ledger — Split expenses, not friendships" },
      { name: "description", content: "Record shared groceries, utilities and household expenses, split costs automatically, and see exactly who owes whom." },
      { property: "og:title", content: "Roommate Ledger — Split expenses, not friendships" },
      { property: "og:description", content: "The shared dorm expense splitter for roommates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = ["Add an expense", "Choose who shared it", "We calculate the split", "Settle what you owe"];
const FEATURES = [
  { icon: Receipt, t: "Shared expenses", d: "Log groceries, power, internet and more in seconds." },
  { icon: Calculator, t: "Automatic splitting", d: "Equal or custom splits, always adding up to the kobo." },
  { icon: Scale, t: "Clear balances", d: "One number tells you if you're owed or owing." },
  { icon: ArrowLeftRight, t: "Who owes whom", d: "Plain-language debts between every roommate." },
  { icon: History, t: "Expense history", d: "Every purchase and settlement, searchable." },
  { icon: Users, t: "Household management", d: "Invite roommates with a simple code." },
];

function Landing() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
          <Button variant="hero" asChild><Link to="/register">Get started</Link></Button>
        </nav>
      </header>

      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">For roommates & dorms</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] sm:text-6xl">Split expenses.<br /><span className="text-primary-strong">Not friendships.</span></h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">Easily record shared groceries, utilities and household expenses, automatically split costs, and see exactly who owes whom.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild><Link to="/register">Get started</Link></Button>
              <Button variant="outline" size="lg" asChild><a href="#how">How it works</a></Button>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s} className="rounded-3xl border bg-card p-6 shadow-soft">
              <span className="num text-4xl font-bold text-accent">0{i + 1}</span>
              <p className="mt-6 font-display text-lg font-bold">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">See it in action</h2>
            <p className="mt-3 opacity-70">Wura buys ₦40,000 of groceries for four roommates. Roommate Ledger does the rest.</p>
            <div className="mt-8 rounded-3xl bg-sidebar-accent p-6">
              <p className="opacity-60">Groceries · Paid by Wura</p>
              <p className="num text-5xl font-bold">₦40,000</p>
              <p className="mt-2"><span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">4 people · ₦10,000 each</span></p>
            </div>
          </div>
          <ul className="space-y-3 self-center">
            {["Tolu", "Ada", "John"].map((n) => (
              <li key={n} className="flex items-center gap-4 rounded-2xl border border-sidebar-border p-4">
                <Avatar name={n} className="bg-sidebar-accent text-ink-foreground" />
                <span className="flex-1"><b>{n}</b> owes Wura</span>
                <span className="num text-xl font-bold text-primary">₦10,000</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Everything you need. Nothing you don't.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-3xl border bg-card p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><f.icon className="size-5" aria-hidden /></span>
              <p className="mt-4 font-display text-lg font-bold">{f.t}</p>
              <p className="mt-1 text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="bg-hero rounded-[2rem] border bg-secondary px-6 py-14 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Start splitting expenses</h2>
          <p className="mt-2 text-muted-foreground">Free for students. Set up your household in a minute.</p>
          <Button variant="hero" size="lg" className="mt-6" asChild><Link to="/register">Get started</Link></Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground">
          <Logo />
          <p>A shared dorm expense splitter · University software engineering project</p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div aria-hidden className="rotate-1 rounded-[2rem] border bg-card p-5 shadow-lift">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold">Maple Dorm</p>
        <span className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="size-3.5" /> Add expense</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-positive-soft p-3"><p className="text-[10px] uppercase text-muted-foreground">Net</p><p className="num text-lg font-bold text-positive">+₦12,500</p></div>
        <div className="rounded-2xl bg-muted p-3"><p className="text-[10px] uppercase text-muted-foreground">I owe</p><p className="num text-lg font-bold">₦7,500</p></div>
        <div className="rounded-2xl bg-muted p-3"><p className="text-[10px] uppercase text-muted-foreground">Owed</p><p className="num text-lg font-bold">₦20,000</p></div>
      </div>
      <p className="mt-5 text-sm font-bold">Who owes whom?</p>
      {[["Tolu", "owes you", "₦7,500", true], ["Ada", "owes you", "₦5,000", true], ["John", "you owe", "₦3,000", false]].map(([n, l, a, pos]) => (
        <div key={n as string} className="mt-2 flex items-center gap-3 rounded-xl bg-muted/60 p-2.5 text-sm">
          <Avatar name={n as string} className="size-8" />
          <span className="flex-1"><b>{n}</b> <span className="text-muted-foreground">{l}</span></span>
          <span className={`num font-bold ${pos ? "text-positive" : "text-negative"}`}>{a}</span>
        </div>
      ))}
    </div>
  );
}
