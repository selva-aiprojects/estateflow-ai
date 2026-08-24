import { NextResponse } from "next/server";
import { getAiChat, addAiExchange } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await getAiChat() });
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

  const messages = await addAiExchange(body.text);
  return NextResponse.json({ data: messages }, { status: 201 });
}
