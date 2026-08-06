import { q, type Row } from "@/lib/db";

export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM = process.env.RESEND_FROM ?? "EstateFlow <onboarding@estateflow.in>";
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export interface OutboxEmail extends Row {
  id: string;
  tenantId: string | null;
  toEmail: string;
  toName: string | null;
  template: string;
  subject: string;
  html: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function shell(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a;line-height:1.5">
    <div style="padding:8px 0 16px;border-bottom:1px solid #e5e7eb;margin-bottom:20px">
      <span style="font-size:15px;font-weight:700;letter-spacing:-0.01em">EstateFlow</span>
      <span style="font-size:13px;color:#6b7280;margin-left:8px">Real Estate OS</span>
    </div>
    <h1 style="font-size:20px;margin:0 0 12px;font-weight:700">${title}</h1>
    <div style="font-size:14px;color:#374151">${bodyHtml}</div>
    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
      Sent by EstateFlow · <a href="${APP_URL}" style="color:#2563eb">estateflow.in</a>
    </div>
  </div>`;
}

export function welcomeKitHtml(opts: {
  tenantName: string;
  displayName: string;
  email: string;
  password: string;
  loginUrl: string;
}): string {
  return shell(
    "Welcome to EstateFlow",
    `<p>Hi ${opts.displayName},</p>
     <p>Your workspace <strong>${opts.tenantName}</strong> is live on EstateFlow. Here are your sign-in credentials:</p>
     <table style="border-collapse:collapse;margin:16px 0;font-size:14px">
       <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Workspace</td><td style="padding:8px 0;font-weight:600">${opts.tenantName}</td></tr>
       <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Email</td><td style="padding:8px 0;font-weight:600">${opts.email}</td></tr>
       <tr><td style="padding:8px 16px 8px 0;color:#6b7280">Temporary password</td><td style="padding:8px 0;font-weight:600;font-family:monospace">${opts.password}</td></tr>
     </table>
     <a href="${opts.loginUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px">Sign in to your workspace</a>
     <p style="margin-top:16px;font-size:13px;color:#6b7280">Please change this password after your first sign-in. For security, never share these credentials.</p>`,
  );
}

export function passwordResetHtml(opts: { displayName: string; resetUrl: string }): string {
  return shell(
    "Reset your EstateFlow password",
    `<p>Hi ${opts.displayName},</p>
     <p>We received a request to reset your EstateFlow password. This link is valid for 60 minutes.</p>
     <a href="${opts.resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px">Reset password</a>
     <p style="margin-top:16px;font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email.</p>`,
  );
}

export function paymentReminderHtml(opts: {
  displayName: string;
  invoiceNo: string;
  amount: string;
  dueDate: string;
  tenantName: string;
}): string {
  return shell(
    `Payment reminder — ${opts.invoiceNo}`,
    `<p>Hi ${opts.displayName},</p>
     <p>This is a reminder that your payment of <strong>${opts.amount}</strong> against invoice <strong>${opts.invoiceNo}</strong> was due on <strong>${opts.dueDate}</strong>.</p>
     <p>Please complete the payment at your earliest convenience to keep your account current with <strong>${opts.tenantName}</strong>.</p>
     <a href="${APP_URL}/portal" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px">View invoice</a>`,
  );
}

// ---------------------------------------------------------------------------
// Outbox + delivery
// ---------------------------------------------------------------------------

export async function queueEmail(opts: {
  tenantId?: string | null;
  toEmail: string;
  toName?: string | null;
  template: string;
  subject: string;
  html: string;
}): Promise<void> {
  await q(
    `INSERT INTO public.email_outbox (tenant_id, to_email, to_name, template, subject, html)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [opts.tenantId ?? null, opts.toEmail, opts.toName ?? null, opts.template, opts.subject, opts.html],
  );
}

async function deliver(row: OutboxEmail): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[mailer] RESEND_API_KEY not set — leaving email ${row.id} queued (${row.template} -> ${row.toEmail})`);
    return;
  }
  await q(`UPDATE public.email_outbox SET status = 'sending' WHERE id = $1`, [row.id]);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [row.toEmail],
        subject: row.subject,
        html: row.html,
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 500);
      throw new Error(`resend ${res.status}: ${detail}`);
    }
    const payload = (await res.json()) as { id?: string };
    await q(
      `UPDATE public.email_outbox SET status = 'sent', provider_message_id = $2, sent_at = now(), error = NULL WHERE id = $1`,
      [row.id, payload.id ?? null],
    );
  } catch (err) {
    await q(
      `UPDATE public.email_outbox SET status = 'failed', error = $2 WHERE id = $1`,
      [row.id, err instanceof Error ? err.message.slice(0, 1000) : "unknown error"],
    );
  }
}

export async function flushOutbox(limit = 50): Promise<number> {
  const rows = await q<OutboxEmail>(
    `SELECT id::text AS id, tenant_id::text AS "tenantId", to_email AS "toEmail", to_name AS "toName",
            template, subject, html, status
       FROM public.email_outbox
      WHERE status = 'queued' OR status = 'failed'
      ORDER BY created_at
      LIMIT $1`,
    [limit],
  );
  for (const row of rows) await deliver(row);
  return rows.length;
}
