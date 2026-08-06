import { NextResponse } from "next/server";
import { getFinance } from "@/lib/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ data: getFinance() });
}
