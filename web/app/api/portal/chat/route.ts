import { NextResponse } from "next/server";
import { addPortalChat, fetchPortalCustomer, fetchPortalChat } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await fetchPortalCustomer();
  return NextResponse.json({ data: await fetchPortalChat(customer.customerId) });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const text = String(body.text ?? "").trim();
  if (!text || text.length > 1000) {
    return NextResponse.json({ error: "text is required (max 1000 chars)" }, { status: 422 });
  }
  const customer = await fetchPortalCustomer();
  const messages = await addPortalChat(customer.customerId, text);
  return NextResponse.json({ data: messages }, { status: 201 });
}
