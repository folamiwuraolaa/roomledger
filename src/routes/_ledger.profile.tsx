import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, PageHeader, Panel, useLedger } from "@/components/ledger/bits";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/_ledger/profile")({
  head: () => ({ meta: [{ title: "Profile · Roommate Ledger" }, { name: "description", content: "Your Roommate Ledger account." }, { property: "og:title", content: "Profile · Roommate Ledger" }, { property: "og:description", content: "Your Roommate Ledger account." }] }),
  component: Profile,
});

function Profile() {
  const { me, myRole, household } = useLedger();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Profile" />
      <Panel className="flex items-center gap-4">
        <Avatar name={me!.name} className="size-16 text-xl" />
        <div><p className="font-display text-xl font-bold">{me!.name}</p><p className="text-muted-foreground">{me!.email}</p><p className="text-sm capitalize">{myRole} · {household!.name}</p></div>
      </Panel>
      <Panel className="space-y-3">
        <Button variant="hero" className="w-full" onClick={async () => { await actions.logout(); navigate({ to: "/" }); }}>Log out</Button>
      </Panel>
    </div>
  );
}
