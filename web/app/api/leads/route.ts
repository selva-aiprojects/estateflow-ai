import { NextResponse } from "next/server";
import { getLeads, createLead } from "@/lib/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ data: getLeads() });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const lead = createLead(body);
  return NextResponse.json({ data: lead }, { status: 201 });
}
