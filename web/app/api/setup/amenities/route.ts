import { NextResponse } from "next/server";
import { createAmenity, listAmenities, type CreateAmenityInput } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await listAmenities() });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  try {
    const amenity = await createAmenity(body as unknown as CreateAmenityInput);
    return NextResponse.json({ data: amenity }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
