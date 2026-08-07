/**
 * Seeds all demo values (previously in web/lib/data.ts) into Postgres.
 *
 * Run from the web/ directory:  node scripts/seed.ts
 * Node 20.6+ / 22+ runs TypeScript natively (type stripping).
 */
import { Client } from "pg";
import { createHash } from "node:crypto";
import {
  projects,
  leads,
  salesLeads,
  quotes,
  landParcels,
  plotLayouts,
  vendors,
  rfqs,
  purchaseOrders,
  grns,
  milestones,
  dprRows,
  financeRecon,
  aiAgentChat,
  notifications,
  legalAgreements,
  reraRegistrations,
  litigations,
  complianceDue,
  attendanceRows,
  contractLabourRows,
  amcContracts,
  visitorEntries,
  maintenanceBills,
  serviceTickets,
  leases,
  rentInvoices,
  marketplacePartners,
  marketplaceDeals,
  channelPartners,
  cpDeals,
  aiAgents,
  aiInsights,
  agentTasks,
  executiveKpis,
  landKpis,
  cashFlowData,
  salesVelocity,
  reconciliationSummary,
  procurementSummary,
  attendanceSummary,
  rentalSummary,
  tenants,
  PLANS,
  unitAmenities,
} from "../lib/data.ts";

const SCHEMA = process.env.TENANT_SCHEMA || "builder_a";
const CONNECTION_STRING = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING;
const PGHOST = process.env.PGHOST || "127.0.0.1";
const PGPORT = Number(process.env.PGPORT || 5432);
const PGUSER = process.env.PGUSER || "postgres";
const PGPASSWORD = process.env.PGPASSWORD || "postgres";
const PGDATABASE = process.env.PGDATABASE || "estateflow";

const NAMESPACE = Buffer.from("6ba7b810-9dad-11d1-80b4-00c04fd430c8", "hex");

function uuid(name: string): string {
  const hash = createHash("sha1").update(NAMESPACE).update(name, "utf8").digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = hash.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const userUuid = (name: string) => uuid(`user:${slug(name)}`);
const customerUuid = (name: string) => uuid(`customer:${slug(name)}`);
const vendorUuid = (code: string) => uuid(`vendor:${code}`);

let client: Client;

async function run(sql: string, params: unknown[] = []) {
  await client.query(sql, params);
}

async function val<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const res = await client.query(sql, params);
  return res.rows[0]?.v as T | undefined;
}

async function main() {
  client = CONNECTION_STRING
    ? new Client({ connectionString: CONNECTION_STRING })
    : new Client({ host: PGHOST, port: PGPORT, user: PGUSER, password: PGPASSWORD, database: PGDATABASE });
  await client.connect();
  await client.query("BEGIN");

  // ---------------------------------------------------------------------------
  // 0. WIPE previous seed (data tables only; lookup tables preserved)
  // ---------------------------------------------------------------------------
  const wipe = [
    "units", "floors", "blocks", "towers", "projects",
    "land_parcels", "plot_layouts", "plots",
    "leads", "lead_sources", "customers", "quotations",
    "bookings", "payment_schedules", "payment_schedule_lines",
    "receipts", "invoices", "invoice_lines",
    "bank_accounts", "bank_statements", "bank_statement_lines",
    "reconciliation_runs", "reconciliation_matches",
    "vendors", "rfqs", "rfq_responses", "purchase_orders", "po_lines", "grns", "grn_lines",
    "construction_milestones", "dprs",
    "departments", "employees", "attendance_records", "contract_labour",
    "societies", "amc_contracts", "visitors", "visitor_logs",
    "society_maintenance_bills", "tickets",
    "leases", "lease_tenants", "lease_invoices",
    "agreements", "rera_project_registrations", "rera_disclosures", "litigations",
    "marketplace_partners", "partner_services", "lead_referrals", "commissions",
    "channel_partners", "channel_deals",
    "ai_agents", "ai_conversations", "ai_messages", "ai_alerts", "ai_workflow_runs",
    "site_visits", "notifications", "app_config",
    "documents", "cash_flow_forecasts", "unit_amenities",
    "site_photos", "events", "event_rsvps", "owner_listings",
    "users",
  ];
  for (const t of wipe) {
    await run(`TRUNCATE TABLE ${SCHEMA}.${t} CASCADE`);
  }
  console.log("[0] wiped seed tables");

  // ---------------------------------------------------------------------------
  // 1. USERS
  // ---------------------------------------------------------------------------
  const userRows: { name: string; email: string }[] = [
    { name: "Arjun Nair", email: "arjun@builder-a.in" },
    { name: "Neha Gupta", email: "neha@builder-a.in" },
    { name: "Ravi Kumar", email: "ravi@builder-a.in" },
    { name: "Suman Das", email: "suman@builder-a.in" },
    { name: "Demo User", email: "demo@builder-a.in" },
  ];
  for (const u of userRows) {
    await run(
      `INSERT INTO ${SCHEMA}.users (id, global_user, email, phone, display_name, status, locale, timezone)
       VALUES ($1, $2, $3, $4, $5, 'active', 'en-IN', 'Asia/Kolkata')`,
      [userUuid(u.name), uuid(`global:${slug(u.name)}`), u.email, null, u.name],
    );
  }
  console.log("[1] users seeded");

  // ---------------------------------------------------------------------------
  // 2. LEAD SOURCES
  // ---------------------------------------------------------------------------
  const sources: [string, string, string][] = [
    ["facebook", "Facebook", "facebook"],
    ["google_ads", "Google Ads", "google_ads"],
    ["whatsapp", "WhatsApp", "whatsapp"],
    ["ivr", "IVR", "ivr"],
    ["referral", "Referral", "referral"],
    ["walkin", "Walk-in", "other"],
    ["channel", "Channel Partner", "other"],
    ["website", "Website", "website"],
    ["marketplace", "Marketplace", "marketplace"],
  ];
  for (const [code, name, channel] of sources) {
    await run(
      `INSERT INTO ${SCHEMA}.lead_sources (id, code, name, channel, is_active) VALUES ($1, $2, $3, $4, true)`,
      [uuid(`ls:${code}`), code, name, channel],
    );
  }
  const sourceUuid = (code: string) => uuid(`ls:${code}`);
  console.log("[2] lead sources seeded");

  // ---------------------------------------------------------------------------
  // 3. PROJECTS / TOWERS / FLOORS / BLOCKS / UNITS
  // ---------------------------------------------------------------------------
  const unitNoToId = new Map<string, string>();
  const projectUuidByCode = new Map<string, string>();
  const towerUuidByCode = new Map<string, string>();
  const projectType: Record<string, string> = { ELEVATE: "residential", OPUS: "commercial" };

  for (const p of projects) {
    const projectId = uuid(`project:${p.id}`);
    const totalUnits = p.towers.reduce((s, t) => s + t.units.length, 0);
    const totalSqft = p.towers.reduce((s, t) => s + t.units.reduce((x, u) => x + u.sqft, 0), 0);
    projectUuidByCode.set(p.code, projectId);
    await run(
      `INSERT INTO ${SCHEMA}.projects
        (id, code, name, project_type, status, location, total_units, total_sqft, planned_start, planned_end)
       VALUES ($1, $2, $3, $4, 'under_construction', $5, $6, $7, '2026-01-15', '2028-03-31')`,
      [projectId, p.code, p.name, projectType[p.code] ?? "residential", p.location, totalUnits, totalSqft],
    );

    for (const t of p.towers) {
      const towerId = uuid(`tower:${t.id}`);
      towerUuidByCode.set(t.code, towerId);
      const maxFloor = Math.max(...t.units.map((u) => u.floor));
      await run(
        `INSERT INTO ${SCHEMA}.towers (id, project_id, code, name, total_floors) VALUES ($1, $2, $3, $4, $5)`,
        [towerId, projectId, t.code, t.name, maxFloor],
      );
      for (let floor = 1; floor <= maxFloor; floor++) {
        await run(
          `INSERT INTO ${SCHEMA}.floors (id, tower_id, floor_no, label) VALUES ($1, $2, $3, $4)`,
          [uuid(`floor:${t.id}:${floor}`), towerId, floor, `Level ${floor}`],
        );
      }
      for (const u of t.units) {
        const blockCode = u.no.split("-")[1] ?? String(u.floor).padStart(2, "0");
        const floorId = await val<string>(
          `SELECT id::text AS v FROM ${SCHEMA}.floors WHERE tower_id = $1 AND floor_no = $2`,
          [towerId, u.floor],
        );
        if (!floorId) throw new Error(`floor missing for tower ${t.code} floor ${u.floor}`);
        const blockId = uuid(`block:${t.id}:${blockCode}`);
        await run(
          `INSERT INTO ${SCHEMA}.blocks (id, floor_id, code) VALUES ($1, $2, $3) ON CONFLICT (floor_id, code) DO NOTHING`,
          [blockId, floorId, blockCode],
        );
        const unitId = uuid(`unit:${u.id}`);
        const unitNo = u.no.split("-").slice(2).join("-") || "A";
        await run(
          `INSERT INTO ${SCHEMA}.units
            (id, block_id, unit_no, unit_type, carpet_area_sqft, super_area_sqft, bsp_price, status)
           VALUES ($1, $2, $3, $4, $5, $5, $6, $7)`,
          [unitId, blockId, unitNo, u.type, u.sqft, u.price, u.status],
        );
        unitNoToId.set(u.no, unitId);
      }
    }
  }

  // Extra floor-6 units on T1 (referenced by the rental/lease module)
  const t1Id = towerUuidByCode.get("T1");
  if (t1Id) {
    let floorId = await val<string>(
      `SELECT id::text AS v FROM ${SCHEMA}.floors WHERE tower_id = $1 AND floor_no = 6`,
      [t1Id],
    );
    if (!floorId) {
      await run(
        `INSERT INTO ${SCHEMA}.floors (id, tower_id, floor_no, label) VALUES ($1, $2, 6, 'Level 6')`,
        [uuid("floor:t1:6"), t1Id],
      );
      floorId = await val<string>(
        `SELECT id::text AS v FROM ${SCHEMA}.floors WHERE tower_id = $1 AND floor_no = 6`,
        [t1Id],
      );
    }
    if (!floorId) throw new Error("floor 6 missing after insert");
    for (const [code, letter, price] of [
      ["06", "A", 8600000],
      ["06", "B", 8800000],
      ["06", "C", 8400000],
    ] as [string, string, number][]) {
      const bid = uuid(`block:t1:${code}`);
      await run(
        `INSERT INTO ${SCHEMA}.blocks (id, floor_id, code) VALUES ($1, $2, $3) ON CONFLICT (floor_id, code) DO NOTHING`,
        [bid, floorId, code],
      );
      const uid = uuid(`unit:t1-06-${letter.toLowerCase()}`);
      await run(
        `INSERT INTO ${SCHEMA}.units (id, block_id, unit_no, unit_type, carpet_area_sqft, super_area_sqft, bsp_price, status)
         VALUES ($1, $2, $3, '3BHK', 1680, 1680, $4, 'blocked')`,
        [uid, bid, letter, price],
      );
      unitNoToId.set(`T1-06-${letter}`, uid);
    }
  }
  console.log("[3] projects/towers/units seeded");

  // ---------------------------------------------------------------------------
  // 4. LAND PORTFOLIO
  // ---------------------------------------------------------------------------
  const parcelUuidByCode = new Map<string, string>();
  for (const lp of landParcels) {
    const id = uuid(`land:${lp.id}`);
    parcelUuidByCode.set(lp.code, id);
    await run(
      `INSERT INTO ${SCHEMA}.land_parcels
        (id, code, name, village, district, state, survey_no, total_acres, total_guntas,
         rate_per_acre, zoning, title_status, title_notes, seller, docs_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [id, lp.code, lp.name, lp.village, lp.district, lp.state, lp.surveyNo, lp.acres, lp.guntas,
       lp.ratePerAcre, lp.zoning, lp.titleStatus, null, lp.seller, lp.docsCount, lp.status],
    );
  }
  const plotUuidById = new Map<string, string>();
  for (const pl of plotLayouts) {
    const layoutId = uuid(`layout:${pl.id}`);
    await run(
      `INSERT INTO ${SCHEMA}.plot_layouts (id, parcel_id, name, total_plots) VALUES ($1, $2, $3, $4)`,
      [layoutId, uuid("land:lp6"), pl.name, pl.plots.length],
    );
    for (const pt of pl.plots) {
      const id = uuid(`plot:${pt.id}`);
      plotUuidById.set(pt.id, id);
      await run(
        `INSERT INTO ${SCHEMA}.plots (id, layout_id, plot_no, zone, area_sqft, price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, layoutId, pt.no, pt.zone, pt.sqft, pt.price, pt.status],
      );
    }
  }
  console.log("[4] land portfolio seeded");

  // ---------------------------------------------------------------------------
  // 5. CUSTOMERS
  // ---------------------------------------------------------------------------
  const customerUuids = new Map<string, string>();
  const allCustomers = Array.from(
    new Set([
      ...quotes.map((q) => q.customer),
      ...leases.map((l) => l.tenant),
      ...cpDeals.map((d) => d.customer),
      ...marketplaceDeals.map((d) => d.customer),
      ...serviceTickets.map((t) => t.customer),
      ...legalAgreements.map((a) => a.customer),
    ]),
  );
  const leadPhone = (name: string) => {
    const l = [...leads, ...salesLeads].find((x) => x.name === name);
    return l?.phone ?? null;
  };
  for (const name of allCustomers) {
    const id = customerUuid(name);
    customerUuids.set(name, id);
    await run(
      `INSERT INTO ${SCHEMA}.customers (id, name, kyc_status, primary_phone, primary_email) VALUES ($1, $2, 'verified', $3, $4)`,
      [id, name, leadPhone(name), `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@example.in`],
    );
  }
  console.log("[5] customers seeded");

  // ---------------------------------------------------------------------------
  // 6. LEADS (CRM) + SALES LEADS (Sales Engine)
  // ---------------------------------------------------------------------------
  const projectIdBySeed = (seed: string) => uuid(`project:${seed}`);
  const projectIdByName = (name: string) => {
    const p = projects.find((x) => x.name === name);
    return p ? projectIdBySeed(p.id) : null;
  };

  async function insertLead(l: { id: string; name: string; phone: string; source: string; project: string; unitType: string; budget: number; score: number; assigned: string; segment: string; createdAt: string; status: string }, stage?: string, engine: "crm" | "sales" = "crm") {
    const sourceId = sourceUuid(l.source) ?? sourceUuid("other");
    const assignedId = l.assigned && l.assigned !== "Unassigned" ? userUuid(l.assigned) : null;
    const projectId = projectIdByName(l.project) ?? null;
    const isLand = l.segment === "land";
    const status = l.status === "site_visit_scheduled" ? "site_visit_scheduled" : l.status === "booking_initiated" ? "booking_initiated" : l.status;
    await run(
      `INSERT INTO ${SCHEMA}.leads
        (id, lead_source_id, status, sales_stage, name, phone, budget_min, budget_max,
         location_intent, project_interest, unit_type_interest, score, score_reason, assigned_to, assigned_at,
         source_payload, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [uuid(`lead:${l.id}`), sourceId, status, stage ?? null, l.name, l.phone, l.budget, l.budget,
       l.project, projectId, l.unitType, l.score, JSON.stringify({ engine }), assignedId, l.createdAt,
       JSON.stringify({ segment: l.segment, source: l.source, isLand }), l.createdAt],
    );
  }

  const statusToStage: Record<string, string> = {
    new: "new", contacted: "qualified", qualified: "qualified",
    site_visit_scheduled: "visit_scheduled", booking_initiated: "booked", won: "won", lost: "lost",
  };
  for (const l of leads) await insertLead(l as never, statusToStage[l.status] ?? "new", "crm");
  const stageToStatus: Record<string, string> = {
    new: "new", qualified: "qualified", visit_scheduled: "site_visit_scheduled",
    offer: "qualified", booked: "booking_initiated", won: "won", lost: "lost",
  };
  for (const l of salesLeads) await insertLead({ ...l, status: stageToStatus[l.stage] ?? "new" } as never, l.stage, "sales");
  console.log("[6] leads seeded");

  // ---------------------------------------------------------------------------
  // 7. QUOTATIONS (apartments + land)
  // ---------------------------------------------------------------------------
  for (const q of quotes) {
    const customerId = customerUuids.get(q.customer);
    const execId = q.salesExecutive ? userUuid(q.salesExecutive) : null;
    let unitId: string | null = null;
    let parcelId: string | null = null;
    let plotId: string | null = null;
    let projectId: string | null = null;
    if (q.segment === "land") {
      parcelId = q.unit.startsWith("LP-") ? parcelUuidByCode.get(q.unit) ?? null : null;
      if (!parcelId) {
        const pt = plotLayouts.flatMap((pl) => pl.plots).find((x) => x.no === q.unit);
        plotId = pt ? plotUuidById.get(pt.id) ?? null : null;
      }
    } else {
      unitId = unitNoToId.get(q.unit) ?? null;
      const p = projects.find((x) => x.name === q.project);
      projectId = p ? projectIdBySeed(p.id) : null;
    }
    await run(
      `INSERT INTO ${SCHEMA}.quotations
        (id, quote_no, customer_id, project_id, unit_id, land_parcel_id, plot_id, sales_executive,
         status, base_amount, discount_pct, discount_amount, total_amount, valid_until, terms_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, '2026-08-30', '{}', $14)`,
      [uuid(`quote:${q.id}`), q.quoteNo, customerId, projectId, unitId, parcelId, plotId, execId,
       q.status, q.base, q.discountPct, Math.round(q.base * q.discountPct) / 100, q.total, q.createdAt],
    );
  }
  console.log("[7] quotations seeded");

  // ---------------------------------------------------------------------------
  // 8. BOOKINGS + PAYMENT SCHEDULE (portal) + DOCUMENTS
  // ---------------------------------------------------------------------------
  const bookingId = uuid("booking:portal-1");
  const portalUnitId = unitNoToId.get("T1-03-A");
  const portalCustomerId = customerUuids.get("Rohan Mehta");
  const portalQuoteId = uuid("quote:q1");
  await run(
    `INSERT INTO ${SCHEMA}.bookings (id, booking_no, quotation_id, customer_id, unit_id, status, token_amount, created_by, created_at)
     VALUES ($1, 'BK-2026-001', $2, $3, $4, 'confirmed', 200000, $5, now())`,
    [bookingId, portalQuoteId, portalCustomerId, portalUnitId, userUuid("Arjun Nair")],
  );
  if (portalUnitId) {
    await run(`UPDATE ${SCHEMA}.units SET status = 'token_paid', current_booking_id = $1 WHERE id = $2`, [bookingId, portalUnitId]);
  }
  const scheduleId = uuid("schedule:portal-1");
  await run(
    `INSERT INTO ${SCHEMA}.payment_schedules (id, booking_id, schedule_type, total_amount) VALUES ($1, $2, 'milestone', 13400000)`,
    [scheduleId, bookingId],
  );
  const instalments = [
    ["Booking amount", "2026-08-12", 200000, true],
    ["15% — Agreement value", "2026-09-15", 2010000, false],
    ["20% — Structure up to L5", "2026-12-01", 2680000, false],
    ["20% — Slab cast milestone", "2027-04-15", 2680000, false],
    ["Balance — Possession", "2028-01-20", 5900000, false],
  ] as [string, string, number, boolean][];
  for (const [i, [label, due, amount, paid]] of instalments.entries()) {
    await run(
      `INSERT INTO ${SCHEMA}.payment_schedule_lines
        (id, schedule_id, installment_no, label, due_date, amount, tax_amount, total_due, paid_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $6, $7, $8)`,
      [uuid(`psl:portal:${i + 1}`), scheduleId, i + 1, label, due, amount, paid ? amount : 0, paid ? "paid" : "pending"],
    );
  }
  await run(
    `INSERT INTO ${SCHEMA}.invoices
      (id, invoice_no, customer_id, booking_id, invoice_type, status, base_amount, cgst, sgst, igst, cess, tds, total_amount, due_date, issued_at, gstin, posted)
     VALUES ($1, 'INV-2026-101', $2, $3, 'customer', 'issued', 200000, 18000, 18000, 0, 0, 0, 236000, '2026-08-15', now(), '29ABCDE1234F1Z5', true)`,
    [uuid("inv:portal-1"), portalCustomerId, bookingId],
  );
  await run(
    `INSERT INTO ${SCHEMA}.documents (id, doc_type, title, status) VALUES ($1, 'sale_document', 'Agreement for Sale (draft)', 'draft')`,
    [uuid("doc:portal-1")],
  );
  await run(
    `INSERT INTO ${SCHEMA}.documents (id, doc_type, title, status) VALUES ($1, 'sale_document', 'Payment schedule & Annexure', 'draft')`,
    [uuid("doc:portal-2")],
  );
  await run(
    `INSERT INTO ${SCHEMA}.documents (id, doc_type, title, status) VALUES ($1, 'sale_document', 'RERA registration certificate', 'signed')`,
    [uuid("doc:portal-3")],
  );
  await run(
    `INSERT INTO ${SCHEMA}.documents (id, doc_type, title, status) VALUES ($1, 'sale_document', 'Allotment letter', 'signed')`,
    [uuid("doc:portal-4")],
  );
  console.log("[8] portal booking seeded");

  // ---------------------------------------------------------------------------
  // 8b. AMENITIES (lookup + unit links for the portal unit)
  // ---------------------------------------------------------------------------
  if (portalUnitId) {
    for (const a of unitAmenities) {
      const amenityId = uuid(`amenity:${a.kind}`);
      await run(
        `INSERT INTO ${SCHEMA}.amenities (id, code, name) VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name`,
        [amenityId, a.kind, a.name],
      );
      await run(
        `INSERT INTO ${SCHEMA}.unit_amenities (unit_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [portalUnitId, amenityId],
      );
    }
    console.log("[8b] amenities seeded");
  }

  // ---------------------------------------------------------------------------
  // 8c. PORTAL: RECEIPT + SUPPORT TICKETS + REFERRALS
  // ---------------------------------------------------------------------------
  await run(
    `INSERT INTO ${SCHEMA}.receipts (id, receipt_no, customer_id, booking_id, amount, payment_mode, reference, received_at, received_by, posted)
     VALUES ($1, $2, $3, $4, 200000, 'upi', 'UPI/RMH-0812', '2026-08-12', $5, true)`,
    [uuid("receipt:portal-booking"), "RCPT-2026-0812", portalCustomerId, bookingId, userUuid("Arjun Nair")],
  );
  const portalSnagsSeed: { id: string; no: string; subject: string; priority: string; status: string; ageDays: number }[] = [
    { id: "snag1", no: "TK-2026-119", subject: "Paint touch-up near balcony door frame", priority: "medium", status: "open", ageDays: 1 },
    { id: "snag2", no: "TK-2026-120", subject: "Bedroom 2 electrical switchplate loose", priority: "low", status: "in_progress", ageDays: 3 },
  ];
  for (const s of portalSnagsSeed) {
    await run(
      `INSERT INTO ${SCHEMA}.tickets (id, ticket_no, customer_id, unit_id, category, priority, status, subject, opened_at, channel)
       VALUES ($1, $2, $3, $4, 'Snagging', $5, $6, $7, $8, 'portal')`,
      [uuid(`ticket:${s.id}`), s.no, portalCustomerId, portalUnitId, s.priority, s.status, s.subject,
       new Date(Date.now() - s.ageDays * 86400_000).toISOString()],
    );
  }
  const referralCode = "RMH-2026";
  const referralLeadsSeed: { name: string; phone: string; status: string; stage: string; budget: number }[] = [
    { name: "Neha Krishnan", phone: "+91 97401 56780", status: "won", stage: "won", budget: 13400000 },
    { name: "Arvind Rao", phone: "+91 90080 11223", status: "booking_initiated", stage: "booked", budget: 14200000 },
    { name: "Pooja Nair", phone: "+91 98801 44556", status: "site_visit_scheduled", stage: "visit_scheduled", budget: 9600000 },
  ];
  for (const [i, l] of referralLeadsSeed.entries()) {
    await run(
      `INSERT INTO ${SCHEMA}.leads
        (id, lead_source_id, status, sales_stage, name, phone, budget_min, budget_max,
         project_interest, unit_type_interest, score, score_reason, assigned_to, source_payload, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now())`,
      [uuid(`lead:referral-${i + 1}`), sourceUuid("referral"), l.status, l.stage, l.name, l.phone, l.budget, l.budget,
       projectIdByName("Elevate Residences"), "3BHK", 74, JSON.stringify({ source: "referral", note: "Referred by existing owner" }), userUuid("Arjun Nair"),
       JSON.stringify({ segment: "apartments", source: "referral", isLand: false, referral_code: referralCode })],
    );
  }
  console.log("[8c] portal receipts / snag tickets / referrals seeded");

  // ---------------------------------------------------------------------------
  // 8d. PORTAL BATCH: SITE PHOTOS, EVENTS, WARRANTY, LOYALTY, KYC, LISTING
  // ---------------------------------------------------------------------------
  const portalProjectId = projectUuidByCode.get("ELEVATE")!;
  const portalTowerId = towerUuidByCode.get("T1") ?? null;
  const sitePhotosSeed: { id: string; mediaType: string; url: string; caption: string; shotOn: string }[] = [
    { id: "photo1", mediaType: "photo", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=70", caption: "Level 5 slab shutter work", shotOn: "2026-08-05" },
    { id: "photo2", mediaType: "photo", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=70", caption: "East wing — steel fixing for slab", shotOn: "2026-08-04" },
    { id: "photo3", mediaType: "photo", url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&q=70", caption: "T1 tower view from east approach", shotOn: "2026-08-03" },
    { id: "video1", mediaType: "video", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", caption: "Drone walkthrough — Level 4 slab cast", shotOn: "2026-08-03" },
  ];
  for (const p of sitePhotosSeed) {
    await run(
      `INSERT INTO ${SCHEMA}.site_photos (id, project_id, tower_id, media_type, url, caption, shot_on, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
      [uuid(`sphoto:${p.id}`), portalProjectId, portalTowerId, p.mediaType, p.url, p.caption, p.shotOn],
    );
  }
  const portalEventsSeed: { id: string; title: string; type: string; description: string; startsAt: string; location: string; capacity: number }[] = [
    { id: "event1", title: "Homeowner Meet — Elevate Residences", type: "homeowner_meet", description: "Meet the project team, review construction progress and discuss the year ahead for your community.", startsAt: "2026-09-13T11:00:00", location: "Sales Gallery, Elevate Residences", capacity: 120 },
    { id: "event2", title: "Site Walkthrough — T1 Tower", type: "site_walkthrough", description: "Guided walkthrough of your tower with the construction team. Safety gear provided.", startsAt: "2026-09-20T10:00:00", location: "Gate 2, Elevate Residences", capacity: 40 },
  ];
  for (const e of portalEventsSeed) {
    await run(
      `INSERT INTO ${SCHEMA}.events (id, project_id, title, description, event_type, starts_at, location, capacity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
      [uuid(`event:${e.id}`), portalProjectId, e.title, e.description, e.type, e.startsAt, e.location, e.capacity],
    );
  }
  await run(
    `INSERT INTO ${SCHEMA}.event_rsvps (id, event_id, customer_id, status, rsvped_at)
     VALUES ($1, $2, $3, 'going', now())`,
    [uuid("rsvp:event1"), uuid("event:event1"), portalCustomerId],
  );
  const warrantyDocsSeed: { id: string; docType: string; title: string; status: string }[] = [
    { id: "warranty1", docType: "warranty", title: "5-year structural warranty policy", status: "executed" },
    { id: "warranty2", docType: "warranty", title: "2-year fittings & finishes warranty", status: "signed" },
    { id: "handover1", docType: "handover", title: "Handover & possession letter (draft)", status: "draft" },
  ];
  for (const w of warrantyDocsSeed) {
    await run(
      `INSERT INTO ${SCHEMA}.documents (id, doc_type, title, status, project_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())`,
      [uuid(`doc:${w.id}`), w.docType, w.title, w.status, portalProjectId],
    );
  }
  await run(
    `UPDATE ${SCHEMA}.customers SET loyalty_points = 1250, loyalty_tier = 'silver', kyc_status = 'pending', pan = NULL, aadhaar_hash = NULL WHERE id = $1`,
    [portalCustomerId],
  );
  await run(
    `INSERT INTO ${SCHEMA}.owner_listings (id, customer_id, unit_id, listing_type, title, description, price, status, created_at)
     VALUES ($1, $2, $3, 'sale', '3BHK T1-03-A — Elevate Residences', 'Corner unit, 1650 sqft, east-facing. Ready for possession 2028.', 16200000, 'active', now())`,
    [uuid("listing:portal-1"), portalCustomerId, portalUnitId],
  );
  console.log("[8d] portal site photos / events / warranty / loyalty / listing seeded");

  // ---------------------------------------------------------------------------
  // 9. CONSTRUCTION: MILESTONES + DPRs
  // ---------------------------------------------------------------------------
  const elevateId = projectUuidByCode.get("ELEVATE")!;
  const statusMap: Record<string, string> = {
    completed: "completed", on_track: "in_progress", at_risk: "at_risk", delayed: "delayed", pending: "pending",
  };
  for (const [i, m] of milestones.entries()) {
    await run(
      `INSERT INTO ${SCHEMA}.construction_milestones
        (id, project_id, code, name, planned_date, actual_date, status, delay_days, sequence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)`,
      [uuid(`milestone:${m.id}`), elevateId, `M${i + 1}`, m.name, m.planned, m.actual ?? null, statusMap[m.status] ?? "pending", i + 1],
    );
  }
  for (const d of dprRows) {
    const towerId = towerUuidByCode.get(d.tower);
    if (!towerId) continue;
    const eng = d.engineer === "Suman Das" ? userUuid("Suman Das") : userUuid("Ravi Kumar");
    await run(
      `INSERT INTO ${SCHEMA}.dprs (id, project_id, tower_id, report_date, site_engineer, progress_pct, summary, labour, concrete_cum)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [uuid(`dpr:${d.date}:${d.tower}`), elevateId, towerId, d.date, eng, d.progress, d.note, d.labour, d.concreteCum],
    );
  }
  console.log("[9] construction seeded");

  // ---------------------------------------------------------------------------
  // 10. FINANCE: BANK STATEMENT + RECONCILIATION
  // ---------------------------------------------------------------------------
  const bankAccountId = uuid("bank:sbi");
  await run(
    `INSERT INTO ${SCHEMA}.bank_accounts (id, account_name, bank_name, account_no, ifsc, is_active)
     VALUES ($1, 'SBI Corporate', 'State Bank of India', '38071154321', 'SBIN0000418', true)`,
    [bankAccountId],
  );
  const statementId = uuid("stmt:sbi-0805");
  await run(
    `INSERT INTO ${SCHEMA}.bank_statements (id, bank_account_id, format, statement_date, imported_by, imported_at)
     VALUES ($1, $2, 'MT940', '2026-08-05', $3, now())`,
    [statementId, bankAccountId, userUuid("Demo User")],
  );
  const reconRunId = uuid("recon:run-1");
  await run(
    `INSERT INTO ${SCHEMA}.reconciliation_runs (id, statement_id, total_lines, matched_lines, unmatched_lines, run_by)
     VALUES ($1, $2, 6, 4, 2, $3)`,
    [reconRunId, statementId, userUuid("Demo User")],
  );
  for (const row of financeRecon) {
    const lineId = uuid(`bankline:${row.ref}`);
    let receiptId: string | null = null;
    if (row.type === "in" && row.matched) {
      const m = row.desc.match(/(NEFT|UPI|RTGS) — ([A-Za-z .]+)/);
      const customerName = m ? m[2].trim() : null;
      const customer = customerName ? (customerUuids.get(customerName) ?? null) : null;
      receiptId = uuid(`receipt:${row.ref}`);
      const mode = /UPI/.test(row.desc) ? "upi" : /RTGS/.test(row.desc) ? "rtgs" : "neft";
      await run(
        `INSERT INTO ${SCHEMA}.receipts (id, receipt_no, customer_id, amount, payment_mode, reference, received_at, received_by, posted)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
        [receiptId, `RCPT-2026-${row.ref.slice(-6)}`, customer, Math.abs(row.amount), mode, row.ref, row.date, userUuid("Demo User")],
      );
    }
    await run(
      `INSERT INTO ${SCHEMA}.bank_statement_lines
        (id, statement_id, txn_reference, txn_date, amount, description, matched_receipt_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [lineId, statementId, row.ref, row.date, row.amount, row.desc, receiptId],
    );
    await run(
      `INSERT INTO ${SCHEMA}.reconciliation_matches (id, run_id, bank_line_id, receipt_id, confidence, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuid(`match:${row.ref}`), reconRunId, lineId, receiptId, row.confidence, row.matched ? "confirmed" : "suggested"],
    );
  }
  console.log("[10] finance recon seeded");

  // ---------------------------------------------------------------------------
  // 11. PROCUREMENT
  // ---------------------------------------------------------------------------
  for (const v of vendors) {
    await run(
      `INSERT INTO ${SCHEMA}.vendors (id, vendor_code, name, category, city, gstin, status, quality_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [vendorUuid(v.code), v.code, v.name, v.category, v.city, v.gstin, v.status, v.rating],
    );
  }
  const rfqUuidByNo = new Map<string, string>();
  for (const r of rfqs) {
    const projectId = projects.find((x) => x.name === r.project) ? projectIdBySeed(projects.find((x) => x.name === r.project)!.id) : elevateId;
    const id = uuid(`rfq:${r.id}`);
    rfqUuidByNo.set(r.rfqNo, id);
    await run(
      `INSERT INTO ${SCHEMA}.rfqs
        (id, rfq_no, project_id, title, category, status, response_deadline, responses, best_rate, market_index, ai_flag, ai_note, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())`,
      [id, r.rfqNo, projectId, r.title, r.category, r.status, r.deadline, r.responses, r.bestRate, r.marketIndex, r.aiFlag ?? false, r.aiNote ?? null, userUuid("Demo User")],
    );
  }
  for (const p of purchaseOrders) {
    const vendorId = vendorUuid(p.vendor === "Jindal Steel Traders" ? "VND-002" : p.vendor === "Shree Cement Supplies" ? "VND-001" : p.vendor === "Apex Facade Systems" ? "VND-005" : "VND-003");
    const projectId = projects.find((x) => x.name === p.project) ? projectIdBySeed(projects.find((x) => x.name === p.project)!.id) : elevateId;
    const id = uuid(`po:${p.id}`);
    await run(
      `INSERT INTO ${SCHEMA}.purchase_orders
        (id, po_no, project_id, vendor_id, status, rfq_no, subtotal, tax_total, total, ai_drafted, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $7, $8, $9, now())`,
      [id, p.poNo, projectId, vendorId, p.status, p.rfqNo, p.total, p.aiDrafted, userUuid("Demo User")],
    );
    for (const item of p.items) {
      await run(
        `INSERT INTO ${SCHEMA}.po_lines (id, po_id, description, quantity, uom, unit_price, total, received_qty)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
        [uuid(`poline:${p.id}:${slug(item.name)}`), id, item.name, item.qty, item.uom, p.total / item.qty, p.total],
      );
    }
  }
  for (const g of grns) {
    const po = purchaseOrders.find((x) => x.poNo === g.poNo)!;
    const vendorId = vendorUuid(po.vendor === "Jindal Steel Traders" ? "VND-002" : po.vendor === "Shree Cement Supplies" ? "VND-001" : po.vendor === "Apex Facade Systems" ? "VND-005" : "VND-003");
    const poId = uuid(`po:${po.id}`);
    const grnId = uuid(`grn:${g.id}`);
    await run(
      `INSERT INTO ${SCHEMA}.grns (id, grn_no, po_id, vendor_id, received_at, received_by, status, match_type, variance_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [grnId, g.grnNo, poId, vendorId, g.receivedAt, userUuid("Demo User"), g.status, g.match, g.variancePct],
    );
    await run(
      `INSERT INTO ${SCHEMA}.grn_lines (id, grn_id, po_line_id, quantity, condition_ok)
       VALUES ($1, $2, $3, 1, true)`,
      [uuid(`grnline:${g.id}`), grnId, uuid(`poline:${po.id}:${slug(po.items[0]?.name ?? "item")}`)],
    );
  }
  console.log("[11] procurement seeded");

  // ---------------------------------------------------------------------------
  // 12. LEGAL / RERA
  // ---------------------------------------------------------------------------
  for (const a of legalAgreements) {
    await run(
      `INSERT INTO ${SCHEMA}.agreements
        (id, agreement_no, agreement_type, parties_json, status, created_at)
       VALUES ($1, $2, 'agreement_for_sale', $3, $4, now())`,
      [uuid(`agreement:${a.id}`), a.agreementNo,
       JSON.stringify({ type: a.type, customer: a.customer, asset: a.asset, esign: a.esign, digilocker: a.digilocker }),
       a.status],
    );
  }
  for (const r of reraRegistrations) {
    const project = projects.find((x) => x.name === r.project)!;
    const regId = uuid(`rera:${r.id}`);
    await run(
      `INSERT INTO ${SCHEMA}.rera_project_registrations
        (id, project_id, rera_reg_no, authority, valid_from, valid_to, status, sync_status, last_synced_at)
       VALUES ($1, $2, $3, $4, '2026-04-01', $5, $6, $7, $8)`,
      [regId, projectIdBySeed(project.id), r.regNo, r.authority, r.validTo, r.status, r.lastSync ? "synced" : "not_synced", r.lastSync ?? null],
    );
    for (const d of r.disclosures) {
      const quarterDate = d.quarter.startsWith("Q2") ? "2026-06-30" : d.quarter.startsWith("Q3") ? "2026-09-30" : "2026-12-31";
      await run(
        `INSERT INTO ${SCHEMA}.rera_disclosures (id, rera_registration_id, quarter, progress_pct, disclosures, submission_status, submitted_at)
         VALUES ($1, $2, $3, $4, '{}', $5, $6)`,
        [uuid(`rera_disc:${r.id}:${d.quarter}`), regId, quarterDate, d.progress, d.submitted ? "submitted" : "draft", d.submitted ? "2026-07-15" : null],
      );
    }
  }
  for (const l of litigations) {
    await run(
      `INSERT INTO ${SCHEMA}.litigations (id, case_number, court, party_a, party_b, status, next_hearing, summary)
       VALUES ($1, $2, $3, 'EstateFlow Builders', $4, $5, $6, $7)`,
      [uuid(`lit:${l.id}`), l.caseNo, l.court, l.parcel, l.status, l.nextHearing === "—" ? null : l.nextHearing, l.summary],
    );
  }
  console.log("[12] legal seeded");

  // ---------------------------------------------------------------------------
  // 13. HR: DEPARTMENTS, EMPLOYEES, ATTENDANCE, CONTRACT LABOUR
  // ---------------------------------------------------------------------------
  const deptMap = new Map<string, string>();
  for (const [code, name] of [["CON", "Construction"], ["PRO", "Procurement"], ["FIN", "Finance"]] as [string, string][]) {
    const id = uuid(`dept:${code}`);
    deptMap.set(name, id);
    await run(`INSERT INTO ${SCHEMA}.departments (id, code, name) VALUES ($1, $2, $3)`, [id, code, name]);
  }
  const attendanceStatusMap: Record<string, string> = {
    present: "present", late: "late", absent: "absent", on_leave: "leave",
  };
  for (const [i, e] of attendanceRows.entries()) {
    const empId = uuid(`emp:${e.id}`);
    const deptId = deptMap.get(e.department) ?? null;
    const empStatus = e.status === "on_leave" ? "on_leave" : "active";
    await run(
      `INSERT INTO ${SCHEMA}.employees (id, department_id, employee_code, name, designation, employee_type, status)
       VALUES ($1, $2, $3, $4, $5, 'full_time', $6)`,
      [empId, deptId, `EMP-${String(i + 1).padStart(3, "0")}`, e.name, e.role, empStatus],
    );
    await run(
      `INSERT INTO ${SCHEMA}.attendance_records
        (id, employee_id, project_id, work_date, check_in_at, method, geo_verified, status)
       VALUES ($1, $2, $3, '2026-08-06', $4, 'manual', $5, $6)`,
      [uuid(`att:${e.id}`), empId, elevateId, e.checkIn === "—" ? null : `2026-08-06T${e.checkIn}:00`, e.geoVerified, attendanceStatusMap[e.status] ?? "present"],
    );
  }
  const labourVendor = (name: string) => vendorUuid(name === "Sri Krishna Manpower" ? "VND-MP-01" : "VND-MP-02");
  await run(
    `INSERT INTO ${SCHEMA}.vendors (id, vendor_code, name, category, city, status)
     VALUES ($1, 'VND-MP-01', 'Sri Krishna Manpower', 'Manpower', 'Bengaluru', 'verified')`,
    [labourVendor("Sri Krishna Manpower")],
  );
  await run(
    `INSERT INTO ${SCHEMA}.vendors (id, vendor_code, name, category, city, status)
     VALUES ($1, 'VND-MP-02', 'Ganga Scaffolding', 'Manpower', 'Bengaluru', 'verified')`,
    [labourVendor("Ganga Scaffolding")],
  );
  for (const cl of contractLabourRows) {
    await run(
      `INSERT INTO ${SCHEMA}.contract_labour (id, project_id, vendor_id, name, role, daily_wage, is_active, attendance_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuid(`labour:${cl.id}`), elevateId, labourVendor(cl.vendor), cl.name, cl.role, cl.dailyWage, cl.active, cl.attendancePct],
    );
  }
  console.log("[13] hr seeded");

  // ---------------------------------------------------------------------------
  // 14. FACILITY / SOCIETY
  // ---------------------------------------------------------------------------
  const societyId = (projectCode: string) => uuid(`society:${projectCode.toLowerCase()}`);
  await run(
    `INSERT INTO ${SCHEMA}.societies (id, project_id, name) VALUES ($1, $2, 'Elevate Residences Society')`,
    [societyId("ELEVATE"), projectUuidByCode.get("ELEVATE")],
  );
  await run(
    `INSERT INTO ${SCHEMA}.societies (id, project_id, name) VALUES ($1, $2, 'Opus Business Park Association')`,
    [societyId("OPUS"), projectUuidByCode.get("OPUS")],
  );
  const amcVendor = (name: string) => {
    const codes: Record<string, string> = {
      "KONE India": "VND-AMC-1", "Cummins Power": "VND-AMC-2", "EcoClear Water": "VND-AMC-3", "SafeGuard Fire": "VND-AMC-4",
    };
    return vendorUuid(codes[name] ?? `VND-AMC-${name}`);
  };
  for (const [name, code] of Object.entries({ "KONE India": "VND-AMC-1", "Cummins Power": "VND-AMC-2", "EcoClear Water": "VND-AMC-3", "SafeGuard Fire": "VND-AMC-4" })) {
    await run(
      `INSERT INTO ${SCHEMA}.vendors (id, vendor_code, name, category, city, status)
       VALUES ($1, $2, $3, 'AMC', 'Bengaluru', 'verified') ON CONFLICT (vendor_code) DO NOTHING`,
      [amcVendor(name), code, name],
    );
  }
  for (const a of amcContracts) {
    const startsOn = new Date(new Date(a.expires).getTime() - 365 * 86400_000).toISOString().slice(0, 10);
    await run(
      `INSERT INTO ${SCHEMA}.amc_contracts (id, society_id, vendor_id, service_name, amount, starts_on, ends_on, renewal_period_months, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [uuid(`amc:${a.id}`), societyId(a.society === "Opus Business Park" ? "OPUS" : "ELEVATE"), amcVendor(a.vendor), a.service, a.amount,
       startsOn, a.expires, a.autoRenew ? 12 : 0, a.status],
    );
  }
  for (const v of visitorEntries) {
    const visitorId = uuid(`visitor:${v.id}`);
    const unitId = v.unit !== "Facility office" ? (unitNoToId.get(v.unit) ?? null) : null;
    await run(
      `INSERT INTO ${SCHEMA}.visitors (id, society_id, name, phone, purpose, visiting_unit, created_at)
       VALUES ($1, $2, $3, NULL, $4, $5, now())`,
      [visitorId, societyId("ELEVATE"), v.visitor, v.purpose, unitId],
    );
    await run(
      `INSERT INTO ${SCHEMA}.visitor_logs (id, visitor_id, check_in_at, check_out_at, qr_verified, gate)
       VALUES ($1, $2, $3, $4, $5, 'Main')`,
      [uuid(`visitorlog:${v.id}`), visitorId, `2026-08-06T${v.checkIn}:00`, v.status === "checked_out" ? `2026-08-06T${v.checkIn}:00` : null, v.qr],
    );
  }
  for (const b of maintenanceBills) {
    const unitId = unitNoToId.get(b.unit) ?? null;
    const [month, year] = b.period.split(" ");
    const mm = month === "Jul" ? "07" : "08";
    const periodStart = `${year}-${mm}-01`;
    await run(
      `INSERT INTO ${SCHEMA}.society_maintenance_bills (id, bill_no, society_id, unit_id, period_start, period_end, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuid(`bill:${b.id}`), b.billNo, societyId("ELEVATE"), unitId, periodStart, `${year}-${mm}-31`, b.amount, b.status],
    );
  }
  for (const t of serviceTickets) {
    const customerId = customerUuids.get(t.customer) ?? null;
    const openedAt = new Date(Date.now() - t.ageDays * 86400_000).toISOString();
    await run(
      `INSERT INTO ${SCHEMA}.tickets (id, ticket_no, customer_id, category, priority, status, subject, opened_at, channel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'portal')`,
      [uuid(`ticket:${t.id}`), t.ticketNo, customerId, t.category, t.priority, t.status, t.category, openedAt],
    );
  }
  console.log("[14] facility seeded");

  // ---------------------------------------------------------------------------
  // 15. RENTALS
  // ---------------------------------------------------------------------------
  for (const l of leases) {
    const unitNo = l.unit.split(" · ")[0];
    const unitId = unitNoToId.get(unitNo) ?? null;
    const leaseId = uuid(`lease:${l.id}`);
    await run(
      `INSERT INTO ${SCHEMA}.leases (id, lease_no, unit_id, start_date, end_date, monthly_rent, escalation_pct, security_deposit, notice_period_days, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 90, $9)`,
      [leaseId, l.leaseNo, unitId, l.start, l.end, l.monthlyRent, l.escalationPct, l.deposit, l.status],
    );
    const tenantId = customerUuids.get(l.tenant);
    if (tenantId) {
      await run(
        `INSERT INTO ${SCHEMA}.lease_tenants (id, lease_id, tenant_customer_id, is_primary) VALUES ($1, $2, $3, true)`,
        [uuid(`leasetenant:${l.id}`), leaseId, tenantId],
      );
    }
  }
  for (const ri of rentInvoices) {
    const unitNo = ri.unit.split(" · ")[0];
    const unitId = unitNoToId.get(unitNo) ?? null;
    const lease = leases.find((x) => x.unit === ri.unit && x.tenant === ri.tenant);
    const leaseId = lease ? uuid(`lease:${lease.id}`) : null;
    const customerId = customerUuids.get(ri.tenant) ?? null;
    const invoiceId = uuid(`rinv:${ri.id}`);
    const [month, year] = ri.month.split(" ");
    const mm = month === "Jul" ? "07" : "08";
    const monthStart = `${year}-${mm}-01`;
    await run(
      `INSERT INTO ${SCHEMA}.invoices (id, invoice_no, customer_id, invoice_type, status, base_amount, total_amount, due_date, created_at)
       VALUES ($1, $2, $3, 'rent', $4, $5, $5, $6, now())`,
      [invoiceId, ri.invNo, customerId, ri.status, ri.amount, ri.due],
    );
    if (leaseId) {
      await run(
        `INSERT INTO ${SCHEMA}.lease_invoices (id, lease_id, invoice_id, period_start, period_end, rent_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuid(`leaseinv:${ri.id}`), leaseId, invoiceId, monthStart, `${year}-${mm}-31`, ri.amount],
      );
    }
    void unitId;
  }
  console.log("[15] rentals seeded");

  // ---------------------------------------------------------------------------
  // 16. MARKETPLACE
  // ---------------------------------------------------------------------------
  const partnerTypeMap: Record<string, string> = {
    home_loan: "bank_home_loan", interiors: "interior_designer", legal: "other",
    packers: "packers_movers", insurance: "insurance", furnishing: "other",
  };
  const partnerIdByName = new Map<string, string>();
  for (const p of marketplacePartners) {
    const id = uuid(`mpartner:${p.id}`);
    partnerIdByName.set(p.name, id);
    await run(
      `INSERT INTO ${SCHEMA}.marketplace_partners (id, partner_type, name, status, verified_at, city, rating, deals, conversion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, partnerTypeMap[p.category], p.name, p.verified ? "verified" : "pending", p.verified ? "2026-01-15" : null, p.city, p.rating, p.deals, p.conversion],
    );
  }
  const loanServiceMap: Record<string, string[]> = {
    "Axis Bank — Home Loans": ["Home loan up to 85%", "Pre-approved for RERA projects", "Flexi overdraft facility"],
    "HDFC — Prime Home Loan": ["0% processing fee for this project", "Balance transfer offers", "Part-payment without penalty"],
  };
  for (const [partnerName, services] of Object.entries(loanServiceMap)) {
    const pid = partnerIdByName.get(partnerName);
    if (!pid) continue;
    const firstServiceId = uuid(`pservice:${marketplacePartners.find((x) => x.name === partnerName)!.id}`);
    await run(`UPDATE ${SCHEMA}.partner_services SET service_name = $1 WHERE id = $2`, [services[0], firstServiceId]);
    for (const [i, s] of services.slice(1).entries()) {
      await run(
        `INSERT INTO ${SCHEMA}.partner_services (id, partner_id, service_name, commission_pct) VALUES ($1, $2, $3, 2.0)`,
        [uuid(`pservice:${partnerName}-${i}`), pid, s],
      );
    }
  }
  for (const d of marketplaceDeals) {
    const partnerId = partnerIdByName.get(d.partner);
    if (!partnerId) continue;
    const serviceId = uuid(`pservice:${marketplacePartners.find((x) => x.name === d.partner)!.id}`);
    const lead = [...leads, ...salesLeads].find((x) => x.name === d.customer);
    const leadId = lead ? uuid(`lead:${lead.id}`) : null;
    const customerId = customerUuids.get(d.customer) ?? null;
    const referralId = uuid(`referral:${d.id}`);
    const stageMap: Record<string, string> = {
      matched: "sent", proposal: "sent", converted: "converted", closed: "converted",
    };
    await run(
      `INSERT INTO ${SCHEMA}.lead_referrals (id, lead_id, customer_id, partner_id, service_id, status, commission_amount, revenue, ai_score, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
      [referralId, leadId, customerId, partnerId, serviceId, stageMap[d.stage] ?? "sent", d.commission, d.revenue, d.aiScore],
    );
    if (d.stage === "converted" || d.stage === "closed") {
      await run(
        `INSERT INTO ${SCHEMA}.commissions (id, referral_id, partner_id, amount, status, earned_at)
         VALUES ($1, $2, $3, $4, $5, now())`,
        [uuid(`commission:${d.id}`), referralId, partnerId, d.commission, d.stage === "closed" ? "paid" : "due"],
      );
    }
  }
  console.log("[16] marketplace seeded");

  // ---------------------------------------------------------------------------
  // 17. CHANNEL PARTNERS
  // ---------------------------------------------------------------------------
  for (const cp of channelPartners) {
    await run(
      `INSERT INTO ${SCHEMA}.channel_partners (id, code, name, agency_name, tier, commission_rate, deals_active, payout_ytd, rating, kyc_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'verified', 'active')`,
      [uuid(`cpartner:${cp.id}`), `CP-${cp.id.toUpperCase().replace("CP", "00")}`, cp.name, cp.agency, cp.tier, cp.commissionRate, cp.dealsActive, cp.payoutYtd, cp.rating],
    );
  }
  const cpartnerIdByName = new Map<string, string>();
  for (const cp of channelPartners) cpartnerIdByName.set(cp.agency, uuid(`cpartner:${cp.id}`));
  for (const d of cpDeals) {
    const partnerId = cpartnerIdByName.get(d.partner);
    const customerId = customerUuids.get(d.customer) ?? null;
    const project = projects.find((x) => x.name === d.project);
    const projectId = project ? projectIdBySeed(project.id) : null;
    await run(
      `INSERT INTO ${SCHEMA}.channel_deals (id, deal_no, partner_id, customer_id, project_id, deal_value, commission_amount, stage, duplicate_flag, registered_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [uuid(`cpdeal:${d.id}`), d.dealNo, partnerId, customerId, projectId, d.value, d.commission, d.stage, d.duplicate, "2026-08-01"],
    );
  }
  console.log("[17] channel partners seeded");

  // ---------------------------------------------------------------------------
  // 18. AI LAYER
  // ---------------------------------------------------------------------------
  const agentTypeMap: Record<string, string> = {
    sales: "sales", construction: "construction", finance: "finance",
    legal: "legal", procurement: "procurement", customer: "customer",
  };
  const modelMap: Record<string, string> = {
    sales: "gpt-4o", construction: "claude-3.5-sonnet", finance: "gpt-4o",
    legal: "gpt-4o", procurement: "gpt-4o", customer: "gpt-4o",
  };
  const agentIdByKey = new Map<string, string>();
  for (const a of aiAgents) {
    const id = uuid(`ai_agent:${a.key}`);
    agentIdByKey.set(a.key, id);
    await run(
      `INSERT INTO ${SCHEMA}.ai_agents (id, code, name, agent_type, model, is_enabled, config_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, `${a.key}_agent`, a.name, agentTypeMap[a.key], modelMap[a.key], a.status !== "training",
       JSON.stringify({ role: a.role, status: a.status, activeTasks: a.activeTasks, successRate: a.successRate, latencyMs: a.latencyMs, lastActivity: a.lastActivity })],
    );
  }
  for (const ins of aiInsights) {
    const severity = ins.tone === "success" ? "info" : ins.tone === "danger" ? "critical" : ins.tone;
    await run(
      `INSERT INTO ${SCHEMA}.ai_alerts (id, alert_type, entity, severity, title, body, generated_at)
       VALUES ($1, 'ai_insight', $2, $3, $4, $5, now())`,
      [uuid(`alert:${ins.id}`), ins.agent, severity, ins.title, ins.body],
    );
  }
  for (const t of agentTasks) {
    const wfStatus = t.status === "done" ? "completed" : t.status === "queued" ? "needs_approval" : "running";
    await run(
      `INSERT INTO ${SCHEMA}.ai_workflow_runs (id, workflow_key, tenant_entity, status, result_json, started_at)
       VALUES ($1, $2, $3, $4, $5, now())`,
      [uuid(`task:${t.id}`), t.title, t.target, wfStatus, JSON.stringify({ progress: t.progress, state: t.status })],
    );
  }
  const salesAgentId = agentIdByKey.get("sales")!;
  const rohanLeadId = uuid(`lead:${salesLeads.find((x) => x.name === "Rohan Mehta")!.id}`);
  const convoId = uuid("convo:sales-rohan");
  await run(
    `INSERT INTO ${SCHEMA}.ai_conversations (id, agent_id, channel, lead_id, customer_id, status, language, created_at)
     VALUES ($1, $2, 'web', $3, $4, 'active', 'en', now())`,
    [convoId, salesAgentId, rohanLeadId, portalCustomerId],
  );
  await run(`UPDATE ${SCHEMA}.leads SET converted_customer = $1 WHERE id = $2`, [portalCustomerId, rohanLeadId]);
  for (const [i, m] of aiAgentChat.entries()) {
    await run(
      `INSERT INTO ${SCHEMA}.ai_messages (id, conversation_id, role, content, created_at)
       VALUES ($1, $2, $3, $4, now())`,
      [uuid(`msg:${i}`), convoId, m.from === "user" ? "user" : "assistant", m.text],
    );
  }
  console.log("[18] ai layer seeded");

  // ---------------------------------------------------------------------------
  // 19. NOTIFICATIONS + SITE VISITS
  // ---------------------------------------------------------------------------
  const noteTone: Record<string, string> = { warning: "warning", danger: "danger", info: "info" };
  for (const [i, n] of notifications.entries()) {
    await run(
      `INSERT INTO ${SCHEMA}.notifications (id, user_id, channel, title, body, payload, status, created_at)
       VALUES ($1, $2, 'app', $3, $4, $5, 'sent', now() - make_interval(mins => $6))`,
      [uuid(`note:${n.id}`), userUuid("Demo User"), n.title, n.body, JSON.stringify({ tone: noteTone[n.tone] ?? "info" }), (i + 1) * 60],
    );
  }
  const visits: [string, string, string, string, string][] = [
    ["Rohan Mehta", "Elevate Residences", "2026-08-09T11:00:00", "confirmed", "ai_sales_agent"],
    ["Priya Sharma", "Elevate Residences", "2026-08-09T16:30:00", "confirmed", "ai_sales_agent"],
    ["Meera Reddy", "Verdant Layout", "2026-08-10T10:00:00", "scheduled", "web"],
  ];
  for (const [i, [name, projectName, when, status, source]] of visits.entries()) {
    const customerId = customerUuids.get(name) ?? null;
    const lead = [...leads, ...salesLeads].find((x) => x.name === name);
    const leadId = lead ? uuid(`lead:${lead.id}`) : null;
    const project = projects.find((x) => x.name === projectName);
    const projectId = project ? projectIdBySeed(project.id) : elevateId;
    await run(
      `INSERT INTO ${SCHEMA}.site_visits (id, visit_no, lead_id, customer_id, project_id, scheduled_at, status, assigned_to, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [uuid(`visit:${i + 1}`), `SV-2026-${String(104 - i)}`, leadId, customerId, projectId, when, status, userUuid("Arjun Nair"), source],
    );
  }
  console.log("[19] notifications + site visits seeded");

  // ---------------------------------------------------------------------------
  // 20. APP CONFIG (analytics series, KPI cards, summaries, land highlights)
  // ---------------------------------------------------------------------------
  const config: [string, unknown, string][] = [
    ["kpis.executive", executiveKpis, "Executive dashboard KPI cards"],
    ["kpis.land", landKpis, "Land dashboard KPI cards"],
    ["analytics.cash_flow", cashFlowData, "Cash flow forecast series (in crores)"],
    ["analytics.sales_velocity", salesVelocity, "Units sold per month (velocity chart)"],
    ["finance.recon_summary", reconciliationSummary, "Bank reconciliation headline summary"],
    ["procurement.summary", procurementSummary, "Procurement headline summary"],
    ["hr.summary", attendanceSummary, "Attendance headline summary"],
    ["rentals.summary", rentalSummary, "Rental headline summary"],
    ["legal.compliance_due", complianceDue, "Compliance due list"],
    ["land.highlights", Object.fromEntries(landParcels.filter((p) => p.highlight).map((p) => [p.code, p.highlight])), "Land parcel highlight tags"],
  ];
  for (const [key, value, desc] of config) {
    await run(
      `INSERT INTO ${SCHEMA}.app_config (key, value, description, updated_at) VALUES ($1, $2, $3, now())`,
      [key, JSON.stringify(value), desc],
    );
  }
  for (const row of cashFlowData) {
    const monthDate = `${row.month} 2026` ? new Date(`${row.month} 01 2026`).toISOString().slice(0, 10) : null;
    await run(
      `INSERT INTO ${SCHEMA}.cash_flow_forecasts (id, forecast_date, expected_inflow, expected_outflow, confidence, model_version)
       VALUES ($1, $2, $3, $4, 95.0, 'v1-demo')`,
      [uuid(`cf:${row.month}`), monthDate, row.inflow, row.outflow],
    );
  }
  console.log("[20] app_config seeded");

  // ---------------------------------------------------------------------------
  // 21. TENANTS (public schema, for the subscription switcher)
  // ---------------------------------------------------------------------------
  await run(
    `UPDATE public.tenants SET name = $1, plan_id = 'plan-enterprise', segments = ARRAY['land','apartments'] WHERE code = 'builder-a'`,
    [tenants[0].name],
  );
  await run(
    `INSERT INTO public.tenants (code, name, subdomain, db_schema, plan_id, segments)
     VALUES ('green-acre', $1, 'greenacre.estateflow.in', 'green_acre', 'plan-land', ARRAY['land'])
     ON CONFLICT (code) DO NOTHING`,
    [tenants[1].name],
  );
  await run(
    `INSERT INTO public.tenants (code, name, subdomain, db_schema, plan_id, segments)
     VALUES ('aarav', $1, 'aarav.estateflow.in', 'aarav', 'plan-homes', ARRAY['apartments'])
     ON CONFLICT (code) DO NOTHING`,
    [tenants[2].name],
  );
  console.log("[21] tenants seeded");

  await client.query("COMMIT");
  console.log("SEED COMPLETE");
  console.log(`plans in catalog: ${PLANS.length}`);
  await client.end();
}

main().catch(async (e) => {
  console.error("SEED ERROR:", e.message);
  console.error(e.stack);
  try {
    await client?.query("ROLLBACK");
  } catch {
    /* ignore */
  }
  process.exit(1);
});
