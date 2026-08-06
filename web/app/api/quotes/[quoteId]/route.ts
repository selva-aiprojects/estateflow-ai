import { NextResponse } from "next/server";
import { decideQuote } from "@/lib/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await ctx.params;
  let body: { action?: "approve" | "reject" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const approve = body.action === "approve";
  const quote = decideQuote(quoteId, approve);
  if (!quote) {
    return NextResponse.json({ error: "quote not found" }, { status: 404 });
  }
  return NextResponse.json({ data: quote });
}
