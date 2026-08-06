"use client";

import { createContext, useCallback, useContext } from "react";
import { tenants as seedTenants, PLANS, type Plan, type Segment, type Tenant } from "@/lib/data";
import { apiSend, useApiData } from "@/lib/api-client";
import type { TenantPayload } from "@/lib/mock-store";

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
  const [payload, setPayload] = useApiData<TenantPayload>("/api/tenant", {
    tenant: seedTenants[0],
    plan: PLANS[0],
    plans: PLANS,
    tenants: seedTenants,
  });

  const setTenantId = useCallback(
    (id: string) => {
      const tenant = payload.tenants.find((t) => t.id === id);
      if (!tenant) return;
      const plan = PLANS.find((p) => p.id === tenant.planId) ?? PLANS[0];
      setPayload({ tenant, plan, plans: PLANS, tenants: payload.tenants });
      apiSend("/api/tenant", { method: "POST", body: JSON.stringify({ tenantId: id }) }).catch(() => {});
    },
    [payload.tenants, setPayload],
  );

  const has = useCallback((segment: Segment) => payload.plan.segments.includes(segment), [payload.plan]);

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
