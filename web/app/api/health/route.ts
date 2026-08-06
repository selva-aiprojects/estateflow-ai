import { NextResponse } from "next/server";
import { q, TENANT_SCHEMA } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let db = "ok";
  try {
    await q(`SELECT 1`);
  } catch {
    db = "error";
  }
  return NextResponse.json({
    ok: db === "ok",
    service: "estateflow-api",
    version: "0.1.0-demo",
    tenant: TENANT_SCHEMA,
    db,
    time: new Date().toISOString(),
  });
}
