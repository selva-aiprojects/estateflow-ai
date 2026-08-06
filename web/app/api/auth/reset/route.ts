import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";
import { queueEmail, passwordResetHtml, APP_URL } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  if (!body.email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const result = await createPasswordResetToken(body.email);
  if (!result) {
    return NextResponse.json({ data: { ok: true } });
  }

  const resetUrl = `${APP_URL}/reset?token=${result.raw}`;
  await queueEmail({
    toEmail: result.user.email!,
    toName: result.user.display_name,
    template: "password-reset",
    subject: "Reset your EstateFlow password",
    html: passwordResetHtml({
      displayName: result.user.display_name ?? "there",
      resetUrl,
    }),
  });

  return NextResponse.json({
    data: {
      ok: true,
      ...(process.env.NODE_ENV !== "production" ? { resetToken: result.raw } : {}),
    },
  });
}
