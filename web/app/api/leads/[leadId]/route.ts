import { NextResponse } from "next/server";
import { updateLeadStatus, assignLead } from "@/lib/mock-store";
import type { LeadStatus } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await ctx.params;
  let body: { status?: LeadStatus; assigned?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  let lead = null;
  if (body.status) lead = updateLeadStatus(leadId, body.status);
  if (body.assigned) lead = assignLead(leadId, body.assigned);

  if (!lead) {
    return NextResponse.json({ error: "lead not found or no update provided" }, { status: 404 });
  }
  return NextResponse.json({ data: lead });
}
