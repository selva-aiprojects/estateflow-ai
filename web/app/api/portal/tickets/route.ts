import { NextResponse } from "next/server";
import { createPortalTicket, type PortalTicketInput } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = ["Plumbing", "Electrical", "Snagging", "Appliances", "Interiors", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const category = String(body.category ?? "");
  const priority = String(body.priority ?? "medium");
  const subject = String(body.subject ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!category || !subject) {
    return NextResponse.json({ error: "category and subject are required" }, { status: 422 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `category must be one of ${CATEGORIES.join(", ")}` }, { status: 422 });
  }
  if (!PRIORITIES.includes(priority)) {
    return NextResponse.json({ error: `priority must be one of ${PRIORITIES.join(", ")}` }, { status: 422 });
  }
  if (subject.length > 240) {
    return NextResponse.json({ error: "subject must be under 240 characters" }, { status: 422 });
  }

  const input: PortalTicketInput = { category, priority, subject, description: description || undefined };
  const ticket = await createPortalTicket(input);
  return NextResponse.json({ data: ticket }, { status: 201 });
}
