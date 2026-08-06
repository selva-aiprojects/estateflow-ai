"use client";

import { useState } from "react";
import { Building2, QrCode, AlertTriangle, ReceiptIndianRupee, Sparkles, CheckCircle2, Wrench, TicketCheck } from "lucide-react";
import { type AmcContract, type MaintenanceBill } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

interface FacilityPayload {
  amc: AmcContract[];
  visitors: { id: string; visitor: string; unit: string; purpose: string; checkIn: string; qr: boolean; status: string }[];
  bills: MaintenanceBill[];
  tickets: { id: string; ticketNo: string; customer: string; category: string; priority: string; status: string; ageDays: number }[];
}

const amcTone: Record<AmcContract["status"], "success" | "danger" | "muted" | "info"> = {
  active: "success",
  expired: "danger",
  cancelled: "muted",
  renewed: "info",
};

const billTone: Record<MaintenanceBill["status"], "info" | "success" | "danger"> = {
  issued: "info",
  paid: "success",
  overdue: "danger",
};

const ticketTone: Record<string, "success" | "info" | "warning" | "danger" | "muted"> = {
  low: "muted",
  medium: "info",
  high: "warning",
  urgent: "danger",
  open: "warning",
  in_progress: "info",
  resolved: "success",
};

export function FacilityView() {
  const [facility] = useApiData<FacilityPayload>("/api/facility");
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!facility) return <PageSkeleton />;

  const { amc, visitors, bills, tickets } = facility;
  const activeAmc = amc.filter((a) => a.status === "active").length;
  const insideVisitors = visitors.filter((v) => v.status === "inside").length;
  const overdueBills = bills.filter((b) => b.status === "overdue").length;

  const screen = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setToast("AI gate screening OK — QR validated for 2 visitors. Nikhil Patil re-checked against blacklist: no match. Entry recorded.");
      setTimeout(() => setToast(null), 5600);
    }, 1400);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Facility & Society Operations"
        subtitle="AMC contracts · QR gate passes · maintenance billing · after-sales service"
        action={
          <Button onClick={screen} disabled={scanning}>
            {scanning ? <Spinner /> : <QrCode size={15} />}
            {scanning ? "Screening…" : "AI gate screen"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Building2 size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{activeAmc}</p>
          <p className="text-xs text-text-muted">Active AMC contracts</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">₹14.6 L annual run</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <AlertTriangle size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">1</p>
          <p className="text-xs text-text-muted">Expiring in 30 days</p>
          <p className="mt-0.5 text-[11px] text-warning">SafeGuard Fire · 20 Jul</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <QrCode size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{insideVisitors}<span className="text-sm text-text-muted">/{visitors.length}</span></p>
          <p className="text-xs text-text-muted">Visitors on-site</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">QR-verified entry</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger">
            <ReceiptIndianRupee size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{overdueBills}</p>
          <p className="text-xs text-text-muted">Overdue maintenance</p>
          <p className="mt-0.5 text-[11px] text-danger">{inr(5400)} to collect</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="AMC Contracts" subtitle="Auto-renewal reminders on the Temporal workflow" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Service", "Vendor", "Value", "Expires", "Renew", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amc.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{a.service}</p>
                      <p className="text-[11px] text-text-subtle">{a.society}</p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{a.vendor}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{inr(a.amount, 0)}</td>
                    <td className="px-4 py-3 text-xs text-text-subtle tabular-nums">{a.expires}</td>
                    <td className="px-4 py-3">{a.autoRenew ? <Badge tone="info">Auto</Badge> : <Badge tone="muted">Manual</Badge>}</td>
                    <td className="px-4 py-3"><Badge tone={amcTone[a.status]}>{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Visitor Gate Log" subtitle="QR passes · facial match at gate" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Visitor", "Unit", "Purpose", "In", "QR", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-text">{v.visitor}</td>
                    <td className="px-4 py-3 text-text-muted">{v.unit}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{v.purpose}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{v.checkIn}</td>
                    <td className="px-4 py-3">{v.qr ? <Badge tone="success"><QrCode size={11} /> Scanned</Badge> : <Badge tone="warning">Manual</Badge>}</td>
                    <td className="px-4 py-3"><Badge tone={v.status === "inside" ? "info" : "muted"}>{v.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Maintenance Billing" subtitle="Per-unit society dues · auto-invoiced monthly" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Bill", "Unit", "Period", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-primary">{b.billNo}</td>
                    <td className="px-4 py-3 text-text">{b.unit}</td>
                    <td className="px-4 py-3 text-text-muted">{b.period}</td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(b.amount)}</td>
                    <td className="px-4 py-3"><Badge tone={billTone[b.status]}>{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Service Tickets" subtitle="After-sales support · SLAs on the queue" action={<Badge tone="primary"><TicketCheck size={11} /> 2 open</Badge>} />
          <ul className="px-3 pb-3">
            {tickets.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-muted/60">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", ticketTone[t.priority] === "danger" ? "bg-danger-soft text-danger" : ticketTone[t.priority] === "warning" ? "bg-warning-soft text-warning" : ticketTone[t.priority] === "info" ? "bg-info-soft text-info" : "bg-surface-muted text-text-muted")}>
                  <Wrench size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text">{t.customer} · {t.category}</p>
                  <p className="truncate text-xs text-text-muted">{t.ticketNo} · {t.ageDays}d old</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge tone={ticketTone[t.priority] as "info" | "warning" | "danger" | "muted"}>{t.priority}</Badge>
                  <Badge tone={ticketTone[t.status] as "info" | "warning" | "success"}>{t.status.replace("_", " ")}</Badge>
                </div>
              </li>
            ))}
          </ul>
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
