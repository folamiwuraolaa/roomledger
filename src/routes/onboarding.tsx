import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  head: () => ({ meta: [{ title: "Set up your household · Roommate Ledger" }, { name: "description", content: "Create or join a household." }, { property: "og:title", content: "Set up your household · Roommate Ledger" }, { property: "og:description", content: "Create or join a household." }] }),
  component: Onboarding,
});

function Onboarding() {
  const hydrated = useHydrated();
  const { me, ready } = useLedger();
  const navigate = useNavigate();
  const { intent, value } = Route.useSearch();
  const [tab, setTab] = useState<"create" | "join">(intent);
  const [val, setVal] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && ready && !me) {
      navigate({ to: "/register", search: { intent: tab, value: val } });
    }
  }, [hydrated, ready, me, navigate, tab, val]);

  async function submit(event: SubmitEvent | any) {
    event.preventDefault();
    setError(null);
    const cleaned = val.trim();
    if (!cleaned) return setError(tab === "create" ? "Please give your household a name." : "Please enter the invite code.");
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
    <AuthShell title="Welcome to Roommate Ledger 👋" subtitle="Let's get you into a household.">
      <div className="grid grid-cols-2 gap-2">
        {([["create", "Create a household", Home], ["join", "Join a household", KeyRound]] as const).map(([k, l, I]) => (
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
          {tab === "create" && <p className="mt-1.5 text-xs text-muted-foreground">Household names must be unique. We'll check before creating it.</p>}
          {tab === "join" && <p className="mt-1.5 text-xs text-muted-foreground">Ask your household admin for the invite code.</p>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{checking ? "Checking name…" : busy ? (tab === "create" ? "Creating household…" : "Joining household…") : (tab === "create" ? "Create household" : "Join household")}</Button>
      </form>
    </AuthShell>
  );
}
