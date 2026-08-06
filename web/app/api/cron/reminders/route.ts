import { NextResponse } from "next/server";
import { runPaymentReminders } from "@/lib/reminders";
import { flushOutbox } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  const configured = Boolean(CRON_SECRET);
  const authorized = CRON_SECRET ? req.headers.get("x-cron-secret") === CRON_SECRET : process.env.NODE_ENV !== "production";
  if (!configured && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (!authorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const reminded = await runPaymentReminders();
  const flushed = await flushOutbox();
  return NextResponse.json({ data: { reminded, flushed } });
}
