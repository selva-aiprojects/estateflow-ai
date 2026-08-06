"use client";

import { useState } from "react";
import { Store, Handshake, BadgePercent, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { partnerCategoryMeta, type MarketplaceDeal, type MarketplacePartner } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { inr, inrCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const dealTone: Record<MarketplaceDeal["stage"], "muted" | "info" | "primary" | "success"> = {
  matched: "muted",
  proposal: "info",
  converted: "primary",
  closed: "success",
};

interface MarketplacePayload {
  partners: MarketplacePartner[];
  deals: MarketplaceDeal[];
}

export function MarketplaceView() {
  const [marketplace] = useApiData<MarketplacePayload>("/api/marketplace");
  const [matching, setMatching] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const match = () => {
    setMatching(true);
    setTimeout(() => {
      setMatching(false);
      setToast("AI match engine paired Aditya Joshi (3BHK, pre-approved ₹1.2 Cr) with Axis Home Loans — match score 96%. Proposal emailed to both parties.");
      setTimeout(() => setToast(null), 5600);
    }, 1500);
  };

  if (!marketplace) return <PageSkeleton />;

  const { partners, deals } = marketplace;
  const verified = partners.filter((p) => p.verified).length;
  const commissionPipeline = deals.reduce((s, d) => s + d.commission, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Integrated Marketplace"
        subtitle="Verified home-loan, interiors, legal & moving partners · commission-led revenue"
        action={
          <Button onClick={match} disabled={matching}>
            {matching ? <Spinner /> : <Sparkles size={15} />}
            {matching ? "Matching…" : "AI match deal"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Store size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{verified}<span className="text-sm text-text-muted">/{partners.length}</span></p>
          <p className="text-xs text-text-muted">Verified partners</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">KYC + GST checked</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Handshake size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{deals.length}</p>
          <p className="text-xs text-text-muted">Active deals</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">1 new this week</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <BadgePercent size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{inrCompact(commissionPipeline)}</p>
          <p className="text-xs text-text-muted">Commission pipeline</p>
          <p className="mt-0.5 text-[11px] text-success">+₹45K this month</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
            <Target size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">94</p>
          <p className="text-xs text-text-muted">Avg. AI match score</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">top deal 96%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title="Deal Pipeline" subtitle="AI-matched partners · commission auto-ledgered on conversion" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Customer", "Partner", "Category", "Commission", "Revenue", "AI Score", "Stage"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-medium text-text">{d.customer}</td>
                    <td className="px-4 py-3 text-text-muted">{d.partner}</td>
                    <td className="px-4 py-3"><Badge tone={partnerCategoryMeta[d.category].tone}>{partnerCategoryMeta[d.category].label}</Badge></td>
                    <td className="px-4 py-3 text-text tabular-nums font-medium">{inr(d.commission)}</td>
                    <td className="px-4 py-3 text-text-muted tabular-nums">{inrCompact(d.revenue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-muted">
                          <div className={cn("h-full rounded-full", d.aiScore >= 90 ? "bg-success" : d.aiScore >= 80 ? "bg-primary" : "bg-warning")} style={{ width: `${d.aiScore}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-text-muted">{d.aiScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge tone={dealTone[d.stage]}>{d.stage}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Partner Directory" subtitle="Rate card, SLA & conversion per category" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-left">
                  {["Partner", "Rating", "Deals", "Conv.", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{p.name}</p>
                      <p className="text-[11px] text-text-subtle">{partnerCategoryMeta[p.category].label} · {p.city}</p>
                    </td>
                    <td className="px-4 py-3 text-text tabular-nums">{p.rating}★</td>
                    <td className="px-4 py-3 text-text tabular-nums">{p.deals}</td>
                    <td className="px-4 py-3 text-text-muted tabular-nums">{p.conversion}%</td>
                    <td className="px-4 py-3">{p.verified ? <Badge tone="success"><CheckCircle2 size={11} /> Verified</Badge> : <Badge tone="warning">Pending</Badge>}</td>
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
