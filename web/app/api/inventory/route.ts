import { NextResponse } from "next/server";
import { getInventory } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await getInventory() });
}
