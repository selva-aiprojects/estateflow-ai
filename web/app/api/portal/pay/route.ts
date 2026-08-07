import { NextResponse } from "next/server";
import { payPortalInstallment } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const lineId = String(body.lineId ?? "");
  const amount = Number(body.amount ?? 0);
  if (!lineId) {
    return NextResponse.json({ error: "lineId is required" }, { status: 422 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 422 });
  }
  const result = await payPortalInstallment(lineId, amount);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }
  return NextResponse.json({ data: result }, { status: 201 });
}
