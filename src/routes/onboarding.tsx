import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/ledger/AuthShell";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Household setup · Roommate Ledger" }] }),
  component: OnboardingRedirect,
});

function OnboardingRedirect() {
  return (
    <AuthShell title="Household setup has moved" subtitle="New members now choose their household during account creation. No code is required.">
      <div className="rounded-2xl border bg-muted/50 p-5 text-sm text-muted-foreground">
        To join a household, create a member account and select an available household from the household picker.
      </div>
      <Button variant="hero" size="lg" className="mt-5 w-full" asChild><Link to="/register" search={{ mode: "member" }}>Create Member Account</Link></Button>
    </AuthShell>
  );
}
