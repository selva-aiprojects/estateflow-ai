import { NextResponse } from "next/server";
import { updateUnitStatus, lockUnit } from "@/lib/mock-store";
import type { UnitStatus } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, ctx: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await ctx.params;
  let body: { status?: UnitStatus; hold?: boolean; heldBy?: string } = {};
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  if (body.hold) {
    const result = lockUnit(unitId, body.heldBy ?? "demo-sales-executive");
    return NextResponse.json({ data: result });
  }

  if (!body.status) {
    return NextResponse.json({ error: "status or hold required" }, { status: 400 });
  }

  const unit = updateUnitStatus(unitId, body.status);
  if (!unit) {
    return NextResponse.json({ error: "unit not found" }, { status: 404 });
  }
  return NextResponse.json({ data: unit });
}
