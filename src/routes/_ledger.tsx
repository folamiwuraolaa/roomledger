import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, Home, List, LogOut, Plus, User, Users } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, Logo, useHydrated, useLedger } from "@/components/ledger/bits";
import { actions } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ledger")({ component: LedgerLayout });

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/expenses", label: "Expenses", icon: List },
  { to: "/balances", label: "Balances", icon: ArrowLeftRight },
  { to: "/household", label: "Household", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function LedgerLayout() {
  const hydrated = useHydrated();
  const { me, household, members, ready } = useLedger();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const inHousehold = !!me && members.some((m) => m.id === me.id);

  useEffect(() => {
    if (!hydrated || !ready) return;
    if (!me) navigate({ to: "/login" });
    else if (!inHousehold) navigate({ to: "/onboarding" });
  }, [hydrated, me, inHousehold, navigate]);

  if (!hydrated || !ready || !me || !inHousehold) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading your household…</div>;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Logo light />
        <div className="mt-8 rounded-2xl bg-sidebar-accent p-4">
          <p className="text-xs uppercase tracking-wider opacity-60">Household</p>
          <p className="font-display text-lg font-bold">{household?.name}</p>
        </div>
        <Button variant="add" size="lg" className="mt-6 w-full" asChild>
          <Link to="/expenses/new"><Plus /> Add expense</Link>
        </Button>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent", path.startsWith(n.to) && "bg-sidebar-accent text-sidebar-primary")}>
              <n.icon className="size-4" aria-hidden /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-sidebar-border pt-4">
          <Avatar name={me.name} className="bg-sidebar-primary text-sidebar-primary-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{me.name}</p>
            <p className="truncate text-xs opacity-60">{me.email}</p>
          </div>
          <button onClick={async () => { await actions.logout(); navigate({ to: "/" }); }} aria-label="Log out" className="rounded-lg p-2 hover:bg-sidebar-accent">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{household?.name}</span>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
        <Outlet />
      </main>

      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[NAV[0], NAV[1], null, NAV[2], NAV[4]].map((n, i) =>
          n ? (
            <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground", path.startsWith(n.to) && "text-foreground")}>
              <n.icon className="size-5" aria-hidden /> {n.label}
            </Link>
          ) : (
            <Link key={i} to="/expenses/new" aria-label="Add expense" className="-mt-5 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lift"><Plus className="size-6" /></span>
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
