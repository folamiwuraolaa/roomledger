import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/logo.png";
import { CATEGORIES, fmtDate } from "@/lib/categories";
import { formatNaira, netBalances, pairwiseDebts, type Expense } from "@/lib/ledger";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="Roommate Ledger home">
      <img src={logo} alt="" width={36} height={36} className="size-9 object-contain" />
      <span className={cn("font-display text-lg font-bold tracking-tight", light ? "text-sidebar-foreground" : "text-foreground")}>
        Roommate Ledger
      </span>
    </Link>
  );
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useLedger() {
  const s = useStore();
  const members = s.household?.members ?? [];
  const me = s.user ?? s.accounts.find((a) => a.id === s.userId) ?? null;
  const myRole = members.find((m) => m.id === me?.id)?.role;
  const balances = netBalances(members, s.expenses, s.settlements);
  const debts = pairwiseDebts(s.expenses, s.settlements);
  const name = (id: string) => (id === me?.id ? "You" : members.find((m) => m.id === id)?.name ?? s.accounts.find((a) => a.id === id)?.name ?? "Former member");
  const iOwe = debts.filter((d) => d.from === me?.id);
  const owedToMe = debts.filter((d) => d.to === me?.id);
  return { ...s, members, me, myRole, balances, debts, name, iOwe, owedToMe };
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-secondary-foreground", className)}>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function CategoryIcon({ category, className }: { category: Expense["category"]; className?: string }) {
  const Icon = CATEGORIES[category].icon;
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl bg-muted text-foreground", className)}>
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function ExpenseRow({ e }: { e: Expense }) {
  const { me, name } = useLedger();
  const share = me ? e.shares[me.id] ?? 0 : 0;
  return (
    <Link to="/expenses/$id" params={{ id: e.id }} className="flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-muted">
      <CategoryIcon category={e.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{e.title}</p>
        <p className="text-sm text-muted-foreground">Paid by {name(e.paidBy)} · {fmtDate(e.date)}</p>
      </div>
      <div className="text-right">
        <p className="num font-semibold">{formatNaira(e.amount)}</p>
        <p className="text-sm text-muted-foreground">{share ? `Your share ${formatNaira(share)}` : "Not included"}</p>
      </div>
    </Link>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border bg-card p-5 shadow-soft sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ paid }: { paid: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", paid ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative")}>
      {paid ? "✓ Paid" : "● Unpaid"}
    </span>
  );
}

export function Empty({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
