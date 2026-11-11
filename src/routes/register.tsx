import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    intent: search.intent === "join" ? "join" : "create",
    value: typeof search.value === "string" ? search.value : "",
  }),
  head: () => ({ meta: [{ title: "Create account · Roommate Ledger" }, { name: "description", content: "Create an account and start splitting dorm expenses." }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { intent, value } = Route.useSearch();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", household: intent === "create" ? value : "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const field = (k: keyof typeof f, label: string, type = "text", ac?: string) => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} autoComplete={ac} className="mt-1.5 h-11" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle={intent === "create" ? "Create your household and go straight to your dashboard." : "It takes less than a minute."}>
      <form className="space-y-4" noValidate onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const householdName = f.household.trim();
        if (!f.name.trim()) return setError("Please enter your full name.");
        if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Please enter a valid email address.");
        if (f.password.length < 8) return setError("Your password needs at least 8 characters.");
        if (f.password !== f.confirm) return setError("The two passwords don't match.");
        if (intent === "create" && householdName.length < 2) return setError("Please enter a household name.");

        setBusy(true);
        try {
          if (intent === "create") {
            const check = await actions.checkHouseholdName(householdName);
            if (!check.available) return setError("That household name already exists. Please enter a different name.");
          }
          const err = await actions.register(f.name, f.email, f.password, intent === "create" ? householdName : undefined);
          if (err) return setError(err);
          if (intent === "create") {
            navigate({ to: "/dashboard" });
          } else {
            navigate({ to: "/onboarding", search: { intent, value } });
          }
        } finally {
          setBusy(false);
        }
      }}>
        {intent === "create" && (
          <div>
            <Label htmlFor="household">Household name</Label>
            <Input id="household" className="mt-1.5 h-11" placeholder="Maple Dorm" value={f.household} onChange={(e) => { setF({ ...f, household: e.target.value }); setError(null); }} />
            <p className="mt-1.5 text-xs text-muted-foreground">Choose a unique name. If it is available, your household is created automatically.</p>
          </div>
        )}
        {field("name", "Full name", "text", "name")}
        {field("email", "Email", "email", "email")}
        {field("password", "Password", "password", "new-password")}
        {field("confirm", "Confirm password", "password", "new-password")}
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy ? (intent === "create" ? "Creating household…" : "Creating account…") : (intent === "create" ? "Create household & account" : "Create account")}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>
      {intent === "create" && <p className="mt-3 text-center text-sm text-muted-foreground">Want to join an existing household? <Link to="/register" search={{ intent: "join" }} className="font-semibold text-primary-strong">Join a household</Link></p>}
    </AuthShell>
  );
}
