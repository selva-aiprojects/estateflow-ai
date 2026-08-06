"use client";

import { createContext, useCallback, useContext } from "react";
import { PLANS, type Plan, type Segment, type Tenant } from "@/lib/data";
import { apiSend, useApiData } from "@/lib/api-client";
import { PageSkeleton } from "@/components/loading";
import type { TenantPayload } from "@/lib/repo";

interface TenantContextValue {
  tenant: Tenant;
  plan: Plan;
  segments: Segment[];
  tenants: Tenant[];
  plans: Plan[];
  has: (segment: Segment) => boolean;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useApiData<TenantPayload>("/api/tenant");

  const setTenantId = useCallback(
    (id: string) => {
      setPayload((prev) => {
        if (!prev) return prev;
        const tenant = prev.tenants.find((t) => t.id === id);
        if (!tenant) return prev;
        const plan = PLANS.find((p) => p.id === tenant.planId) ?? PLANS[0];
        return { tenant, plan, plans: PLANS, tenants: prev.tenants };
      });
      apiSend("/api/tenant", { method: "POST", body: JSON.stringify({ tenantId: id }) }).catch(() => {});
    },
    [setPayload],
  );

  const has = useCallback((segment: Segment) => payload?.plan.segments.includes(segment) ?? false, [payload]);

  if (!payload) return <PageSkeleton />;

  return (
    <TenantContext.Provider
      value={{
        tenant: payload.tenant,
        plan: payload.plan,
        segments: payload.plan.segments,
        tenants: payload.tenants,
        plans: payload.plans,
        has,
        setTenantId,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return ctx;
}
