import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Home, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/ledger/AuthShell";
import { useLedger } from "@/components/ledger/bits";
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
  const { me } = useLedger();
  const navigate = useNavigate();
  const { intent, value } = Route.useSearch();
  const [tab, setTab] = useState<"create" | "join">(intent);

  const [val, setVal] = useState(value);
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthShell title={`Welcome to Roommate Ledger 👋`} subtitle={me ? "Let's get you into a household." : "Create your account first, then we'll set up your household."}>
      <div className="grid grid-cols-2 gap-2">
        {([["create", "Create a household", Home], ["join", "Join a household", KeyRound]] as const).map(([k, l, I]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => { setTab(k); setVal(""); setError(null); }}
            className={cn("flex flex-col items-start gap-2 rounded-2xl border p-4 text-left text-sm font-semibold", tab === k ? "border-primary-strong bg-secondary" : "")}>
            <I className="size-5" aria-hidden />{l}
          </button>
        ))}
      </div>
      {!me && <div className="mb-5 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">No account yet?</p>
        <p className="mt-1">Enter your household name or invite code, then continue to create your account.</p>
      </div>}
      <form className="mt-6 space-y-4" noValidate onSubmit={async (e) => {
        e.preventDefault();
        if (!val.trim()) return setError(tab === "create" ? "Please give your household a name." : "Please enter the invite code.");
        if (!me) {
          navigate({ to: "/register", search: { intent: tab, value: val.trim() } });
          return;
        }
        if (tab === "create") { const err = await actions.createHousehold(val); if (err) return setError(err); toast.success("Household created."); }
        else { const err = await actions.joinHousehold(val); if (err) return setError(err); toast.success("You joined the household."); }
        navigate({ to: "/dashboard" });
      }}>
        <div>
          <Label htmlFor="v">{tab === "create" ? "Household name" : "Household invite code"}</Label>
          <Input id="v" className="mt-1.5 h-11" placeholder={tab === "create" ? "Maple Dorm" : "MAPLE1"} value={val} onChange={(e) => setVal(e.target.value)} />
          {tab === "join" && <p className="mt-1.5 text-xs text-muted-foreground">Ask your household admin for the invite code.</p>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-negative-soft p-3 text-sm font-medium text-negative">{error}</p>}
        <Button type="submit" variant="hero" size="lg" className="w-full">{me ? (tab === "create" ? "Create household" : "Join household") : "Continue to account setup"}</Button>
      </form>
      {!me && <p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <button type="button" onClick={() => navigate({ to: "/login" })} className="font-semibold text-primary-strong">Log in</button></p>}
    </AuthShell>
  );
}
