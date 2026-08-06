import {
  projects as seedProjects,
  leads as seedLeads,
  quotes as seedQuotes,
  executiveKpis as seedKpis,
  landKpis as seedLandKpis,
  cashFlowData as seedCashFlow,
  salesVelocity as seedVelocity,
  milestones as seedMilestones,
  dprRows as seedDpr,
  financeRecon as seedRecon,
  reconciliationSummary as seedReconSummary,
  aiAgentChat as seedAiChat,
  notifications as seedNotifications,
  unitStatusMeta,
  landParcels as seedLandParcels,
  plotLayouts as seedPlotLayouts,
  landStatusMeta,
  titleStatusMeta,
  computeLandSummary,
  PLANS,
  tenants as seedTenants,
  type Segment,
  type Plan,
  type Tenant,
  type LandParcel,
  type LandStatus,
  type Plot,
  type PlotLayout,
  type Unit,
  type UnitStatus,
  type Lead,
  type LeadStatus,
  type Quote,
  type Milestone,
} from "@/lib/data";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

interface ReconRow {
  ref: string;
  date: string;
  desc: string;
  amount: number;
  type: "in" | "out";
  matched: boolean;
  confidence: number;
}

export interface DashboardPayload {
  kpis: typeof seedKpis;
  landKpis: typeof seedLandKpis;
  cashFlow: typeof seedCashFlow;
  salesVelocity: typeof seedVelocity;
  notifications: typeof seedNotifications;
  unitMix: { label: string; value: number; color: string }[];
  landMix: { label: string; value: number; color: string }[];
  landSummary: ReturnType<typeof computeLandSummary>;
}

export interface InventoryPayload {
  projects: typeof seedProjects;
  unitStatusMeta: typeof unitStatusMeta;
}

export interface LandPayload {
  parcels: LandParcel[];
  layouts: PlotLayout[];
  landStatusMeta: typeof landStatusMeta;
  titleStatusMeta: typeof titleStatusMeta;
  summary: ReturnType<typeof computeLandSummary>;
}

export interface ConstructionPayload {
  milestones: Milestone[];
  dprRows: typeof seedDpr;
  towerStats: { tower: string; progress: number; lab: number; concrete: string; lag: string }[];
}

export interface FinancePayload {
  recon: ReconRow[];
  summary: typeof seedReconSummary;
  cashFlow: typeof seedCashFlow;
  salesVelocity: typeof seedVelocity;
}

export interface PortalPayload {
  milestones: Milestone[];
  unit: { no: string; project: string; type: string; sqft: number; floor: string; price: number };
  instalments: {
    id: string;
    name: string;
    due: string;
    amount: number;
    paid: boolean;
    paidOn: string;
  }[];
  docs: { name: string; tag: string }[];
}

// ---------------------------------------------------------------------------
// In-memory database (demo baseline). State resets on process restart.
// ---------------------------------------------------------------------------
const db = {
  projects: deepClone(seedProjects),
  leads: deepClone(seedLeads),
  quotes: deepClone(seedQuotes),
  recon: deepClone(seedRecon) as ReconRow[],
  reconSummary: deepClone(seedReconSummary),
  notifications: deepClone(seedNotifications),
  aiChat: deepClone(seedAiChat) as { from: "user" | "ai"; text: string }[],
  landParcels: deepClone(seedLandParcels) as LandParcel[],
  plotLayouts: deepClone(seedPlotLayouts) as PlotLayout[],
  tenants: deepClone(seedTenants) as Tenant[],
  quoteSeq: 874,
};

let leadSeq = 1043;
let currentTenantId = "builder-a";
let unitLocked: Record<string, { heldBy: string; expiresAt: number }> = {};
let landLocked: Record<string, { heldBy: string; expiresAt: number }> = {};

function ensureDb() {
  (globalThis as unknown as { __estateflowDb?: typeof db }).__estateflowDb = db;
  return db;
}

function unitMix(): DashboardPayload["unitMix"] {
  const counts: Record<string, number> = {};
  ensureDb().projects.forEach((p) =>
    p.towers.forEach((t) =>
      t.units.forEach((u) => {
        counts[u.status] = (counts[u.status] ?? 0) + 1;
      }),
    ),
  );
  return [
    { label: unitStatusMeta.available.label, value: counts.available ?? 0, color: unitStatusMeta.available.color },
    { label: unitStatusMeta.blocked.label, value: counts.blocked ?? 0, color: unitStatusMeta.blocked.color },
    { label: unitStatusMeta.token_paid.label, value: counts.token_paid ?? 0, color: unitStatusMeta.token_paid.color },
    { label: unitStatusMeta.sold.label, value: counts.sold ?? 0, color: unitStatusMeta.sold.color },
  ];
}

function currentTenant(): Tenant {
  return ensureDb().tenants.find((t) => t.id === currentTenantId) ?? ensureDb().tenants[0];
}

function currentPlan(): Plan {
  return PLANS.find((p) => p.id === currentTenant().planId) ?? PLANS[0];
}

function currentSegments(): Segment[] {
  return currentPlan().segments;
}

function landMix(): DashboardPayload["landMix"] {
  const counts: Record<string, number> = {};
  ensureDb().landParcels.forEach((p) => {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  });
  return [
    { label: landStatusMeta.available.label, value: counts.available ?? 0, color: landStatusMeta.available.color },
    { label: landStatusMeta.hold.label, value: counts.hold ?? 0, color: landStatusMeta.hold.color },
    { label: landStatusMeta.token_paid.label, value: counts.token_paid ?? 0, color: landStatusMeta.token_paid.color },
    { label: landStatusMeta.registered.label, value: counts.registered ?? 0, color: landStatusMeta.registered.color },
    { label: landStatusMeta.sold.label, value: counts.sold ?? 0, color: landStatusMeta.sold.color },
  ];
}

function towerStats() {
  const byTower: Record<string, { progress: number; labour: number; concrete: number }> = {};
  ensureDb().projects.forEach((p) =>
    p.towers.forEach((t) => {
      const report = seedDpr.find((d) => d.tower === t.code.replace("T", ""));
      byTower[t.code] = {
        progress: report?.progress ?? 0,
        labour: report?.labour ?? 0,
        concrete: report?.concreteCum ?? 0,
      };
    }),
  );
  return Object.entries(byTower).map(([tower, v]) => ({
    tower,
    progress: v.progress,
    lab: v.labour,
    concrete: `${v.concrete} m³`,
    lag: tower === "T1" ? "2 days ahead" : "0 days ahead",
  }));
}

function portalData(): PortalPayload {
  return {
    milestones: deepClone(seedMilestones),
    unit: {
      no: "T1-03-A",
      project: "Elevate Residences",
      type: "3BHK",
      sqft: 1650,
      floor: "Level 3 · Tower 1",
      price: 13400000,
    },
    instalments: [
      { id: "i1", name: "Booking amount", due: "2026-08-12", amount: 200000, paid: true, paidOn: "2026-08-06" },
      { id: "i2", name: "15% — Agreement value", due: "2026-09-15", amount: 2010000, paid: false, paidOn: "" },
      { id: "i3", name: "20% — Structure up to L5", due: "2026-12-01", amount: 2680000, paid: false, paidOn: "" },
      { id: "i4", name: "20% — Slab cast milestone", due: "2027-04-15", amount: 2680000, paid: false, paidOn: "" },
      { id: "i5", name: "Balance — Possession", due: "2028-01-20", amount: 5900000, paid: false, paidOn: "" },
    ],
    docs: [
      { name: "Agreement for Sale (draft)", tag: "For signing" },
      { name: "Payment schedule & Annexure", tag: "Ready" },
      { name: "RERA registration certificate", tag: "Verified" },
      { name: "Allotment letter", tag: "Signed" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Query API
// ---------------------------------------------------------------------------
export function getDashboard(): DashboardPayload {
  const parcels = ensureDb().landParcels;
  return {
    kpis: deepClone(seedKpis),
    landKpis: deepClone(seedLandKpis),
    cashFlow: deepClone(seedCashFlow),
    salesVelocity: deepClone(seedVelocity),
    notifications: deepClone(ensureDb().notifications),
    unitMix: unitMix(),
    landMix: landMix(),
    landSummary: computeLandSummary(parcels),
  };
}

export function getNotifications() {
  return deepClone(ensureDb().notifications);
}

export interface TenantPayload {
  tenant: Tenant;
  plan: Plan;
  plans: Plan[];
  tenants: Tenant[];
}

export function getTenantData(): TenantPayload {
  const tenant = currentTenant();
  const plan = currentPlan();
  return {
    tenant: deepClone(tenant),
    plan: deepClone(plan),
    plans: deepClone(PLANS),
    tenants: deepClone(ensureDb().tenants),
  };
}

export function setTenant(tenantId: string): Tenant | null {
  const tenant = ensureDb().tenants.find((t) => t.id === tenantId);
  if (!tenant) return null;
  currentTenantId = tenantId;
  return deepClone(tenant);
}

export function getLand(): LandPayload {
  const parcels = ensureDb().landParcels;
  return {
    parcels: deepClone(parcels),
    layouts: deepClone(ensureDb().plotLayouts),
    landStatusMeta,
    titleStatusMeta,
    summary: computeLandSummary(parcels),
  };
}

export function getInventory(): InventoryPayload {
  return { projects: deepClone(ensureDb().projects), unitStatusMeta };
}

export function getLeads(): Lead[] {
  return deepClone(ensureDb().leads);
}

export function getQuotes(): Quote[] {
  return deepClone(ensureDb().quotes);
}

export function getConstruction(): ConstructionPayload {
  return { milestones: deepClone(seedMilestones), dprRows: deepClone(seedDpr), towerStats: towerStats() };
}

export function getFinance(): FinancePayload {
  return {
    recon: deepClone(ensureDb().recon),
    summary: deepClone(ensureDb().reconSummary),
    cashFlow: deepClone(seedCashFlow),
    salesVelocity: deepClone(seedVelocity),
  };
}

export function getPortal(): PortalPayload {
  return portalData();
}

export function getAiChat() {
  return deepClone(ensureDb().aiChat);
}

// ---------------------------------------------------------------------------
// Command API
// ---------------------------------------------------------------------------
export function updateUnitStatus(unitId: string, status: UnitStatus): Unit | null {
  for (const p of ensureDb().projects) {
    for (const t of p.towers) {
      const unit = t.units.find((u) => u.id === unitId);
      if (unit) {
        unit.status = status;
        return deepClone(unit);
      }
    }
  }
  return null;
}

export function updateLeadStatus(leadId: string, status: LeadStatus): Lead | null {
  const lead = ensureDb().leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.status = status;
  return deepClone(lead);
}

export function assignLead(leadId: string, salesExecutive: string): Lead | null {
  const lead = ensureDb().leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.assigned = salesExecutive;
  return deepClone(lead);
}

export function createLead(input: Partial<Lead>): Lead {
  const lead: Lead = {
    id: `L-${leadSeq++}`,
    name: input.name ?? "New Lead",
    phone: input.phone ?? "",
    source: input.source ?? "whatsapp",
    project: input.project ?? "Elevate Residences",
    unitType: input.unitType ?? "3BHK",
    budget: input.budget ?? 0,
    score: input.score ?? 50,
    status: input.status ?? "new",
    assigned: input.assigned ?? "Unassigned",
    aiEngaged: input.aiEngaged ?? true,
    segment: input.segment ?? "apartments",
    createdAt: new Date().toISOString(),
  };
  ensureDb().leads.unshift(lead);
  return deepClone(lead);
}

export function createQuote(input: {
  customer: string;
  projectId?: string;
  unitId?: string;
  segment?: Segment;
  landId?: string;
  landKind?: "parcel" | "plot";
  discountPct: number;
  salesExecutive?: string;
}): { quote: Quote; needsApproval: boolean } | null {
  const discountPct = input.discountPct;
  const needsApproval = discountPct > 5;
  let project = "";
  let unitLabel = "";
  let base = 0;

  if (input.segment === "land" && input.landId) {
    const parcel = ensureDb().landParcels.find((p) => p.id === input.landId);
    if (parcel) {
      project = `Land · ${parcel.village}`;
      unitLabel = parcel.code;
      base = parcel.acres * parcel.ratePerAcre;
    } else {
      const plot = ensureDb().plotLayouts.flatMap((l) => l.plots).find((p) => p.id === input.landId);
      if (plot) {
        project = "Verdant Layout";
        unitLabel = plot.no;
        base = plot.price;
      }
    }
  } else {
    const proj = ensureDb().projects.find((p) => p.id === input.projectId);
    const unit = proj?.towers.flatMap((t) => t.units).find((u) => u.id === input.unitId);
    if (!proj || !unit) return null;
    project = proj.name;
    unitLabel = unit.no;
    base = unit.price;
  }

  if (!base) return null;

  const quote: Quote = {
    id: `q-${Date.now()}`,
    quoteNo: `QT-2026-${ensureDb().quoteSeq++}`,
    customer: input.customer || "New Customer",
    project,
    unit: unitLabel,
    base,
    discountPct,
    total: Math.round(base - (base * discountPct) / 100),
    status: needsApproval ? "pending_approval" : "draft",
    salesExecutive: input.salesExecutive ?? "Arjun Nair",
    segment: input.segment ?? "apartments",
    createdAt: new Date().toISOString(),
  };
  ensureDb().quotes.unshift(quote);
  return { quote: deepClone(quote), needsApproval };
}

export function updateLandStatus(landId: string, status: LandStatus): LandParcel | Plot | null {
  const parcel = ensureDb().landParcels.find((p) => p.id === landId);
  if (parcel) {
    parcel.status = status;
    return deepClone(parcel);
  }
  for (const layout of ensureDb().plotLayouts) {
    const plot = layout.plots.find((p) => p.id === landId);
    if (plot) {
      plot.status = status === "sold" || status === "token_paid" || status === "hold" || status === "available"
        ? (status as UnitStatus)
        : plot.status;
      return deepClone(plot);
    }
  }
  return null;
}

export function decideQuote(quoteId: string, approve: boolean): Quote | null {
  const quote = ensureDb().quotes.find((q) => q.id === quoteId);
  if (!quote) return null;
  quote.status = approve ? "approved" : "cancelled";
  return deepClone(quote);
}

export function autoMatchRecon(ref: string, description?: string): ReconRow | null {
  const row = ensureDb().recon.find((r) => r.ref === ref);
  if (!row) return null;
  row.matched = true;
  row.confidence = 97.1;
  if (description) row.desc = description;
  const summary = ensureDb().reconSummary;
  summary.matched += 1;
  summary.pending = Math.max(0, summary.pending - 1);
  summary.matchRate = Math.round((summary.matched / summary.total) * 1000) / 10;
  return deepClone(row);
}

export function addAiMessage(message: { from: "user" | "ai"; text: string }) {
  ensureDb().aiChat.push(message);
  return deepClone(message);
}

export function lockUnit(unitId: string, heldBy: string, ttlMinutes = 15): { locked: boolean; expiresAt: number } {
  const existing = unitLocked[unitId];
  const now = Date.now();
  if (existing && existing.expiresAt > now) {
    return { locked: false, expiresAt: existing.expiresAt };
  }
  const expiresAt = now + ttlMinutes * 60 * 1000;
  unitLocked[unitId] = { heldBy, expiresAt };
  return { locked: true, expiresAt };
}

export function lockLand(landId: string, heldBy: string, ttlMinutes = 15): { locked: boolean; expiresAt: number } {
  const existing = landLocked[landId];
  const now = Date.now();
  if (existing && existing.expiresAt > now) {
    return { locked: false, expiresAt: existing.expiresAt };
  }
  const expiresAt = now + ttlMinutes * 60 * 1000;
  landLocked[landId] = { heldBy, expiresAt };
  return { locked: true, expiresAt };
}
