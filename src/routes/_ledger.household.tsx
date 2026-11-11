import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, PageHeader, Panel, useLedger } from "@/components/ledger/bits";
import { formatNaira } from "@/lib/ledger";
import { actions } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_ledger/household")({
  head: () => ({ meta: [{ title: "Household · Roommate Ledger" }, { name: "description", content: "Members, roles and balances in your household." }, { property: "og:title", content: "Household · Roommate Ledger" }, { property: "og:description", content: "Members, roles and balances in your household." }] }),
  component: Household,
});

function Household() {
  const { household, members, balances, name, me, myRole } = useLedger();
  const isAdmin = myRole === "admin";
  return (
    <div className="space-y-6">
      <PageHeader title={household!.name} subtitle={`${members.length} members`} />
      <Panel className="flex flex-wrap items-center justify-between gap-4 bg-secondary">
        <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Invite code</p><p className="num text-3xl font-bold tracking-widest">{household!.code}</p><p className="text-sm text-muted-foreground">Share this with roommates so they can join.</p></div>
        <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(household!.code); toast.success("Invite code copied."); }}><Copy /> Copy code</Button>
      </Panel>
      <Panel title="Members">
        <ul className="divide-y">
          {members.map((m) => {
            const b = balances[m.id] ?? 0;
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar name={m.name} />
                <div className="flex-1"><p className="font-semibold">{m.name}{m.id === me!.id && " (you)"}</p><p className="text-sm capitalize text-muted-foreground">{m.role}</p></div>
                <span className={cn("num font-bold", b > 0 ? "text-positive" : b < 0 ? "text-negative" : "text-muted-foreground")}>
                  {b === 0 ? "Settled" : `${formatNaira(b, { sign: true })} ${b > 0 ? "owed" : "owes"}`}
                </span>
                {isAdmin && m.id !== me!.id && (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button size="sm" variant="outline" onClick={async () => { await actions.setRole(m.id, m.role === "admin" ? "member" : "admin"); toast.success(`${m.name} is now ${m.role === "admin" ? "a member" : "an admin"}.`); }}>
                      Make {m.role === "admin" ? "member" : "admin"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (b !== 0) { toast.error(`${name(m.id)} still has an open balance. Settle it before removing them.`); return; }
                      await actions.removeMember(m.id); toast.success("Member removed.");
                    }}>Remove</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
