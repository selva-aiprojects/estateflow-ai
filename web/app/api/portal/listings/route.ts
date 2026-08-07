import { NextResponse } from "next/server";
import { createOwnerListing } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const listingType = String(body.listingType ?? "");
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const price = Number(body.price ?? 0);
  if (listingType !== "sale" && listingType !== "rent") {
    return NextResponse.json({ error: "listingType must be sale or rent" }, { status: 422 });
  }
  if (!title || title.length > 200) {
    return NextResponse.json({ error: "title is required (max 200 chars)" }, { status: 422 });
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "price must be a positive number" }, { status: 422 });
  }
  const result = await createOwnerListing({ listingType, title, description: description || undefined, price });
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }
  return NextResponse.json({ data: result }, { status: 201 });
}
