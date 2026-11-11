import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Crown, Loader2, Search, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { actions, type AvailableHousehold } from "@/lib/store";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "admin" || search.mode === "member" ? search.mode : "choose",
  }),
  head: () => ({ meta: [{ title: "Create account · Roommate Ledger" }, { name: "description", content: "Create an admin or member account." }] }),
  component: Register,
});

type Mode = "choose" | "admin" | "member";

type FormState = { name: string; email: string; password: string; confirm: string; household: string };

const choices = [
  { mode: "admin" as const, icon: Crown, title: "Create Admin / Leader Account", text: "Create a new household, become its admin, and go straight to your dashboard." },
  { mode: "member" as const, icon: UserRound, title: "Create Member Account", text: "Create your account, choose an available household, and join immediately." },
];

function Register() {
  const navigate = useNavigate();
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [f, setF] = useState<FormState>({ name: "", email: "", password: "", confirm: "", household: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHouseholds, setShowHouseholds] = useState(false);
  const [households, setHouseholds] = useState<AvailableHousehold[]>([]);
  const [householdSearch, setHouseholdSearch] = useState("");
  const [loadingHouseholds, setLoadingHouseholds] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<AvailableHousehold | null>(null);

  useEffect(() => {
    if (!showHouseholds) return;
    let cancelled = false;
    setLoadingHouseholds(true);
    actions.availableHouseholds()
      .then((items) => { if (!cancelled) setHouseholds(items); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "We couldn't load the available households."); })
      .finally(() => { if (!cancelled) setLoadingHouseholds(false); });
    return () => { cancelled = true; };
  }, [showHouseholds]);

  function select(next: Mode) {
    setMode(next);
    setError(null);
    setSelectedHousehold(null);
    setShowHouseholds(false);
  }

  function validateDetails() {
    const name = f.name.trim();
    const email = f.email.trim();
    if (!name) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
    if (f.password.length < 8) return "Your password needs at least 8 characters.";
    if (f.password !== f.confirm) return "The two passwords don't match.";
    if (mode === "admin" && f.household.trim().length < 2) return "Please enter a household name.";
    return null;
  }

  async function submitAdmin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validation = validateDetails();
    if (validation) return setError(validation);
    setBusy(true);
    try {
      const err = await actions.registerAdmin(f.name.trim(), f.email.trim(), f.password, f.household.trim());
      if (err) return setError(err);
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  }

  async function continueMember(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validation = validateDetails();
    if (validation) return setError(validation);
    setShowHouseholds(true);
  }

  async function joinSelected() {
    if (!selectedHousehold) return setError("Please select a household first.");
    setError(null);
    setBusy(true);
    try {
      const err = await actions.registerMember(f.name.trim(), f.email.trim(), f.password, selectedHousehold.id);
      if (err) return setError(err);
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  }

  if (mode === "choose") {
    return (
      <AuthShell title="Create your Roommate Ledger account" subtitle="Choose how you want to use Roommate Ledger.">
        <div className="grid gap-4 sm:grid-cols-2">
          {choices.map(({ mode: m, icon: Icon, title, text }) => (
            <button key={m} type="button" onClick={() => select(m)} className="group flex min-h-56 flex-col rounded-3xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary-strong"><Icon className="size-6" /></span>
              <span className="mt-5 block font-display text-lg font-bold">{title}</span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">{text}</span>
              <span className="mt-auto pt-5 text-sm font-semibold text-primary-strong">Continue →</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>
        <p className="mt-3 text-center text-xs text-muted-foreground">Super Admin accounts use the separate Super Admin setup/login.</p>
      </AuthShell>
    );
  }

  const selected = choices.find((c) => c.mode === mode)!;
  const Icon = selected.icon;
  const filtered = households.filter((h) => h.name.toLowerCase().includes(householdSearch.trim().toLowerCase()));

  return (
    <AuthShell title={selected.title} subtitle={mode === "admin" ? "Create your household and go straight to your dashboard." : "Enter your details first. Then choose the household you want to join."}>
      <button type="button" onClick={() => select("choose")} className="mb-5 text-sm font-semibold text-muted-foreground hover:text-foreground">← Back to account options</button>
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-secondary p-4"><span className="grid size-10 place-items-center rounded-xl bg-card text-primary-strong"><Icon className="size-5" /></span><div><p className="font-semibold">{selected.title}</p><p className="text-xs text-muted-foreground">{mode === "admin" ? "You will be the household admin." : "You will join as a household member."}</p></div></div>

      <form className="space-y-4" noValidate onSubmit={mode === "admin" ? submitAdmin : continueMember}>
        {mode === "admin" && (
          <div><Label htmlFor="household">Household name</Label><Input id="household" placeholder="Maple Dorm" className="mt-1.5 h-11" value={f.household} onChange={(e) => setF({ ...f, household: e.target.value })} /></div>
        )}
        <Field id="name" label="Full name" value={f.name} autoComplete="name" onChange={(v) => setF({ ...f, name: v })} />
        <Field id="email" label="Email" type="email" value={f.email} autoComplete="email" onChange={(v) => setF({ ...f, email: v })} />
        <Field id="password" label="Password" type="password" value={f.password} autoComplete="new-password" onChange={(v) => setF({ ...f, password: v })} />
        <Field id="confirm" label="Confirm password" type="password" value={f.confirm} autoComplete="new-password" onChange={(v) => setF({ ...f, confirm: v })} />
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{busy ? "Creating account…" : mode === "admin" ? "Create Admin & Household" : "Continue to Household Selection"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>

      {showHouseholds && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="household-title">
          <div className="w-full max-w-lg rounded-[2rem] border bg-card p-5 shadow-lift sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="household-title" className="text-xl font-bold">Choose your household</h2><p className="mt-1 text-sm text-muted-foreground">Select the household you want to join.</p></div>
              <button type="button" onClick={() => { setShowHouseholds(false); setSelectedHousehold(null); }} className="rounded-xl p-2 hover:bg-muted" aria-label="Close"><X className="size-5" /></button>
            </div>
            <div className="relative mt-5"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={householdSearch} onChange={(e) => setHouseholdSearch(e.target.value)} placeholder="Search households" className="h-11 pl-9" /></div>
            {loadingHouseholds ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading households…</div>
            ) : filtered.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed p-6 text-center"><p className="font-semibold">No households found</p><p className="mt-1 text-sm text-muted-foreground">Ask an admin to create a household before you register as a member.</p></div>
            ) : (
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {filtered.map((h) => {
                  const isSelected = selectedHousehold?.id === h.id;
                  return <button key={h.id} type="button" onClick={() => setSelectedHousehold(h)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${isSelected ? "border-primary bg-secondary" : "hover:bg-muted"}`}><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary font-bold text-primary-strong">{h.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{h.name}</span><span className="text-sm text-muted-foreground">{h.memberCount} {h.memberCount === 1 ? "member" : "members"}</span></span>{isSelected && <Check className="size-5 text-primary-strong" />}</button>;
                })}
              </div>
            )}
            {error && <p role="alert" className="mt-4 rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
            <Button type="button" variant="hero" size="lg" className="mt-5 w-full" disabled={!selectedHousehold || busy} onClick={joinSelected}>{busy ? "Creating account & joining…" : selectedHousehold ? `Join ${selectedHousehold.name}` : "Select a household"}</Button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}

function Field({ id, label, value, onChange, type = "text", autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} type={type} autoComplete={autoComplete} className="mt-1.5 h-11" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
