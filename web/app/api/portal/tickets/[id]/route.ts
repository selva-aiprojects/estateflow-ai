import { NextResponse } from "next/server";
import { getPortalTicketThread, escalateTicket } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await getPortalTicketThread(id);
  if (!thread) {
    return NextResponse.json({ error: "ticket not found" }, { status: 404 });
  }
  return NextResponse.json({ data: thread });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  if (body.action === "escalate") {
    const result = await escalateTicket(id);
    return NextResponse.json({ data: result });
  }
  return NextResponse.json({ error: "unsupported action" }, { status: 422 });
}
