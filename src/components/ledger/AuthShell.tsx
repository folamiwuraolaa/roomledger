import type { ReactNode } from "react";
import { Logo } from "./bits";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="bg-hero grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
