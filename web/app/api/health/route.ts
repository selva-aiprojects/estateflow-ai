import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "estateflow-api",
    version: "0.1.0-demo",
    tenant: "builder-a",
    time: new Date().toISOString(),
  });
}
