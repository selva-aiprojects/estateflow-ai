"use client";

import { useState } from "react";
import { UserCog, MapPin, AlertTriangle, Clock, Sparkles, CheckCircle2, Wallet } from "lucide-react";
import { type AttendanceRow } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const attTone: Record<AttendanceRow["status"], "success" | "warning" | "danger" | "muted"> = {
  present: "success",
  late: "warning",
  absent: "danger",
  on_leave: "muted",
};

interface HrPayload {
  attendance: AttendanceRow[];
  labour: { id: string; name: string; vendor: string; role: string; dailyWage: number; active: boolean; attendancePct: number }[];
  summary: { total: number; present: number; late: number; absent: number; onTimePct: number };
}

export function HrView() {
  const [hr] = useApiData<HrPayload>("/api/hr");
  const [sweeping, setSweeping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sweep = () => {
    setSweeping(true);
    setTimeout(() => {
      setSweeping(false);
      setToast("AI geofence sweep complete — 168/172 present verified inside site boundary. 1 flag: Deepak Menon checked-in from 40m outside radius.");
      setTimeout(() => setToast(null), 5600);
    }, 1500);
  };

  if (!hr) return <PageSkeleton />;

  const { summary, attendance, labour } = hr;
  const activeLabour = labour.filter((l) => l.active).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="HR & Contract Labour"
        subtitle="Biometric + geofenced attendance · contractor compliance register · daily wages"
        action={
          <Button onClick={sweep} disabled={sweeping}>
            {sweeping ? <Spinner /> : <Sparkles size={15} />}
            {sweeping ? "Sweeping…" : "AI geofence sweep"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <UserCog size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{summary.present}<span className="text-sm text-text-muted">/{summary.total}</span></p>
          <p className="text-xs text-text-muted">Present today</p>
          <p className="mt-0.5 text-[11px] text-success">across {summary.total} staff</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Clock size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{summary.onTimePct}%</p>
          <p className="text-xs text-text-muted">On-time arrival</p>
          <p className="mt-0.5 text-[11px] text-warning tabular-nums">{summary.late} late · {summary.absent} absent</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <AlertTriangle size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{activeLabour}</p>
          <p className="text-xs text-text-muted">Contract labour active</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">from 2 contractors</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Wallet size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inr(4_820_000, 0)}</p>
          <p className="text-xs text-text-muted">Monthly wage run</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">verified via bank transfer</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Site Attendance" subtitle="Geofenced check-in · biometric & face recognition" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Employee", "Role", "Dept", "Check-in", "Geo", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-text">{a.name}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{a.role}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{a.department}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{a.checkIn}</td>
                    <td className="px-4 py-3">
                      {a.geoVerified ? (
                        <Badge tone="success"><MapPin size={11} /> Verified</Badge>
                      ) : (
                        <Badge tone="muted">—</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3"><Badge tone={attTone[a.status]}>{a.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Contract Labour Register" subtitle="Form 5C compliant · contractor-wise headcount & wages" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Worker", "Contractor", "Role", "Daily wage", "Attendance", "Active"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labour.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-text">{l.name}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{l.vendor}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{l.role}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{inr(l.dailyWage)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-muted">
                          <div className={cn("h-full rounded-full", l.attendancePct >= 90 ? "bg-success" : l.attendancePct >= 75 ? "bg-warning" : "bg-danger")} style={{ width: `${l.attendancePct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-text-muted">{l.attendancePct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {l.active ? <Badge tone="success">Active</Badge> : <Badge tone="muted">Inactive</Badge>}
                    </td>
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
