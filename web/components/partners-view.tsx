"use client";

import { useState } from "react";
import { Handshake, Users, Copy, Wallet, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";
import { type ChannelPartner, type CpDeal } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr, inrCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const tierTone: Record<ChannelPartner["tier"], "muted" | "warning" | "primary"> = {
  silver: "muted",
  gold: "warning",
  platinum: "primary",
};

const dealTone: Record<CpDeal["stage"], "muted" | "info" | "primary" | "success"> = {
  registered: "muted",
  verified: "info",
  converted: "primary",
  paid: "success",
};

interface PartnersPayload {
  partners: ChannelPartner[];
  deals: CpDeal[];
}

export function PartnersView() {
  const [partnersData] = useApiData<PartnersPayload>("/api/partners");
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const register = () => {
    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      setToast("AI deal registration OK — CPD-2026-043 logged for Ritu Jindal. Cross-checked 1,048 closed deals: no duplicate. Commission ₹3.52L estimated.");
      setTimeout(() => setToast(null), 5600);
    }, 1500);
  };

  if (!partnersData) return <PageSkeleton />;

  const { partners, deals } = partnersData;
  const payoutYtd = partners.reduce((s, p) => s + p.payoutYtd, 0);
  const duplicates = deals.filter((d) => d.duplicate).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Channel Partner Desk"
        subtitle="CP onboarding · deal registration with duplicate detection · commission ledger"
        action={
          <Button onClick={register} disabled={registering}>
            {registering ? <Spinner /> : <Sparkles size={15} />}
            {registering ? "Registering…" : "AI register deal"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Users size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{partners.length}</p>
          <p className="text-xs text-text-muted">Active channel partners</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">2 platinum · 2 gold</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
            <Handshake size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{deals.length}</p>
          <p className="text-xs text-text-muted">Deals in pipeline</p>
          <p className="mt-0.5 text-[11px] text-success">₹7.8 Cr deal value</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger">
            <Copy size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{duplicates}</p>
          <p className="text-xs text-text-muted">Duplicate flags</p>
          <p className="mt-0.5 text-[11px] text-danger">Suresh Patil · registered twice</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Wallet size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(payoutYtd)}</p>
          <p className="text-xs text-text-muted">Commission paid YTD</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">avg 1.0% per deal</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title="CP Deals" subtitle="Registration → verification → conversion → payout" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Deal", "Partner", "Customer", "Project", "Value", "Commission", "Stage"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className={cn("border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40", d.duplicate && "bg-danger-soft/30")}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 font-medium text-primary">
                        {d.dealNo}
                        {d.duplicate && <ShieldAlert size={12} className="text-danger" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{d.partner}</td>
                    <td className="px-4 py-3 text-text">{d.customer}</td>
                    <td className="px-4 py-3 text-text-muted">{d.project}</td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(d.value, 0)}</td>
                    <td className="px-4 py-3 text-text tabular-nums">{inr(d.commission, 0)}</td>
                    <td className="px-4 py-3"><Badge tone={dealTone[d.stage]}>{d.stage}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Partner Tiers" subtitle="Commission rate by tier · KYC & rating" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["CP", "Agency", "Tier", "Rate", "Deals", "Payout YTD"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{p.name}</p>
                      <p className="text-[11px] text-text-subtle">{p.rating}★ rating</p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{p.agency}</td>
                    <td className="px-4 py-3"><Badge tone={tierTone[p.tier]}>{p.tier}</Badge></td>
                    <td className="px-4 py-3 text-text tabular-nums">{p.commissionRate}%</td>
                    <td className="px-4 py-3 text-text tabular-nums">{p.dealsActive}</td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inrCompact(p.payoutYtd)}</td>
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
