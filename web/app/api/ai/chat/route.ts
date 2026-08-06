import { NextResponse } from "next/server";
import { getAiChat, addAiMessage } from "@/lib/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ data: getAiChat() });
}

export async function POST(req: Request) {
  let body: { from?: "user" | "ai"; text?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  if (!body.text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const message = addAiMessage({ from: body.from === "user" ? "user" : "ai", text: body.text });
  return NextResponse.json({ data: message }, { status: 201 });
}
