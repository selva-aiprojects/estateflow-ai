"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, HardHat, Gauge, Mountain, FileText, Eye, ScanEye } from "lucide-react";
import { milestones as seedMilestones, dprRows as seedDprRows } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const msStatus = {
  completed: { label: "Completed", tone: "success" as const, icon: CheckCircle2 },
  on_track: { label: "On Track", tone: "info" as const, icon: ScanEye },
  at_risk: { label: "At Risk", tone: "warning" as const, icon: AlertTriangle },
  pending: { label: "Pending", tone: "muted" as const, icon: Clock },
  delayed: { label: "Delayed", tone: "danger" as const, icon: AlertTriangle },
};

const seedTowerStats = [
  { tower: "T1", progress: 68.4, lab: 84, concrete: "42 m³", lag: "2 days ahead" },
  { tower: "T2", progress: 61.2, lab: 76, concrete: "35 m³", lag: "0 days ahead" },
];

export function ConstructionView() {
  const [construction] = useApiData("/api/construction", {
    milestones: seedMilestones,
    dprRows: seedDprRows,
    towerStats: seedTowerStats,
  });
  const { milestones, dprRows, towerStats } = construction;
  const [photos, setPhotos] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const togglePhotos = () => {
    if (photos) {
      setPhotos(false);
      return;
    }
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setPhotos(true);
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Construction & DPR"
        subtitle="Daily Progress Reports ingested from engineer mobile app · AI quality & material flags"
        action={
          <Button variant="secondary" onClick={togglePhotos} disabled={syncing}>
            {syncing ? <Spinner className="text-primary" /> : <Eye size={15} />}
            {syncing ? "Syncing photos…" : photos ? "Hide site photos" : "Show site photos"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Gauge, label: "Overall Progress", value: "63.2%", sub: "across 2 active towers", tone: "text-primary" },
          { icon: HardHat, label: "Site Labour", value: "160", sub: "T1 84 · T2 76", tone: "text-success" },
          { icon: Mountain, label: "Concrete cast (wk)", value: "217 m³", sub: "2.1% under budget", tone: "text-primary" },
          { icon: AlertTriangle, label: "AI Flags", value: "3", sub: "2 material · 1 safety", tone: "text-danger" },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-md bg-surface-muted", k.tone)}>
              <k.icon size={16} />
            </div>
            <p className="mt-3 text-lg font-semibold text-text tabular-nums">{k.value}</p>
            <p className="text-xs text-text-muted">{k.label}</p>
            <p className="mt-0.5 text-[11px] text-text-subtle">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Project Milestones" subtitle="Baseline vs. actual — variance auto-flagged against India Real Estate (RERA) timelines" />
          <div className="space-y-4 px-5 pb-5">
            {milestones.map((m) => {
              const meta = msStatus[m.status];
              return (
                <div key={m.id} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border-2", meta.tone === "success" ? "border-success bg-success text-white" : meta.tone === "muted" ? "border-border bg-surface-muted text-text-subtle" : "border-warning bg-warning-soft text-warning")}>
                      <meta.icon size={13} />
                    </div>
                    {m.id !== milestones[milestones.length - 1].id && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-text">{m.name}</p>
                        <p className="text-xs text-text-subtle tabular-nums">
                          {m.status === "completed" && m.actual ? `Completed ${m.actual}` : `Planned ${m.planned}`}
                        </p>
                      </div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300" style={{ width: `${m.progress}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-text-subtle tabular-nums">{m.progress}% complete</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-5">
          {towerStats.map((t) => (
            <Card key={t.tower} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">Tower {t.tower}</p>
                <Badge tone="info">{t.lag}</Badge>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light" style={{ width: `${t.progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-text-subtle tabular-nums">{t.progress}% structural progress</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-surface-muted/60 p-2">
                  <p className="text-text-muted">Labour</p>
                  <p className="font-medium text-text tabular-nums">{t.lab}</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-2">
                  <p className="text-text-muted">Concrete</p>
                  <p className="font-medium text-text tabular-nums">{t.concrete}</p>
                </div>
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
              <AlertTriangle size={13} /> AI Site Agent · material flag
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
              Cement stock at Tower 2 below reorder level. Purchase order auto-raised and routed for approval on the finance module.
            </p>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Daily Progress Reports"
          subtitle="Ingested at site close-out · photos + notes + labour + concrete"
          action={
            <Badge tone="success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Auto-synced
            </Badge>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-left">
                {["Date", "Tower", "Progress", "Labour", "Concrete", "Engineer Note", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dprRows.map((d, i) => (
                <tr key={i} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                  <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{d.date}</td>
                  <td className="px-4 py-3 font-medium text-text">T{d.tower}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${d.progress}%` }} />
                      </div>
                      <span className="text-xs text-text-muted tabular-nums">{d.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text tabular-nums">{d.labour}</td>
                  <td className="px-4 py-3 text-text tabular-nums">{d.concreteCum} m³</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{d.note}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-md p-1.5 text-text-subtle transition-colors hover:bg-surface-muted hover:text-primary cursor-pointer" title="View report details">
                      <FileText size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {photos && !syncing && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 animate-fade-in">
          {["Level 5 slab — east wing", "Tower 2 blockwork L3", "Concrete pour T1", "Steel fixing L5", "Site hoarding RERA"].map((c, i) => (
            <div key={i} className="group overflow-hidden rounded-lg border border-border bg-surface-muted/40">
              <div className="flex aspect-video items-center justify-center bg-sidebar text-white/40 transition-colors group-hover:bg-sidebar/90">
                <Camera size={22} />
              </div>
              <p className="px-2.5 py-2 text-[11px] text-text-muted">{c}</p>
            </div>
          ))}
        </div>
      )}

      {syncing && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border bg-surface-muted/40">
              <div className="aspect-video animate-pulse bg-surface-muted" />
              <div className="px-2.5 py-2">
                <div className="h-2 w-3/4 animate-pulse rounded bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Camera(props: { size?: number }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
