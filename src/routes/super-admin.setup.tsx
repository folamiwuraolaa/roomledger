import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/super-admin/setup")({
  head: () => ({ meta: [{ title: "Super Admin Setup · Roommate Ledger" }] }),
  component: SuperAdminSetup,
});

function SuperAdminSetup() {
  const navigate = useNavigate();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    actions.superAdminSetupStatus().then(setAvailable).catch(() => setAvailable(false));
  }, []);

  if (available === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking Super Admin setup…</div>;
  }

  if (!available) {
    return (
      <AuthShell title="Setup already completed" subtitle="A Super Admin account already exists for this system.">
        <div className="space-y-4 text-center">
          <p className="rounded-xl bg-muted p-4 text-sm">For security, the initial Super Admin setup can only be completed once.</p>
          <Button variant="hero" size="lg" className="w-full" asChild><Link to="/super-admin/login">Go to Super Admin login</Link></Button>
          <Link to="/login" className="block text-sm font-semibold text-muted-foreground">Back to member login</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create Super Admin" subtitle="This creates the first system administrator. Keep these credentials secure.">
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        if (password !== confirm) return setError("The passwords do not match.");
        setBusy(true);
        const result = await actions.superAdminSetup(name, email, password);
        setBusy(false);
        if (result) return setError(result);
        navigate({ to: "/super-admin" });
      }}>
        <div><Label htmlFor="admin-name">Full name</Label><Input id="admin-name" className="mt-1.5 h-11" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label htmlFor="admin-setup-email">Email</Label><Input id="admin-setup-email" type="email" autoComplete="email" className="mt-1.5 h-11" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="admin-setup-password">Password</Label><Input id="admin-setup-password" type="password" autoComplete="new-password" className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div><Label htmlFor="admin-confirm">Confirm password</Label><Input id="admin-confirm" type="password" autoComplete="new-password" className="mt-1.5 h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create Super Admin"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already set up? <Link to="/super-admin/login" className="font-semibold text-primary-strong">Sign in</Link></p>
    </AuthShell>
  );
}
