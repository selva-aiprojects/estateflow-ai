"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, TrendingUp, ReceiptText } from "lucide-react";
import { financeRecon, reconciliationSummary, cashFlowData, salesVelocity } from "@/lib/data";
import { inrCompact, inr } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";
import { CashFlowChart, BarChart } from "@/components/charts";

export function FinanceView() {
  const [matched, setMatched] = useState(financeRecon);
  const [autoMatch, setAutoMatch] = useState(false);

  const pending = matched.filter((r) => !r.matched);
  const aiSuggest = () => {
    setAutoMatch(true);
    setTimeout(() => {
      setMatched((rows) => rows.map((r) => (r.ref === "SBI/MT940/0804-011" ? { ...r, matched: true, confidence: 97.1, desc: "NEFT — Priya Sharma (token · T1-02-C)" } : r)));
    }, 1100);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Finance & Collections"
        subtitle="RERA-mandated escrow account · automated bank statement reconciliation"
        action={
          <Button variant="secondary" onClick={aiSuggest} disabled={autoMatch}>
            {autoMatch ? <Spinner className="text-primary" /> : <Sparkles size={15} />}
            {autoMatch ? "AI matching…" : "AI auto-match (1)"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Banknote size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">₹86.4 Cr</p>
          <p className="text-xs text-text-muted">Q3 Collections</p>
          <p className="mt-0.5 text-[11px] text-success tabular-nums">↑ 8.1% vs plan</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <ReceiptText size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(reconciliationSummary.pendingAmount)}</p>
          <p className="text-xs text-text-muted">Unreconciled inflow</p>
          <p className="mt-0.5 text-[11px] text-text-subtle tabular-nums">{reconciliationSummary.pending} transactions</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-muted text-text-muted">
            <TrendingUp size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{reconciliationSummary.matchRate}%</p>
          <p className="text-xs text-text-muted">Auto-match rate</p>
          <p className="mt-0.5 text-[11px] text-text-subtle tabular-nums">{reconciliationSummary.matched} / {reconciliationSummary.total} rows</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <AlertTriangle size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{pending.length}</p>
          <p className="text-xs text-text-muted">Unmatched now</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">requires review</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cash Flow Forecast" subtitle="₹ Cr — projected inflows vs. construction outflows" />
          <div className="px-5 pb-5">
            <CashFlowChart data={cashFlowData} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Collections by Quarter" subtitle="Units sold per month (booking → token → instalment)" />
          <div className="px-5 pb-5">
            <BarChart data={salesVelocity} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Bank Statement Reconciliation"
          subtitle="MT940 → RERA escrow → customer ledger mapping with confidence scoring"
          action={
            <Badge tone="success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live bank feed
            </Badge>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-left">
                {["Reference", "Date", "Description", "Amount", "Type", "Match Confidence", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matched.map((r, i) => (
                <tr key={i} className={cn("border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40", !r.matched && "bg-warning-soft/40")}>
                  <td className="px-4 py-3 font-mono text-xs text-text-subtle">{r.ref}</td>
                  <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{r.date}</td>
                  <td className="px-4 py-3 text-text">{r.desc}</td>
                  <td className={cn("px-4 py-3 font-medium tabular-nums", r.type === "in" ? "text-success" : "text-danger")}>
                    <span className="inline-flex items-center gap-1">
                      {r.type === "in" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {inr(r.amount, 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.type === "in" ? "success" : "muted"}>{r.type === "in" ? "Credit" : "Debit"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-muted">
                        <div className={cn("h-full rounded-full", r.matched ? "bg-success" : "bg-warning")} style={{ width: `${r.confidence}%` }} />
                      </div>
                      <span className={cn("text-xs tabular-nums", r.matched ? "text-text-muted" : "text-warning")}>{r.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.matched ? (
                      <Badge tone="success">
                        <CheckCircle2 size={11} /> Matched
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge tone="warning">Unmatched</Badge>
                        <Button size="sm" variant="secondary" onClick={aiSuggest} disabled={autoMatch}>
                          {autoMatch ? <Spinner className="text-primary" /> : <Sparkles size={12} />}
                          {autoMatch ? "Matching…" : "Suggest"}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {autoMatch && !matched.every((r) => r.matched) && (
        <div className="flex items-center gap-2 text-xs text-primary animate-fade-in">
          <Sparkles size={13} /> AI matching "NEFT — Unidentified" against customer ledger…
        </div>
      )}
    </div>
  );
}
