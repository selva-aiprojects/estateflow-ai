import { NextResponse } from "next/server";
import { getTenantData, setTenant } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await getTenantData() });
}

export async function POST(req: Request) {
  let body: { tenantId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  if (!body.tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  const tenant = await setTenant(body.tenantId);
  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }
  return NextResponse.json({ data: await getTenantData() });
}
