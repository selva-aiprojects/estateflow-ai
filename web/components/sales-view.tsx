"use client";

import { useMemo, useState } from "react";
import { Filter, Target, Trophy, Timer, Sparkles, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
import { leadSourceMeta, leadStageMeta, type SalesLead, type SalesLeadStage } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr, inrCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";
import { BarChart, Donut } from "@/components/charts";

const toneHsl: Record<string, string> = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))",
  info: "hsl(var(--info))",
  muted: "hsl(var(--text-subtle))",
};

const funnelStages: SalesLeadStage[] = ["new", "qualified", "visit_scheduled", "offer", "booked", "won"];

export function SalesView() {
  const [leads] = useApiData<SalesLead[]>("/api/sales-leads");
  const [ranking, setRanking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const all = leads ?? [];

  const funnel = useMemo(
    () =>
      funnelStages.map((stage) => {
        const inStage = all.filter((l) => l.stage === stage);
        return { stage, count: inStage.length, value: inStage.reduce((s, l) => s + l.budget, 0) };
      }),
    [all],
  );

  const sourceMix = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((l) => counts.set(l.source, (counts.get(l.source) ?? 0) + 1));
    return [...counts.entries()].map(([source, count]) => ({
      label: leadSourceMeta[source as keyof typeof leadSourceMeta].label,
      value: count,
      color: toneHsl[leadSourceMeta[source as keyof typeof leadSourceMeta].tone],
    }));
  }, [all]);

  if (!leads) return <PageSkeleton />;

  const active = leads.filter((l) => l.stage !== "lost");
  const pipelineValue = active.reduce((s, l) => s + l.budget, 0);
  const wonValue = leads.filter((l) => l.stage === "won").reduce((s, l) => s + l.budget, 0);
  const winRate = leads.length ? (leads.filter((l) => l.stage === "won").length / leads.filter((l) => l.stage === "won" || l.stage === "lost").length) * 100 : 0;

  const reRank = () => {
    setRanking(true);
    setTimeout(() => {
      setRanking(false);
      setToast("Queue re-ranked by AI: 11 leads rescored from 34 new IVR intents · Rohan Mehta +4 positions (92%).");
      setTimeout(() => setToast(null), 5600);
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Sales Engine"
        subtitle="AI-scored pipeline · source attribution · funnel health"
        action={
          <Button onClick={reRank} disabled={ranking}>
            {ranking ? <Spinner /> : <Sparkles size={15} />}
            {ranking ? "Re-ranking…" : "AI re-rank queue"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Target size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(pipelineValue)}</p>
          <p className="text-xs text-text-muted">Active pipeline</p>
          <p className="mt-0.5 text-[11px] text-success">↑ ₹2.1 Cr this week</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Trophy size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(wonValue)}</p>
          <p className="text-xs text-text-muted">Won YTD</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">42 units booked</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
            <TrendingUp size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{winRate.toFixed(0)}%</p>
          <p className="text-xs text-text-muted">Win rate</p>
          <p className="mt-0.5 text-[11px] text-success">↑ 3.1 pts vs Q2</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <Timer size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">1m 42s</p>
          <p className="text-xs text-text-muted">Avg. response time</p>
          <p className="mt-0.5 text-[11px] text-success">AI Sales Agent assisted</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Pipeline Funnel" subtitle="Count, value & conversion between stages" />
          <div className="space-y-3 px-5 pb-5">
            {funnel.map((f, i) => {
              const prev = i === 0 ? null : funnel[i - 1];
              const conversion = prev && prev.count > 0 ? (f.count / prev.count) * 100 : null;
              const pct = funnel[0].count ? (f.count / funnel[0].count) * 100 : 0;
              return (
                <div key={f.stage}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-text">
                      {leadStageMeta[f.stage].label}
                      <span className="text-xs text-text-subtle tabular-nums">{f.count} · {inrCompact(f.value)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-text-muted tabular-nums">
                      {conversion !== null && (
                        <span className="inline-flex items-center gap-0.5 text-text-subtle">
                          {conversion.toFixed(0)}% <ArrowRight size={11} />
                        </span>
                      )}
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", i === 0 ? "bg-primary" : "bg-primary/70")}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-[11px] text-text-subtle">
              Lost leads excluded · 4.8% avg. lead-to-booking across 90 days
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Source Mix" subtitle="Inbound attribution by channel" />
          <div className="px-5 pb-5">
            <Donut segments={sourceMix} size={150} thickness={20} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader title="Lead Queue" subtitle="AI-scored · auto-assigned to executive" action={<Badge tone="primary"><Filter size={11} /> {leads.length} leads</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Lead", "Source", "AI Score", "Stage", "Budget", "Owner"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{l.name}</p>
                      <p className="text-[11px] text-text-subtle">{l.project} · {l.unitType}</p>
                    </td>
                    <td className="px-4 py-3"><Badge tone={leadSourceMeta[l.source].tone}>{leadSourceMeta[l.source].label}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium tabular-nums", l.score >= 80 ? "text-success" : l.score >= 65 ? "text-primary" : "text-text-muted")}>{l.score}</span>
                    </td>
                    <td className="px-4 py-3"><Badge tone={leadStageMeta[l.stage].tone}>{leadStageMeta[l.stage].label}</Badge></td>
                    <td className="px-4 py-3 text-text tabular-nums">{inrCompact(l.budget)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{l.assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Booking Velocity" subtitle="Units booked per month" />
          <div className="px-5 pb-5">
            <BarChart data={[
              { month: "Mar", units: 22 },
              { month: "Apr", units: 27 },
              { month: "May", units: 24 },
              { month: "Jun", units: 31 },
              { month: "Jul", units: 35 },
              { month: "Aug", units: 41 },
            ]} />
          </div>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 animate-fade-in">
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-sidebar px-4 py-3 text-sm text-white shadow-lift">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" />
            <span className="text-white/90">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
