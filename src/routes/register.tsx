import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Crown, KeyRound, UserRound, ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "admin" || search.mode === "member" || search.mode === "join" ? search.mode : "choose",
    value: typeof search.value === "string" ? search.value : "",
  }),
  head: () => ({ meta: [{ title: "Create account · Roommate Ledger" }, { name: "description", content: "Choose how you want to join Roommate Ledger." }] }),
  component: Register,
});

type Mode = "choose" | "admin" | "member" | "join";

const choices = [
  { mode: "admin" as const, icon: Crown, title: "Create Admin / Leader Account", text: "Create a household, become its admin, and start using your dashboard immediately." },
  { mode: "member" as const, icon: UserRound, title: "Create Member Account", text: "Create your personal account, then use the household invitation code from your admin." },
  { mode: "join" as const, icon: KeyRound, title: "Join with Household Code", text: "Already have the code sent by your household admin? Use it to join directly." },
];

function Register() {
  const navigate = useNavigate();
  const { mode: initialMode, value } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", household: value, code: value });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function select(next: Mode) {
    setMode(next);
    setError(null);
  }

  const field = (k: keyof typeof f, label: string, type = "text", ac?: string, placeholder?: string) => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} autoComplete={ac} placeholder={placeholder} className="mt-1.5 h-11" value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setError(null); }} />
    </div>
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "choose") return setError("Please choose an account option first.");

    const name = f.name.trim();
    const email = f.email.trim();
    if (!name) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (f.password.length < 8) return setError("Your password needs at least 8 characters.");
    if (f.password !== f.confirm) return setError("The two passwords don't match.");
    if (mode === "admin" && f.household.trim().length < 2) return setError("Please enter a household name.");
    if ((mode === "join" || mode === "member") && f.code.trim().length < 4) return setError("Please enter the household code sent by your admin.");

    setBusy(true);
    try {
      if (mode === "admin") {
        const check = await actions.checkHouseholdName(f.household.trim());
        if (!check.available) return setError("That household name already exists. Please enter a different name.");
        const err = await actions.register(name, email, f.password, f.household.trim());
        if (err) return setError(err);
        navigate({ to: "/dashboard" });
        return;
      }

      if (mode === "join" || mode === "member") {
        const err = await actions.register(name, email, f.password, undefined, f.code.trim());
        if (err) return setError(err);
        navigate({ to: "/dashboard" });
        return;
      }

      const err = await actions.register(name, email, f.password);
      if (err) return setError(err);
      navigate({ to: "/onboarding", search: { intent: "join", value: "" } });
    } finally {
      setBusy(false);
    }
  }

  if (mode === "choose") {
    return (
      <AuthShell title="Create your Roommate Ledger account" subtitle="Choose the option that matches what you want to do.">
        <div className="space-y-3">
          {choices.map(({ mode: m, icon: Icon, title, text }) => (
            <button key={m} type="button" onClick={() => select(m)} className="group flex w-full items-start gap-4 rounded-3xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary-strong"><Icon className="size-6" /></span>
              <span className="min-w-0"><span className="block font-display text-base font-bold">{title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{text}</span><span className="mt-3 inline-flex text-sm font-semibold text-primary-strong">Continue →</span></span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>
        <p className="mt-3 text-center text-xs text-muted-foreground">Super Admin? Use the dedicated Super Admin login/setup page.</p>
      </AuthShell>
    );
  }

  const selected = choices.find((c) => c.mode === mode)!;
  const Icon = selected.icon;

  return (
    <AuthShell title={selected.title} subtitle={mode === "admin" ? "Create your household and go straight to your dashboard." : "Create your account and join your household with the code sent by your admin."}>
      <button type="button" onClick={() => select("choose")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to account options</button>
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-secondary p-4"><span className="grid size-10 place-items-center rounded-xl bg-card text-primary-strong"><Icon className="size-5" /></span><div><p className="font-semibold">{selected.title}</p><p className="text-xs text-muted-foreground">{mode === "admin" ? "You will be the household admin." : "You will have a member account."}</p></div></div>

      <form className="space-y-4" noValidate onSubmit={submit}>
        {mode === "admin" && <div>{field("household", "Household name", "text", undefined, "Maple Dorm")}</div>}
        {(mode === "member" || mode === "join") && <div>{field("code", "Household invitation code", "text", undefined, "RL-7K4P9X")}</div>}
        {field("name", "Full name", "text", "name")}
        {field("email", "Email", "email", "email")}
        {field("password", "Password", "password", "new-password")}
        {field("confirm", "Confirm password", "password", "new-password")}

        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy ? "Creating account…" : mode === "admin" ? "Create Admin & Household" : "Create Account & Join Household"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>
    </AuthShell>
  );
}
