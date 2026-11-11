import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in · Roommate Ledger" }, { name: "description", content: "Log in to see what you owe and who owes you." }, { property: "og:title", content: "Log in · Roommate Ledger" }, { property: "og:description", content: "Log in to your household ledger." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your household.">
      <form className="space-y-4" noValidate onSubmit={async (e) => {
        e.preventDefault();
        if (!email || !password) return setError("Please enter your email and password.");
        const err = await actions.login(email, password);
        if (err) return setError(err);
        navigate({ to: "/dashboard" });
      }}>
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" className="mt-1.5 h-11" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div>
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" autoComplete="current-password" className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full">Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link to="/register" className="font-semibold text-primary-strong">Create account</Link></p>
      <p className="mt-3 text-center text-xs text-muted-foreground"><Link to="/super-admin/login" className="font-semibold hover:text-foreground">Super Admin access</Link></p>
    </AuthShell>
  );
}
