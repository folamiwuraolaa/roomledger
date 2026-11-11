import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Home, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { useHydrated, useLedger } from "@/components/ledger/bits";
import { actions } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>) => ({
    intent: search.intent === "join" ? "join" : "create",
    value: typeof search.value === "string" ? search.value : "",
  }),
  head: () => ({ meta: [{ title: "Set up your household · Roommate Ledger" }, { name: "description", content: "Create or join a household." }] }),
  component: Onboarding,
});

function Onboarding() {
  const hydrated = useHydrated();
  const { me, ready } = useLedger();
  const navigate = useNavigate();
  const { intent, value } = Route.useSearch();
  const [tab, setTab] = useState<"create" | "join">(intent);
  const [val, setVal] = useState(value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);

  // A logged-out visitor can create a household directly from this screen.
  // Do NOT redirect them to login. Registration creates the account, household,
  // admin membership and authenticated session in one backend transaction.
  useEffect(() => {
    if (hydrated && ready && me && tab === "create") {
      // Existing members can use the normal authenticated household endpoint.
    }
  }, [hydrated, ready, me, tab]);

  async function submit(event: SubmitEvent | any) {
    event.preventDefault();
    setError(null);
    const cleaned = val.trim();
    if (!cleaned) return setError(tab === "create" ? "Please give your household a name." : "Please enter the invite code.");

    if (tab === "create" && !me) {
      if (name.trim().length < 2) return setError("Please enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please enter a valid email address.");
      if (password.length < 8) return setError("Your password needs at least 8 characters.");
      if (password !== confirm) return setError("The two passwords don't match.");

      setBusy(true);
      try {
        setChecking(true);
        const check = await actions.checkHouseholdName(cleaned);
        setChecking(false);
        if (!check.available) return setError("That household name already exists. Please enter a different name.");

        const err = await actions.register(name.trim(), email.trim(), password, cleaned);
        if (err) return setError(err);
        toast.success("Household created. Welcome to your dashboard!");
        navigate({ to: "/dashboard" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to create the household.");
      } finally {
        setChecking(false);
        setBusy(false);
      }
      return;
    }

    if (!me) {
      navigate({ to: "/register", search: { intent: tab, value: cleaned } });
      return;
    }

    setBusy(true);
    try {
      if (tab === "create") {
        setChecking(true);
        const check = await actions.checkHouseholdName(cleaned);
        setChecking(false);
        if (!check.available) return setError("That household name already exists. Please enter a different name.");
        const err = await actions.createHousehold(cleaned);
        if (err) return setError(err);
        toast.success("Household created. Welcome to your dashboard!");
      } else {
        const err = await actions.joinHousehold(cleaned);
        if (err) return setError(err);
        toast.success("You joined the household.");
      }
      navigate({ to: "/dashboard" });
    } finally {
      setChecking(false);
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome to Roommate Ledger 👋" subtitle={tab === "create" ? "Create your household and go straight to your dashboard." : "Let's get you into your household."}>
      <div className="grid grid-cols-2 gap-2">
        {([['create', 'Create a household', Home], ['join', 'Join a household', KeyRound]] as const).map(([k, l, I]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => { setTab(k); setVal(""); setError(null); }}
            className={cn("flex flex-col items-start gap-2 rounded-2xl border p-4 text-left text-sm font-semibold", tab === k ? "border-primary-strong bg-secondary" : "")}>
            <I className="size-5" aria-hidden />{l}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" noValidate onSubmit={submit}>
        <div>
          <Label htmlFor="v">{tab === "create" ? "Household name" : "Household invite code"}</Label>
          <Input id="v" className="mt-1.5 h-11" placeholder={tab === "create" ? "Maple Dorm" : "MAPLE1"} value={val} onChange={(e) => { setVal(e.target.value); setError(null); }} />
          <p className="mt-1.5 text-xs text-muted-foreground">{tab === "create" ? "We check the name first. If it is available, your account and household are created together." : "Ask your household admin for the invite code."}</p>
        </div>

        {tab === "create" && !me && (
          <>
            <div><Label htmlFor="onboard-name">Full name</Label><Input id="onboard-name" autoComplete="name" className="mt-1.5 h-11" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label htmlFor="onboard-email">Email</Label><Input id="onboard-email" type="email" autoComplete="email" className="mt-1.5 h-11" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="onboard-password">Password</Label><Input id="onboard-password" type="password" autoComplete="new-password" className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div><Label htmlFor="onboard-confirm">Confirm password</Label><Input id="onboard-confirm" type="password" autoComplete="new-password" className="mt-1.5 h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          </>
        )}

        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
          {checking ? "Checking name…" : busy ? (tab === "create" ? "Creating household…" : "Joining household…") : (tab === "create" ? "Create household & account" : "Join household")}
        </Button>
      </form>

      {!me && <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary-strong">Log in</Link></p>}
    </AuthShell>
  );
}
