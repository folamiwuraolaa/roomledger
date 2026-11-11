import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    intent: search.intent === "join" ? "join" : "create",
    value: typeof search.value === "string" ? search.value : "",
  }),
  head: () => ({ meta: [{ title: "Create account · Roommate Ledger" }, { name: "description", content: "Create an account and start splitting dorm expenses." }, { property: "og:title", content: "Create account · Roommate Ledger" }, { property: "og:description", content: "Start splitting dorm expenses." }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { intent, value } = Route.useSearch();
  const [accountType, setAccountType] = useState<"admin" | "member">(intent === "join" ? "member" : "admin");
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const field = (k: keyof typeof f, label: string, type = "text", ac?: string) => (
    <div><Label htmlFor={k}>{label}</Label><Input id={k} type={type} autoComplete={ac} className="mt-1.5 h-11" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
  );
  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute.">
      <form className="space-y-4" noValidate onSubmit={async (e) => {
        e.preventDefault();
        if (!f.name.trim()) return setError("Please enter your full name.");
        if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Please enter a valid email address.");
        if (f.password.length < 8) return setError("Your password needs at least 8 characters.");
        if (f.password !== f.confirm) return setError("The two passwords don't match.");
        const err = await actions.register(f.name, f.email, f.password);
        if (err) return setError(err);
        navigate({
          to: "/onboarding",
          search: {
            intent: accountType === "admin" ? "create" : "join",
            value: accountType === (intent === "create" ? "admin" : "member") ? value : "",
          },
        });
      }}>
        {field("name", "Full name", "text", "name")}
        {field("email", "Email", "email", "email")}
        {field("password", "Password", "password", "new-password")}
        {field("confirm", "Confirm password", "password", "new-password")}

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">How will you use Roommate Ledger?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setAccountType("admin")} aria-pressed={accountType === "admin"}
              className={cn("rounded-2xl border p-4 text-left transition-colors", accountType === "admin" && "border-primary-strong bg-secondary")}>
              <Home className="size-5" aria-hidden />
              <span className="mt-2 block font-semibold">Create a household</span>
              <span className="mt-1 block text-xs text-muted-foreground">Set up the household and manage its members.</span>
            </button>
            <button type="button" onClick={() => setAccountType("member")} aria-pressed={accountType === "member"}
              className={cn("rounded-2xl border p-4 text-left transition-colors", accountType === "member" && "border-primary-strong bg-secondary")}>
              <Users className="size-5" aria-hidden />
              <span className="mt-2 block font-semibold">Join a household</span>
              <span className="mt-1 block text-xs text-muted-foreground">Use an invite code from your household admin.</span>
            </button>
          </div>
        </fieldset>
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>
    </AuthShell>
  );
}
