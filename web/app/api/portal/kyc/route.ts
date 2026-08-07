import { NextResponse } from "next/server";
import { completePortalKyc } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const pan = String(body.pan ?? "").trim().toUpperCase();
  const aadhaarLast4 = String(body.aadhaarLast4 ?? "").trim();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    return NextResponse.json({ error: "a valid 10-character PAN is required" }, { status: 422 });
  }
  if (!/^\d{4}$/.test(aadhaarLast4)) {
    return NextResponse.json({ error: "last 4 digits of Aadhaar are required" }, { status: 422 });
  }
  const kyc = await completePortalKyc(pan, aadhaarLast4);
  return NextResponse.json({ data: kyc }, { status: 200 });
}
