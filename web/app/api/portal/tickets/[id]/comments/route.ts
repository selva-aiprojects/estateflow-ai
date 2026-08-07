import { NextResponse } from "next/server";
import { addTicketComment } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const comment = String(body.body ?? "").trim();
  if (!comment || comment.length > 2000) {
    return NextResponse.json({ error: "comment body is required (max 2000 chars)" }, { status: 422 });
  }
  const result = await addTicketComment(id, comment);
  if (!result.ok) {
    return NextResponse.json({ error: "could not add comment" }, { status: 422 });
  }
  return NextResponse.json({ data: result }, { status: 201 });
}
