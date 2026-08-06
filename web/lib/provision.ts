import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pool, q, qOne, quoteIdent, type Row } from "@/lib/db";
import { PLANS } from "@/lib/data";
import { hashPassword, sha256 } from "@/lib/password";
import { queueEmail, welcomeKitHtml, APP_URL } from "@/lib/mailer";

export interface ProvisionTenantInput {
  code: string;
  name: string;
  subdomain: string;
  shortCode: string;
  dbSchema: string;
  planId: string;
  segments: ("land" | "apartments")[];
  adminEmail: string;
  adminName: string;
}

export interface ProvisionResult {
  tenantId: string;
  schema: string;
  adminUserId: string;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function splitSql(sql: string): string[] {
  const statements: string[] = [];
  let buf = "";
  let i = 0;
  const n = sql.length;
  let dollarTag: string | null = null;
  while (i < n) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === "-" && next === "-") {
      while (i < n && sql[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < n && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (ch === "'" && dollarTag === null) {
      buf += ch;
      i++;
      while (i < n) {
        buf += sql[i];
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            buf += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (dollarTag === null && ch === "$") {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++;
      if (sql[j] === "$") {
        dollarTag = sql.slice(i, j + 1);
        buf += dollarTag;
        i = j + 1;
        continue;
      }
    }
    if (dollarTag !== null && sql.startsWith(dollarTag, i)) {
      buf += dollarTag;
      i += dollarTag.length;
      dollarTag = null;
      continue;
    }
    if (ch === ";" && dollarTag === null) {
      statements.push(buf.trim());
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  if (buf.trim()) statements.push(buf.trim());
  return statements.filter((s) => s.length > 0);
}

function tenantSchemaDdl(): string {
  const root = process.env.NEXT_PUBLIC_APP_ROOT ?? path.resolve(process.cwd(), "..");
  const file = path.join(root, "sql", "02_tenant_schema.sql");
  return readFileSync(file, "utf8");
}

export async function provisionTenant(input: ProvisionTenantInput): Promise<ProvisionResult> {
  const code = normalizeSlug(input.code);
  const dbSchema = normalizeSlug(input.dbSchema);
  if (!code || !dbSchema) throw new Error("code and dbSchema must be valid slugs");

  const plan = PLANS.find((p) => p.id === input.planId);
  if (!plan) throw new Error(`unknown planId '${input.planId}'`);

  const tempPassword = randomPassword();
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO ${quoteIdent(dbSchema)}, public`);

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO public.tenants (code, name, subdomain, db_schema, short_code, plan_id, segments, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (code) DO UPDATE
         SET name = EXCLUDED.name, subdomain = EXCLUDED.subdomain, db_schema = EXCLUDED.db_schema,
             short_code = EXCLUDED.short_code, plan_id = EXCLUDED.plan_id,
             segments = EXCLUDED.segments, location = EXCLUDED.location, status = 'active'
       RETURNING id::text AS id`,
      [code, input.name, input.subdomain, dbSchema, input.shortCode || input.code.slice(0, 3).toUpperCase(), plan.id, plan.segments, input.name],
    );
    const tenantId = inserted.rows[0].id;

    await client.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(dbSchema)}`);

    const appConfig = await client.query<{ v: string | null }>(
      `SELECT to_regclass($1)::text AS v`,
      [`${dbSchema}.app_config`],
    );
    if (!appConfig.rows[0]?.v) {
      const statements = splitSql(tenantSchemaDdl());
      for (const stmt of statements) await client.query(stmt);
      await client.query(
        `INSERT INTO ${quoteIdent(dbSchema)}.app_config (key, value, description, updated_at)
         VALUES ('app.name', $1::jsonb, 'Workspace display name', now())`,
        [JSON.stringify(input.name)],
      );
    }

    const userInsert = await client.query<{ id: string }>(
      `INSERT INTO public.users (email, display_name, password_hash, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING id::text AS id`,
      [input.adminEmail.toLowerCase(), input.adminName, hashPassword(tempPassword)],
    );
    const adminUserId = userInsert.rows[0].id;

    await client.query(
      `INSERT INTO public.tenant_memberships (tenant_id, user_id, role, status)
       VALUES ($1, $2, 'tenant-admin', 'active')
       ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'tenant-admin', status = 'active'`,
      [tenantId, adminUserId],
    );

    await client.query("COMMIT");

    await queueEmail({
      tenantId,
      toEmail: input.adminEmail.toLowerCase(),
      toName: input.adminName,
      template: "welcome-kit",
      subject: `Welcome to EstateFlow — ${input.name} workspace`,
      html: welcomeKitHtml({
        tenantName: input.name,
        displayName: input.adminName,
        email: input.adminEmail.toLowerCase(),
        password: tempPassword,
        loginUrl: `${APP_URL}/login`,
      }),
    });

    return { tenantId, schema: dbSchema, adminUserId };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await client.query("RESET search_path").catch(() => {});
    client.release();
  }
}

export async function listTenants() {
  const rows = await q<Row>(
    `SELECT id::text AS id, code, name, subdomain, db_schema, short_code, status, plan_id, segments,
            created_at::text AS created_at
       FROM public.tenants
      ORDER BY created_at`,
  );
  return rows.map((r) => ({
    id: r.id as string,
    code: r.code as string,
    name: r.name as string,
    subdomain: r.subdomain as string,
    schema: r.db_schema as string,
    shortCode: r.short_code as string | null,
    status: r.status as string,
    planId: r.plan_id as string,
    segments: r.segments as string[],
    createdAt: r.created_at as string,
  }));
}

export async function tenantAdminUserId(tenantCode: string): Promise<string | null> {
  const row = await qOne<{ id: string }>(
    `SELECT u.id::text AS id
       FROM public.tenant_memberships m
       JOIN public.tenants t ON t.id = m.tenant_id
       JOIN public.users u ON u.id = m.user_id
      WHERE t.code = $1 AND m.role = 'tenant-admin'
      ORDER BY m.joined_at
      LIMIT 1`,
    [tenantCode],
  );
  return row?.id ?? null;
}

export async function countOutboxByStatus(): Promise<Record<string, number>> {
  const rows = await q<{ status: string; v: number }>(
    `SELECT status, COUNT(*)::int AS v FROM public.email_outbox GROUP BY status`,
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.status] = r.v;
  return out;
}

export async function resendWelcomeKit(tenantCode: string): Promise<boolean> {
  const tenant = await qOne<{ id: string; name: string }>(
    `SELECT id::text AS id, name FROM public.tenants WHERE code = $1`,
    [tenantCode],
  );
  const admin = await tenantAdminUserId(tenantCode);
  if (!tenant || !admin) return false;
  const user = await qOne<{ email: string; display_name: string; password_hash: string | null }>(
    `SELECT email, display_name, password_hash FROM public.users WHERE id = $1`,
    [admin],
  );
  if (!user) return false;
  const newPassword = randomPassword();
  await q(`UPDATE public.users SET password_hash = $1 WHERE id = $2`, [hashPassword(newPassword), admin]);
  await queueEmail({
    tenantId: tenant.id,
    toEmail: user.email,
    toName: user.display_name,
    template: "welcome-kit",
    subject: `Welcome to EstateFlow — ${tenant.name} workspace`,
    html: welcomeKitHtml({
      tenantName: tenant.name,
      displayName: user.display_name ?? "Admin",
      email: user.email,
      password: newPassword,
      loginUrl: `${APP_URL}/login`,
    }),
  });
  return true;
}

function randomPassword(): string {
  return "Ef@" + sha256(randomUUID()).slice(0, 10);
}
