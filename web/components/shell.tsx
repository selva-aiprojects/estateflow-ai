"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Grid3x3,
  Map,
  Users,
  FileText,
  HardHat,
  Landmark,
  Home,
  Bell,
  Search,
  Sparkles,
  ChevronDown,
  Zap,
  PackageSearch,
  Scale,
  UserCog,
  Building2,
  KeyRound,
  Store,
  Handshake,
  Cpu,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui";
import { useApiData } from "@/lib/api-client";
import { TenantProvider, useTenant } from "@/lib/tenant-context";
import { UserChip } from "@/components/user-chip";
import type { Segment } from "@/lib/data";

type NavGroupId = "management" | "sales" | "construction" | "finance" | "hrms" | "customer";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  persona: string;
  segment?: Segment;
  group: NavGroupId;
}

const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: "management", label: "Management" },
  { id: "sales", label: "Sales" },
  { id: "construction", label: "Construction" },
  { id: "finance", label: "Finance" },
  { id: "hrms", label: "HRMS" },
  { id: "customer", label: "Customer" },
];

const navGroups: { id: NavGroupId; items: NavItem[] }[] = [
  {
    id: "management",
    items: [
      { href: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard, persona: "management", group: "management" },
      { href: "/setup", label: "Setup · Properties & People", icon: Settings2, persona: "management", group: "management" },
      { href: "/legal", label: "Legal & RERA", icon: Scale, persona: "management", group: "management" },
      { href: "/ai", label: "AI Command Center", icon: Cpu, persona: "management", group: "management" },
    ],
  },
  {
    id: "sales",
    items: [
      { href: "/sales", label: "Sales Engine", icon: Users, persona: "sales", group: "sales" },
      { href: "/inventory", label: "Inventory Heat Map", icon: Grid3x3, persona: "sales", segment: "apartments", group: "sales" },
      { href: "/land", label: "Land Portfolio", icon: Map, persona: "sales", segment: "land", group: "sales" },
      { href: "/leads", label: "Lead Pipeline", icon: Users, persona: "sales", group: "sales" },
      { href: "/quotes", label: "Quotations & Approvals", icon: FileText, persona: "sales", group: "sales" },
      { href: "/marketplace", label: "Marketplace", icon: Store, persona: "sales", group: "sales" },
      { href: "/partners", label: "Channel Partners", icon: Handshake, persona: "sales", group: "sales" },
    ],
  },
  {
    id: "construction",
    items: [
      { href: "/construction", label: "Construction & DPR", icon: HardHat, persona: "construction", segment: "apartments", group: "construction" },
      { href: "/procurement", label: "Procurement & Vendors", icon: PackageSearch, persona: "construction", group: "construction" },
    ],
  },
  {
    id: "finance",
    items: [
      { href: "/finance", label: "Finance & Collections", icon: Landmark, persona: "finance", group: "finance" },
      { href: "/rentals", label: "Rental Operations", icon: KeyRound, persona: "finance", group: "finance" },
    ],
  },
  {
    id: "hrms",
    items: [
      { href: "/hr", label: "HR & Contract Labour", icon: UserCog, persona: "construction", group: "hrms" },
    ],
  },
  {
    id: "customer",
    items: [
      { href: "/portal", label: "Customer Portal", icon: Home, persona: "customer", group: "customer" },
      { href: "/facility", label: "Facility & Society Ops", icon: Building2, persona: "customer", group: "customer" },
    ],
  },
];

const personas = [
  { id: "management", label: "Management", role: "VP · Sales & Ops" },
  { id: "sales", label: "Sales", role: "Sales Executive" },
  { id: "construction", label: "Construction", role: "Site Engineer" },
  { id: "finance", label: "Finance", role: "Accounts Lead" },
  { id: "customer", label: "Customer", role: "Unit / Plot Owner" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <ShellInner>{children}</ShellInner>
    </TenantProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenant, tenants, setTenantId } = useTenant();
  const [persona, setPersona] = useState("management");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications] = useApiData<{ id: string; title: string; body: string; time: string; tone: string }[]>("/api/notifications");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const allItems = navGroups.flatMap((g) => g.items);
  const visibleItems = allItems.filter((item) => item.persona === persona || persona === "management");

  const visiblePersonas = personas;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Image
            src="/logo-white.png"
            alt="EstateFlow — AI Real Estate OS"
            width={521}
            height={90}
            priority
            className="h-8 w-auto"
          />
        </div>

        <div className="px-3 pt-4">
          <label className="block">
            <span className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">Tenant</span>
            <div className="relative">
              <select
                value={tenant.id}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 pr-8 text-xs text-white outline-none transition-colors hover:bg-white/10 focus:border-white/25"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} className="text-text">
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            </div>
          </label>
        </div>

        <div className="px-3 pt-3">
          <label className="block">
            <span className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">Persona</span>
            <div className="relative">
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 pr-8 text-xs text-white outline-none transition-colors hover:bg-white/10 focus:border-white/25"
              >
                {visiblePersonas.map((p) => (
                  <option key={p.id} value={p.id} className="text-text">
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            </div>
          </label>
          <p className="mt-1.5 px-1 text-[10px] text-white/40">{visiblePersonas.find((p) => p.id === persona)?.role}</p>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          {navGroups.map((group) => {
            const groupItems = group.items.filter((item) => visibleItems.includes(item));
            if (groupItems.length === 0) return null;
            const groupLabel = NAV_GROUPS.find((g) => g.id === group.id)?.label ?? group.id;
            return (
              <div key={group.id}>
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">{groupLabel}</p>
                <ul className="space-y-1">
                  {groupItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors duration-200 cursor-pointer",
                            active ? "bg-primary text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-md bg-white/5 p-2">
            <Sparkles size={14} className="text-white/50" />
            <p className="text-[10px] leading-snug text-white/60">
              AI agents live on this tenant · <span className="font-medium text-white/90">{tenant.subdomain}</span>
            </p>
          </div>
        </div>
      </aside>

      <div className="ml-60 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-6 backdrop-blur">
          <div className="hidden max-w-md flex-1 items-center rounded-md border border-border bg-surface-muted/60 px-3 py-2 md:flex">
            <Search size={14} className="text-text-subtle" />
            <input
              placeholder="Search leads, units, land parcels…  (⌘K)"
              className="w-full bg-transparent px-2 text-sm text-text outline-none placeholder:text-text-subtle"
              aria-label="Global search"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="mr-2 hidden items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-2.5 py-1 text-[11px] font-medium text-success sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              AI Online
            </span>
            <div className="relative">
              <IconButton label="Notifications" onClick={() => setNotifOpen((v) => !v)}>
                <Bell size={17} />
                <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[9px] font-semibold text-white">
                  {notifications?.length ?? 0}
                </span>
              </IconButton>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-lift animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-text">Notifications</p>
                    <span className="text-[11px] text-text-subtle">Temporal workflows</span>
                  </div>
                  <ul>
                    {(notifications ?? []).map((n) => (
                      <li key={n.id} className="border-b border-border/60 px-4 py-3 last:border-0 hover:bg-surface-muted/50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-1 h-2 w-2 shrink-0 rounded-full",
                              n.tone === "danger" && "bg-danger",
                              n.tone === "warning" && "bg-warning",
                              n.tone === "info" && "bg-info",
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text">{n.title}</p>
                            <p className="truncate text-xs text-text-muted">{n.body}</p>
                            <p className="mt-0.5 text-[10px] text-text-subtle">{n.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <UserChip />
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>

        <footer className="border-t border-border px-6 py-4">
          <div className="flex flex-col gap-1 text-[11px] text-text-subtle sm:flex-row sm:items-center sm:justify-between">
            <span>
              EstateFlow · {tenant.name} · Data resides in AWS {tenant.region} (DPDP 2023)
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={11} /> First token &lt; 1.5s · p95 API &lt; 200ms
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
