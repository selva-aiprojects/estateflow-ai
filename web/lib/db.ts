import { Pool, type PoolClient } from "pg";

export const TENANT_SCHEMA = process.env.TENANT_SCHEMA ?? "builder_a";

declare global {
  // eslint-disable-next-line no-var
  var __estateflowPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    host: process.env.PGHOST ?? "127.0.0.1",
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? "postgres",
    password: process.env.PGPASSWORD ?? "postgres",
    database: process.env.PGDATABASE ?? "estateflow",
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    options: `-c search_path=${TENANT_SCHEMA},public`,
  });
}

export function pool(): Pool {
  if (!globalThis.__estateflowPool) {
    globalThis.__estateflowPool = createPool();
  }
  return globalThis.__estateflowPool;
}

export type Row = Record<string, unknown>;

export async function q<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(text, params);
  return res.rows as T[];
}

export async function qOne<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T | undefined> {
  const rows = await q<T>(text, params);
  return rows[0];
}

export async function qVal<T = unknown>(text: string, params: unknown[] = []): Promise<T | undefined> {
  const row = await qOne<{ v: T }>(text, params);
  return row?.v;
}

export async function tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export function quoteIdent(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

// Runs fn on a dedicated connection whose search_path is pointed at the given
// tenant schema. Used for provisioning and cross-schema maintenance; never for
// hot request paths (the shared pool stays on TENANT_SCHEMA).
export async function withSchema<T>(schema: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query(`SET search_path TO ${quoteIdent(schema)}, public`);
    const result = await fn(client);
    return result;
  } finally {
    await client.query("RESET search_path").catch(() => {});
    client.release();
  }
}
