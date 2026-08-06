"use client";

import { useMemo, useState } from "react";
import { Bot, PhoneCall, Mail, MapPin, X, Wand2, CheckCircle2 } from "lucide-react";
import { leadStatusMeta, type Lead, type LeadStatus } from "@/lib/data";
import { useApiData, apiSend } from "@/lib/api-client";
import { inr, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Avatar, Badge, Button, Card, PageHeader, Spinner } from "@/components/ui";

const sourceMeta: Record<Lead["source"], { label: string; tone: "primary" | "info" | "success" | "warning" | "muted" }> = {
  facebook: { label: "Facebook Ads", tone: "info" },
  google_ads: { label: "Google Ads", tone: "warning" },
  whatsapp: { label: "WhatsApp", tone: "success" },
  ivr: { label: "IVR", tone: "muted" },
  referral: { label: "Referral", tone: "primary" },
};

const tabs: { id: LeadStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "site_visit_scheduled", label: "Visit Scheduled" },
  { id: "booking_initiated", label: "Booking" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

const scoreTone = (s: number) => (s >= 80 ? "success" : s >= 65 ? "warning" : "muted");

export function LeadsView() {
  const [leads, setLeads] = useApiData<Lead[]>("/api/leads");
  const [tab, setTab] = useState<LeadStatus | "all">("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [scoring, setScoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const runScoring = () => {
    setScoring(true);
    setTimeout(() => {
      setScoring(false);
      setToast("AI scoring complete — 10 leads re-ranked. Rohan Mehta promoted to top priority.");
      setTimeout(() => setToast(null), 4500);
    }, 1600);
  };

  const filtered = useMemo(() => (tab === "all" ? (leads ?? []) : (leads ?? []).filter((l) => l.status === tab)), [tab]);

  if (!leads) return <PageSkeleton />;

  const setStatus = (id: string, status: LeadStatus) => {
    setLeads((rows) => (rows ? rows.map((l) => (l.id === id ? { ...l, status } : l)) : rows));
    apiSend<Lead>(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  const assignLead = (l: Lead) => {
    const next = l.assigned === "Arjun Nair" ? "" : "Arjun Nair";
    const assign = (label: string) =>
      setLeads((rows) => (rows ? rows.map((x) => (x.id === l.id ? { ...x, assigned: label } : x)) : rows));
    assign(next);
    apiSend<Lead>(`/api/leads/${l.id}`, {
      method: "PATCH",
      body: JSON.stringify({ assigned: next || "Unassigned" }),
    })
      .then((updated) => setLeads((rows) => (rows ? rows.map((x) => (x.id === updated.id ? updated : x)) : rows)))
      .catch(() => {});
    if (next) {
      setTimeout(() => {
        setLeads((rows) => (rows ? rows.map((x) => (x.id === l.id ? { ...x, assigned: "Arjun Nair" } : x)) : rows));
      }, 800);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Lead Pipeline"
        subtitle="Facebook Ads · Google Ads · WhatsApp Business · IVR — ingested, scored, and routed by Temporal round-robin"
        action={
          <Button variant="secondary" onClick={runScoring} disabled={scoring}>
            {scoring ? <Spinner className="text-primary" /> : <Wand2 size={15} />}
            {scoring ? "Scoring…" : "Run AI scoring"}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const count = t.id === "all" ? leads.length : leads.filter((l) => l.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer",
                tab === t.id ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
              )}
            >
              {t.label}
              <span className={cn("tabular-nums", tab === t.id ? "text-white/80" : "text-text-subtle")}>{count}</span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-left">
                {["Lead", "Source", "Project", "Budget", "AI Score", "Status", "Assigned To", "Activity"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const assignedTo = l.assigned;
                return (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={l.name} size="sm" />
                        <div>
                          <p className="font-medium text-text">{l.name}</p>
                          <p className="text-xs text-text-subtle tabular-nums">{l.phone}</p>
                        </div>
                        <Badge tone={l.segment === "land" ? "success" : "primary"} className="ml-auto">{l.segment === "land" ? "Land" : "Home"}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={sourceMeta[l.source].tone}>{sourceMeta[l.source].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{l.project}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{inr(l.budget, 0)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={scoreTone(l.score) as "success" | "warning" | "muted"}>{l.score}%</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={leadStatusMeta[l.status].tone as "info" | "muted" | "primary" | "warning" | "success" | "danger"}>
                        {leadStatusMeta[l.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {l.aiEngaged && (
                          <span title="AI Sales Agent engaged" className="flex h-5 w-5 items-center justify-center rounded-full bg-success-soft text-success">
                            <Bot size={11} />
                          </span>
                        )}
                        <span className={cn("text-text-muted", assignedTo === "Unassigned" && "italic")}>{assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          assignLead(l);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer"
                      >
                        {assignedTo === "Arjun Nair" ? <CheckCircle2 size={12} className="text-success" /> : <Wand2 size={12} />}
                        {assignedTo === "Arjun Nair" ? "Assigned" : l.assigned ? "Reassign" : "Round-robin"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/30 p-0" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-surface shadow-lift animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 border-b border-border bg-surface px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} size="lg" />
                  <div>
                    <h3 className="text-base font-semibold text-text">{selected.name}</h3>
                    <p className="text-sm text-text-subtle tabular-nums">{selected.phone}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="rounded-md p-1.5 text-text-subtle hover:bg-surface-muted transition-colors cursor-pointer">
                  <X size={17} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={leadStatusMeta[selected.status].tone as "info" | "muted" | "primary" | "warning" | "success" | "danger"}>
                  {leadStatusMeta[selected.status].label}
                </Badge>
                <Badge tone={scoreTone(selected.score) as "success" | "warning" | "muted"}>Score {selected.score}%</Badge>
                {selected.aiEngaged && (
                  <Badge tone="success">
                    <Bot size={11} /> AI engaged
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Budget range</p>
                  <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{inr(selected.budget, 0)}</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Intent</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">{selected.unitType} @ {selected.project}</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Ingested</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">{formatDateTime(selected.createdAt)}</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Location intent</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">Whitefield / ORR</p>
                </div>
              </div>

              <div className="rounded-md border border-success/20 bg-success-soft/50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <Bot size={13} /> AI Sales Agent summary
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text">
                  {selected.name} qualifies on budget and timeline. Preferred tower T1. Interested in a site visit this weekend.
                </p>
              </div>

              <div className="rounded-md border border-border">
                <p className="border-b border-border px-3 py-2 text-xs font-medium text-text-muted">Next best actions</p>
                <ul className="space-y-1 p-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted/60">
                    <PhoneCall size={13} className="text-primary" /> Call back in 5 min (click-to-call)
                  </li>
                  <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted/60">
                    <Mail size={13} className="text-primary" /> Share payment plan PDF
                  </li>
                  <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted/60">
                    <MapPin size={13} className="text-primary" /> Schedule site visit — Sat 9 Aug
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setStatus(selected.id, "qualified")}>Move to Qualified</Button>
                <Button variant="secondary" onClick={() => setStatus(selected.id, "lost")}>Mark Lost</Button>
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
