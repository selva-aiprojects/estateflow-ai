import { NextResponse } from "next/server";
import { updateLandStatus, lockLand } from "@/lib/mock-store";
import type { LandStatus } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, ctx: { params: Promise<{ landId: string }> }) {
  const { landId } = await ctx.params;
  let body: { status?: LandStatus; hold?: boolean; heldBy?: string } = {};
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  if (body.hold) {
    const result = lockLand(landId, body.heldBy ?? "demo-sales-executive");
    return NextResponse.json({ data: result });
  }

  if (!body.status) {
    return NextResponse.json({ error: "status or hold required" }, { status: 400 });
  }

  const land = updateLandStatus(landId, body.status);
  if (!land) {
    return NextResponse.json({ error: "land asset not found" }, { status: 404 });
  }
  return NextResponse.json({ data: land });
}
