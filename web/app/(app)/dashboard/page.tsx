import {
  TrendingUp,
  TrendingDown,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  CircleDollarSign,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, PageHeader, StatusPill } from "@/components/ui";
import { CashFlowChart, BarChart, Donut } from "@/components/charts";
import { AiQueryBar } from "@/components/ai-query";
import { AssistantPanel } from "@/components/assistant-panel";
import { executiveKpis, cashFlowData, salesVelocity, notifications } from "@/lib/data";
import { unitStatusMeta, projects } from "@/lib/data";

function countByStatus() {
  const counts: Record<string, number> = {};
  projects.forEach((p) =>
    p.towers.forEach((t) =>
      t.units.forEach((u) => {
        counts[u.status] = (counts[u.status] ?? 0) + 1;
      }),
    ),
  );
  return [
    { label: unitStatusMeta.available.label, value: counts.available ?? 0, color: unitStatusMeta.available.color },
    { label: unitStatusMeta.blocked.label, value: counts.blocked ?? 0, color: unitStatusMeta.blocked.color },
    { label: unitStatusMeta.token_paid.label, value: counts.token_paid ?? 0, color: unitStatusMeta.token_paid.color },
    { label: unitStatusMeta.sold.label, value: counts.sold ?? 0, color: unitStatusMeta.sold.color },
  ];
}

export default function DashboardPage() {
  const kpiCards = executiveKpis.map((k) => ({
    ...k,
    positive: k.delta >= 0,
    icon: k.id === "k2" ? CircleDollarSign : k.id === "k4" ? AlertTriangle : TrendingUp,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Elevate Residences · Opus Business Park — live as of 05 Aug 2026, 09:30 IST"
        action={
          <Badge tone="success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Data in sync
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-text tabular-nums">{k.value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Icon size={17} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <span className={`inline-flex items-center gap-0.5 font-medium ${k.positive ? "text-success" : "text-danger"}`}>
                  {k.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(k.delta)}%
                </span>
                <span className="text-text-subtle">{k.hint}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Cash Flow Forecast"
            subtitle="AI Finance Agent · Time-series projection (₹ Cr)"
            action={
              <Button variant="ghost" size="sm">
                <FileCheck2 size={14} /> Report
              </Button>
            }
          />
          <div className="px-5 pb-5">
            <CashFlowChart data={cashFlowData} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Inventory Mix" subtitle="Live across all projects" />
          <div className="px-5 pb-5">
            <Donut segments={countByStatus()} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Natural Language Intelligence"
          subtitle="Text-to-SQL · schema security layer · tenant-scoped read-only"
          icon={<Sparkles size={15} className="text-primary" />}
        />
        <div className="px-5 pb-5">
          <AiQueryBar />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Sales Velocity" subtitle="Units sold per month" />
          <div className="px-5 pb-5">
            <BarChart data={salesVelocity} />
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-muted">
            <span>Projected unsold 3BHK next quarter</span>
            <span className="inline-flex items-center gap-1 font-medium text-success">
              ≈ 0 · on track to clear <ArrowUpRight size={12} />
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Approval Queues" subtitle="Temporal workflow routing" />
          <ul className="px-3 pb-3">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-muted/60">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    n.tone === "warning" ? "bg-warning-soft text-warning" : n.tone === "danger" ? "bg-danger-soft text-danger" : "bg-info-soft text-info"
                  }`}
                >
                  {n.tone === "danger" ? <AlertTriangle size={15} /> : <FileCheck2 size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text">{n.title}</p>
                  <p className="truncate text-xs text-text-muted">{n.body}</p>
                </div>
                <span className="shrink-0 text-[10px] text-text-subtle">{n.time}</span>
              </li>
            ))}
          </ul>
          <div className="px-5 pb-4">
            <Button variant="secondary" size="sm" className="w-full">
              Open approval queue
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Project Health" subtitle="Master schedule vs actual" />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
            {[
              { name: "Elevate Residences · T1", progress: 68, tone: "primary" as const, note: "2 days ahead · DPR synced" },
              { name: "Elevate Residences · T2", progress: 61, tone: "warning" as const, note: "Cement stock alert active" },
              { name: "Opus Business Park", progress: 44, tone: "primary" as const, note: "Facade works started" },
            ].map((p) => (
              <div key={p.name} className="rounded-lg border border-border bg-surface-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-text">{p.name}</p>
                  <span className="text-xs font-semibold text-text tabular-nums">{p.progress}%</span>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className={`h-full rounded-full ${p.tone === "primary" ? "bg-primary" : "bg-warning"}`} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-text-subtle">{p.note}</p>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-success-soft/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-text">RERA Quarterly Disclosure</p>
                <Badge tone="success">Submitted</Badge>
              </div>
              <p className="mt-2 text-[11px] text-text-muted">Q2 2026 · progress 61.2% · acknowledged by authority</p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="AI Sales Agent Live" subtitle="Sandbox · LangGraph + WhatsApp" />
          <div className="flex-1 min-h-[340px]">
            <AssistantPanel />
          </div>
        </Card>
      </div>
    </div>
  );
}
