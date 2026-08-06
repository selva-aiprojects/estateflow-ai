"use client";

import {
  TrendingUp,
  TrendingDown,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  CircleDollarSign,
  Map,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { CashFlowChart, BarChart, Donut } from "@/components/charts";
import { AiQueryBar } from "@/components/ai-query";
import { AssistantPanel } from "@/components/assistant-panel";
import { useApiData } from "@/lib/api-client";
import { useTenant } from "@/lib/tenant-context";
import {
  unitStatusMeta,
  landStatusMeta,
  computeLandSummary,
  type Kpi,
} from "@/lib/data";
import { formatAcres, inrCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";

interface DashboardPayload {
  kpis: Kpi[];
  landKpis: Kpi[];
  cashFlow: { month: string; inflow: number; outflow: number }[];
  salesVelocity: { month: string; units: number }[];
  notifications: { id: string; title: string; body: string; time: string; tone: string }[];
  unitMix: { label: string; value: number; color: string }[];
  landMix: { label: string; value: number; color: string }[];
  landSummary: ReturnType<typeof computeLandSummary>;
}

export function DashboardView() {
  const { tenant, plan, has } = useTenant();
  const [dashboard] = useApiData<DashboardPayload>("/api/dashboard");

  if (!dashboard) return <PageSkeleton />;

  const showHomes = has("apartments");
  const showLand = has("land");

  const kpiCard = (k: Kpi, Icon: React.ElementType) => (
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
        <span className={`inline-flex items-center gap-0.5 font-medium ${k.delta >= 0 ? "text-success" : "text-danger"}`}>
          {k.delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(k.delta)}%
        </span>
        <span className="text-text-subtle">{k.hint}</span>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Executive Dashboard"
        subtitle={`${tenant.name} · ${plan.name} plan — live as of 05 Aug 2026, 09:30 IST`}
        action={
          <Badge tone="success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Data in sync
          </Badge>
        }
      />

      {showHomes && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">Homes &amp; Towers</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.kpis.map((k) =>
              kpiCard(k, k.id === "k2" ? CircleDollarSign : k.id === "k4" ? AlertTriangle : TrendingUp),
            )}
          </div>
        </>
      )}

      {showLand && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">Land Portfolio</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.landKpis.map((k) =>
              kpiCard(k, k.id === "lk3" ? ShieldCheck : k.id === "lk4" ? Landmark : Map),
            )}
          </div>
        </>
      )}

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
            <CashFlowChart data={dashboard.cashFlow} />
          </div>
        </Card>

        {showHomes && showLand ? (
          <Card>
            <CardHeader title="Unit Inventory Mix" subtitle="Live across towers" />
            <div className="px-5 pb-5">
              <Donut segments={dashboard.unitMix} />
            </div>
          </Card>
        ) : showHomes ? (
          <Card>
            <CardHeader title="Unit Inventory Mix" subtitle="Live across towers" />
            <div className="px-5 pb-5">
              <Donut segments={dashboard.unitMix} />
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader title="Land Portfolio Mix" subtitle="Parcel status across districts" />
            <div className="px-5 pb-5">
              <Donut segments={dashboard.landMix} />
            </div>
          </Card>
        )}
      </div>

      {showLand && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title="Land under management"
              subtitle={`${tenant.name} · multi-district land bank`}
            />
            <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                <p className="text-[11px] text-text-muted">Total extent</p>
                <p className="mt-1 text-xl font-semibold text-text tabular-nums">{formatAcres(dashboard.landSummary.totalAcres)}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                <p className="text-[11px] text-text-muted">Avg rate / acre</p>
                <p className="mt-1 text-xl font-semibold text-text tabular-nums">{inrCompact(dashboard.landSummary.avgRatePerAcre)}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
                <p className="text-[11px] text-text-muted">Value realised</p>
                <p className="mt-1 text-xl font-semibold text-success tabular-nums">{inrCompact(dashboard.landSummary.realised)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-muted">
              <span>Title verification queue</span>
              <span className="inline-flex items-center gap-1 font-medium text-warning">
                {dashboard.landSummary.titleQueue} open <ShieldCheck size={12} />
              </span>
            </div>
          </Card>

          <Card>
            <CardHeader title="Land Deals in Pipeline" subtitle="AI Sales Agent · WhatsApp + IVR" />
            <ul className="px-3 pb-3">
              {[
                { name: "Rajesh Kumar", deal: "Sarjapura · 4.5 ac", value: "₹14.4 Cr", tone: "primary" },
                { name: "Suresh Gowda", deal: "Devanahalli · 3.1 ac", value: "₹12.7 Cr", tone: "warning" },
                { name: "Meera Reddy", deal: "Plot VL-11 · 2,400 sq.ft", value: "₹35 L", tone: "primary" },
              ].map((d) => (
                <li key={d.name} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-muted/60">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", d.tone === "warning" ? "bg-warning-soft text-warning" : "bg-primary-soft text-primary")}>
                    <Map size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-text">{d.name}</p>
                    <p className="truncate text-xs text-text-muted">{d.deal}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-text tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-4">
              <Button variant="secondary" size="sm" className="w-full">
                Open land pipeline
              </Button>
            </div>
          </Card>
        </div>
      )}

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
          {showHomes ? (
            <>
              <CardHeader title="Sales Velocity" subtitle="Units sold per month" />
              <div className="px-5 pb-5">
                <BarChart data={dashboard.salesVelocity} />
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-muted">
                <span>Projected unsold 3BHK next quarter</span>
                <span className="inline-flex items-center gap-1 font-medium text-success">
                  ≈ 0 · on track to clear <ArrowUpRight size={12} />
                </span>
              </div>
            </>
          ) : (
            <>
              <CardHeader title="Land Enquiry Velocity" subtitle="Inbound land leads per month" />
              <div className="px-5 pb-5">
                <BarChart data={dashboard.salesVelocity.map((v, i) => ({ month: v.month, units: [3, 5, 4, 7, 6, 9][i] ?? v.units }))} />
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-muted">
                <span>Land deals expected to close next quarter</span>
                <span className="inline-flex items-center gap-1 font-medium text-success">
                  2 in negotiation <ArrowUpRight size={12} />
                </span>
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader title="Approval Queues" subtitle="Temporal workflow routing" />
          <ul className="px-3 pb-3">
            {dashboard.notifications.slice(0, 4).map((n) => (
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
          {showHomes ? (
            <>
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
            </>
          ) : (
            <>
              <CardHeader title="Land Title Health" subtitle="AI Legal Agent · chain of title per parcel" />
              <div className="space-y-3 px-5 pb-5">
                {[
                  { name: "Sarjapura Greenfield Parcel", status: "Title Clear", tone: "success" as const, detail: "30-yr chain verified · encumbrance clean" },
                  { name: "Hoskote Industrial Tract", status: "In Review", tone: "warning" as const, detail: "2 deeds pending sub-registrar check" },
                  { name: "Attibele SEZ Proximity", status: "Under Litigation", tone: "danger" as const, detail: "Registration paused until case clears" },
                  { name: "Shamshabad Agri Parcel", status: "Title Clear", tone: "success" as const, detail: "Single owner · full extent verified" },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-4">
                    <div>
                      <p className="text-[13px] font-medium text-text">{t.name}</p>
                      <p className="mt-0.5 text-[11px] text-text-subtle">{t.detail}</p>
                    </div>
                    <Badge tone={t.tone}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
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
