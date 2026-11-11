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
  head: () => ({ meta: [{ title: "Set up your household · Roommate Ledger" }, { name: "description", content: "Create or join a household." }, { property: "og:title", content: "Set up your household · Roommate Ledger" }, { property: "og:description", content: "Create or join a household." }] }),
  component: Onboarding,
});

function Onboarding() {
  const hydrated = useHydrated();
  const { me, ready } = useLedger();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [val, setVal] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (hydrated && ready && !me) navigate({ to: "/login" }); }, [hydrated, me, navigate]);

  return (
    <AuthShell title={`Welcome to Roommate Ledger 👋`} subtitle="Let's get you into a household.">
      <div className="grid grid-cols-2 gap-2">
        {([["create", "Create a household", Home], ["join", "Join a household", KeyRound]] as const).map(([k, l, I]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => { setTab(k); setVal(""); setError(null); }}
            className={cn("flex flex-col items-start gap-2 rounded-2xl border p-4 text-left text-sm font-semibold", tab === k ? "border-primary-strong bg-secondary" : "")}>
            <I className="size-5" aria-hidden />{l}
          </button>
        ))}
      </div>
      <form className="mt-6 space-y-4" noValidate onSubmit={async (e) => {
        e.preventDefault();
        if (!val.trim()) return setError(tab === "create" ? "Please give your household a name." : "Please enter the invite code.");
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
        <Button type="submit" variant="hero" size="lg" className="w-full">{tab === "create" ? "Create household" : "Join household"}</Button>
      </form>
    </AuthShell>
  );
}
