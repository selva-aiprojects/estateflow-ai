"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Mail,
  Plus,
  RefreshCw,
  Sparkles,
  Lock,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import type { Plan } from "@/lib/data";

interface AdminTenant {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  schema: string;
  shortCode: string | null;
  status: string;
  planId: string;
  segments: string[];
  createdAt: string;
}

interface AdminPayload {
  tenants: AdminTenant[];
  plans: Plan[];
  outbox: Record<string, number>;
}

const formDefaults = {
  name: "",
  code: "",
  subdomain: "",
  adminEmail: "",
  adminName: "",
  planId: "plan-enterprise",
};

export default function AdminPage() {
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [denied, setDenied] = useState(false);
  const [form, setForm] = useState(formDefaults);
  const [segments, setSegments] = useState<("land" | "apartments")[]>(["land", "apartments"]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const load = () => {
    apiGet<AdminPayload>("/api/admin/tenants")
      .then(setPayload)
      .catch(() => setDenied(true));
  };

  useEffect(load, []);

  const toggleSegment = (s: "land" | "apartments") =>
    setSegments((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const dbSchema = form.code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const res = await apiSend<{ tenantId: string; schema: string }>("/api/admin/tenants", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          dbSchema,
          subdomain: form.subdomain || `${form.code}.estateflow.in`,
          planId: form.planId,
          segments,
          adminEmail: form.adminEmail,
          adminName: form.adminName || "Workspace Admin",
        }),
      });
      setNotice({
        tone: "success",
        text: `Workspace provisioned. Schema "${res.schema}" created and a welcome-kit email is queued for ${form.adminEmail}.`,
      });
      setForm(formDefaults);
      setPayload(null);
      setDenied(false);
      load();
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Provisioning failed." });
    } finally {
      setBusy(false);
    }
  };

  const resend = async (code: string) => {
    setSending(code);
    setNotice(null);
    try {
      await apiSend("/api/admin/tenants", { method: "PUT", body: JSON.stringify({ code }) });
      setNotice({ tone: "success", text: `Welcome kit re-queued for ${code}.` });
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Failed to re-queue." });
    } finally {
      setSending(null);
    }
  };

  const planById = (id: string) => payload?.plans.find((p) => p.id === id);

  if (denied) {
    return (
      <Card className="mx-auto mt-8 flex max-w-xl flex-col items-center p-10 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ShieldCheck size={24} />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-text">Nexus Admin access required</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
          Tenant provisioning is a platform-level capability. Sign in with the Nexus Admin account (
          <b className="text-text">nexus@estateflow.in</b>) to manage workspaces, plans and email communications.
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/login")}>
          Go to sign in
        </Button>
      </Card>
    );
  }

  if (!payload) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tenant Management" subtitle="Loading control plane…" />
        <Card className="space-y-4 p-6">
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Management"
        subtitle="Provision workspaces, manage plans and monitor email communications (Nexus Admin)."
      />

      {notice && (
        <p
          role="status"
          className={cn(
            "rounded-md border px-4 py-3 text-sm",
            notice.tone === "success" ? "border-success/20 bg-success-soft text-success" : "border-danger/20 bg-danger-soft text-danger",
          )}
        >
          {notice.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Plus size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Provision a workspace</h2>
              <p className="text-xs text-text-muted">Registry row + physical schema + welcome email</p>
            </div>
          </div>

          <form onSubmit={create} className="space-y-4 p-5">
            <Input label="Company / workspace name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Emerald Estates" />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Code (slug)"
                value={form.code}
                onChange={(v) => setForm({ ...form, code: v })}
                placeholder="emerald"
                hint="Used for schema + subdomain"
              />
              <Input label="Subdomain" value={form.subdomain} onChange={(v) => setForm({ ...form, subdomain: v })} placeholder="emerald.estateflow.in" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Admin name" value={form.adminName} onChange={(v) => setForm({ ...form, adminName: v })} placeholder="A. Manager" />
              <Input label="Admin email" value={form.adminEmail} onChange={(v) => setForm({ ...form, adminEmail: v })} placeholder="admin@emerald.in" />
            </div>

            <Select
              label="Plan"
              value={form.planId}
              onChange={(v) => setForm({ ...form, planId: v })}
              options={payload.plans.map((p) => ({ value: p.id, label: `${p.name} — ${p.price}` }))}
            />

            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-text-muted">Segments</legend>
              <div className="flex gap-2">
                {(["land", "apartments"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSegment(s)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md border px-3 py-2 text-xs font-medium capitalize transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      segments.includes(s)
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <Button type="submit" disabled={busy || !form.name || !form.code || !form.adminEmail || segments.length === 0} className="w-full">
              {busy ? "Provisioning…" : "Create workspace & send welcome kit"}
              {!busy && <Sparkles size={14} />}
            </Button>
            <p className="text-[11px] leading-relaxed text-text-subtle">
              Creates <code className="rounded bg-surface-muted px-1">public.tenants</code> row, the tenant schema (DDL
              template), an admin account with temporary credentials, and queues the welcome-kit email via Resend.
            </p>
          </form>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Workspaces", value: String(payload.tenants.length), icon: Building2 },
              { label: "Queued emails", value: String(payload.outbox["queued"] ?? 0), icon: Mail },
              { label: "Sent emails", value: String(payload.outbox["sent"] ?? 0), icon: Mail },
              { label: "Failed", value: String(payload.outbox["failed"] ?? 0), icon: Lock },
            ].map((s) => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center gap-2 text-text-muted">
                  <s.icon size={14} />
                  <span className="text-xs">{s.label}</span>
                </div>
                <p className="mt-1.5 text-2xl font-semibold text-text tabular-nums">{s.value}</p>
              </Card>
            ))}
          </div>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-text">Workspaces</h2>
                <p className="text-xs text-text-muted">Registry is DB-backed · switcher reads public.tenants</p>
              </div>
              <Button size="sm" variant="secondary" onClick={load}>
                <RefreshCw size={13} />
                Refresh
              </Button>
            </div>

            {payload.tenants.length === 0 ? (
              <EmptyState icon={<Building2 size={22} />} title="No workspaces yet" hint="Provision the first tenant to get started." />
            ) : (
              <ul className="divide-y divide-border">
                {payload.tenants.map((t) => {
                  const plan = planById(t.planId);
                  return (
                    <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                        {t.shortCode ?? t.code.slice(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-text">{t.name}</p>
                          <Badge tone={t.status === "active" ? "success" : "muted"}>{t.status}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-text-muted">
                          {t.code} · schema <code className="rounded bg-surface-muted px-1">{t.schema}</code> · {t.subdomain}
                        </p>
                      </div>
                      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs font-medium text-text">{plan?.name ?? t.planId}</span>
                        <span className="text-[11px] text-text-subtle">{t.segments.join(" + ")}</span>
                      </div>
                      <Button size="sm" variant="secondary" disabled={sending === t.code} onClick={() => resend(t.code)}>
                        {sending === t.code ? "Sending…" : "Resend kit"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
