import { Client } from "pg";

const CONNECTION_STRING = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING;

const client = CONNECTION_STRING
  ? new Client({ connectionString: CONNECTION_STRING })
  : new Client({
      host: process.env.PGHOST || "127.0.0.1",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "estateflow",
    });

const SCHEMA = process.env.TENANT_SCHEMA || "builder_a";

const tables = [
  "app_config", "users", "lead_sources", "leads",
  "projects", "towers", "floors", "blocks", "units",
  "land_parcels", "plot_layouts", "plots",
  "customers", "quotations",
  "bookings", "payment_schedules", "payment_schedule_lines", "documents",
  "construction_milestones", "dprs",
  "bank_accounts", "bank_statements", "bank_statement_lines", "reconciliation_runs", "reconciliation_matches", "receipts",
  "vendors", "rfqs", "purchase_orders", "po_lines", "grns",
  "agreements", "rera_project_registrations", "rera_disclosures", "litigations",
  "departments", "employees", "attendance_records", "contract_labour",
  "societies", "amc_contracts", "visitors", "visitor_logs", "society_maintenance_bills", "tickets",
  "leases", "lease_tenants", "lease_invoices", "invoices",
  "marketplace_partners", "partner_services", "lead_referrals", "commissions",
  "channel_partners", "channel_deals",
  "ai_agents", "ai_conversations", "ai_messages", "ai_workflow_runs", "ai_alerts",
  "site_visits", "notifications", "cash_flow_forecasts", "unit_holds", "land_holds",
];

async function main() {
  await client.connect();
  for (const t of tables) {
    const res = await client.query(
      `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position`,
      [SCHEMA, t],
    );
    console.log(`\n== ${t}`);
    console.log(res.rows.map((r) => `${r.column_name}:${r.data_type}${r.is_nullable === "YES" ? "" : "!"}`).join(", "));
  }
  const pub = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log("\n== public tables");
  console.log(pub.rows.map((r) => r.table_name).join(", "));
  const plans = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='plans' ORDER BY ordinal_position`,
  );
  console.log("\n== public.plans columns");
  console.log(plans.rows.map((r) => `${r.column_name}:${r.data_type}`).join(", "));
  const tenants = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='tenants' ORDER BY ordinal_position`,
  );
  console.log("\n== public.tenants columns");
  console.log(tenants.rows.map((r) => `${r.column_name}:${r.data_type}`).join(", "));
  await client.end();
}

main().catch((e) => {
  console.error("SCHEMA DUMP ERROR:", e.message);
  process.exit(1);
});
