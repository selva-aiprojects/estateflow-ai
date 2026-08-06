import { NextResponse } from "next/server";
import { getLeads, createLead } from "@/lib/repo";
import type { Lead } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await getLeads() });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const lead = await createLead(body as Partial<Lead>);
  return NextResponse.json({ data: lead }, { status: 201 });
}
