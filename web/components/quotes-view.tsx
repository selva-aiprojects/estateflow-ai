"use client";

import { useMemo, useState } from "react";
import { FilePlus2, CheckCircle2, XCircle, Clock, ShieldAlert, X, TrendingUp, Map, Building2 } from "lucide-react";
import {
  quoteStatusMeta,
  type Quote,
  type QuoteStatus,
  type Project,
  type Segment,
  type LandParcel,
  type PlotLayout,
} from "@/lib/data";
import { useApiData, apiSend } from "@/lib/api-client";
import { inr, formatAcres } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Avatar, Badge, Button, Card, CardHeader, Input, PageHeader, Select, Spinner } from "@/components/ui";

const toneMap: Record<string, "muted" | "primary" | "success" | "warning" | "danger" | "info"> = {
  muted: "muted",
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

interface QuoteResponse {
  quote: Quote;
  needsApproval: boolean;
}

export function QuotesView() {
  const [rows, setRows] = useApiData<Quote[]>("/api/quotes");
  const [inventory] = useApiData<{ projects: Project[] }>("/api/inventory");
  const [land] = useApiData<{ parcels: LandParcel[]; layouts: PlotLayout[] }>("/api/land");
  const [showBuilder, setShowBuilder] = useState(false);
  const [segment, setSegment] = useState<Segment>("apartments");
  const [projectId, setProjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [landId, setLandId] = useState("");
  const [discount, setDiscount] = useState("2.0");
  const [customer, setCustomer] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apprId, setApprId] = useState<string | null>(null);

  const units = useMemo(() => {
    const p = inventory?.projects.find((x) => x.id === projectId);
    if (!p) return [];
    return p.towers.flatMap((t) => t.units.filter((u) => u.status === "available" || u.status === "token_paid"));
  }, [projectId, inventory]);

  const landAssets = useMemo(() => {
    if (!land) return [];
    const parcels = land.parcels.map((p) => ({
      id: p.id,
      kind: "parcel" as const,
      label: `${p.code} · ${p.name} · ${formatAcres(p.acres)}`,
      base: p.acres * p.ratePerAcre,
    }));
    const plots = land.layouts
      .flatMap((l) => l.plots)
      .filter((p) => p.status === "available" || p.status === "token_paid")
      .map((p) => ({ id: p.id, kind: "plot" as const, label: `${p.no} · ${p.zone} plot · ${p.sqft} sq.ft`, base: p.price }));
    return [...parcels, ...plots];
  }, [land]);

  if (!rows || !inventory || !land) return <PageSkeleton />;

  const { projects } = inventory;
  const selectedUnit = units.find((u) => u.id === unitId);
  const selectedLand = landAssets.find((a) => a.id === landId);
  const discountNum = parseFloat(discount) || 0;
  const base = segment === "land" ? (selectedLand?.base ?? 0) : (selectedUnit?.price ?? 0);
  const total = base - (base * discountNum) / 100;
  const needsApproval = discountNum > 5;
  const pending = rows.filter((r) => r.status === "pending_approval");

  const submitQuote = () => {
    if (segment === "land" ? !selectedLand : !selectedUnit) return;
    setSubmitting(true);
    setTimeout(() => {
      apiSend<QuoteResponse>("/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          customer: customer || "New Customer",
          segment,
          ...(segment === "land"
            ? { landId: selectedLand!.id, landKind: selectedLand!.kind }
            : { projectId, unitId: selectedUnit!.id }),
          discountPct: discountNum,
          salesExecutive: "Arjun Nair",
        }),
      })
        .then((res) => {
          setRows((r) => (r ? [res.quote, ...r] : [res.quote]));
          setSubmitting(false);
          setShowBuilder(false);
          setCustomer("");
          setDiscount("2.0");
          setUnitId("");
          setLandId("");
          setToast(
            res.needsApproval
              ? "Discount exceeds 5% — Temporal workflow paused booking. Approval routed to VP of Sales."
              : "Quote saved as draft. Redis hold active on this asset for 15 minutes.",
          );
          setTimeout(() => setToast(null), 5000);
        })
        .catch(() => {
          setSubmitting(false);
          setToast("API unavailable — quote not persisted (demo offline).");
          setTimeout(() => setToast(null), 4000);
        });
    }, 1200);
  };

  const decide = (id: string, approve: boolean) => {
    setRows((r) => (r ? r.map((q) => (q.id === id ? { ...q, status: approve ? "approved" : "cancelled" } : q)) : r));
    apiSend<Quote>(`/api/quotes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: approve ? "approve" : "reject" }),
    }).catch(() => {});
    setToast(approve ? "Approved. Booking unblocked and notification sent to Sales Executive." : "Approval rejected. Booking remained blocked.");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Quotations & Approvals"
        subtitle="Dynamic payment schedules · discount thresholds auto-routed via Temporal"
        action={
          <Button onClick={() => setShowBuilder(true)}>
            <FilePlus2 size={15} /> New Quotation
          </Button>
        }
      />

      {pending.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader
            title={`Discount approvals needed (${pending.length})`}
            subtitle="Discounted > 5% — workflow halted until VP of Sales decides"
            icon={<ShieldAlert size={15} className="text-warning" />}
          />
          <div className="space-y-3 px-5 pb-5">
            {pending.map((q) => (
              <div key={q.id} className={cn("flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between", apprId === q.id ? "border-primary/40 bg-primary-soft/40" : "border-border bg-surface-muted/40")}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft text-warning">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      {q.quoteNo} · {q.customer}
                    </p>
                    <p className="text-xs text-text-muted">
                      {q.project} · Unit {q.unit} · {inr(q.base, 0)} → <b className="text-danger">{q.discountPct}%</b> ({inr(q.total, 0)})
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="danger" onClick={() => decide(q.id, false)}>
                    <XCircle size={14} /> Reject
                  </Button>
                  <Button size="sm" onClick={() => decide(q.id, true)}>
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-left">
                {["Quote", "Customer", "Project / Unit", "Base Amount", "Discount", "Total", "Status", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">{q.quoteNo}</span>
                      <Badge tone={q.segment === "land" ? "success" : "primary"}>{q.segment === "land" ? "Land" : "Home"}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={q.customer} size="sm" />
                      <span className="text-text">{q.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    <span className="flex items-center gap-1.5">
                      {q.segment === "land" ? <Map size={13} className="text-success" /> : <Building2 size={13} className="text-primary" />}
                      {q.project} · {q.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text tabular-nums">{inr(q.base, 0)}</td>
                  <td className={cn("px-4 py-3 tabular-nums font-medium", q.discountPct > 5 ? "text-danger" : "text-text")}>{q.discountPct}%</td>
                  <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(q.total, 0)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={toneMap[quoteStatusMeta[q.status].tone]}>{quoteStatusMeta[q.status].label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">
                    {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(q.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showBuilder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowBuilder(false)}>
          <div className="w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface shadow-lift animate-fade-in max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-text">New Quotation</h3>
                <p className="text-xs text-text-muted">Redis will hold the unit / parcel for 15 minutes</p>
              </div>
              <button onClick={() => setShowBuilder(false)} aria-label="Close" className="rounded-md p-1.5 text-text-subtle hover:bg-surface-muted transition-colors cursor-pointer">
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-surface-muted/40 p-1">
                <button
                  onClick={() => setSegment("apartments")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    segment === "apartments" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text",
                  )}
                >
                  <Building2 size={14} /> Apartments
                </button>
                <button
                  onClick={() => setSegment("land")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    segment === "land" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text",
                  )}
                >
                  <Map size={14} /> Land
                </button>
              </div>

              {segment === "land" ? (
                <Select
                  label="Land Asset"
                  value={landId}
                  onChange={setLandId}
                  options={landAssets.map((a) => ({ value: a.id, label: a.label }))}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Project"
                    value={projectId}
                    onChange={(v) => {
                      setProjectId(v);
                      setUnitId("");
                    }}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                  />
                  <Select
                    label="Available Unit"
                    value={unitId}
                    onChange={setUnitId}
                    options={units.map((u) => ({ value: u.id, label: `${u.no} · ${u.type} · ${u.sqft} sq.ft` }))}
                  />
                </div>
              )}
              <Input label="Customer name" value={customer} onChange={setCustomer} placeholder="e.g. Rohan Mehta" />
              <Input label="Discount (%)" value={discount} onChange={setDiscount} suffix="%" hint={discountNum > 5 ? "Exceeds 5% — approval required" : "Within sales authority"} />

              <div className="rounded-lg bg-surface-muted/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">
                    Base price ({segment === "land" ? (selectedLand ? `${selectedLand.label.split("·")[0].trim()} · ${selectedLand.label.split("·")[1].trim()}` : "—") : selectedUnit ? `${selectedUnit.type} · ${selectedUnit.sqft} sq.ft` : "—"})
                  </span>
                  <span className="font-medium text-text tabular-nums">{inr(base, 0)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-text-muted">Discount ({discountNum}%)</span>
                  <span className="font-medium text-danger tabular-nums">−{inr((base * discountNum) / 100, 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium text-text">Total</span>
                  <span className="text-lg font-semibold text-text tabular-nums">{inr(total, 0)}</span>
                </div>
              </div>

              {needsApproval && (
                <div className="flex items-start gap-2.5 rounded-md border border-warning/25 bg-warning-soft/70 p-3 text-xs leading-relaxed text-warning">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Discount &gt; 5% triggers a <b>Temporal workflow</b> that halts the booking and routes an approval notification to the VP of Sales mobile app.
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={submitQuote} disabled={(segment === "land" ? !selectedLand : !selectedUnit) || submitting}>
                  {submitting && <Spinner />}
                  {submitting ? "Submitting…" : needsApproval ? "Submit for Approval" : "Save Draft Quote"}
                </Button>
                <Button variant="secondary" onClick={() => setShowBuilder(false)} disabled={submitting}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
