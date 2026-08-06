"use client";

import { useState } from "react";
import { PackageSearch, FilePlus2, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2, Truck } from "lucide-react";
import { type Vendor, type Rfq, type PurchaseOrder, type Grn } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr, inrCompact, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const rfqTone: Record<Rfq["status"], "muted" | "info" | "warning" | "success"> = {
  draft: "muted",
  published: "info",
  under_evaluation: "warning",
  awarded: "success",
  closed: "muted",
};

const poTone: Record<PurchaseOrder["status"], "muted" | "info" | "warning" | "success"> = {
  draft: "muted",
  sent: "info",
  partially_received: "warning",
  received: "success",
};

const grnTone: Record<Grn["status"], "warning" | "success" | "danger"> = {
  pending_verification: "warning",
  verified: "success",
  rejected: "danger",
};

interface ProcurementPayload {
  vendors: Vendor[];
  rfqs: Rfq[];
  pos: PurchaseOrder[];
  grns: Grn[];
  summary: { openRfqs: number; activePos: number; grnExceptions: number; savingsYtd: number };
}

export function ProcurementView() {
  const [procurement] = useApiData<ProcurementPayload>("/api/procurement");
  const [drafting, setDrafting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const aiDraftPo = () => {
    setDrafting(true);
    setTimeout(() => {
      setDrafting(false);
      setToast("AI Procurement Agent drafted PO-2026-042 from awarded RFQ-2026-018 · Jindal Steel · ₹4.82 Cr · awaiting approval.");
      setTimeout(() => setToast(null), 5200);
    }, 1500);
  };

  if (!procurement) return <PageSkeleton />;

  const { summary, rfqs, pos, grns } = procurement;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Procurement & Vendor Management"
        subtitle="RFQ → PO → GRN → 3-way invoice matching · AI market-index anomaly detection"
        action={
          <Button onClick={aiDraftPo} disabled={drafting}>
            {drafting ? <Spinner /> : <FilePlus2 size={15} />}
            {drafting ? "Drafting…" : "AI draft PO"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <PackageSearch size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{summary.openRfqs}</p>
          <p className="text-xs text-text-muted">Open RFQs</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">2 under AI evaluation</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Truck size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{summary.activePos}</p>
          <p className="text-xs text-text-muted">Active POs</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">{inrCompact(152000000)} committed</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger">
            <AlertTriangle size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{summary.grnExceptions}</p>
          <p className="text-xs text-text-muted">Match exceptions</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">need finance review</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <ShieldCheck size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(summary.savingsYtd)}</p>
          <p className="text-xs text-text-muted">AI-driven savings YTD</p>
          <p className="mt-0.5 text-[11px] text-success">↑ vs market index</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="RFQ Pipeline"
          subtitle="Vendor responses scored against market indices by the AI Procurement Agent"
          action={
            <Badge tone="primary">
              <Sparkles size={11} /> 2 anomalies flagged
            </Badge>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-left">
                {["RFQ", "Item", "Project", "Deadline", "Responses", "Best Rate", "Market Index", "Variance", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfqs.map((r) => {
                const variance = ((r.bestRate - r.marketIndex) / r.marketIndex) * 100;
                return (
                  <tr key={r.id} className={cn("border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40", r.aiFlag && "bg-warning-soft/30")}>
                    <td className="px-4 py-3 font-medium text-primary">{r.rfqNo}</td>
                    <td className="px-4 py-3">
                      <p className="text-text">{r.title}</p>
                      <p className="text-[11px] text-text-subtle">{r.category}</p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.project}</td>
                    <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{formatDate(r.deadline)}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{r.responses}</td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(r.bestRate)}</td>
                    <td className="px-4 py-3 text-text-muted tabular-nums">{inr(r.marketIndex)}</td>
                    <td className={cn("px-4 py-3 tabular-nums font-medium", variance <= 0 ? "text-success" : "text-warning")}>{variance >= 0 ? "+" : ""}{variance.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={rfqTone[r.status]}>{r.status.replace("_", " ")}</Badge>
                        {r.aiFlag && (
                          <span title={r.aiNote} className="flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-warning-soft text-warning">
                            <Sparkles size={11} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Purchase Orders" subtitle="AI-drafted POs marked · BOQ overage blocked by workflow" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["PO", "Vendor", "Value", "Status", "Source"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pos.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-primary">{p.poNo}</td>
                    <td className="px-4 py-3">
                      <p className="text-text">{p.vendor}</p>
                      <p className="text-[11px] text-text-subtle">{p.rfqNo}</p>
                    </td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(p.total, 0)}</td>
                    <td className="px-4 py-3"><Badge tone={poTone[p.status]}>{p.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3">
                      {p.aiDrafted ? (
                        <Badge tone="primary"><Sparkles size={11} /> AI drafted</Badge>
                      ) : (
                        <span className="text-xs text-text-subtle">Manual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="GRN & Invoice Matching" subtitle="3-way match: PO vs GRN vs vendor invoice" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["GRN", "PO", "Vendor", "Received", "Match", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grns.map((g) => (
                  <tr key={g.id} className={cn("border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40", g.match === "mismatch" && "bg-danger-soft/30")}>
                    <td className="px-4 py-3 font-medium text-primary">{g.grnNo}</td>
                    <td className="px-4 py-3 text-text-muted">{g.poNo}</td>
                    <td className="px-4 py-3 text-text">{g.vendor}</td>
                    <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{formatDate(g.receivedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={g.match === "three_way" ? "success" : g.match === "two_way" ? "info" : "danger"}>
                        {g.match === "three_way" ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {g.match.replace("_", "-")} · {g.variancePct}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3"><Badge tone={grnTone[g.status]}>{g.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
