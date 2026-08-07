/**
 * Seeds platform + tenant identities into the public schema.
 * Run from the web/ directory:  node scripts/seed-auth.ts
 *
 * Users created:
 *   nexus@estateflow.in            Nexus Admin (superadmin)      Nexus@2026
 *   admin@builder-a.estateflow.in  Builder A Homes (tenant-admin) BuilderA@2026
 *   admin@greenacre.estateflow.in  GreenAcre (tenant-admin)       GreenAcre@2026
 *   admin@aarav.estateflow.in      Aarav Towers (tenant-admin)    Aarav@2026
 */
import { Client } from "pg";
import { hashPassword } from "../lib/password.ts";

const SCHEMA = process.env.TENANT_SCHEMA || "builder_a";
const CONNECTION_STRING = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING;
const PGHOST = process.env.PGHOST || "127.0.0.1";
const PGPORT = Number(process.env.PGPORT || 5432);
const PGUSER = process.env.PGUSER || "postgres";
const PGPASSWORD = process.env.PGPASSWORD || "postgres";
const PGDATABASE = process.env.PGDATABASE || "estateflow";

async function main() {
  const client = CONNECTION_STRING
    ? new Client({ connectionString: CONNECTION_STRING })
    : new Client({ host: PGHOST, port: PGPORT, user: PGUSER, password: PGPASSWORD, database: PGDATABASE });
  await client.connect();
  await client.query(`SET search_path TO public`);

  await client.query(
    `UPDATE tenants SET short_code = 'BA', location = 'Bengaluru' WHERE code = 'builder-a'`,
  );
  await client.query(
    `UPDATE tenants SET short_code = 'GA', location = 'Hyderabad' WHERE code = 'green-acre'`,
  );
  await client.query(
    `UPDATE tenants SET short_code = 'AH', location = 'Chennai' WHERE code = 'aarav'`,
  );
  console.log("[OK] tenant short_code/location backfilled");

  async function upsertUser(email: string, displayName: string, password: string, superadmin: boolean) {
    const res = await client.query(
      `INSERT INTO users (email, display_name, password_hash, is_superadmin, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (email) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             password_hash = EXCLUDED.password_hash,
             is_superadmin = EXCLUDED.is_superadmin,
             status = 'active'
       RETURNING id::text AS id`,
      [email.toLowerCase(), displayName, hashPassword(password), superadmin],
    );
    return res.rows[0].id;
  }

  const nexusId = await upsertUser("nexus@estateflow.in", "Nexus Admin", "Nexus@2026", true);
  const builderAdmin = await upsertUser("admin@builder-a.estateflow.in", "Builder A Admin", "BuilderA@2026", false);
  const greenAdmin = await upsertUser("admin@greenacre.estateflow.in", "GreenAcre Admin", "GreenAcre@2026", false);
  const aaravAdmin = await upsertUser("admin@aarav.estateflow.in", "Aarav Admin", "Aarav@2026", false);

  await client.query(
    `INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
     SELECT t.id, u.id, 'tenant-admin', 'active'
       FROM tenants t JOIN users u ON u.email = $1
      WHERE t.code = $2
     ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'tenant-admin', status = 'active'`,
    ["admin@builder-a.estateflow.in", "builder-a"],
  );
  await client.query(
    `INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
     SELECT t.id, u.id, 'tenant-admin', 'active'
       FROM tenants t JOIN users u ON u.email = $1
      WHERE t.code = $2
     ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'tenant-admin', status = 'active'`,
    ["admin@greenacre.estateflow.in", "green-acre"],
  );
  await client.query(
    `INSERT INTO tenant_memberships (tenant_id, user_id, role, status)
     SELECT t.id, u.id, 'tenant-admin', 'active'
       FROM tenants t JOIN users u ON u.email = $1
      WHERE t.code = $2
     ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'tenant-admin', status = 'active'`,
    ["admin@aarav.estateflow.in", "aarav"],
  );

  console.log(`[OK] nexus superadmin  : ${nexusId}`);
  console.log(`[OK] tenant admins     : ${builderAdmin}, ${greenAdmin}, ${aaravAdmin}`);
  console.log(`[DONE] auth seeded (schema ${SCHEMA})`);
  await client.end();
}

main().catch((e) => {
  console.error("SEED-AUTH ERROR:", e.message);
  process.exit(1);
});
