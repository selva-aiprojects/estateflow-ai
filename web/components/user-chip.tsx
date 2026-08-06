"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, Button, Badge } from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth-types";

export function UserChip() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<AuthUser | null>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const signOut = async () => {
    await apiSend("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  if (user === undefined) return <div className="h-9 w-9 animate-pulse rounded-full bg-surface-muted" aria-hidden />;

  if (!user) {
    return (
      <Link href="/login" className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-muted">
        <UserRound size={15} />
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Account menu"
      >
        <Avatar name={user.displayName} size="sm" />
        <div className="hidden text-left sm:block">
          <p className="text-xs font-medium text-text leading-tight">{user.displayName}</p>
          <p className="text-[10px] text-text-subtle leading-tight">{user.isSuperadmin ? "Nexus Admin" : "Workspace Admin"}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-72 overflow-hidden rounded-lg border border-border bg-surface shadow-lift animate-fade-in">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={user.displayName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{user.displayName}</p>
                <p className="truncate text-xs text-text-muted">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {user.isSuperadmin ? (
                <Badge tone="primary">
                  <ShieldCheck size={12} /> Nexus Admin
                </Badge>
              ) : (
                <Badge tone="info">Workspace user</Badge>
              )}
              {user.memberships.slice(0, 2).map((m) => (
                <Badge key={m.tenantCode} tone="muted">
                  {m.tenantName}
                </Badge>
              ))}
            </div>
          </div>
          <div className="p-1.5">
            {user.isSuperadmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text transition-colors hover:bg-surface-muted"
              >
                <Settings2 size={15} className="text-text-subtle" />
                Tenant management
              </Link>
            )}
            <button
              onClick={signOut}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
