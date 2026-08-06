"use client";

import { useState } from "react";
import { KeyRound, CalendarRange, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, Send } from "lucide-react";
import { type Lease, type RentInvoice } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr, inrCompact, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const leaseTone: Record<Lease["status"], "muted" | "warning" | "success" | "danger"> = {
  draft: "muted",
  pending_signature: "warning",
  active: "success",
  terminated: "danger",
  expired: "muted",
};

const invTone: Record<RentInvoice["status"], "info" | "success" | "danger"> = {
  issued: "info",
  paid: "success",
  overdue: "danger",
};

interface RentalsPayload {
  leases: Lease[];
  invoices: RentInvoice[];
  summary: { monthlyRentRun: number; overdueAmount: number; avgOccupancy: number };
}

export function RentalsView() {
  const [rentals] = useApiData<RentalsPayload>("/api/rentals");
  const [reminding, setReminding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const remind = () => {
    setReminding(true);
    setTimeout(() => {
      setReminding(false);
      setToast("Customer Agent sent WhatsApp rent reminders to 2 tenants. Anil Kapoor replied with UPI payment ref for July overdue of ₹72,000.");
      setTimeout(() => setToast(null), 5600);
    }, 1500);
  };

  if (!rentals) return <PageSkeleton />;

  const { summary, leases, invoices } = rentals;
  const activeLeases = leases.filter((l) => l.status === "active").length;
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Rental Operations"
        subtitle="Lease lifecycle · automatic rent invoicing · escalations & deposits"
        action={
          <Button onClick={remind} disabled={reminding}>
            {reminding ? <Spinner /> : <Send size={15} />}
            {reminding ? "Reminding…" : "AI rent reminders"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <KeyRound size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{activeLeases}</p>
          <p className="text-xs text-text-muted">Active leases</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">1 expiring this month</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <CalendarRange size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(summary.monthlyRentRun)}</p>
          <p className="text-xs text-text-muted">Monthly rent run</p>
          <p className="mt-0.5 text-[11px] text-success">↑ 10% at renewal</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger">
            <AlertTriangle size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(summary.overdueAmount)}</p>
          <p className="text-xs text-text-muted">Overdue rent</p>
          <p className="mt-0.5 text-[11px] text-danger">{overdue} invoice</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
            <TrendingUp size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{summary.avgOccupancy}%</p>
          <p className="text-xs text-text-muted">Occupancy</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">portfolio wide</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Lease Register" subtitle="Escalation clauses applied automatically at renewal" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Lease", "Unit", "Tenant", "Term", "Rent/mo", "Esc.", "Deposit", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leases.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-primary">{l.leaseNo}</td>
                    <td className="px-4 py-3 text-text-muted">{l.unit}</td>
                    <td className="px-4 py-3 text-text">{l.tenant}</td>
                    <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{formatDate(l.start)} → {formatDate(l.end)}</td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(l.monthlyRent)}</td>
                    <td className="px-4 py-3">{l.escalationPct > 0 ? <Badge tone="info">+{l.escalationPct}%/yr</Badge> : <span className="text-xs text-text-subtle">fixed</span>}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{inrCompact(l.deposit)}</td>
                    <td className="px-4 py-3"><Badge tone={leaseTone[l.status]}>{l.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Rent Invoices" subtitle="Auto-raised on the 1st · reminders on 5th · penalty on 10th" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Invoice", "Unit", "Tenant", "Month", "Amount", "Due", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className={cn("border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40", i.status === "overdue" && "bg-danger-soft/30")}>
                    <td className="px-4 py-3 font-medium text-primary">{i.invNo}</td>
                    <td className="px-4 py-3 text-text-muted">{i.unit}</td>
                    <td className="px-4 py-3 text-text">{i.tenant}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{i.month}</td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(i.amount)}</td>
                    <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{i.due}</td>
                    <td className="px-4 py-3"><Badge tone={invTone[i.status]}>{i.status}</Badge></td>
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
