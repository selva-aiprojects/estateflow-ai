"use client";

import { useState } from "react";
import { Scale, FileSignature, ShieldAlert, CalendarClock, Sparkles, CheckCircle2, Landmark, BookOpenCheck } from "lucide-react";
import { type LegalAgreement, type Litigation, type ReraRegistration, type ComplianceDue } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const agTone: Record<LegalAgreement["status"], "muted" | "warning" | "success" | "danger"> = {
  draft: "muted",
  pending_signature: "warning",
  executed: "success",
  cancelled: "danger",
};

const syncTone: Record<LegalAgreement["digilocker"], "muted" | "warning" | "success" | "danger"> = {
  not_synced: "muted",
  pending: "warning",
  syncing: "warning",
  synced: "success",
  failed: "danger",
};

const litTone: Record<Litigation["status"], "warning" | "muted" | "success"> = {
  active: "warning",
  closed: "muted",
  settled: "success",
};

interface LegalPayload {
  agreements: LegalAgreement[];
  rera: ReraRegistration[];
  litigations: Litigation[];
  compliance: ComplianceDue[];
}

export function LegalView() {
  const [legal] = useApiData<LegalPayload>("/api/legal");
  const [auditing, setAuditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const audit = () => {
    setAuditing(true);
    setTimeout(() => {
      setAuditing(false);
      setToast("Legal Agent audited 6 draft agreements. AFS-2026-0112 missing force majeure clause — suggested text added for counsel review.");
      setTimeout(() => setToast(null), 5600);
    }, 1500);
  };

  if (!legal) return <PageSkeleton />;

  const { agreements, rera, litigations, compliance } = legal;
  const pendingSignatures = agreements.filter((a) => a.status === "pending_signature").length;
  const activeLits = litigations.filter((l) => l.status === "active").length;
  const dueNow = compliance.filter((c) => c.status === "due").length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Legal & RERA Compliance"
        subtitle="Land titles · agreements · RERA quarterly disclosures · DigiLocker sync"
        action={
          <Button onClick={audit} disabled={auditing}>
            {auditing ? <Spinner /> : <Sparkles size={15} />}
            {auditing ? "Auditing…" : "AI clause audit"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <FileSignature size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{pendingSignatures}</p>
          <p className="text-xs text-text-muted">Pending signatures</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">esigned via Aadhaar OTP</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Landmark size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{rera.length}</p>
          <p className="text-xs text-text-muted">RERA registered</p>
          <p className="mt-0.5 text-[11px] text-success">both disclosures on track</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger">
            <ShieldAlert size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{activeLits}</p>
          <p className="text-xs text-text-muted">Active litigations</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">Attibele title on hold</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <CalendarClock size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{dueNow}</p>
          <p className="text-xs text-text-muted">Compliance due</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">next 14 days</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title="Agreements & Allotment Letters" subtitle="Automated draft → e-sign → DigiLocker archive" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Document", "Type", "Customer", "Asset", "e-Sign", "DigiLocker", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agreements.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-primary">{a.agreementNo}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{a.type}</td>
                    <td className="px-4 py-3 text-text">{a.customer}</td>
                    <td className="px-4 py-3 text-text-muted">{a.asset}</td>
                    <td className="px-4 py-3">{a.esign ? <Badge tone="success"><CheckCircle2 size={11} /> Enabled</Badge> : <Badge tone="muted">Manual</Badge>}</td>
                    <td className="px-4 py-3"><Badge tone={syncTone[a.digilocker]}>{a.digilocker.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={agTone[a.status]}>{a.status.replace("_", " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Compliance Calendar" subtitle="Mandatory filings & renewals" />
          <ul className="px-3 pb-3">
            {compliance.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-muted/60">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", c.status === "due" ? "bg-danger-soft text-danger" : c.status === "upcoming" ? "bg-warning-soft text-warning" : "bg-success-soft text-success")}>
                  <CalendarClock size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text">{c.label}</p>
                  <p className="truncate text-xs text-text-muted">{c.project} · {c.due}</p>
                </div>
                <Badge tone={c.status === "due" ? "danger" : c.status === "upcoming" ? "warning" : "success"}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="RERA Project Registrations" subtitle="Quarterly progress disclosures synced to the authority" action={<Badge tone="success"><BookOpenCheck size={11} /> Auto-sync</Badge>} />
          <div className="space-y-4 px-5 pb-5">
            {rera.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-surface-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text">{r.project}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-text-subtle">{r.regNo}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={r.status === "registered" ? "success" : "warning"}>{r.status.replace("_", " ")}</Badge>
                    <span className="text-[10px] text-text-subtle">valid till {r.validTo}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {r.disclosures.map((d) => (
                    <div key={d.quarter} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-[11px] font-medium text-text-muted">{d.quarter}</span>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div className={cn("h-full rounded-full", d.submitted ? "bg-success" : "bg-warning")} style={{ width: `${Math.max(d.progress, 6)}%` }} />
                      </div>
                      <span className="w-20 shrink-0 text-right text-[11px] tabular-nums text-text-muted">{d.progress}% · {d.submitted ? "submitted" : "draft"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Litigations & Title Review" subtitle="Legal Agent tracks case milestones" />
          <ul className="px-3 pb-3">
            {litigations.map((l) => (
              <li key={l.id} className="flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface-muted/60">
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", l.status === "active" ? "bg-danger-soft text-danger" : l.status === "settled" ? "bg-success-soft text-success" : "bg-surface-muted text-text-muted")}>
                  <Scale size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-text">{l.parcel} · <span className="font-mono text-text-subtle">{l.caseNo}</span></p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{l.summary}</p>
                  <p className="mt-1 text-[11px] text-text-subtle">{l.court} · next hearing {l.nextHearing}</p>
                </div>
                <Badge tone={litTone[l.status]} className="shrink-0">{l.status}</Badge>
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
