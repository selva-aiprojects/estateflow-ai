import { NextResponse } from "next/server";
import { requireSuperAdmin, AuthError } from "@/lib/auth";
import { provisionTenant, listTenants, resendWelcomeKit } from "@/lib/provision";
import { PLANS } from "@/lib/data";
import type { Segment } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(err: unknown) {
  if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
  const message = err instanceof Error ? err.message : "provisioning failed";
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  try {
    await requireSuperAdmin();
    const [tenants, outbox] = await Promise.all([listTenants(), import("@/lib/provision").then((m) => m.countOutboxByStatus())]);
    return NextResponse.json({ data: { tenants, plans: PLANS, outbox } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    let body: {
      code?: string;
      name?: string;
      subdomain?: string;
      shortCode?: string;
      dbSchema?: string;
      planId?: string;
      segments?: Segment[];
      adminEmail?: string;
      adminName?: string;
    } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid json body" }, { status: 400 });
    }

    if (!body.code || !body.name || !body.subdomain || !body.adminEmail) {
      return NextResponse.json(
        { error: "code, name, subdomain and adminEmail are required" },
        { status: 400 },
      );
    }

    const result = await provisionTenant({
      code: body.code,
      name: body.name,
      subdomain: body.subdomain,
      shortCode: body.shortCode ?? body.code.slice(0, 3).toUpperCase(),
      dbSchema: body.dbSchema ?? body.code,
      planId: body.planId ?? "plan-enterprise",
      segments: body.segments ?? ["land", "apartments"],
      adminEmail: body.adminEmail,
      adminName: body.adminName ?? "Workspace Admin",
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: Request) {
  try {
    await requireSuperAdmin();
    const body = (await req.json()) as { code?: string };
    if (!body.code) return NextResponse.json({ error: "code required" }, { status: 400 });
    const ok = await resendWelcomeKit(body.code);
    if (!ok) return NextResponse.json({ error: "tenant or admin not found" }, { status: 404 });
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return errorResponse(err);
  }
}
