const { Client } = require('pg');

const SCHEMA = process.env.TENANT_SCHEMA || 'builder_a';
const CONNECTION_STRING = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
const PGHOST = process.env.PGHOST || '127.0.0.1';
const PGPORT = Number(process.env.PGPORT || 5432);
const PGUSER = process.env.PGUSER || 'postgres';
const PGPASSWORD = process.env.PGPASSWORD || 'postgres';
const PGDATABASE = process.env.PGDATABASE || 'estateflow';

const ALTERS = [
  `ALTER TABLE ${SCHEMA}.projects ADD COLUMN IF NOT EXISTS location varchar(200)`,
  `ALTER TABLE ${SCHEMA}.leads ADD COLUMN IF NOT EXISTS sales_stage varchar(30)`,
  `ALTER TABLE ${SCHEMA}.dprs ADD COLUMN IF NOT EXISTS labour int`,
  `ALTER TABLE ${SCHEMA}.dprs ADD COLUMN IF NOT EXISTS concrete_cum numeric(12,2)`,
  `ALTER TABLE ${SCHEMA}.vendors ADD COLUMN IF NOT EXISTS category varchar(120)`,
  `ALTER TABLE ${SCHEMA}.vendors ADD COLUMN IF NOT EXISTS city varchar(120)`,
  `ALTER TABLE ${SCHEMA}.rfqs ADD COLUMN IF NOT EXISTS category varchar(120)`,
  `ALTER TABLE ${SCHEMA}.rfqs ADD COLUMN IF NOT EXISTS best_rate numeric(19,2)`,
  `ALTER TABLE ${SCHEMA}.rfqs ADD COLUMN IF NOT EXISTS market_index numeric(19,2)`,
  `ALTER TABLE ${SCHEMA}.rfqs ADD COLUMN IF NOT EXISTS ai_flag boolean NOT NULL DEFAULT false`,
  `ALTER TABLE ${SCHEMA}.rfqs ADD COLUMN IF NOT EXISTS ai_note text`,
  `ALTER TABLE ${SCHEMA}.rfqs ADD COLUMN IF NOT EXISTS responses int NOT NULL DEFAULT 0`,
  `ALTER TABLE ${SCHEMA}.grns ADD COLUMN IF NOT EXISTS match_type varchar(20)`,
  `ALTER TABLE ${SCHEMA}.grns ADD COLUMN IF NOT EXISTS variance_pct numeric(8,2)`,
  `ALTER TABLE ${SCHEMA}.quotations ADD COLUMN IF NOT EXISTS land_parcel_id uuid REFERENCES ${SCHEMA}.land_parcels(id)`,
  `ALTER TABLE ${SCHEMA}.quotations ADD COLUMN IF NOT EXISTS plot_id uuid REFERENCES ${SCHEMA}.plots(id)`,
  `ALTER TABLE ${SCHEMA}.quotations ALTER COLUMN unit_id DROP NOT NULL`,
  `ALTER TABLE ${SCHEMA}.quotations ALTER COLUMN project_id DROP NOT NULL`,
  `ALTER TABLE ${SCHEMA}.purchase_orders ADD COLUMN IF NOT EXISTS rfq_no varchar(40)`,
  `ALTER TABLE ${SCHEMA}.marketplace_partners ADD COLUMN IF NOT EXISTS city varchar(120)`,
  `ALTER TABLE ${SCHEMA}.marketplace_partners ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 0`,
  `ALTER TABLE ${SCHEMA}.marketplace_partners ADD COLUMN IF NOT EXISTS deals int NOT NULL DEFAULT 0`,
  `ALTER TABLE ${SCHEMA}.marketplace_partners ADD COLUMN IF NOT EXISTS conversion numeric(5,2) NOT NULL DEFAULT 0`,
  `ALTER TABLE ${SCHEMA}.lead_referrals ADD COLUMN IF NOT EXISTS revenue numeric(19,2)`,
  `ALTER TABLE ${SCHEMA}.lead_referrals ADD COLUMN IF NOT EXISTS ai_score numeric(5,2)`,
  `ALTER TABLE ${SCHEMA}.contract_labour ADD COLUMN IF NOT EXISTS attendance_pct numeric(5,2) NOT NULL DEFAULT 0`,
  `ALTER TABLE ${SCHEMA}.customers ADD COLUMN IF NOT EXISTS loyalty_points int NOT NULL DEFAULT 0`,
  `ALTER TABLE ${SCHEMA}.customers ADD COLUMN IF NOT EXISTS loyalty_tier varchar(20) NOT NULL DEFAULT 'member'
      CHECK (loyalty_tier IN ('member','silver','gold','platinum'))`,
];

const TABLES = [
  `CREATE TABLE IF NOT EXISTS ${SCHEMA}.site_photos (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id  uuid REFERENCES ${SCHEMA}.projects(id),
      tower_id    uuid REFERENCES ${SCHEMA}.towers(id),
      media_type  varchar(20) NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo','video')),
      url         text NOT NULL,
      thumb_url   text,
      caption     varchar(255),
      shot_on     date,
      created_at  timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA}.events (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id  uuid REFERENCES ${SCHEMA}.projects(id),
      title       varchar(255) NOT NULL,
      description text,
      event_type  varchar(40) NOT NULL DEFAULT 'community'
                              CHECK (event_type IN ('homeowner_meet','site_walkthrough','webinar','festival','community')),
      starts_at   timestamptz NOT NULL,
      location    varchar(200),
      capacity    int,
      is_active   boolean NOT NULL DEFAULT true,
      created_at  timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA}.event_rsvps (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id    uuid NOT NULL REFERENCES ${SCHEMA}.events(id) ON DELETE CASCADE,
      customer_id uuid NOT NULL REFERENCES ${SCHEMA}.customers(id),
      status      varchar(20) NOT NULL DEFAULT 'going'
                              CHECK (status IN ('going','interested','declined')),
      rsvped_at   timestamptz NOT NULL DEFAULT now(),
      UNIQUE (event_id, customer_id)
  )`,
  `CREATE TABLE IF NOT EXISTS ${SCHEMA}.owner_listings (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id  uuid NOT NULL REFERENCES ${SCHEMA}.customers(id),
      unit_id      uuid REFERENCES ${SCHEMA}.units(id),
      listing_type varchar(20) NOT NULL CHECK (listing_type IN ('sale','rent')),
      title        varchar(255) NOT NULL,
      description  text,
      price        numeric(19,2) NOT NULL,
      status       varchar(20) NOT NULL DEFAULT 'active'
                               CHECK (status IN ('draft','active','sold','closed','rented')),
      created_at   timestamptz NOT NULL DEFAULT now()
  )`,
];

async function main() {
  const c = CONNECTION_STRING
    ? new Client({ connectionString: CONNECTION_STRING })
    : new Client({ host: PGHOST, port: PGPORT, user: PGUSER, password: PGPASSWORD, database: PGDATABASE });
  await c.connect();
  for (const sql of ALTERS) {
    await c.query(sql);
  }
  for (const sql of TABLES) {
    await c.query(sql);
  }
  console.log(`[OK] ${ALTERS.length} columns + ${TABLES.length} tables ensured in schema ${SCHEMA}`);
  await c.end();
}

main().catch((e) => { console.error('MIGRATE ERROR:', e.message); process.exit(1); });
