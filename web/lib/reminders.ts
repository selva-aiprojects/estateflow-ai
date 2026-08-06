import { q, type Row } from "@/lib/db";
import { queueEmail, paymentReminderHtml } from "@/lib/mailer";
import { tenantAdminUserId } from "@/lib/provision";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

interface OverdueInvoice extends Row {
  invoiceNo: string;
  customerName: string;
  customerEmail: string | null;
  amount: number;
  dueDate: string | null;
}

const OVERDUE_STATUSES = ["issued", "partially_paid", "overdue"];

// Finds invoices that are unpaid past their due date and have a customer email.
async function fetchOverdueInvoices(): Promise<OverdueInvoice[]> {
  return q<OverdueInvoice>(
    `SELECT i.invoice_no AS "invoiceNo", c.name AS "customerName", c.primary_email AS "customerEmail",
            i.total_amount::float8 AS amount, i.due_date::text AS "dueDate"
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
      WHERE i.status = ANY($1::varchar[])
        AND i.due_date IS NOT NULL
        AND i.due_date < (now() + interval '1 day')::date
        AND c.primary_email IS NOT NULL
        AND c.primary_email <> ''
      ORDER BY i.due_date`,
    [OVERDUE_STATUSES],
  );
}

async function alreadyReminded(invoiceNo: string, sinceDays = 7): Promise<boolean> {
  const row = await q<{ v: number }>(
    `SELECT COUNT(*)::int AS v
       FROM public.email_outbox
      WHERE template = 'payment-reminder'
        AND subject = $1
        AND created_at > now() - ($2 || ' days')::interval`,
    [`Payment reminder — ${invoiceNo}`, String(sinceDays)],
  );
  return (row[0]?.v ?? 0) > 0;
}

export async function runPaymentReminders(): Promise<number> {
  const adminUserId = await tenantAdminUserId("builder-a");
  const overdue = await fetchOverdueInvoices();
  let count = 0;

  for (const inv of overdue) {
    if (await alreadyReminded(inv.invoiceNo)) continue;
    if (!inv.customerEmail) continue;

    const amount = inr.format(inv.amount);
    const dueDate = inv.dueDate ? dayFmt.format(new Date(`${inv.dueDate}T00:00:00`)) : "N/A";

    await queueEmail({
      toEmail: inv.customerEmail,
      toName: inv.customerName,
      template: "payment-reminder",
      subject: `Payment reminder — ${inv.invoiceNo}`,
      html: paymentReminderHtml({
        displayName: inv.customerName,
        invoiceNo: inv.invoiceNo,
        amount,
        dueDate,
        tenantName: "Builder A Homes",
      }),
    });

    if (adminUserId) {
      await q(
        `INSERT INTO notifications (user_id, channel, title, body, payload, status)
         VALUES ($1, 'email', $2, $3, $4::jsonb, 'sent')`,
        [
          adminUserId,
          `Payment reminder sent — ${inv.invoiceNo}`,
          `${amount} due ${dueDate} · email sent to ${inv.customerEmail}`,
          JSON.stringify({ tone: "warning", invoiceNo: inv.invoiceNo }),
        ],
      );
    }
    count++;
  }

  return count;
}
