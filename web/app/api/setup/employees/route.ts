import { NextResponse } from "next/server";
import { createEmployee, listEmployees, type CreateEmployeeInput } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await listEmployees() });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  try {
    const employee = await createEmployee(body as unknown as CreateEmployeeInput);
    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
