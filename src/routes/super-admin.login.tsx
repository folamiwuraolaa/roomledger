import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/super-admin/login")({
  head: () => ({ meta: [{ title: "Super Admin Login · Roommate Ledger" }] }),
  component: SuperAdminLogin,
});

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell title="Super Admin" subtitle="System-wide administration access.">
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setBusy(true);
        const result = await actions.superAdminLogin(email, password);
        setBusy(false);
        if (result) return setError(result);
        navigate({ to: "/super-admin" });
      }}>
        <div><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" autoComplete="username" className="mt-1.5 h-11" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="admin-password">Password</Label><Input id="admin-password" type="password" autoComplete="current-password" className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in as Super Admin"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">First-time setup? <Link to="/super-admin/setup" className="font-semibold text-primary-strong">Create the Super Admin account</Link></p>
      <p className="mt-3 text-center text-sm"><Link to="/login" className="font-semibold text-muted-foreground hover:text-foreground">Back to member login</Link></p>
    </AuthShell>
  );
}
