"use client";

import { useMemo, useState } from "react";
import {
  Map,
  ShieldCheck,
  Scale,
  FileText,
  CalendarClock,
  Lock,
  X,
  Info,
  RefreshCw,
  BadgeCheck,
  Landmark,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import {
  landParcels as seedParcels,
  plotLayouts as seedLayouts,
  landStatusMeta,
  titleStatusMeta,
  zoningMeta,
  unitStatusMeta,
  type LandParcel,
  type LandStatus,
  type Plot,
  type PlotLayout,
  type UnitStatus,
} from "@/lib/data";
import { useApiData, apiSend } from "@/lib/api-client";
import { useTenant } from "@/lib/tenant-context";
import { inr, inrCompact, formatAcres } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, PageHeader, Select, Spinner } from "@/components/ui";

interface LandPayload {
  parcels: LandParcel[];
  layouts: PlotLayout[];
  landStatusMeta: typeof landStatusMeta;
  titleStatusMeta: typeof titleStatusMeta;
  summary: { totalAcres: number; availableParcels: number; avgRatePerAcre: number; titleQueue: number; realised: number; registeredParcels: number };
}

interface QuoteResponse {
  quote: { quoteNo: string };
  needsApproval: boolean;
}

const parcelStatusOrder: LandStatus[] = ["available", "hold", "token_paid", "registered", "sold"];
const titleOrder = ["clear", "in_review", "disputed", "litigation"] as const;
const plotStatusOrder: UnitStatus[] = ["available", "blocked", "token_paid", "sold", "under_maintenance"];

export function LandView() {
  const { plan, has } = useTenant();
  const [land] = useApiData<LandPayload>("/api/land", {
    parcels: seedParcels,
    layouts: seedLayouts,
    landStatusMeta,
    titleStatusMeta,
    summary: {
      totalAcres: seedParcels.reduce((s, p) => s + p.acres, 0),
      availableParcels: seedParcels.filter((p) => p.status === "available").length,
      avgRatePerAcre: 29000000,
      titleQueue: seedParcels.filter((p) => p.titleStatus !== "clear").length,
      realised: 0,
      registeredParcels: 0,
    },
  });
  const { parcels, layouts, summary } = land;

  const [tab, setTab] = useState<"parcels" | "plots">("parcels");
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [layoutId, setLayoutId] = useState(layouts[0].id);
  const [held, setHeld] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const layout = layouts.find((l) => l.id === layoutId)!;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const startQuote = (target: { id: string; kind: "parcel" | "plot"; label: string; base: number }) => {
    if (busy) return;
    setBusy(true);
    setHeld(target.id);
    apiSend<{ locked: boolean }>(`/api/land/${target.id}`, {
      method: "PATCH",
      body: JSON.stringify({ hold: true, heldBy: "demo-sales-executive" }),
    }).catch(() => {});
    apiSend<QuoteResponse>("/api/quotes", {
      method: "POST",
      body: JSON.stringify({
        customer: "Demo Customer",
        segment: "land",
        landId: target.id,
        landKind: target.kind,
        discountPct: 2,
        salesExecutive: "Arjun Nair",
      }),
    })
      .then((res) => {
        setBusy(false);
        showToast(
          res.needsApproval
            ? `Land quote created (${res.quote.quoteNo}) — approval routed.`
            : `Land quote created (${res.quote.quoteNo}) — 15-min Redis hold on ${target.label}.`,
        );
      })
      .catch(() => {
        setBusy(false);
        showToast("API unavailable — quote not persisted (demo offline).");
      });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    parcels.forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
    return c;
  }, [parcels]);

  const plotCounts = useMemo(() => {
    const c: Record<string, number> = {};
    layouts.flatMap((l) => l.plots).forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
    return c;
  }, [layouts]);

  const totalPlotValue = layouts.flatMap((l) => l.plots).reduce((s, p) => s + p.price, 0);
  const soldPlotValue = layouts.flatMap((l) => l.plots).filter((p) => p.status === "sold").reduce((s, p) => s + p.price, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Land Portfolio"
        subtitle="Land parcels · plotted development · title & RERA verification — live inventory"
        action={
          <Badge tone="success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {plan.name} plan active
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Map, label: "Land under portfolio", value: `${summary.totalAcres} ac`, sub: "6 parcels · multi-district", tone: "text-primary" },
          { icon: TrendingUp, label: "Avg. rate / acre", value: inrCompact(summary.avgRatePerAcre), sub: "available parcels only", tone: "text-primary" },
          { icon: Landmark, label: "Available parcels", value: `${summary.availableParcels}`, sub: `${summary.registeredParcels} already registered`, tone: "text-success" },
          { icon: ShieldCheck, label: "Title verification", value: `${summary.titleQueue} open`, sub: "1 in review · 1 litigation", tone: "text-warning" },
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

      <div className="flex gap-1.5">
        {[
          { id: "parcels" as const, label: "Land Parcels", count: parcels.length },
          { id: "plots" as const, label: "Plot Layouts", count: layouts.flatMap((l) => l.plots).length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer",
              tab === t.id ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
            )}
          >
            {t.label}
            <span className={cn("tabular-nums", tab === t.id ? "text-white/80" : "text-text-subtle")}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "parcels" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {parcelStatusOrder.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: landStatusMeta[s].color }} />
                      {landStatusMeta[s].label}
                      <span className="font-medium text-text tabular-nums">{counts[s] ?? 0}</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {titleOrder.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[11px] text-text-subtle">
                      <span className={cn("h-1.5 w-1.5 rounded-full", titleStatusMeta[t].tone === "success" && "bg-success", titleStatusMeta[t].tone === "warning" && "bg-warning", titleStatusMeta[t].tone === "danger" && "bg-danger")} />
                      {titleStatusMeta[t].label}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {parcels.map((p) => {
                const meta = landStatusMeta[p.status];
                const isHeld = held === p.id;
                return (
                  <Card key={p.id} hover className="relative overflow-hidden" onClick={() => setSelectedParcel(p)}>
                    <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: meta.color }} />
                    <div className="p-4 pl-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-text">{p.name}</p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            {p.village}, {p.district} · Survey {p.surveyNo}
                          </p>
                        </div>
                        {isHeld && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Lock size={12} />
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Badge tone="muted" className="text-[10px]">{p.code}</Badge>
                        <Badge tone={zoningMeta[p.zoning].tone} className="text-[10px]">{zoningMeta[p.zoning].label}</Badge>
                        <Badge tone={titleStatusMeta[p.titleStatus].tone} className="text-[10px]">
                          <ShieldCheck size={11} /> {titleStatusMeta[p.titleStatus].label}
                        </Badge>
                        <Badge className="text-[10px]" tone={meta.color === "#16a34a" ? "success" : meta.color === "#ca8a04" ? "warning" : meta.color === "#2563eb" ? "info" : meta.color === "#0d9488" ? "primary" : "danger"}>
                          {meta.label}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-md bg-surface-muted/60 p-2">
                          <p className="text-[10px] text-text-muted">Extent</p>
                          <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{formatAcres(p.acres, p.guntas)}</p>
                        </div>
                        <div className="rounded-md bg-surface-muted/60 p-2">
                          <p className="text-[10px] text-text-muted">Rate / ac</p>
                          <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{inrCompact(p.ratePerAcre)}</p>
                        </div>
                        <div className="rounded-md bg-surface-muted/60 p-2">
                          <p className="text-[10px] text-text-muted">Value</p>
                          <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{inrCompact(p.acres * p.ratePerAcre)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {selectedParcel ? (
              <ParcelDetail
                parcel={selectedParcel}
                held={held === selectedParcel.id}
                busy={busy}
                onClose={() => setSelectedParcel(null)}
                onQuote={() => startQuote({ id: selectedParcel.id, kind: "parcel", label: selectedParcel.code, base: selectedParcel.acres * selectedParcel.ratePerAcre })}
              />
            ) : (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Map size={20} />
                </div>
                <p className="mt-3 text-sm font-medium text-text">Select a land parcel</p>
                <p className="mt-1 max-w-[220px] text-xs text-text-muted">
                  View title status, per-acre rate, and raise a land deal quotation.
                </p>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                <RefreshCw size={14} className="text-text-muted" /> Land health
              </h3>
              <ul className="space-y-2 text-xs text-text-muted">
                <li className="flex items-center justify-between">
                  <span>Title-clear parcels</span>
                  <b className="text-text tabular-nums">{parcels.filter((p) => p.titleStatus === "clear").length}</b>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pending title review</span>
                  <b className="text-text tabular-nums">{parcels.filter((p) => p.titleStatus === "in_review").length}</b>
                </li>
                <li className="flex items-center justify-between">
                  <span>Litigation flags</span>
                  <b className="text-danger tabular-nums">{parcels.filter((p) => p.titleStatus === "litigation").length}</b>
                </li>
              </ul>
              <div className="mt-4 rounded-md border border-warning/20 bg-warning-soft/60 p-3 text-[11px] leading-relaxed text-warning">
                <span className="inline-flex items-center gap-1 font-medium"><Info size={12} /> AI Legal Agent:</span>{" "}
                Attibele SEZ Proximity has an encumbrance flag — registration is paused until litigation clears.
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {plotStatusOrder.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: unitStatusMeta[s].color }} />
                      {unitStatusMeta[s].label}
                      <span className="font-medium text-text tabular-nums">{plotCounts[s] ?? 0}</span>
                    </span>
                  ))}
                </div>
                <Select
                  value={layoutId}
                  onChange={setLayoutId}
                  options={layouts.map((l) => ({ value: l.id, label: l.name }))}
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-text">{layout.name}</h2>
                  <p className="text-xs text-text-muted">RERA approved plotted development · sector roads &amp; parks included</p>
                </div>
                <Badge tone="info">
                  <span className="h-1.5 w-1.5 rounded-full bg-info animate-pulse" /> Live · Redis lock active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {layout.plots.map((plot) => {
                  const meta = unitStatusMeta[plot.status];
                  const isHeld = held === plot.id;
                  return (
                    <button
                      key={plot.id}
                      onClick={() => setSelectedPlot(plot)}
                      title={`${plot.no} · ${plot.zone} · ${plot.sqft} sq.ft · ${inr(plot.price)}`}
                      className={cn(
                        "relative flex h-16 flex-col items-center justify-center rounded-md border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        selectedPlot?.id === plot.id && "ring-2 ring-primary ring-offset-1",
                        isHeld && "animate-pulse",
                      )}
                      style={{
                        backgroundColor: `${meta.color}1f`,
                        borderColor: selectedPlot?.id === plot.id ? "hsl(var(--primary))" : `${meta.color}55`,
                      }}
                    >
                      <span className="text-xs font-semibold text-text" style={{ color: meta.color }}>{plot.no}</span>
                      <span className="mt-0.5 text-[10px] text-text-muted tabular-nums">{plot.sqft} sq.ft</span>
                      {isHeld && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                          <Lock size={9} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 border-t border-border pt-3 text-[11px] text-text-subtle">
                Click any plot for details. Generating a quotation acquires a 15-minute Redis hold to prevent double-booking.
              </p>
            </Card>
          </div>

          <div className="space-y-4">
            {selectedPlot ? (
              <PlotDetail
                plot={selectedPlot}
                layout={layout.name}
                held={held === selectedPlot.id}
                busy={busy}
                onClose={() => setSelectedPlot(null)}
                onQuote={() => startQuote({ id: selectedPlot.id, kind: "plot", label: selectedPlot.no, base: selectedPlot.price })}
              />
            ) : (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <BadgeCheck size={20} />
                </div>
                <p className="mt-3 text-sm font-medium text-text">No plot selected</p>
                <p className="mt-1 max-w-[220px] text-xs text-text-muted">
                  Select a plot on the layout map to view pricing and quote actions.
                </p>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                <TrendingUp size={14} className="text-text-muted" /> Layout sell-through
              </h3>
              <p className="text-2xl font-semibold text-text tabular-nums">
                {Math.round(((plotCounts.sold ?? 0) / layouts.flatMap((l) => l.plots).length) * 100)}%
              </p>
              <p className="mt-0.5 text-[11px] text-text-subtle">
                {inrCompact(soldPlotValue)} realised of {inrCompact(totalPlotValue)} inventory value
              </p>
            </Card>
          </div>
        </div>
      )}

      {!has("land") && (
        <Card className="border-warning/30 p-4 text-xs text-warning">
          Your current plan ({plan.name}) does not include the Land Portfolio module.
        </Card>
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

function ParcelDetail({
  parcel,
  held,
  busy,
  onClose,
  onQuote,
}: {
  parcel: LandParcel;
  held: boolean;
  busy: boolean;
  onClose: () => void;
  onQuote: () => void;
}) {
  const meta = landStatusMeta[parcel.status];
  const value = parcel.acres * parcel.ratePerAcre;
  return (
    <Card className="animate-fade-in">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ backgroundColor: meta.color }}>
            <Landmark size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{parcel.name}</h3>
            <p className="text-xs text-text-muted">{parcel.code} · {parcel.village}, {parcel.district}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close panel" className="rounded-md p-1.5 text-text-subtle hover:bg-surface-muted transition-colors cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Extent</p>
            <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{formatAcres(parcel.acres, parcel.guntas)}</p>
          </div>
          <div className="rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Rate per acre</p>
            <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{inr(parcel.ratePerAcre)}</p>
          </div>
          <div className="rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Title status</p>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: titleStatusMeta[parcel.titleStatus].tone === "danger" ? "hsl(var(--danger))" : titleStatusMeta[parcel.titleStatus].tone === "warning" ? "hsl(var(--warning))" : "hsl(var(--success))" }}>
              {titleStatusMeta[parcel.titleStatus].label}
            </p>
          </div>
          <div className="rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Zoning</p>
            <p className="mt-0.5 text-sm font-semibold text-text">{zoningMeta[parcel.zoning].label}</p>
          </div>
          <div className="col-span-2 rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Total consideration</p>
            <p className="mt-0.5 text-lg font-semibold text-text tabular-nums">{inr(value)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border p-2.5">
            <p className="text-text-muted">Survey number</p>
            <p className="mt-0.5 font-medium text-text">{parcel.surveyNo}</p>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <p className="text-text-muted">Documents on file</p>
            <p className="mt-0.5 font-medium text-text">{parcel.docsCount} (DigiLocker)</p>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <p className="text-text-muted">Seller</p>
            <p className="mt-0.5 font-medium text-text">{parcel.seller}</p>
          </div>
          <div className="rounded-md border border-border p-2.5">
            <p className="text-text-muted">Status</p>
            <p className="mt-0.5 font-medium text-text" style={{ color: meta.color }}>{meta.label}</p>
          </div>
        </div>

        <div className="rounded-md border border-primary/20 bg-primary-soft/60 p-3 text-[11px] leading-relaxed text-primary">
          <span className="inline-flex items-center gap-1 font-medium"><Info size={12} /> AI Legal Agent:</span>{" "}
          {parcel.titleStatus === "clear"
            ? "Title chain verified across 30 years. Encumbrance certificate clean — ready for registration."
            : parcel.titleStatus === "in_review"
              ? "2 deeds pending verification against sub-registrar records. Expected clearance in 4 working days."
              : "Encumbrance flag raised — registration paused. Legal team is reviewing the litigation file."}
        </div>

        {held ? (
          <div className="rounded-md border border-primary/20 bg-primary-soft p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Lock size={14} /> Held · 15-min Redis lock
            </div>
            <p className="mt-1 text-[11px] text-primary/80">No other executive can quote this {parcel.titleStatus === "clear" ? "parcel" : "parcel"} during the hold.</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onQuote} disabled={busy || parcel.status === "sold"}>
              {busy && <Spinner />}
              <FileText size={15} /> Generate Quote
            </Button>
            <Button variant="secondary" className="flex-1">
              <CalendarClock size={15} /> Book Site Visit
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function PlotDetail({
  plot,
  layout,
  held,
  busy,
  onClose,
  onQuote,
}: {
  plot: Plot;
  layout: string;
  held: boolean;
  busy: boolean;
  onClose: () => void;
  onQuote: () => void;
}) {
  const meta = unitStatusMeta[plot.status];
  return (
    <Card className="animate-fade-in">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ backgroundColor: meta.color }}>
            <Scale size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">Plot {plot.no}</h3>
            <p className="text-xs text-text-muted">{layout} · {plot.zone}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close panel" className="rounded-md p-1.5 text-text-subtle hover:bg-surface-muted transition-colors cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Plot area</p>
            <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{plot.sqft.toLocaleString("en-IN")} sq.ft</p>
          </div>
          <div className="rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Status</p>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p>
          </div>
          <div className="col-span-2 rounded-md bg-surface-muted/60 p-3">
            <p className="text-[11px] text-text-muted">Base Sale Price</p>
            <p className="mt-0.5 text-lg font-semibold text-text tabular-nums">{inr(plot.price)}</p>
          </div>
        </div>

        <div className="rounded-md border border-warning/20 bg-warning-soft/60 p-3 text-[11px] leading-relaxed text-warning">
          <span className="inline-flex items-center gap-1 font-medium"><Info size={12} /> AI Sales Agent note:</span>{" "}
          Plots in this sector are selling within 6 weeks on average — 2 leads are currently in budget.
        </div>

        {held ? (
          <div className="rounded-md border border-primary/20 bg-primary-soft p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Lock size={14} /> Held · 15-min Redis lock
            </div>
            <p className="mt-1 text-[11px] text-primary/80">No other executive can quote this plot during the hold.</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onQuote} disabled={busy || plot.status === "sold"}>
              {busy && <Spinner />}
              <FileText size={15} /> Generate Quote
            </Button>
            <Button variant="secondary" className="flex-1">
              <CalendarClock size={15} /> Book Site Visit
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
