import { NextResponse } from "next/server";
import { getQuotes, createQuote } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await getQuotes() });
}

export async function POST(req: Request) {
  let body: {
    customer?: string;
    projectId?: string;
    unitId?: string;
    segment?: "land" | "apartments";
    landId?: string;
    landKind?: "parcel" | "plot";
    discountPct?: number;
    salesExecutive?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  if (body.segment !== "land" && (!body.projectId || !body.unitId)) {
    return NextResponse.json({ error: "projectId and unitId required" }, { status: 400 });
  }

  const discountPct = Math.max(0, Number(body.discountPct) || 0);
  const result = await createQuote({
    customer: body.customer ?? "",
    projectId: body.projectId,
    unitId: body.unitId,
    segment: body.segment,
    landId: body.landId,
    landKind: body.landKind,
    discountPct,
    salesExecutive: body.salesExecutive,
  });

  if (!result) {
    return NextResponse.json({ error: "project, unit or land asset not found" }, { status: 404 });
  }
  return NextResponse.json({ data: result }, { status: 201 });
}
