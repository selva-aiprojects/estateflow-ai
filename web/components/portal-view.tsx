"use client";

import { useState } from "react";
import {
  Home,
  CalendarDays,
  FileText,
  Camera,
  Download,
  ShieldCheck,
  PhoneCall,
  MapPin,
  Bell,
  Building2,
  CircleParking,
  Plug,
  Waves,
  Dumbbell,
  Trees,
  Baby,
  Footprints,
  Trophy,
  BatteryCharging,
  MoveVertical,
  Flame,
  Droplets,
  Recycle,
  Headset,
} from "lucide-react";
import { inr } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Avatar, Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { useApiData } from "@/lib/api-client";
import { PageSkeleton } from "@/components/loading";
import type { Milestone, UnitAmenity, AmenityKind } from "@/lib/data";

interface PortalPayload {
  milestones: Milestone[];
  unit: { no: string; project: string; type: string; sqft: number; floor: string; price: number };
  instalments: { id: string; name: string; due: string; amount: number; paid: boolean; paidOn: string }[];
  docs: { name: string; tag: string }[];
  amenities: UnitAmenity[];
}

const amenityIcon: Record<AmenityKind, React.ElementType> = {
  parking: CircleParking,
  charging: Plug,
  clubhouse: Building2,
  pool: Waves,
  gym: Dumbbell,
  garden: Trees,
  play: Baby,
  jogging: Footprints,
  sports: Trophy,
  security: ShieldCheck,
  backup: BatteryCharging,
  lifts: MoveVertical,
  fire: Flame,
  water: Droplets,
  stp: Recycle,
  concierge: Headset,
};

export function PortalView() {
  const [portal] = useApiData<PortalPayload>("/api/portal");
  const [tab, setTab] = useState<"overview" | "payments" | "docs" | "amenities">("overview");

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Home },
    { id: "payments" as const, label: "Payments", icon: CalendarDays },
    { id: "docs" as const, label: "Documents", icon: FileText },
    { id: "amenities" as const, label: "Amenities", icon: Building2 },
  ];

  if (!portal) return <PageSkeleton />;

  const { milestones, unit, instalments, docs, amenities } = portal;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar name="Rohan Mehta" size="lg" />
          <div>
            <p className="text-sm font-semibold text-text">Welcome back, Rohan</p>
            <p className="text-xs text-text-muted">Owner · T1-03-A · Elevate Residences</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <PhoneCall size={14} /> Talk to sales
          </Button>
          <Button size="sm">
            <Bell size={14} /> Notifications
          </Button>
        </div>
      </div>

      <div className="flex gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer",
              tab === t.id ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
            )}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Your Home" subtitle={unit.no} action={<Badge tone="primary">Booked</Badge>} />
              <div className="flex aspect-[16/7] items-center justify-center rounded-lg bg-sidebar text-white/30">
                <Home size={40} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {[
                  ["Project", unit.project],
                  ["Configuration", `${unit.type} · ${unit.sqft} sq.ft`],
                  ["Location", unit.floor],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-md bg-surface-muted/60 p-3">
                    <p className="text-[11px] text-text-muted">{k}</p>
                    <p className="mt-0.5 text-sm font-medium text-text">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-[11px] text-text-muted">Total consideration</p>
                  <p className="text-lg font-semibold text-text tabular-nums">{inr(unit.price, 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-text-muted">Paid so far</p>
                  <p className="text-lg font-semibold text-success tabular-nums">{inr(200000, 0)}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader title="Project Progress" subtitle="Elevate Residences · live from site" />
                <div className="space-y-3 px-5 pb-5">
                  {milestones.slice(0, 4).map((m) => (
                    <div key={m.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">{m.name}</span>
                        <span className="font-medium text-text tabular-nums">{m.progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div className={cn("h-full rounded-full", m.status === "completed" ? "bg-success" : m.status === "on_track" ? "bg-primary" : "bg-warning")} style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Camera size={13} /> Latest site photo
                </p>
                <div className="mt-2 flex aspect-video items-center justify-center rounded-lg bg-surface-muted text-text-subtle">
                  <Home size={26} />
                </div>
                <p className="mt-2 text-[11px] text-text-subtle">Level 5 slab casting · Tower 1 · 05 Aug</p>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Next Payment Due"
              subtitle={instalments[1].name}
              action={<Button size="sm">Pay now</Button>}
            />
            <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-semibold text-text tabular-nums">{inr(instalments[1].amount, 0)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <CalendarDays size={13} /> Due 15 Sep 2026 · escrow-protected (RERA)
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-surface-muted/60 px-3 py-2 text-xs text-text-muted">
                <ShieldCheck size={15} className="text-success" />
                Deposits held in RERA-mandated escrow account
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === "payments" && (
        <Card>
          <CardHeader title="Payment Schedule" subtitle="Milestone-linked instalments per agreement" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Instalment", "Due date", "Amount", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instalments.map((i) => (
                  <tr key={i.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{i.name}</p>
                      {i.paid && <p className="text-[11px] text-text-subtle">Paid {i.paidOn}</p>}
                    </td>
                    <td className="px-4 py-3 text-text-muted tabular-nums">{i.due}</td>
                    <td className="px-4 py-3 font-medium text-text tabular-nums">{inr(i.amount, 0)}</td>
                    <td className="px-4 py-3">
                      {i.paid ? (
                        <Badge tone="success">Paid</Badge>
                      ) : i.id === "i2" ? (
                        <Badge tone="warning">Due soon</Badge>
                      ) : (
                        <Badge tone="muted">Scheduled</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {i.id === "i2" && (
                        <Button size="sm">
                          <Download size={13} /> Raise demand
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "docs" && (
        <Card>
          <CardHeader title="Documents" subtitle="Signed via eSign · copies available for download" />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
            {docs.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-text-muted">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{d.name}</p>
                    <p className="text-xs text-text-subtle">{d.tag}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  <Download size={13} /> PDF
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "amenities" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text">Amenities &amp; Services</p>
              <p className="text-xs text-text-muted">Everything included with {unit.no} · Elevate Residences</p>
            </div>
            <Badge tone="primary">{amenities.length} amenities</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {amenities.map((a) => {
              const Icon = amenityIcon[a.kind] ?? Building2;
              return (
                <Card key={a.kind} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text">{a.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{a.detail ?? "Included with your home"}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
