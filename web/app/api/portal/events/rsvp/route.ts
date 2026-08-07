import { NextResponse } from "next/server";
import { setEventRsvp } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["going", "interested", "declined"];

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const eventId = String(body.eventId ?? "");
  const status = String(body.status ?? "");
  if (!eventId || !STATUSES.includes(status)) {
    return NextResponse.json({ error: `eventId and status (${STATUSES.join(", ")}) are required` }, { status: 422 });
  }
  const result = await setEventRsvp(eventId, status as "going" | "interested" | "declined");
  if (!result.ok) {
    return NextResponse.json({ error: "could not update RSVP" }, { status: 422 });
  }
  return NextResponse.json({ data: result }, { status: 201 });
}
