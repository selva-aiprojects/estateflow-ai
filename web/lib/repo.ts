import { randomUUID } from "node:crypto";
import { q, qOne, qVal } from "@/lib/db";
import {
  PLANS,
  computeLandSummary,
  unitStatusMeta,
  landStatusMeta,
  titleStatusMeta,
  type Plan,
  type Segment,
  type Tenant,
  type Unit,
  type UnitStatus,
  type Project,
  type LandParcel,
  type LandStatus,
  type LandZoning,
  type TitleStatus,
  type Plot,
  type PlotLayout,
  type Lead,
  type LeadStatus,
  type Quote,
  type QuoteStatus,
  type Milestone,
  type Kpi,
  type Vendor,
  type Rfq,
  type PurchaseOrder,
  type Grn,
  type LegalAgreement,
  type ReraRegistration,
  type Litigation,
  type ComplianceDue,
  type AttendanceRow,
  type ContractLabourRow,
  type AmcContract,
  type VisitorEntry,
  type MaintenanceBill,
  type ServiceTicket,
  type Lease,
  type RentInvoice,
  type MarketplacePartner,
  type MarketplaceDeal,
  type ChannelPartner,
  type CpDeal,
  type PartnerTier,
  type AiAgent,
  type AiInsight,
  type AgentTask,
  type AgentKey,
  type SalesLead,
  type SalesLeadStage,
  type SalesLeadSource,
  type AmenityKind,
  type UnitAmenity,
  unitAmenities,
  type PortalUpdate,
  type PortalTicket,
  type PortalPossessionStep,
  type PortalSnag,
  type PortalReferral,
  type PortalReferralProgram,
  portalUpdates,
  portalTickets,
  portalPossessionSteps,
  portalSnags,
  portalReferralProgram,
  type PortalPhoto,
  portalPhotos,
  type PortalEvent,
  portalEvents,
  type PortalLoanPartner,
  portalLoanPartners,
  type PortalWarrantyDoc,
  portalWarrantyDocs,
  type PortalResaleListing,
  portalResaleListings,
  type PortalLoyalty,
  portalLoyalty,
  type PortalKyc,
  portalKyc,
  type PortalTaxSummary,
  portalTaxSummary,
  type PortalChatMessage,
  portalChatMessages,
} from "@/lib/data";

type DbRow = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown): string => (v == null ? "" : String(v));

const bool = (v: unknown): boolean => v === true || v === "true" || v === 1;

const dateStr = (v: unknown): string => (v == null || v === "" ? "" : new Date(v as string).toISOString().slice(0, 10));

const isoStr = (v: unknown): string => (v == null ? "" : new Date(v as string).toISOString());

const relTime = (v: unknown): string => {
  if (v == null) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(v as string).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const statusToStage: Record<string, string> = {
  new: "new",
  contacted: "qualified",
  qualified: "qualified",
  site_visit_scheduled: "visit_scheduled",
  booking_initiated: "booked",
  won: "won",
  lost: "lost",
};

const MONTH_SHORT = new Intl.DateTimeFormat("en", { month: "short" });

function quarterLabel(v: unknown): string {
  const d = new Date(`${dateStr(v)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
}

function severityTone(sev: string): AiInsight["tone"] {
  if (sev === "critical" || sev === "danger") return "danger";
  if (sev === "warning") return "warning";
  return "info";
}

function inferAgent(title: string): AgentKey {
  const t = title.toLowerCase();
  if (/lead|rank|ivr|booking|site visit/i.test(t)) return "sales";
  if (/cement|stock|material|plaster|dpr|floor|slab|tower/i.test(t)) return "construction";
  if (/recon|mt940|cash|demand|escrow/i.test(t)) return "finance";
  if (/rfq|vendor|quote|steel|facade|procurement/i.test(t)) return "procurement";
  if (/agreement|clause|afs|rera|litigation/i.test(t)) return "legal";
  if (/faq|whatsapp|concierge/i.test(t)) return "customer";
  return "sales";
}

const docTag = (title: string): string => {
  if (/draft/i.test(title)) return "For signing";
  if (/payment schedule/i.test(title)) return "Ready";
  if (/RERA/i.test(title)) return "Verified";
  return "Signed";
};

async function config<T>(key: string, fallback: T): Promise<T> {
  const row = await qOne<DbRow>(`SELECT value FROM app_config WHERE key = $1`, [key]);
  return (row?.value as T | undefined) ?? fallback;
}

async function userIdByName(name: string): Promise<string | undefined> {
  return qVal<string>(`SELECT id::text AS v FROM users WHERE display_name = $1 LIMIT 1`, [name]);
}

// ---------------------------------------------------------------------------
// Tenants (public schema) + TenantPayload
// ---------------------------------------------------------------------------

export interface TenantPayload {
  tenant: Tenant;
  plan: Plan;
  plans: Plan[];
  tenants: Tenant[];
}

let currentTenantCode = "builder-a";

interface TenantDbRow extends DbRow {
  code: string;
  short_code: string | null;
  name: string;
  subdomain: string;
  location: string | null;
  region: string | null;
  plan_id: string | null;
}

// The tenant registry (catalog + plan assignments) lives in public.tenants so
// that superadmin provisioning can add workspaces at runtime. The tenant
// schema (builder_a) holds that tenant's operational data.
async function fetchTenants(): Promise<Tenant[]> {
  const rows = await q<TenantDbRow>(
    `SELECT code, short_code, name, subdomain, location, region, plan_id
       FROM public.tenants
      WHERE status = 'active'
      ORDER BY created_at`,
  );
  return rows.map((r) => ({
    id: r.code,
    code: r.short_code ?? r.code.slice(0, 3).toUpperCase(),
    name: r.name,
    subdomain: r.subdomain,
    location: r.location ?? r.name,
    region: r.region ?? "ap-south-1",
    planId: r.plan_id ?? "plan-enterprise",
  }));
}

export async function getTenantData(): Promise<TenantPayload> {
  const tenants = await fetchTenants();
  const tenant = tenants.find((t) => t.id === currentTenantCode) ?? tenants[0];
  const plan = PLANS.find((p) => p.id === tenant.planId) ?? PLANS[0];
  return { tenant, plan, plans: PLANS, tenants };
}

export async function setTenant(tenantId: string): Promise<Tenant | null> {
  const tenants = await fetchTenants();
  const tenant = tenants.find((t) => t.id === tenantId);
  if (!tenant) return null;
  currentTenantCode = tenantId;
  return { ...tenant };
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardPayload {
  kpis: Kpi[];
  landKpis: Kpi[];
  cashFlow: { month: string; inflow: number; outflow: number }[];
  salesVelocity: { month: string; units: number }[];
  notifications: { id: string; title: string; body: string; time: string; tone: "info" | "warning" | "danger" }[];
  unitMix: { label: string; value: number; color: string }[];
  landMix: { label: string; value: number; color: string }[];
  landSummary: ReturnType<typeof computeLandSummary>;
}

async function fetchNotifications() {
  const rows = await q<DbRow>(`SELECT id, title, body, payload, created_at FROM notifications ORDER BY created_at DESC LIMIT 4`);
  return rows.map((r) => ({
    id: str(r.id),
    title: str(r.title),
    body: str(r.body),
    time: relTime(r.created_at),
    tone: ((r.payload as { tone?: string } | null)?.tone ?? "info") as "info" | "warning" | "danger",
  }));
}

async function fetchUnitLandMix(): Promise<{ unitMix: DashboardPayload["unitMix"]; landMix: DashboardPayload["landMix"] }> {
  const [unitCounts, landCounts] = await Promise.all([
    q<DbRow>(`SELECT status, COUNT(*)::int AS v FROM units GROUP BY status`),
    q<DbRow>(`SELECT status, COUNT(*)::int AS v FROM land_parcels GROUP BY status`),
  ]);
  const uc: Record<string, number> = {};
  for (const r of unitCounts) uc[str(r.status)] = num(r.v);
  const lc: Record<string, number> = {};
  for (const r of landCounts) lc[str(r.status)] = num(r.v);
  const unitMix = (["available", "blocked", "token_paid", "sold"] as UnitStatus[]).map((s) => ({
    label: unitStatusMeta[s].label,
    value: uc[s] ?? 0,
    color: unitStatusMeta[s].color,
  }));
  const landMix = (["available", "hold", "token_paid", "registered", "sold"] as LandStatus[]).map((s) => ({
    label: landStatusMeta[s].label,
    value: lc[s] ?? 0,
    color: landStatusMeta[s].color,
  }));
  return { unitMix, landMix };
}

export async function getDashboard(): Promise<DashboardPayload> {
  const [kpis, landKpis, cashFlow, salesVelocity, notifications, parcels, mix] = await Promise.all([
    config<Kpi[]>("kpis.executive", []),
    config<Kpi[]>("kpis.land", []),
    config<DashboardPayload["cashFlow"]>("analytics.cash_flow", []),
    config<DashboardPayload["salesVelocity"]>("analytics.sales_velocity", []),
    fetchNotifications(),
    fetchLandParcels(),
    fetchUnitLandMix(),
  ]);
  return {
    kpis,
    landKpis,
    cashFlow,
    salesVelocity,
    notifications,
    unitMix: mix.unitMix,
    landMix: mix.landMix,
    landSummary: computeLandSummary(parcels),
  };
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface InventoryPayload {
  projects: Project[];
  unitStatusMeta: typeof unitStatusMeta;
}

async function fetchReraMap(): Promise<Map<string, string>> {
  const rows = await q<DbRow>(`SELECT project_id, rera_reg_no FROM rera_project_registrations`);
  return new Map(rows.map((r) => [str(r.project_id), str(r.rera_reg_no)]));
}

const UNIT_JOIN = `
  FROM units u
  JOIN blocks b ON b.id = u.block_id
  JOIN floors f ON f.id = b.floor_id
  JOIN towers t ON t.id = f.tower_id
  JOIN projects pr ON pr.id = t.project_id`;

const UNIT_SELECT = `
  SELECT u.id AS unit_id, u.unit_no, u.unit_type, u.carpet_area_sqft, u.bsp_price, u.status,
         t.code AS tower_code, t.name AS tower_name, f.floor_no, b.code AS block_code,
         pr.id AS project_id, pr.code AS project_code, pr.name AS project_name, pr.location AS project_location`;

const mapUnitRow = (r: DbRow): Unit => ({
  id: str(r.unit_id),
  no: `${str(r.tower_code)}-${str(r.block_code)}-${str(r.unit_no)}`,
  type: str(r.unit_type),
  floor: num(r.floor_no),
  tower: str(r.tower_code),
  sqft: num(r.carpet_area_sqft),
  price: num(r.bsp_price),
  status: str(r.status) as UnitStatus,
});

interface TowerBucket {
  id: string;
  code: string;
  name: string;
  units: Unit[];
}

interface ProjectBucket {
  proj: Project;
  towers: Map<string, TowerBucket>;
}

export async function getInventory(): Promise<InventoryPayload> {
  const [rows, rera] = await Promise.all([
    q<DbRow>(`${UNIT_SELECT}${UNIT_JOIN} ORDER BY pr.code, t.code, f.floor_no, b.code, u.unit_no`),
    fetchReraMap(),
  ]);
  const projectsOut: Project[] = [];
  const byProject = new Map<string, ProjectBucket>();
  for (const r of rows) {
    const key = `${str(r.project_id)}`;
    let bucket = byProject.get(key);
    if (!bucket) {
      const proj: Project = {
        id: str(r.project_id),
        code: str(r.project_code),
        name: str(r.project_name),
        location: str(r.project_location),
        reraNo: rera.get(key) ?? "",
        towers: [],
      };
      bucket = { proj, towers: new Map() };
      byProject.set(key, bucket);
      projectsOut.push(proj);
    }
    const tkey = str(r.tower_code);
    let tower = bucket.towers.get(tkey);
    if (!tower) {
      tower = { id: tkey, code: tkey, name: str(r.tower_name), units: [] };
      bucket.towers.set(tkey, tower);
      bucket.proj.towers.push(tower);
    }
    tower.units.push(mapUnitRow(r));
  }
  return { projects: projectsOut, unitStatusMeta };
}

// ---------------------------------------------------------------------------
// Land
// ---------------------------------------------------------------------------

export interface LandPayload {
  parcels: LandParcel[];
  layouts: PlotLayout[];
  landStatusMeta: typeof landStatusMeta;
  titleStatusMeta: typeof titleStatusMeta;
  summary: ReturnType<typeof computeLandSummary>;
}

const LAND_PARCEL_SELECT = `
  SELECT id, code, name, village, district, state, survey_no, total_acres, total_guntas,
         rate_per_acre, zoning, title_status, seller, docs_count, status
  FROM land_parcels`;

async function mapParcelRow(r: DbRow, highlights: Record<string, string>): Promise<LandParcel> {
  return {
    id: str(r.id),
    code: str(r.code),
    name: str(r.name),
    village: str(r.village),
    district: str(r.district),
    state: str(r.state),
    surveyNo: str(r.survey_no),
    acres: num(r.total_acres),
    guntas: num(r.total_guntas),
    ratePerAcre: num(r.rate_per_acre),
    zoning: (str(r.zoning) || "NA_Residential") as LandZoning,
    titleStatus: (str(r.title_status) || "clear") as TitleStatus,
    status: str(r.status) as LandStatus,
    seller: str(r.seller),
    docsCount: num(r.docs_count),
    highlight: highlights[str(r.code)],
  };
}

async function fetchLandParcels(): Promise<LandParcel[]> {
  const [rows, highlights] = await Promise.all([
    q<DbRow>(`${LAND_PARCEL_SELECT} ORDER BY code`),
    config<Record<string, string>>("land.highlights", {}),
  ]);
  return Promise.all(rows.map((r) => mapParcelRow(r, highlights)));
}

async function fetchParcelById(id: string): Promise<LandParcel | null> {
  const [row, highlights] = await Promise.all([
    qOne<DbRow>(`${LAND_PARCEL_SELECT} WHERE id = $1`, [id]),
    config<Record<string, string>>("land.highlights", {}),
  ]);
  return row ? mapParcelRow(row, highlights) : null;
}

async function fetchPlotLayouts(): Promise<PlotLayout[]> {
  const rows = await q<DbRow>(`
    SELECT l.id AS layout_id, l.name AS layout_name,
           pt.id AS plot_id, pt.plot_no, pt.zone, pt.area_sqft, pt.price, pt.status
    FROM plot_layouts l
    JOIN plots pt ON pt.layout_id = l.id
    ORDER BY l.name, pt.plot_no`);
  const layouts: PlotLayout[] = [];
  const index = new Map<string, PlotLayout>();
  for (const r of rows) {
    const lid = str(r.layout_id);
    let layout = index.get(lid);
    if (!layout) {
      layout = { id: lid, code: str(r.layout_name), name: str(r.layout_name), plots: [] };
      index.set(lid, layout);
      layouts.push(layout);
    }
    layout.plots.push({
      id: str(r.plot_id),
      no: str(r.plot_no),
      zone: (str(r.zone) || "residential") as "residential" | "commercial" | "villa",
      sqft: num(r.area_sqft),
      price: num(r.price),
      status: str(r.status) as UnitStatus,
    });
  }
  return layouts;
}

export async function getLand(): Promise<LandPayload> {
  const [parcels, layouts] = await Promise.all([fetchLandParcels(), fetchPlotLayouts()]);
  return {
    parcels,
    layouts,
    landStatusMeta,
    titleStatusMeta,
    summary: computeLandSummary(parcels),
  };
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

const LEAD_SELECT = `
  SELECT l.id, l.name, l.phone, l.budget_max, l.score, l.status, l.sales_stage,
         l.location_intent, l.unit_type_interest, l.created_at, l.source_payload,
         ls.code AS source_code, u.display_name AS assigned_name
  FROM leads l
  LEFT JOIN lead_sources ls ON ls.id = l.lead_source_id
  LEFT JOIN users u ON u.id = l.assigned_to`;

function leadFromRow(r: DbRow): Lead {
  const seg = ((r.source_payload as { segment?: string } | null)?.segment) ?? "apartments";
  return {
    id: str(r.id),
    name: str(r.name),
    phone: str(r.phone),
    source: (str(r.source_code) || "whatsapp") as Lead["source"],
    project: str(r.location_intent),
    unitType: str(r.unit_type_interest),
    budget: num(r.budget_max),
    score: num(r.score),
    status: str(r.status) as LeadStatus,
    assigned: str(r.assigned_name) || "Unassigned",
    aiEngaged: true,
    segment: seg === "land" ? "land" : "apartments",
    createdAt: isoStr(r.created_at),
  };
}

function salesLeadFromRow(r: DbRow): SalesLead {
  const seg = ((r.source_payload as { segment?: string } | null)?.segment) ?? "apartments";
  const stage = str(r.sales_stage) || statusToStage[str(r.status)] || "new";
  return {
    id: str(r.id),
    name: str(r.name),
    phone: str(r.phone),
    source: (str(r.source_code) || "whatsapp") as SalesLeadSource,
    project: str(r.location_intent),
    unitType: str(r.unit_type_interest),
    budget: num(r.budget_max),
    score: num(r.score),
    stage: stage as SalesLeadStage,
    assigned: str(r.assigned_name) || "Unassigned",
    segment: seg === "land" ? "land" : "apartments",
    createdAt: isoStr(r.created_at),
  };
}

export async function getLeads(): Promise<Lead[]> {
  const rows = await q<DbRow>(
    `${LEAD_SELECT} WHERE l.score_reason->>'engine' IS NULL OR l.score_reason->>'engine' = 'crm' ORDER BY l.created_at DESC`,
  );
  return rows.map(leadFromRow);
}

export async function getSalesLeads(): Promise<SalesLead[]> {
  const rows = await q<DbRow>(
    `${LEAD_SELECT} WHERE l.score_reason->>'engine' = 'sales' ORDER BY l.created_at DESC`,
  );
  return rows.map(salesLeadFromRow);
}

async function fetchLeadById(id: string): Promise<Lead | null> {
  const row = await qOne<DbRow>(`${LEAD_SELECT} WHERE l.id = $1`, [id]);
  return row ? leadFromRow(row) : null;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead | null> {
  await q(
    `UPDATE leads SET status = $1, sales_stage = $2, updated_at = now() WHERE id = $3`,
    [status, statusToStage[status] ?? "new", leadId],
  );
  return fetchLeadById(leadId);
}

export async function assignLead(leadId: string, salesExecutive: string): Promise<Lead | null> {
  const execId = await userIdByName(salesExecutive);
  if (execId) {
    await q(`UPDATE leads SET assigned_to = $1, assigned_at = now(), updated_at = now() WHERE id = $2`, [execId, leadId]);
  }
  return fetchLeadById(leadId);
}

export async function createLead(input: Partial<Lead>): Promise<Lead> {
  const source = input.source ?? "whatsapp";
  const sourceId =
    (await qVal<string>(`SELECT id::text AS v FROM lead_sources WHERE code = $1`, [source])) ??
    (await qVal<string>(`SELECT id::text AS v FROM lead_sources WHERE code = 'whatsapp'`));
  const segment = input.segment === "land" ? "land" : "apartments";
  const status = (input.status ?? "new") as LeadStatus;
  const createdAt = new Date().toISOString();
  const id = randomUUID();
  await q(
    `INSERT INTO leads
       (id, lead_source_id, status, sales_stage, name, phone, budget_max, location_intent,
        unit_type_interest, score, score_reason, source_payload, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      sourceId,
      status,
      statusToStage[status] ?? "new",
      input.name ?? "New Lead",
      input.phone ?? "",
      input.budget ?? 0,
      input.project ?? "Elevate Residences",
      input.unitType ?? "3BHK",
      input.score ?? 50,
      JSON.stringify({ engine: "crm" }),
      JSON.stringify({ segment, source }),
      createdAt,
    ],
  );
  return {
    id,
    name: input.name ?? "New Lead",
    phone: input.phone ?? "",
    source: source as Lead["source"],
    project: input.project ?? "Elevate Residences",
    unitType: input.unitType ?? "3BHK",
    budget: input.budget ?? 0,
    score: input.score ?? 50,
    status,
    assigned: "Unassigned",
    aiEngaged: true,
    segment,
    createdAt,
  };
}

// ---------------------------------------------------------------------------
// Quotations
// ---------------------------------------------------------------------------

const QUOTE_SELECT = `
  SELECT q.id, q.quote_no, q.status, q.base_amount, q.discount_pct, q.total_amount, q.created_at,
         q.project_id, q.unit_id, q.land_parcel_id, q.plot_id,
         c.name AS customer, se.display_name AS exec_name,
         pr.name AS project_name, t.code AS tower_code, b.code AS block_code, u.unit_no,
         lp.code AS parcel_code, lp.village AS parcel_village, lp.name AS parcel_name,
         pt.plot_no AS plot_no, pl.name AS layout_name
  FROM quotations q
  JOIN customers c ON c.id = q.customer_id
  LEFT JOIN users se ON se.id = q.sales_executive
  LEFT JOIN projects pr ON pr.id = q.project_id
  LEFT JOIN units u ON u.id = q.unit_id
  LEFT JOIN blocks b ON b.id = u.block_id
  LEFT JOIN floors f ON f.id = b.floor_id
  LEFT JOIN towers t ON t.id = f.tower_id
  LEFT JOIN land_parcels lp ON lp.id = q.land_parcel_id
  LEFT JOIN plots pt ON pt.id = q.plot_id
  LEFT JOIN plot_layouts pl ON pl.id = pt.layout_id`;

function quoteFromRow(r: DbRow): Quote {
  const isLand = !!r.land_parcel_id || !!r.plot_id;
  let project = "";
  let unit = "";
  if (isLand) {
    if (r.parcel_code) {
      project = `Land · ${str(r.parcel_village)}`;
      unit = str(r.parcel_code);
    } else {
      project = str(r.layout_name);
      unit = str(r.plot_no);
    }
  } else {
    project = str(r.project_name);
    unit = `${str(r.tower_code)}-${str(r.block_code)}-${str(r.unit_no)}`;
  }
  return {
    id: str(r.id),
    quoteNo: str(r.quote_no),
    customer: str(r.customer),
    project,
    unit,
    base: num(r.base_amount),
    discountPct: num(r.discount_pct),
    total: num(r.total_amount),
    status: str(r.status) as QuoteStatus,
    salesExecutive: str(r.exec_name) || "Arjun Nair",
    segment: isLand ? "land" : "apartments",
    createdAt: isoStr(r.created_at),
  };
}

export async function getQuotes(): Promise<Quote[]> {
  const rows = await q<DbRow>(`${QUOTE_SELECT} ORDER BY q.created_at DESC`);
  return rows.map(quoteFromRow);
}

async function fetchQuoteById(id: string): Promise<Quote | null> {
  const row = await qOne<DbRow>(`${QUOTE_SELECT} WHERE q.id = $1`, [id]);
  return row ? quoteFromRow(row) : null;
}

async function nextQuoteNo(): Promise<string> {
  const max = await qVal<number>(
    `SELECT COALESCE(MAX(CAST(RIGHT(quote_no, 4) AS integer)), 873)::int AS v FROM quotations WHERE quote_no LIKE 'QT-2026-%'`,
  );
  return `QT-2026-${String((max ?? 873) + 1).padStart(4, "0")}`;
}

export async function createQuote(input: {
  customer: string;
  projectId?: string;
  unitId?: string;
  segment?: Segment;
  landId?: string;
  landKind?: "parcel" | "plot";
  discountPct: number;
  salesExecutive?: string;
}): Promise<{ quote: Quote; needsApproval: boolean } | null> {
  const discountPct = input.discountPct ?? 0;
  const needsApproval = discountPct > 5;
  const segment = input.segment === "land" ? "land" : "apartments";
  let project = "";
  let unitLabel = "";
  let base = 0;
  let projectId: string | null = null;
  let unitId: string | null = null;
  let parcelId: string | null = null;
  let plotId: string | null = null;

  if (segment === "land" && input.landId) {
    const parcel = await qOne<DbRow>(`SELECT id, code, village, total_acres, rate_per_acre FROM land_parcels WHERE id = $1`, [input.landId]);
    if (parcel) {
      project = `Land · ${str(parcel.village)}`;
      unitLabel = str(parcel.code);
      base = num(parcel.total_acres) * num(parcel.rate_per_acre);
      parcelId = str(parcel.id);
    } else {
      const plot = await qOne<DbRow>(
        `SELECT pt.id, pt.plot_no, pt.price, pl.name AS layout_name FROM plots pt JOIN plot_layouts pl ON pl.id = pt.layout_id WHERE pt.id = $1`,
        [input.landId],
      );
      if (plot) {
        project = str(plot.layout_name);
        unitLabel = str(plot.plot_no);
        base = num(plot.price);
        plotId = str(plot.id);
      }
    }
  } else if (input.projectId && input.unitId) {
    const row = await qOne<DbRow>(
      `SELECT pr.id AS project_id, pr.name AS project_name, u.id AS unit_id, u.unit_no, u.bsp_price,
              t.code AS tower_code, b.code AS block_code
       ${UNIT_JOIN} WHERE u.id = $1 AND pr.id = $2`,
      [input.unitId, input.projectId],
    );
    if (!row) return null;
    project = str(row.project_name);
    unitLabel = `${str(row.tower_code)}-${str(row.block_code)}-${str(row.unit_no)}`;
    base = num(row.bsp_price);
    projectId = str(row.project_id);
    unitId = str(row.unit_id);
  } else {
    return null;
  }
  if (!base) return null;

  const customerName = input.customer || "New Customer";
  let customerId = await qVal<string>(`SELECT id::text AS v FROM customers WHERE name = $1 LIMIT 1`, [customerName]);
  if (!customerId) {
    const ins = await q<DbRow>(`INSERT INTO customers (name, kyc_status) VALUES ($1, 'verified') RETURNING id`, [customerName]);
    customerId = str(ins[0]?.id);
  }
  const execName = input.salesExecutive ?? "Arjun Nair";
  const execId = (await userIdByName(execName)) ?? (await qVal<string>(`SELECT id::text AS v FROM users ORDER BY created_at LIMIT 1`));

  const quoteNo = await nextQuoteNo();
  const discountAmount = Math.round((base * discountPct) / 100);
  const total = Math.round(base - (base * discountPct) / 100);
  const status: QuoteStatus = needsApproval ? "pending_approval" : "draft";
  const createdAt = new Date().toISOString();

  const ins = await q<DbRow>(
    `INSERT INTO quotations
       (quote_no, customer_id, project_id, unit_id, land_parcel_id, plot_id, sales_executive,
        status, base_amount, discount_pct, discount_amount, total_amount, valid_until, terms_json, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '2026-08-30', '{}', now())
     RETURNING id`,
    [quoteNo, customerId, projectId, unitId, parcelId, plotId, execId, status, base, discountPct, discountAmount, total],
  );
  const quote: Quote = {
    id: str(ins[0]?.id),
    quoteNo,
    customer: customerName,
    project,
    unit: unitLabel,
    base,
    discountPct,
    total,
    status,
    salesExecutive: execName,
    segment,
    createdAt,
  };
  return { quote, needsApproval };
}

export async function decideQuote(quoteId: string, approve: boolean): Promise<Quote | null> {
  await q(`UPDATE quotations SET status = $1, updated_at = now() WHERE id = $2`, [approve ? "approved" : "cancelled", quoteId]);
  return fetchQuoteById(quoteId);
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export interface DprRow {
  date: string;
  tower: string;
  engineer: string;
  progress: number;
  labour: number;
  concreteCum: number;
  note: string;
}

export interface ConstructionPayload {
  milestones: Milestone[];
  dprRows: DprRow[];
  towerStats: { tower: string; progress: number; lab: number; concrete: string; lag: string }[];
}

async function fetchMilestones(): Promise<Milestone[]> {
  const [progress, rows] = await Promise.all([
    qVal<number>(`SELECT COALESCE(MAX(progress_pct), 0)::int AS v FROM dprs`),
    q<DbRow>(`SELECT id, name, planned_date, actual_date, status FROM construction_milestones ORDER BY sequence`),
  ]);
  return rows.map((r) => {
    const status = str(r.status);
    const mockStatus = (status === "in_progress" ? "on_track" : status) as Milestone["status"];
    return {
      id: str(r.id),
      name: str(r.name),
      planned: dateStr(r.planned_date),
      actual: r.actual_date ? dateStr(r.actual_date) : undefined,
      progress: status === "completed" ? 100 : status === "pending" ? 0 : progress ?? 0,
      status: mockStatus,
    };
  });
}

async function fetchDprRows(): Promise<DprRow[]> {
  const rows = await q<DbRow>(`
    SELECT d.report_date, d.progress_pct, d.labour, d.concrete_cum, d.summary,
           t.code AS tower, u.display_name AS engineer
    FROM dprs d
    JOIN towers t ON t.id = d.tower_id
    LEFT JOIN users u ON u.id = d.site_engineer
    ORDER BY d.report_date DESC, t.code`);
  return rows.map((r) => ({
    date: dateStr(r.report_date),
    tower: str(r.tower),
    engineer: str(r.engineer),
    progress: num(r.progress_pct),
    labour: num(r.labour),
    concreteCum: num(r.concrete_cum),
    note: str(r.summary),
  }));
}

function computeTowerStats(rows: DprRow[]): ConstructionPayload["towerStats"] {
  const byTower = new Map<string, DprRow[]>();
  for (const r of rows) {
    const list = byTower.get(r.tower) ?? [];
    list.push(r);
    byTower.set(r.tower, list);
  }
  const stats: ConstructionPayload["towerStats"] = [];
  for (const [tower, list] of byTower) {
    const latest = list[0];
    const lagMatch = /(\d+)\s+days?\s+(ahead|behind)/i.exec(latest.note);
    stats.push({
      tower,
      progress: latest.progress,
      lab: latest.labour,
      concrete: `${latest.concreteCum} m³`,
      lag: lagMatch ? `${lagMatch[1]} days ${lagMatch[2].toLowerCase()}` : "0 days ahead",
    });
  }
  return stats;
}

export async function getConstruction(): Promise<ConstructionPayload> {
  const [milestones, dprRows] = await Promise.all([fetchMilestones(), fetchDprRows()]);
  return { milestones, dprRows, towerStats: computeTowerStats(dprRows) };
}

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export interface ReconRow {
  ref: string;
  date: string;
  desc: string;
  amount: number;
  type: "in" | "out";
  matched: boolean;
  confidence: number;
}

export interface ReconSummary {
  total: number;
  matched: number;
  pending: number;
  pendingAmount: number;
  matchRate: number;
}

export interface FinancePayload {
  recon: ReconRow[];
  summary: ReconSummary;
  cashFlow: { month: string; inflow: number; outflow: number }[];
  salesVelocity: { month: string; units: number }[];
}

async function fetchRecon(): Promise<ReconRow[]> {
  const rows = await q<DbRow>(`
    SELECT DISTINCT ON (l.id)
      l.txn_reference AS ref, l.txn_date AS "date", l.description AS "desc", l.amount AS amount,
      COALESCE(m.status, 'suggested') AS match_status, m.confidence AS confidence
    FROM bank_statement_lines l
    LEFT JOIN reconciliation_matches m ON m.bank_line_id = l.id
    ORDER BY l.id, CASE WHEN m.status = 'confirmed' THEN 0 ELSE 1 END, m.confidence DESC`);
  return rows
    .map((r) => {
      const amount = num(r.amount);
      const matched = str(r.match_status) === "confirmed";
      return {
        ref: str(r.ref),
        date: dateStr(r.date),
        desc: str(r.desc),
        amount,
        type: (amount >= 0 ? "in" : "out") as "in" | "out",
        matched,
        confidence: num(r.confidence),
      };
    })
    .sort((a, b) => b.ref.localeCompare(a.ref));
}

const EMPTY_SUMMARY: ReconSummary = { total: 0, matched: 0, pending: 0, pendingAmount: 0, matchRate: 0 };

export async function getFinance(): Promise<FinancePayload> {
  const [recon, summary, cashFlow, salesVelocity] = await Promise.all([
    fetchRecon(),
    config<ReconSummary>("finance.recon_summary", EMPTY_SUMMARY),
    config<FinancePayload["cashFlow"]>("analytics.cash_flow", []),
    config<FinancePayload["salesVelocity"]>("analytics.sales_velocity", []),
  ]);
  return { recon, summary, cashFlow, salesVelocity };
}

async function bumpReconSummary(): Promise<void> {
  const current = await config<ReconSummary>("finance.recon_summary", EMPTY_SUMMARY);
  const matched = (current.matched ?? 0) + 1;
  const total = current.total ?? 0;
  const next = {
    ...current,
    matched,
    pending: Math.max(0, (current.pending ?? 0) - 1),
    matchRate: total ? Math.round((matched / total) * 1000) / 10 : current.matchRate,
  };
  await q(`UPDATE app_config SET value = $1, updated_at = now() WHERE key = 'finance.recon_summary'`, [JSON.stringify(next)]);
}

export async function autoMatchRecon(ref: string, description?: string): Promise<ReconRow | null> {
  const line = await qOne<DbRow>(`SELECT id, description, txn_date, amount FROM bank_statement_lines WHERE txn_reference = $1`, [ref]);
  if (!line) return null;
  const lineId = str(line.id);
  const newDesc = description ?? str(line.description);
  await q(`UPDATE bank_statement_lines SET description = $1 WHERE id = $2`, [newDesc, lineId]);

  const existing = await qOne<DbRow>(`SELECT id FROM reconciliation_matches WHERE bank_line_id = $1 AND status = 'confirmed'`, [lineId]);
  if (existing) {
    await q(`UPDATE reconciliation_matches SET confidence = 97.1 WHERE id = $1`, [str(existing.id)]);
  } else {
    const runId = await qVal<string>(`SELECT id::text AS v FROM reconciliation_runs ORDER BY run_at DESC LIMIT 1`);
    const receiptId = await qVal<string>(`SELECT receipt_id::text AS v FROM reconciliation_matches WHERE bank_line_id = $1 AND receipt_id IS NOT NULL LIMIT 1`, [lineId]);
    if (runId) {
      await q(
        `INSERT INTO reconciliation_matches (run_id, bank_line_id, receipt_id, confidence, status)
         VALUES ($1, $2, $3, 97.1, 'confirmed')`,
        [runId, lineId, receiptId],
      );
    }
  }

  await bumpReconSummary();
  const amount = num(line.amount);
  return {
    ref,
    date: dateStr(line.txn_date),
    desc: newDesc,
    amount,
    type: (amount >= 0 ? "in" : "out") as "in" | "out",
    matched: true,
    confidence: 97.1,
  };
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface PortalPayload {
  milestones: Milestone[];
  unit: { no: string; project: string; type: string; sqft: number; floor: string; price: number };
  instalments: { id: string; name: string; due: string; amount: number; paid: boolean; paidOn: string }[];
  docs: { name: string; tag: string }[];
  amenities: UnitAmenity[];
  ledger: {
    total: number;
    paid: number;
    due: number;
    paidPct: number;
    receipts: { no: string; date: string; desc: string; amount: number; mode: string }[];
  };
  updates: PortalUpdate[];
  tickets: PortalTicket[];
  possession: { steps: PortalPossessionStep[]; snags: PortalSnag[]; possessionDate: string; signed: string[] };
  referrals: PortalReferralProgram;
  photos: PortalPhoto[];
  tax: PortalTaxSummary;
  loanPartners: PortalLoanPartner[];
  events: PortalEvent[];
  warranty: PortalWarrantyDoc[];
  loyalty: PortalLoyalty;
  kyc: PortalKyc;
  listings: PortalResaleListing[];
  chat: PortalChatMessage[];
}

export interface PortalTicketInput {
  category: string;
  priority: string;
  subject: string;
  description?: string;
}

export async function fetchPortalCustomer(): Promise<{ customerId: string; unitId: string; projectId: string }> {
  const row = await qOne<DbRow>(`
    SELECT bk.customer_id, bk.unit_id, u.block_id, f.tower_id
    FROM bookings bk
    JOIN units u ON u.id = bk.unit_id
    JOIN blocks bl ON bl.id = u.block_id
    JOIN floors f ON f.id = bl.floor_id
    ORDER BY bk.created_at
    LIMIT 1`);
  const unitId = row ? str(row.unit_id) : "";
  return {
    customerId: row ? str(row.customer_id) : "",
    unitId,
    projectId: row ? str(row.tower_id) : "",
  };
}

async function fetchPortalUpdates(): Promise<PortalUpdate[]> {
  const rows = await q<DbRow>(`
    SELECT d.report_date, d.progress_pct, d.summary, t.code AS tower, u.display_name AS engineer
    FROM dprs d
    JOIN towers t ON t.id = d.tower_id
    LEFT JOIN users u ON u.id = d.site_engineer
    ORDER BY d.report_date DESC, t.code
    LIMIT 8`);
  if (!rows.length) return portalUpdates;
  return rows.map((r) => ({
    date: dateStr(r.report_date),
    tower: str(r.tower),
    progress: num(r.progress_pct),
    note: str(r.summary),
    engineer: str(r.engineer),
  }));
}

async function fetchPortalTickets(customerId: string): Promise<PortalTicket[]> {
  const rows = await q<DbRow>(
    `SELECT id, ticket_no, category, subject, priority, status, opened_at
     FROM tickets WHERE customer_id = $1 ORDER BY opened_at DESC LIMIT 10`,
    [customerId],
  );
  if (!rows.length) return portalTickets;
  return rows.map((r) => ({
    id: str(r.id),
    no: str(r.ticket_no),
    category: str(r.category),
    subject: str(r.subject) || str(r.category),
    priority: str(r.priority) as PortalTicket["priority"],
    status: str(r.status) as PortalTicket["status"],
    ageDays: Math.max(0, Math.round((Date.now() - new Date(str(r.opened_at)).getTime()) / 86400_000)),
  }));
}

async function fetchPortalSnags(customerId: string): Promise<PortalSnag[]> {
  const rows = await q<DbRow>(
    `SELECT id, ticket_no, category, subject, status, opened_at
     FROM tickets WHERE customer_id = $1 AND category ILIKE '%snag%'
     ORDER BY opened_at DESC LIMIT 10`,
    [customerId],
  );
  if (!rows.length) return portalSnags;
  return rows.map((r) => ({
    id: str(r.id),
    no: str(r.ticket_no),
    title: str(r.subject) || str(r.category),
    category: str(r.category),
    status: (str(r.status) === "in_progress" ? "in_progress" : str(r.status) === "resolved" ? "resolved" : "open") as PortalSnag["status"],
    raised: dateStr(r.opened_at),
  }));
}

async function fetchPortalReferrals(): Promise<PortalReferralProgram> {
  const code = "RMH-2026";
  const rows = await q<DbRow>(
    `SELECT name, phone, status FROM leads
     WHERE source_payload->>'referral_code' = $1 ORDER BY created_at DESC`,
    [code],
  );
  if (!rows.length) return portalReferralProgram;
  const statusToPhase: Record<string, PortalReferral["status"]> = {
    site_visit_scheduled: "visited", visit_scheduled: "visited", site_visit: "visited",
    booking_initiated: "booked", offer: "booked", won: "converted", booked: "booked",
  };
  const referred = rows.map((r, i) => ({
    id: `ref-${i}`,
    name: str(r.name),
    phone: str(r.phone),
    status: (statusToPhase[str(r.status)] ?? "visited") as PortalReferral["status"],
    reward: str(r.status) === "won" ? portalReferralProgram.reward : 0,
  }));
  return {
    code,
    reward: portalReferralProgram.reward,
    earned: referred.reduce((sum, r) => sum + r.reward, 0),
    referred,
  };
}

async function fetchPortalPhotos(projectId: string): Promise<PortalPhoto[]> {
  const rows = await q<DbRow>(
    `SELECT id, media_type, url, COALESCE(thumb_url, url) AS thumb, caption, shot_on
     FROM site_photos
     WHERE project_id = $1 OR project_id IS NULL
     ORDER BY shot_on DESC NULLS LAST, created_at DESC
     LIMIT 12`,
    [projectId],
  );
  if (!rows.length) return portalPhotos;
  return rows.map((r) => ({
    id: str(r.id),
    mediaType: (str(r.media_type) === "video" ? "video" : "photo") as PortalPhoto["mediaType"],
    url: str(r.url),
    thumb: str(r.thumb),
    caption: str(r.caption),
    shotOn: dateStr(r.shot_on),
  }));
}

async function fetchPortalTax(customerId: string): Promise<PortalTaxSummary> {
  const row = await qOne<DbRow>(
    `SELECT COALESCE(SUM(base_amount),0) base, COALESCE(SUM(cgst),0) cgst, COALESCE(SUM(sgst),0) sgst,
            COALESCE(SUM(igst),0) igst, COALESCE(SUM(tds),0) tds, COALESCE(SUM(total_amount),0) total
     FROM invoices WHERE customer_id = $1`,
    [customerId],
  );
  if (!row || num(row.total) <= 0) return portalTaxSummary;
  return {
    baseAmount: num(row.base),
    cgst: num(row.cgst),
    sgst: num(row.sgst),
    igst: num(row.igst),
    tds: num(row.tds),
    total: num(row.total),
  };
}

async function fetchPortalLoanPartners(): Promise<PortalLoanPartner[]> {
  const rows = await q<DbRow>(`
    SELECT p.id, p.name, p.partner_type, p.city, p.rating, p.deals, p.conversion, p.status,
           COALESCE(array_agg(DISTINCT ps.service_name) FILTER (WHERE ps.service_name IS NOT NULL), '{}') AS services
    FROM marketplace_partners p
    LEFT JOIN partner_services ps ON ps.partner_id = p.id
    WHERE p.partner_type = 'bank_home_loan'
    GROUP BY p.id
    ORDER BY p.rating DESC, p.deals DESC
    LIMIT 8`);
  if (!rows.length) return portalLoanPartners;
  return rows.map((r) => ({
    id: str(r.id),
    name: str(r.name),
    category: str(r.partner_type),
    city: str(r.city),
    rating: num(r.rating),
    deals: num(r.deals),
    conversion: num(r.conversion),
    verified: str(r.status) === "verified" || str(r.status) === "active",
    services: Array.isArray(r.services) ? r.services.map(String) : [],
  }));
}

async function fetchPortalEvents(customerId: string): Promise<PortalEvent[]> {
  const rows = await q<DbRow>(
    `SELECT e.id, e.title, e.event_type, e.description, e.starts_at, e.location, e.capacity,
            (SELECT status FROM event_rsvps r WHERE r.event_id = e.id AND r.customer_id = $1 LIMIT 1) AS my_rsvp
     FROM events e
     WHERE e.is_active = true
     ORDER BY e.starts_at
     LIMIT 10`,
    [customerId],
  );
  if (!rows.length) return portalEvents;
  return rows.map((r) => ({
    id: str(r.id),
    title: str(r.title),
    type: (str(r.event_type) || "community") as PortalEvent["type"],
    description: str(r.description),
    startsAt: new Date(str(r.starts_at)).toISOString(),
    location: str(r.location),
    capacity: num(r.capacity),
    rsvp: (r.my_rsvp ? str(r.my_rsvp) : undefined) as PortalEvent["rsvp"],
  }));
}

async function fetchPortalWarranty(): Promise<PortalWarrantyDoc[]> {
  const rows = await q<DbRow>(
    `SELECT id, title, status, updated_at
     FROM documents
     WHERE doc_type IN ('warranty','handover','possession_letter')
     ORDER BY created_at, id`,
  );
  if (!rows.length) return portalWarrantyDocs;
  return rows.map((r) => ({
    id: str(r.id),
    title: str(r.title),
    status: (str(r.status) || "draft") as PortalWarrantyDoc["status"],
    issued: dateStr(r.updated_at),
  }));
}

async function fetchPortalLoyalty(customerId: string): Promise<PortalLoyalty> {
  const row = await qOne<DbRow>(
    `SELECT loyalty_points, loyalty_tier FROM customers WHERE id = $1`,
    [customerId],
  );
  if (!row) return portalLoyalty;
  const tier = (str(row.loyalty_tier) || "member") as PortalLoyalty["tier"];
  const perks =
    tier === "platinum" ? portalLoyalty.perks
    : tier === "gold" ? ["Priority service desk", "Referral bonus boost (₹75,000)", "Invites to member-only events"]
    : tier === "silver" ? ["Priority service desk", "Referral bonus boost (₹75,000)", "Invites to member-only events"]
    : ["Invites to community events", "Birthday greetings & offers"];
  return { points: num(row.loyalty_points), tier, perks };
}

async function fetchPortalKyc(customerId: string): Promise<PortalKyc> {
  const row = await qOne<DbRow>(
    `SELECT kyc_status, pan, aadhaar_hash FROM customers WHERE id = $1`,
    [customerId],
  );
  if (!row) return portalKyc;
  return {
    status: (str(row.kyc_status) || "pending") as PortalKyc["status"],
    pan: str(row.pan),
    aadhaarLast4: str(row.aadhaar_hash) ? str(row.aadhaar_hash).slice(-4) : "",
  };
}

async function fetchPortalListings(customerId: string): Promise<PortalResaleListing[]> {
  const rows = await q<DbRow>(
    `SELECT id, listing_type, title, description, price, status
     FROM owner_listings
     WHERE customer_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [customerId],
  );
  if (!rows.length) return portalResaleListings;
  return rows.map((r) => ({
    id: str(r.id),
    listingType: (str(r.listing_type) || "sale") as PortalResaleListing["listingType"],
    title: str(r.title),
    description: str(r.description),
    price: num(r.price),
    status: (str(r.status) || "active") as PortalResaleListing["status"],
  }));
}

export async function fetchPortalChat(customerId: string): Promise<PortalChatMessage[]> {
  const rows = await q<DbRow>(`
    SELECT m.role, m.content, COALESCE((m.payload->>'seq')::int, 0) AS seq
    FROM ai_messages m
    JOIN ai_conversations c ON c.id = m.conversation_id
    LEFT JOIN leads l ON l.id = c.lead_id
    WHERE c.customer_id = $1 OR l.converted_customer = $1
    ORDER BY m.created_at, seq
    LIMIT 40`,
    [customerId],
  );
  if (!rows.length) return portalChatMessages;
  return rows.map((r) => ({
    from: (str(r.role) === "assistant" ? "ai" : "user") as PortalChatMessage["from"],
    text: str(r.content),
  }));
}

async function portalConversationId(customerId: string): Promise<string | null> {
  const convo = await qOne<DbRow>(`
    SELECT c.id FROM ai_conversations c
    LEFT JOIN leads l ON l.id = c.lead_id
    WHERE c.customer_id = $1 OR l.converted_customer = $1
    ORDER BY c.created_at LIMIT 1`,
    [customerId],
  );
  return convo ? str(convo.id) : null;
}

function portalAiReply(text: string, context: { nextDue?: string; nextAmount?: number; progress?: number }): string {
  const t = text.toLowerCase();
  if (/payment|emi|installment|due|pay/.test(t))
    return context.nextAmount
      ? `Your next installment of ₹${Math.round(context.nextAmount).toLocaleString("en-IN")} is due ${context.nextDue}. You're on track — nothing is overdue. You can also pay online from the Payments tab.`
      : "All your scheduled payments are on track. You can see the full schedule in the Payments tab.";
  if (/progress|construction|slab|building|tower/.test(t))
    return `Tower T1 is at ${context.progress ?? 68}% overall. Level 5 slab shutter work is in progress and we're ~2 days ahead of schedule. Photos are in the Site Updates tab.`;
  if (/possession|handover|key/.test(t))
    return "Target possession is January 2028. Structure completion and RERA registration are done; occupancy NOC is scheduled for 12 Sep 2026. Track every step in the Possession tab.";
  if (/warranty|defect/.test(t))
    return "Your 5-year structural warranty and 2-year fittings warranty are active. To raise a defect, open a support ticket with the Snagging category.";
  if (/amenit|club|pool|gym/.test(t))
    return "Your unit includes 30+ amenities — clubhouse, pool, gym, co-working and more. The full list is on the Amenities tab.";
  if (/event|meet|rsvp/.test(t))
    return "The Homeowner Meet is on 13 Sep 2026 and a T1 site walkthrough on 20 Sep. RSVP from the Events tab — seats are limited.";
  if (/refer|reward|bonus/.test(t))
    return `Your referral code is RMH-2026. You've earned ₹50,000 and have 3 successful referrals so far.`;
  if (/loan|finance|emi.*rate/.test(t))
    return "Axis Bank and HDFC offer pre-approved home loans for this project. Use the EMI calculator on the Home Loans tab to estimate your monthly payment.";
  return "I can help with payments, construction progress, possession, amenities, events and support tickets. What would you like to know?";
}

export async function getPortal(): Promise<PortalPayload> {
  const milestones = await fetchMilestones();
  const unitRow = await qOne<DbRow>(`
    SELECT pr.name AS project_name, t.code AS tower_code, t.name AS tower_name, f.floor_no,
           u.unit_no, bl.code AS block_code, u.unit_type, u.carpet_area_sqft, u.bsp_price
    FROM bookings bk
    JOIN units u ON u.id = bk.unit_id
    JOIN blocks bl ON bl.id = u.block_id
    JOIN floors f ON f.id = bl.floor_id
    JOIN towers t ON t.id = f.tower_id
    JOIN projects pr ON pr.id = t.project_id
    ORDER BY bk.created_at
    LIMIT 1`);
  const unit = unitRow
    ? {
        no: `${str(unitRow.tower_code)}-${str(unitRow.block_code)}-${str(unitRow.unit_no)}`,
        project: str(unitRow.project_name),
        type: str(unitRow.unit_type),
        sqft: num(unitRow.carpet_area_sqft),
        floor: `Level ${num(unitRow.floor_no)} · ${str(unitRow.tower_name).split(" · ")[0]}`,
        price: num(unitRow.bsp_price),
      }
    : { no: "", project: "", type: "", sqft: 0, floor: "", price: 0 };

  const instRows = await q<DbRow>(`
    SELECT psl.id, psl.label, psl.due_date, psl.amount, psl.status
    FROM payment_schedule_lines psl
    JOIN payment_schedules ps ON ps.id = psl.schedule_id
    JOIN bookings bk ON bk.id = ps.booking_id
    ORDER BY psl.installment_no`);
  const instalments = instRows.map((r) => {
    const paid = str(r.status) === "paid";
    return {
      id: str(r.id),
      name: str(r.label),
      due: dateStr(r.due_date),
      amount: num(r.amount),
      paid,
      paidOn: paid ? dateStr(new Date().toISOString()) : "",
    };
  });

  const docRows = await q<DbRow>(`SELECT id, title, status FROM documents ORDER BY created_at, id`);
  const docs = docRows.map((r) => ({ name: str(r.title), tag: docTag(str(r.title)) }));

  const amenityRows = await q<DbRow>(`
    SELECT a.code, a.name
    FROM unit_amenities ua
    JOIN amenities a ON a.id = ua.amenity_id
    JOIN units u ON u.id = ua.unit_id
    JOIN bookings bk ON bk.unit_id = u.id
    ORDER BY a.name`);
  const detailByKind = new Map(unitAmenities.map((a) => [a.kind, a.detail]));
  const amenities: UnitAmenity[] = amenityRows.length
    ? amenityRows.map((r) => {
        const kind = (str(r.code) as AmenityKind) ?? "clubhouse";
        return { kind, name: str(r.name), detail: detailByKind.get(kind) };
      })
    : unitAmenities;

  const paid = instalments.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0);
  const ledger = {
    total: unit.price,
    paid,
    due: unit.price - paid,
    paidPct: unit.price ? Math.round((paid / unit.price) * 100) : 0,
    receipts: instalments.filter((i) => i.paid).map((i, idx) => ({
      no: `RCPT-2026-${String(101 + idx).padStart(3, "0")}`,
      date: i.paidOn,
      desc: `${i.name} · ${unit.no}`,
      amount: i.amount,
      mode: "UPI",
    })),
  };

  const [updates, customer, referrals] = await Promise.all([
    fetchPortalUpdates(),
    fetchPortalCustomer(),
    fetchPortalReferrals(),
  ]);
  const [
    tickets,
    snags,
    photos,
    tax,
    loanPartners,
    events,
    warranty,
    loyalty,
    kyc,
    listings,
    chat,
  ] = await Promise.all([
    fetchPortalTickets(customer.customerId),
    fetchPortalSnags(customer.customerId),
    fetchPortalPhotos(customer.projectId),
    fetchPortalTax(customer.customerId),
    fetchPortalLoanPartners(),
    fetchPortalEvents(customer.customerId),
    fetchPortalWarranty(),
    fetchPortalLoyalty(customer.customerId),
    fetchPortalKyc(customer.customerId),
    fetchPortalListings(customer.customerId),
    fetchPortalChat(customer.customerId),
  ]);

  const signoffRow = await qOne<DbRow>(`SELECT value FROM app_config WHERE key = 'portal_handover'`);
  const signedSteps = signoffRow && signoffRow.value && Array.isArray((signoffRow.value as Record<string, unknown>).signedSteps)
    ? ((signoffRow.value as Record<string, unknown>).signedSteps as string[])
    : [];

  const possession = {
    steps: portalPossessionSteps,
    snags,
    possessionDate: "Jan 2028",
    signed: signedSteps,
  };

  return {
    milestones, unit, instalments, docs, amenities, ledger, updates, tickets, possession, referrals,
    photos, tax, loanPartners, events, warranty, loyalty, kyc, listings, chat,
  };
}

export async function createPortalTicket(input: PortalTicketInput): Promise<PortalTicket> {
  try {
    const customer = await fetchPortalCustomer();
    const count = (await qVal<number>(`SELECT count(*)::int AS v FROM tickets`)) ?? 0;
    const no = `TK-2026-${String(count + 1).padStart(3, "0")}`;
    const id = randomUUID();
    const openedAt = new Date().toISOString();
    await q(
      `INSERT INTO tickets (id, ticket_no, customer_id, project_id, unit_id, category, priority, status, subject, description, opened_at, channel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, $9, $10, 'portal')`,
      [id, no, customer.customerId || null, customer.projectId || null, customer.unitId || null,
       input.category, input.priority, input.subject, input.description ?? null, openedAt],
    );
    return {
      id,
      no,
      category: input.category,
      subject: input.subject,
      priority: input.priority as PortalTicket["priority"],
      status: "open",
      ageDays: 0,
    };
  } catch {
    return {
      id: randomUUID(),
      no: `TK-2026-DEMO`,
      category: input.category,
      subject: input.subject,
      priority: input.priority as PortalTicket["priority"],
      status: "open",
      ageDays: 0,
    };
  }
}

export async function payPortalInstallment(lineId: string, amount: number): Promise<{ ok: boolean; message: string }> {
  try {
    const customer = await fetchPortalCustomer();
    const line = await qOne<DbRow>(
      `SELECT psl.schedule_id, psl.amount, psl.paid_amount, psl.total_due, ps.booking_id
       FROM payment_schedule_lines psl
       JOIN payment_schedules ps ON ps.id = psl.schedule_id
       WHERE psl.id = $1`,
      [lineId],
    );
    if (!line) return { ok: false, message: "Installment not found" };
    const paidAmount = num(line.paid_amount) + amount;
    const status = paidAmount >= num(line.total_due) ? "paid" : paidAmount > 0 ? "partially_paid" : "pending";
    await q(
      `UPDATE payment_schedule_lines SET paid_amount = $1, status = $2 WHERE id = $3`,
      [paidAmount, status, lineId],
    );
    const receiptNo = `RCPT-2026-${String(Math.floor(100 + Math.random() * 900))}GW`;
    await q(
      `INSERT INTO receipts (id, receipt_no, customer_id, booking_id, amount, payment_mode, gateway_txn_id, reference, received_at, received_by, posted)
       VALUES ($1, $2, $3, $4, $5, 'gateway', $6, $7, now(), $8, true)`,
      [randomUUID(), receiptNo, customer.customerId || null, str(line.booking_id), amount,
       `GWP-${randomUUID().slice(0, 12)}`, `GATEWAY/UPI/${Date.now()}`, null],
    );
    return { ok: true, message: `Payment received. Receipt ${receiptNo} generated.` };
  } catch {
    return { ok: false, message: "Payment could not be processed. Please try again." };
  }
}

export async function addPortalChat(customerId: string, text: string): Promise<PortalChatMessage[]> {
  const convoId = await portalConversationId(customerId);
  if (convoId) {
    const seq =
      (await qVal<number>(`SELECT COALESCE(MAX(COALESCE((payload->>'seq')::int, 0)), 0) + 1 AS v FROM ai_messages WHERE conversation_id = $1`, [convoId])) ?? 0;
    await q(
      `INSERT INTO ai_messages (id, conversation_id, role, content, payload, created_at)
       VALUES ($1, $2, 'user', $3, $4, now())`,
      [randomUUID(), convoId, text, JSON.stringify({ seq })],
    );
  }
  const next = await qOne<DbRow>(`
    SELECT psl.label, psl.due_date, psl.total_due, psl.paid_amount
    FROM payment_schedule_lines psl
    JOIN payment_schedules ps ON ps.id = psl.schedule_id
    WHERE psl.status IN ('pending','due','partially_paid')
    ORDER BY psl.installment_no LIMIT 1`);
  const progressRow = await qVal<number>(`SELECT progress_pct FROM dprs ORDER BY report_date DESC LIMIT 1`);
  const reply = portalAiReply(text, {
    nextDue: next ? dateStr(next.due_date) : undefined,
    nextAmount: next ? num(next.total_due) - num(next.paid_amount) : undefined,
    progress: progressRow ?? undefined,
  });
  if (convoId) {
    const seq =
      (await qVal<number>(`SELECT COALESCE(MAX(COALESCE((payload->>'seq')::int, 0)), 0) + 1 AS v FROM ai_messages WHERE conversation_id = $1`, [convoId])) ?? 0;
    await q(
      `INSERT INTO ai_messages (id, conversation_id, role, content, payload, created_at)
       VALUES ($1, $2, 'assistant', $3, $4, now())`,
      [randomUUID(), convoId, reply, JSON.stringify({ seq })],
    );
  }
  return [
    { from: "user", text },
    { from: "ai", text: reply },
  ];
}

export async function completePortalKyc(pan: string, aadhaarLast4: string): Promise<PortalKyc> {
  const customer = await fetchPortalCustomer();
  await q(
    `UPDATE customers SET pan = $1, aadhaar_hash = $2, kyc_status = 'verified', updated_at = now() WHERE id = $3`,
    [pan, aadhaarLast4, customer.customerId],
  );
  return { status: "verified", pan, aadhaarLast4 };
}

export async function addTicketComment(ticketId: string, body: string, isInternal = false): Promise<{ ok: boolean }> {
  try {
    await q(
      `INSERT INTO ticket_comments (id, ticket_id, author_id, is_internal, body, created_at)
       VALUES ($1, $2, $3, $4, $5, now())`,
      [randomUUID(), ticketId, null, isInternal, body],
    );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function escalateTicket(ticketId: string): Promise<{ ok: boolean; status: string; priority: string }> {
  await q(
    `UPDATE tickets SET status = 'in_progress', priority = 'urgent' WHERE id = $1`,
    [ticketId],
  );
  return { ok: true, status: "in_progress", priority: "urgent" };
}

export async function setEventRsvp(eventId: string, status: "going" | "interested" | "declined"): Promise<{ ok: boolean }> {
  try {
    const customer = await fetchPortalCustomer();
    await q(
      `INSERT INTO event_rsvps (id, event_id, customer_id, status, rsvped_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (event_id, customer_id) DO UPDATE SET status = EXCLUDED.status, rsvped_at = now()`,
      [randomUUID(), eventId, customer.customerId, status],
    );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function createOwnerListing(input: { listingType: "sale" | "rent"; title: string; description?: string; price: number }): Promise<{ ok: boolean; message: string }> {
  try {
    const customer = await fetchPortalCustomer();
    await q(
      `INSERT INTO owner_listings (id, customer_id, unit_id, listing_type, title, description, price, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', now())`,
      [randomUUID(), customer.customerId, customer.unitId || null, input.listingType, input.title, input.description ?? null, input.price],
    );
    return { ok: true, message: "Listing published to the community marketplace." };
  } catch {
    return { ok: false, message: "Could not publish listing. Please try again." };
  }
}

export async function signPortalPossession(stepName: string): Promise<{ ok: boolean; signed: string[] }> {
  try {
    const row = await qOne<DbRow>(`SELECT value FROM app_config WHERE key = 'portal_handover'`);
    const current = row && row.value && Array.isArray((row.value as Record<string, unknown>).signedSteps)
      ? ((row.value as Record<string, unknown>).signedSteps as string[])
      : [];
    const next = current.includes(stepName) ? current : [...current, stepName];
    await q(
      `INSERT INTO app_config (key, value, updated_by, updated_at)
       VALUES ('portal_handover', $1, NULL, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [JSON.stringify({ signedSteps: next })],
    );
    return { ok: true, signed: next };
  } catch {
    return { ok: false, signed: [] };
  }
}

export async function getPortalTicketThread(ticketId: string): Promise<{ id: string; no: string; subject: string; status: string; priority: string; openedAt: string; comments: { body: string; createdAt: string; isInternal: boolean }[] } | null> {
  const t = await qOne<DbRow>(`SELECT id, ticket_no, subject, status, priority, opened_at FROM tickets WHERE id = $1`, [ticketId]);
  if (!t) return null;
  const comments = await q<DbRow>(`SELECT body, created_at, is_internal FROM ticket_comments WHERE ticket_id = $1 ORDER BY created_at ASC`, [ticketId]);
  return {
    id: str(t.id),
    no: str(t.ticket_no),
    subject: str(t.subject),
    status: str(t.status),
    priority: str(t.priority),
    openedAt: str(t.opened_at),
    comments: comments.map((c) => ({ body: str(c.body), createdAt: str(c.created_at), isInternal: !!c.is_internal })),
  };
}

// ---------------------------------------------------------------------------
// Procurement
// ---------------------------------------------------------------------------

export interface ProcurementPayload {
  vendors: Vendor[];
  rfqs: Rfq[];
  pos: PurchaseOrder[];
  grns: Grn[];
  summary: typeof procurementSummaryFallback;
}

const procurementSummaryFallback = {
  openRfqs: 0,
  activePos: 0,
  grnExceptions: 0,
  verifiedVendors: 0,
  savingsYtd: 0,
};

async function fetchVendors(): Promise<Vendor[]> {
  const rows = await q<DbRow>(`
    SELECT id, vendor_code, name, category, gstin, quality_rating, status, city
    FROM vendors WHERE vendor_code LIKE 'VND-00%'
    ORDER BY vendor_code`);
  return rows.map((r) => ({
    id: str(r.id),
    code: str(r.vendor_code),
    name: str(r.name),
    category: str(r.category),
    gstin: str(r.gstin),
    rating: num(r.quality_rating),
    status: (str(r.status) || "pending") as Vendor["status"],
    city: str(r.city),
  }));
}

async function fetchRfqs(): Promise<Rfq[]> {
  const rows = await q<DbRow>(`
    SELECT r.id, r.rfq_no, r.title, r.category, r.response_deadline, r.responses, r.best_rate,
           r.market_index, r.status, r.ai_flag, r.ai_note, pr.name AS project
    FROM rfqs r
    JOIN projects pr ON pr.id = r.project_id
    ORDER BY r.rfq_no DESC`);
  return rows.map((r) => ({
    id: str(r.id),
    rfqNo: str(r.rfq_no),
    title: str(r.title),
    project: str(r.project),
    category: str(r.category),
    deadline: dateStr(r.response_deadline),
    responses: num(r.responses),
    bestRate: num(r.best_rate),
    marketIndex: num(r.market_index),
    status: str(r.status) as Rfq["status"],
    aiFlag: bool(r.ai_flag),
    aiNote: str(r.ai_note) || undefined,
  }));
}

async function fetchPos(): Promise<PurchaseOrder[]> {
  const rows = await q<DbRow>(`
    SELECT po.id, po.po_no, po.total, po.status, po.ai_drafted, po.rfq_no,
           v.name AS vendor, pr.name AS project, po_items.items
    FROM purchase_orders po
    JOIN vendors v ON v.id = po.vendor_id
    JOIN projects pr ON pr.id = po.project_id
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(jsonb_build_object('name', pl.description, 'qty', pl.quantity, 'uom', pl.uom)) AS items
      FROM po_lines pl WHERE pl.po_id = po.id
    ) po_items ON true
    ORDER BY po.po_no DESC`);
  return rows.map((r) => ({
    id: str(r.id),
    poNo: str(r.po_no),
    vendor: str(r.vendor),
    project: str(r.project),
    rfqNo: str(r.rfq_no),
    total: num(r.total),
    status: str(r.status) as PurchaseOrder["status"],
    aiDrafted: bool(r.ai_drafted),
    items: (r.items as { name: string; qty: number; uom: string }[]) ?? [],
  }));
}

async function fetchGrns(): Promise<Grn[]> {
  const rows = await q<DbRow>(`
    SELECT g.id, g.grn_no, g.received_at, g.status, g.match_type, g.variance_pct,
           po.po_no, v.name AS vendor
    FROM grns g
    JOIN purchase_orders po ON po.id = g.po_id
    JOIN vendors v ON v.id = g.vendor_id
    ORDER BY g.received_at DESC`);
  return rows.map((r) => ({
    id: str(r.id),
    grnNo: str(r.grn_no),
    poNo: str(r.po_no),
    vendor: str(r.vendor),
    receivedAt: isoStr(r.received_at),
    status: str(r.status) as Grn["status"],
    match: (str(r.match_type) || "two_way") as Grn["match"],
    variancePct: num(r.variance_pct),
  }));
}

export async function getProcurement(): Promise<ProcurementPayload> {
  const [vendors, rfqs, pos, grns, summary] = await Promise.all([
    fetchVendors(),
    fetchRfqs(),
    fetchPos(),
    fetchGrns(),
    config<ProcurementPayload["summary"]>("procurement.summary", procurementSummaryFallback),
  ]);
  return { vendors, rfqs, pos, grns, summary };
}

// ---------------------------------------------------------------------------
// Legal / RERA
// ---------------------------------------------------------------------------

export interface LegalPayload {
  agreements: LegalAgreement[];
  rera: ReraRegistration[];
  litigations: Litigation[];
  compliance: ComplianceDue[];
}

export async function getLegal(): Promise<LegalPayload> {
  const [agreements, rera, litigations, compliance] = await Promise.all([
    (async () => {
      const rows = await q<DbRow>(`SELECT id, agreement_no, status, parties_json FROM agreements ORDER BY created_at DESC, id`);
      return rows.map((r) => {
        const p = (r.parties_json as Record<string, unknown> | null) ?? {};
        return {
          id: str(r.id),
          agreementNo: str(r.agreement_no),
          type: str(p.type) || "Agreement for Sale",
          customer: str(p.customer),
          asset: str(p.asset),
          status: str(r.status) as LegalAgreement["status"],
          esign: bool(p.esign),
          digilocker: (str(p.digilocker) || "not_synced") as LegalAgreement["digilocker"],
        };
      });
    })(),
    (async () => {
      const regs = await q<DbRow>(`
        SELECT r.id, r.rera_reg_no, r.authority, r.valid_to, r.status, r.last_synced_at, pr.name AS project
        FROM rera_project_registrations r
        JOIN projects pr ON pr.id = r.project_id
        ORDER BY pr.name`);
      const discs = await q<DbRow>(`SELECT rera_registration_id, quarter, progress_pct, submission_status FROM rera_disclosures ORDER BY quarter`);
      return regs.map((r) => ({
        id: str(r.id),
        project: str(r.project),
        regNo: str(r.rera_reg_no),
        authority: str(r.authority),
        validTo: dateStr(r.valid_to),
        status: str(r.status) as ReraRegistration["status"],
        lastSync: r.last_synced_at ? isoStr(r.last_synced_at) : "—",
        disclosures: discs
          .filter((d) => str(d.rera_registration_id) === str(r.id))
          .map((d) => ({
            quarter: quarterLabel(d.quarter),
            progress: num(d.progress_pct),
            submitted: str(d.submission_status) === "submitted",
          })),
      }));
    })(),
    (async () => {
      const rows = await q<DbRow>(`
        SELECT id, case_number, court, party_b, status, next_hearing, summary
        FROM litigations
        ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, filed_date DESC`);
      return rows.map((r) => ({
        id: str(r.id),
        caseNo: str(r.case_number),
        parcel: str(r.party_b),
        court: str(r.court),
        status: str(r.status) as Litigation["status"],
        nextHearing: r.next_hearing ? dateStr(r.next_hearing) : "—",
        summary: str(r.summary),
      }));
    })(),
    config<ComplianceDue[]>("legal.compliance_due", []),
  ]);
  return { agreements, rera, litigations, compliance };
}

// ---------------------------------------------------------------------------
// HR
// ---------------------------------------------------------------------------

export interface HrPayload {
  attendance: AttendanceRow[];
  labour: ContractLabourRow[];
  summary: typeof hrSummaryFallback;
}

const hrSummaryFallback = { total: 0, present: 0, late: 0, absent: 0, onTimePct: 0 };

async function fetchAttendance(): Promise<AttendanceRow[]> {
  const rows = await q<DbRow>(`
    SELECT a.id AS att_id, e.name, e.designation, d.name AS department,
           to_char(a.check_in_at, 'HH24:MI') AS check_in_str, a.status, a.geo_verified
    FROM attendance_records a
    JOIN employees e ON e.id = a.employee_id
    LEFT JOIN departments d ON d.id = e.department_id
    ORDER BY e.employee_code`);
  const statusMap: Record<string, AttendanceRow["status"]> = {
    present: "present",
    late: "late",
    absent: "absent",
    leave: "on_leave",
  };
  return rows.map((r) => ({
    id: str(r.att_id),
    name: str(r.name),
    role: str(r.designation),
    department: str(r.department),
    checkIn: str(r.check_in_str) || "—",
    status: statusMap[str(r.status)] ?? "present",
    geoVerified: bool(r.geo_verified),
  }));
}

async function fetchLabour(): Promise<ContractLabourRow[]> {
  const rows = await q<DbRow>(`
    SELECT cl.id, cl.name, cl.role, cl.daily_wage, cl.is_active, cl.attendance_pct, v.name AS vendor
    FROM contract_labour cl
    LEFT JOIN vendors v ON v.id = cl.vendor_id
    ORDER BY cl.name`);
  return rows.map((r) => ({
    id: str(r.id),
    name: str(r.name),
    vendor: str(r.vendor),
    role: str(r.role),
    dailyWage: num(r.daily_wage),
    active: bool(r.is_active),
    attendancePct: num(r.attendance_pct),
  }));
}

export async function getHr(): Promise<HrPayload> {
  const [attendance, labour, summary] = await Promise.all([
    fetchAttendance(),
    fetchLabour(),
    config<HrPayload["summary"]>("hr.summary", hrSummaryFallback),
  ]);
  return { attendance, labour, summary };
}

// ---------------------------------------------------------------------------
// Facility
// ---------------------------------------------------------------------------

export interface FacilityPayload {
  amc: AmcContract[];
  visitors: VisitorEntry[];
  bills: MaintenanceBill[];
  tickets: ServiceTicket[];
}

export async function getFacility(): Promise<FacilityPayload> {
  const [amc, visitors, bills, tickets] = await Promise.all([
    (async () => {
      const rows = await q<DbRow>(`
        SELECT a.id, a.service_name, a.amount, a.ends_on, a.status, a.renewal_period_months,
               v.name AS vendor, s.name AS society
        FROM amc_contracts a
        JOIN societies s ON s.id = a.society_id
        LEFT JOIN vendors v ON v.id = a.vendor_id
        ORDER BY a.ends_on`);
      return rows.map((r) => ({
        id: str(r.id),
        service: str(r.service_name),
        vendor: str(r.vendor),
        society: str(r.society),
        amount: num(r.amount),
        expires: dateStr(r.ends_on),
        status: str(r.status) as AmcContract["status"],
        autoRenew: num(r.renewal_period_months) > 0,
      }));
    })(),
    (async () => {
      const rows = await q<DbRow>(`
        SELECT v.id, v.name AS visitor, v.purpose, u.unit_no, bl.code AS block_code, t.code AS tower_code,
               to_char(vl.check_in_at, 'HH24:MI') AS check_in_str, vl.check_out_at, vl.qr_verified
        FROM visitors v
        LEFT JOIN visitor_logs vl ON vl.visitor_id = v.id
        LEFT JOIN units u ON u.id = v.visiting_unit
        LEFT JOIN blocks bl ON bl.id = u.block_id
        LEFT JOIN floors f ON f.id = bl.floor_id
        LEFT JOIN towers t ON t.id = f.tower_id
        ORDER BY vl.check_in_at`);
      return rows.map((r) => ({
        id: str(r.id),
        visitor: str(r.visitor),
        unit: r.unit_no ? `${str(r.tower_code)}-${str(r.block_code)}-${str(r.unit_no)}` : "Facility office",
        purpose: str(r.purpose),
        checkIn: str(r.check_in_str) || "—",
        status: (r.check_out_at ? "checked_out" : "inside") as VisitorEntry["status"],
        qr: bool(r.qr_verified),
      }));
    })(),
    (async () => {
      const rows = await q<DbRow>(`
        SELECT b.id, b.bill_no, b.amount, b.status, b.period_start, u.unit_no, bl.code AS block_code, t.code AS tower_code
        FROM society_maintenance_bills b
        LEFT JOIN units u ON u.id = b.unit_id
        LEFT JOIN blocks bl ON bl.id = u.block_id
        LEFT JOIN floors f ON f.id = bl.floor_id
        LEFT JOIN towers t ON t.id = f.tower_id
        ORDER BY b.bill_no DESC`);
      return rows.map((r) => {
        const period = new Date(`${dateStr(r.period_start)}T00:00:00`);
        return {
          id: str(r.id),
          billNo: str(r.bill_no),
          unit: r.unit_no ? `${str(r.tower_code)}-${str(r.block_code)}-${str(r.unit_no)}` : "",
          period: Number.isNaN(period.getTime()) ? "" : `${MONTH_SHORT.format(period)} ${period.getFullYear()}`,
          amount: num(r.amount),
          status: str(r.status) as MaintenanceBill["status"],
        };
      });
    })(),
    (async () => {
      const rows = await q<DbRow>(`
        SELECT t.id, t.ticket_no, t.category, t.priority, t.status, t.opened_at, c.name AS customer
        FROM tickets t
        LEFT JOIN customers c ON c.id = t.customer_id
        ORDER BY t.opened_at DESC`);
      return rows.map((r) => ({
        id: str(r.id),
        ticketNo: str(r.ticket_no),
        customer: str(r.customer),
        category: str(r.category),
        priority: (str(r.priority) || "medium") as ServiceTicket["priority"],
        status: str(r.status) as ServiceTicket["status"],
        ageDays: r.opened_at ? Math.max(0, Math.round((Date.now() - new Date(r.opened_at as string).getTime()) / 86_400_000)) : 0,
      }));
    })(),
  ]);
  return { amc, visitors, bills, tickets };
}

// ---------------------------------------------------------------------------
// Rentals
// ---------------------------------------------------------------------------

export interface RentalsPayload {
  leases: Lease[];
  invoices: RentInvoice[];
  summary: typeof rentalsSummaryFallback;
}

const rentalsSummaryFallback = { activeLeases: 0, monthlyRentRun: 0, overdueAmount: 0, avgOccupancy: 0 };

async function fetchLeases(): Promise<Lease[]> {
  const rows = await q<DbRow>(`
    SELECT l.id, l.lease_no, l.start_date, l.end_date, l.monthly_rent, l.escalation_pct,
           l.security_deposit, l.status, u.unit_no, bl.code AS block_code, t.code AS tower_code,
           pr.name AS project_name, c.name AS tenant
    FROM leases l
    JOIN units u ON u.id = l.unit_id
    JOIN blocks bl ON bl.id = u.block_id
    JOIN floors f ON f.id = bl.floor_id
    JOIN towers t ON t.id = f.tower_id
    JOIN projects pr ON pr.id = t.project_id
    LEFT JOIN lease_tenants lt ON lt.lease_id = l.id AND lt.is_primary
    LEFT JOIN customers c ON c.id = lt.tenant_customer_id
    ORDER BY l.created_at DESC`);
  return rows.map((r) => ({
    id: str(r.id),
    leaseNo: str(r.lease_no),
    unit: `${str(r.tower_code)}-${str(r.block_code)}-${str(r.unit_no)} · ${str(r.project_name)}`,
    tenant: str(r.tenant),
    start: dateStr(r.start_date),
    end: dateStr(r.end_date),
    monthlyRent: num(r.monthly_rent),
    escalationPct: num(r.escalation_pct),
    deposit: num(r.security_deposit),
    status: str(r.status) as Lease["status"],
  }));
}

async function fetchRentInvoices(): Promise<RentInvoice[]> {
  const rows = await q<DbRow>(`
    SELECT i.id, i.invoice_no, i.status, i.due_date, i.total_amount, i.created_at,
           li.period_start, c.name AS tenant, u.unit_no, bl.code AS block_code, t.code AS tower_code, pr.name AS project_name
    FROM lease_invoices li
    JOIN invoices i ON i.id = li.invoice_id
    JOIN leases l ON l.id = li.lease_id
    LEFT JOIN customers c ON c.id = i.customer_id
    JOIN units u ON u.id = l.unit_id
    JOIN blocks bl ON bl.id = u.block_id
    JOIN floors f ON f.id = bl.floor_id
    JOIN towers t ON t.id = f.tower_id
    JOIN projects pr ON pr.id = t.project_id
    ORDER BY i.created_at DESC`);
  return rows.map((r) => {
    const period = new Date(`${dateStr(r.period_start)}T00:00:00`);
    return {
      id: str(r.id),
      invNo: str(r.invoice_no),
      unit: `${str(r.tower_code)}-${str(r.block_code)}-${str(r.unit_no)} · ${str(r.project_name)}`,
      tenant: str(r.tenant),
      month: Number.isNaN(period.getTime()) ? "" : `${MONTH_SHORT.format(period)} ${period.getFullYear()}`,
      amount: num(r.total_amount),
      due: dateStr(r.due_date),
      status: str(r.status) as RentInvoice["status"],
    };
  });
}

export async function getRentals(): Promise<RentalsPayload> {
  const [leases, invoices, summary] = await Promise.all([
    fetchLeases(),
    fetchRentInvoices(),
    config<RentalsPayload["summary"]>("rentals.summary", rentalsSummaryFallback),
  ]);
  return { leases, invoices, summary };
}

// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

export interface MarketplacePayload {
  partners: MarketplacePartner[];
  deals: MarketplaceDeal[];
}

export async function getMarketplace(): Promise<MarketplacePayload> {
  const [partners, deals] = await Promise.all([
    (async () => {
      const rows = await q<DbRow>(`
        SELECT p.id, p.name, p.status, p.verified_at, p.city, p.rating, p.deals, p.conversion,
               ps.service_name AS category
        FROM marketplace_partners p
        LEFT JOIN LATERAL (
          SELECT service_name FROM partner_services WHERE partner_id = p.id LIMIT 1
        ) ps ON true
        ORDER BY p.rating DESC`);
      return rows.map((r) => ({
        id: str(r.id),
        name: str(r.name),
        category: (str(r.category) || "home_loan") as MarketplacePartner["category"],
        city: str(r.city),
        rating: num(r.rating),
        deals: num(r.deals),
        conversion: num(r.conversion),
        verified: str(r.status) === "verified",
      }));
    })(),
    (async () => {
      const rows = await q<DbRow>(`
        SELECT r.id, r.revenue, r.ai_score, r.commission_amount, r.status, r.created_at,
               c.name AS customer, p.name AS partner, ps.service_name AS category
        FROM lead_referrals r
        JOIN marketplace_partners p ON p.id = r.partner_id
        LEFT JOIN customers c ON c.id = r.customer_id
        LEFT JOIN partner_services ps ON ps.id = r.service_id
        ORDER BY r.created_at DESC`);
      return rows.map((r) => ({
        id: str(r.id),
        customer: str(r.customer),
        partner: str(r.partner),
        category: (str(r.category) || "home_loan") as MarketplaceDeal["category"],
        commission: num(r.commission_amount),
        revenue: num(r.revenue),
        stage: (str(r.status) || "matched") as MarketplaceDeal["stage"],
        aiScore: num(r.ai_score),
      }));
    })(),
  ]);
  return { partners, deals };
}

// ---------------------------------------------------------------------------
// Channel partners
// ---------------------------------------------------------------------------

export interface PartnersPayload {
  partners: ChannelPartner[];
  deals: CpDeal[];
}

export async function getPartners(): Promise<PartnersPayload> {
  const [partners, deals] = await Promise.all([
    q<DbRow>(`SELECT id, name, agency_name, tier, commission_rate, deals_active, payout_ytd, rating FROM channel_partners ORDER BY rating DESC`),
    q<DbRow>(`
      SELECT cd.id, cd.deal_no, cd.deal_value, cd.commission_amount, cd.stage, cd.duplicate_flag,
             cp.agency_name, c.name AS customer, pr.name AS project
      FROM channel_deals cd
      JOIN channel_partners cp ON cp.id = cd.partner_id
      LEFT JOIN customers c ON c.id = cd.customer_id
      LEFT JOIN projects pr ON pr.id = cd.project_id
      ORDER BY cd.registered_at DESC`),
  ]);
  return {
    partners: partners.map((r) => ({
      id: str(r.id),
      name: str(r.name),
      agency: str(r.agency_name),
      tier: (str(r.tier) || "silver") as PartnerTier,
      dealsActive: num(r.deals_active),
      commissionRate: num(r.commission_rate),
      payoutYtd: num(r.payout_ytd),
      rating: num(r.rating),
    })),
    deals: deals.map((r) => ({
      id: str(r.id),
      dealNo: str(r.deal_no),
      partner: str(r.agency_name),
      customer: str(r.customer),
      project: str(r.project),
      value: num(r.deal_value),
      commission: num(r.commission_amount),
      stage: str(r.stage) as CpDeal["stage"],
      duplicate: bool(r.duplicate_flag),
    })),
  };
}

// ---------------------------------------------------------------------------
// AI command center + chat
// ---------------------------------------------------------------------------

export interface AiCommandPayload {
  agents: AiAgent[];
  insights: AiInsight[];
  tasks: AgentTask[];
}

export async function getAiCommand(): Promise<AiCommandPayload> {
  const [agents, alerts, runs] = await Promise.all([
    q<DbRow>(`SELECT id, code, name, agent_type, config_json FROM ai_agents ORDER BY agent_type`),
    q<DbRow>(`SELECT id, entity, severity, title, body, generated_at FROM ai_alerts WHERE alert_type = 'ai_insight' ORDER BY generated_at DESC, id`),
    q<DbRow>(`SELECT id, workflow_key, tenant_entity, status, result_json, started_at FROM ai_workflow_runs ORDER BY started_at DESC`),
  ]);
  const agentsOut: AiAgent[] = agents.map((r) => {
    const cfg = (r.config_json as Record<string, unknown> | null) ?? {};
    return {
      key: (str(r.code).replace("_agent", "") || "sales") as AgentKey,
      name: str(r.name),
      role: str(cfg.role),
      status: (str(cfg.status) || "idle") as AiAgent["status"],
      activeTasks: num(cfg.activeTasks),
      successRate: num(cfg.successRate),
      latencyMs: num(cfg.latencyMs),
      lastActivity: str(cfg.lastActivity),
    };
  });
  const insights: AiInsight[] = alerts.map((r) => ({
    id: str(r.id),
    agent: (str(r.entity) || "sales") as AgentKey,
    tone: severityTone(str(r.severity)),
    title: str(r.title),
    body: str(r.body),
    time: relTime(r.generated_at),
  }));
  const tasks: AgentTask[] = runs.map((r) => {
    const result = (r.result_json as { progress?: number; state?: string } | null) ?? {};
    const wfStatus = str(r.status);
    return {
      id: str(r.id),
      agent: inferAgent(str(r.workflow_key)),
      title: str(r.workflow_key),
      target: str(r.tenant_entity),
      status: wfStatus === "completed" ? "done" : wfStatus === "needs_approval" ? "queued" : "running",
      progress: num(result.progress),
    };
  });
  return { agents: agentsOut, insights, tasks };
}

export async function getAiChat(): Promise<{ from: "user" | "ai"; text: string }[]> {
  const rows = await q<DbRow>(`
    SELECT m.role, m.content, COALESCE((m.payload->>'seq')::int, 0) AS seq
    FROM ai_messages m
    JOIN ai_conversations c ON c.id = m.conversation_id
    ORDER BY m.created_at, seq`);
  return rows.map((r) => ({
    from: (str(r.role) === "assistant" ? "ai" : "user") as "user" | "ai",
    text: str(r.content),
  }));
}

export async function addAiMessage(message: { from: "user" | "ai"; text: string }) {
  const convoId = await qVal<string>(`SELECT id::text AS v FROM ai_conversations ORDER BY created_at DESC LIMIT 1`);
  if (convoId) {
    const seq =
      (await qVal<number>(`SELECT COALESCE(MAX(COALESCE((payload->>'seq')::int, 0)), 0) + 1 AS v FROM ai_messages WHERE conversation_id = $1`, [convoId])) ?? 0;
    await q(
      `INSERT INTO ai_messages (conversation_id, role, content, payload) VALUES ($1, $2, $3, $4)`,
      [convoId, message.from === "ai" ? "assistant" : "user", message.text, JSON.stringify({ seq })],
    );
  }
  return { from: message.from, text: message.text };
}

// ---------------------------------------------------------------------------
// Inventory / land mutations
// ---------------------------------------------------------------------------

export async function updateUnitStatus(unitId: string, status: UnitStatus): Promise<Unit | null> {
  await q(`UPDATE units SET status = $1, status_changed_at = now(), updated_at = now() WHERE id = $2`, [status, unitId]);
  const row = await qOne<DbRow>(`${UNIT_SELECT}${UNIT_JOIN} WHERE u.id = $1`, [unitId]);
  return row ? mapUnitRow(row) : null;
}

export async function lockUnit(unitId: string, heldBy: string, ttlMinutes = 15): Promise<{ locked: boolean; expiresAt: number }> {
  const existing = await qOne<DbRow>(
    `SELECT expires_at FROM unit_holds WHERE unit_id = $1 AND released_at IS NULL AND expires_at > now() ORDER BY expires_at DESC LIMIT 1`,
    [unitId],
  );
  if (existing) return { locked: false, expiresAt: new Date(existing.expires_at as string).getTime() };
  const heldById = (await userIdByName(heldBy)) ?? heldBy;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  await q(`INSERT INTO unit_holds (unit_id, held_by, expires_at, reason) VALUES ($1, $2, $3, 'quote_hold')`, [unitId, heldById, expiresAt]);
  return { locked: true, expiresAt: expiresAt.getTime() };
}

export async function updateLandStatus(landId: string, status: LandStatus): Promise<LandParcel | Plot | null> {
  const parcel = await qOne<DbRow>(`SELECT id FROM land_parcels WHERE id = $1`, [landId]);
  if (parcel) {
    await q(`UPDATE land_parcels SET status = $1, status_changed_at = now(), updated_at = now() WHERE id = $2`, [status, landId]);
    return fetchParcelById(landId);
  }
  const plot = await qOne<DbRow>(`SELECT id, status FROM plots WHERE id = $1`, [landId]);
  if (!plot) return null;
  const current = str(plot.status) as UnitStatus;
  const next: UnitStatus = ["sold", "token_paid", "available", "blocked", "under_maintenance"].includes(status) ? (status as UnitStatus) : current;
  await q(`UPDATE plots SET status = $1, status_changed_at = now() WHERE id = $2`, [next, landId]);
  const row = await qOne<DbRow>(`SELECT id, plot_no, zone, area_sqft, price, status FROM plots WHERE id = $1`, [landId]);
  return row
    ? {
        id: str(row.id),
        no: str(row.plot_no),
        zone: (str(row.zone) || "residential") as "residential" | "commercial" | "villa",
        sqft: num(row.area_sqft),
        price: num(row.price),
        status: str(row.status) as UnitStatus,
      }
    : null;
}

export async function lockLand(landId: string, heldBy: string, ttlMinutes = 15): Promise<{ locked: boolean; expiresAt: number }> {
  const existing = await qOne<DbRow>(
    `SELECT expires_at FROM land_holds WHERE (parcel_id = $1 OR plot_id = $1) AND released_at IS NULL AND expires_at > now() ORDER BY expires_at DESC LIMIT 1`,
    [landId],
  );
  if (existing) return { locked: false, expiresAt: new Date(existing.expires_at as string).getTime() };
  const heldById = (await userIdByName(heldBy)) ?? heldBy;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const parcel = await qOne<DbRow>(`SELECT id FROM land_parcels WHERE id = $1`, [landId]);
  await q(
    `INSERT INTO land_holds (parcel_id, plot_id, held_by, expires_at, reason) VALUES ($1, $2, $3, $4, 'quote_hold')`,
    [parcel ? landId : null, parcel ? null : landId, heldById, expiresAt],
  );
  return { locked: true, expiresAt: expiresAt.getTime() };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getNotifications() {
  return fetchNotifications();
}
