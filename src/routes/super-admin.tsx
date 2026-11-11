import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/ledger";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin Dashboard · Roommate Ledger" }] }),
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const location = useLocation();
  if (location.pathname !== "/super-admin") return <Outlet />;
  return <SuperAdminHome />;
}

function SuperAdminHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    actions.superAdminState().then((result) => {
      if (active) setData(result);
    }).catch(async (e) => {
      const message = e instanceof Error ? e.message : "Unable to load the Super Admin dashboard.";
      // After a database reset there is no Super Admin yet. Send the visitor
      // directly to the one-time setup page instead of showing a dead-end.
      if (message.toLowerCase().includes("log in as super admin") || message.toLowerCase().includes("access is required")) {
        try {
          if (await actions.superAdminSetupStatus()) {
            navigate({ to: "/super-admin/setup", replace: true });
            return;
          }
        } catch {
          // Fall through to the normal access error below.
        }
      }
      if (active) setError(message);
    });
    return () => { active = false; };
  }, [navigate]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center p-6"><Card className="max-w-md p-6 text-center"><h1 className="text-xl font-bold">Super Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button className="mt-5" asChild><Link to="/super-admin/login">Go to Super Admin login</Link></Button></Card></div>;
  }

  if (!data) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading Super Admin dashboard…</div>;

  const userNames = new Map((data.users ?? []).map((u: any) => [u.id, u.name]));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Roommate Ledger</p><h1 className="text-2xl font-bold">Super Admin</h1></div>
          <Button variant="outline" onClick={async () => { await actions.superAdminLogout(); navigate({ to: "/super-admin/login" }); }}>Log out</Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div><p className="text-muted-foreground">Welcome, {data.user.name}.</p><h2 className="text-3xl font-bold">System overview</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Users", data.stats.users], ["Households", data.stats.households], ["Expenses", data.stats.expenses], ["Settlements", data.stats.settlements]].map(([label, value]) => <Card key={label as string} className="rounded-3xl p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label as string}</p><p className="mt-2 text-3xl font-bold">{value as number}</p></Card>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl p-5"><h3 className="text-xl font-bold">Users</h3><div className="mt-4 space-y-3">{data.users.slice(0, 10).map((u: any) => <div key={u.id} className="flex items-center justify-between rounded-2xl bg-muted/60 p-3"><div><p className="font-semibold">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>{u.isSuperAdmin && <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary-strong">Super Admin</span>}</div>)}</div></Card>
          <Card className="rounded-3xl p-5"><h3 className="text-xl font-bold">Households</h3><div className="mt-4 space-y-3">{data.households.slice(0, 10).map((h: any) => <div key={h.id} className="flex items-center justify-between rounded-2xl bg-muted/60 p-3"><div><p className="font-semibold">{h.name}</p><p className="text-sm text-muted-foreground">Code: {h.code}</p></div><span className="text-sm font-semibold">{h.members} members</span></div>)}</div></Card>
        </div>
        <Card className="rounded-3xl p-5"><h3 className="text-xl font-bold">Recent expenses</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b text-muted-foreground"><th className="p-3">Expense</th><th className="p-3">Household</th><th className="p-3">Paid by</th><th className="p-3">Amount</th></tr></thead><tbody>{data.recentExpenses.map((e: any) => <tr key={e.id} className="border-b last:border-0"><td className="p-3 font-semibold">{e.title}</td><td className="p-3">{data.households.find((h: any) => h.id === e.householdId)?.name ?? "—"}</td><td className="p-3">{userNames.get(e.paidBy) ?? "—"}</td><td className="num p-3 font-bold">{formatNaira(e.amount)}</td></tr>)}</tbody></table></div></Card>
      </main>
    </div>
  );
}
