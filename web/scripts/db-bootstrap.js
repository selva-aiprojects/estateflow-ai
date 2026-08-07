const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DB_NAME = 'estateflow';
const CONNECTION_STRING = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
const PGHOST = process.env.PGHOST || '127.0.0.1';
const PGPORT = Number(process.env.PGPORT || 5432);
const PGUSER = process.env.PGUSER || 'postgres';
const PGPASSWORD = process.env.PGPASSWORD || 'postgres';

const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_SQL = path.join(ROOT, 'sql', '01_public_schema.sql');
const TENANT_SQL = path.join(ROOT, 'sql', '02_tenant_schema.sql');

function splitSql(sql) {
  const statements = [];
  let buf = '';
  let i = 0;
  const n = sql.length;
  let dollarTag = null;
  while (i < n) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === '-' && next === '-') {
      while (i < n && sql[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === "'" && dollarTag === null) {
      buf += ch; i++;
      while (i < n) {
        buf += sql[i];
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { buf += sql[i + 1]; i += 2; continue; }
          i++; break;
        }
        i++;
      }
      continue;
    }
    if (dollarTag === null && ch === '$') {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++;
      if (sql[j] === '$') {
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
    if (ch === ';' && dollarTag === null) {
      statements.push(buf.trim());
      buf = '';
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  if (buf.trim()) statements.push(buf.trim());
  return statements.filter((s) => s.length > 0);
}

async function runStatements(client, statements, label) {
  for (const stmt of statements) {
    try {
      await client.query(stmt);
    } catch (err) {
      console.error(`[FAIL] ${label} statement:\n${stmt.slice(0, 300)}\n-> ${err.message}`);
      throw err;
    }
  }
  console.log(`[OK] ${label}: ${statements.length} statements applied`);
}

async function applySchema(db) {
  const publicStatements = splitSql(fs.readFileSync(PUBLIC_SQL, 'utf8'));
  await runStatements(db, publicStatements, 'public schema');

  await db.query(`INSERT INTO tenants (code, name, subdomain, db_schema, segments)
    VALUES ('builder-a', 'Builder A (Demo)', 'builder-a', 'builder_a', ARRAY['land','apartments'])
    ON CONFLICT (code) DO NOTHING`);
  const tenant = await db.query('SELECT id, db_schema FROM tenants WHERE code = $1', ['builder-a']);
  const schemaName = tenant.rows[0].db_schema;
  console.log(`[OK] tenant builder-a -> schema ${schemaName}`);

  await db.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  await db.query(`SET search_path TO ${schemaName}`);
  const tenantStatements = splitSql(fs.readFileSync(TENANT_SQL, 'utf8'));
  await runStatements(db, tenantStatements, `tenant schema ${schemaName}`);

  const counts = await db.query(`SELECT
      (SELECT count(*) FROM information_schema.tables WHERE table_schema = '${schemaName}') AS tables,
      (SELECT count(*) FROM pg_views WHERE schemaname = '${schemaName}') AS views`);
  console.log(`[OK] ${schemaName}: ${counts.rows[0].tables} tables, ${counts.rows[0].views} views`);
}

async function main() {
  if (CONNECTION_STRING) {
    const db = new Client({ connectionString: CONNECTION_STRING });
    await db.connect();
    console.log(`[OK] connected via DATABASE_URL (using existing database)`);
    await applySchema(db);
    await db.end();
    console.log('[DONE] bootstrap complete');
    return;
  }

  const admin = new Client({ host: PGHOST, port: PGPORT, user: PGUSER, password: PGPASSWORD, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`[OK] created database ${DB_NAME}`);
  } else {
    console.log(`[OK] database ${DB_NAME} already exists`);
  }
  await admin.end();

  const db = new Client({ host: PGHOST, port: PGPORT, user: PGUSER, password: PGPASSWORD, database: DB_NAME });
  await db.connect();
  console.log(`[OK] connected to ${DB_NAME}`);

  await applySchema(db);
  await db.end();
  console.log('[DONE] bootstrap complete');
}

main().catch((e) => {
  console.error('BOOTSTRAP ERROR:', e.message);
  process.exit(1);
});
