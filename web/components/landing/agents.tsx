import { PhoneCall, HardHat, Landmark, Scale, PackageSearch, MessageCircle } from "lucide-react";

const agents = [
  {
    icon: PhoneCall,
    tone: "bg-info-soft text-info",
    title: "AI Sales Agent",
    summary:
      "Qualifies, follows up and books site visits 24/7 — in English, Hindi and regional languages.",
    points: ["Answers pricing & payment-plan FAQs instantly", "Books visits straight into the scheduler"],
    tools: "WhatsApp Business · Twilio Voice",
  },
  {
    icon: HardHat,
    tone: "bg-warning-soft text-warning",
    title: "AI Construction Agent",
    summary:
      "Reads site photos and DPRs against the master schedule to catch delays before they compound.",
    points: ["Vision analysis of uploaded site images", "Flags shortages & re-forecasts completion dates"],
    tools: "Claude Vision · Predictive engine",
  },
  {
    icon: Landmark,
    tone: "bg-success-soft text-success",
    title: "AI Finance Agent",
    summary:
      "Forecasts cash flow, flags budget variance before it lands on the P&L, and acts on overdue invoices.",
    points: ["Collection-pattern cash forecasting", "BOQ baseline vs. actual material spend", "Payment-reminder emails queued for overdue invoices"],
    tools: "Time-series · Resend outbox",
  },
  {
    icon: Scale,
    tone: "bg-primary-soft text-primary",
    title: "AI Legal Agent",
    summary:
      "Audits contracts and RERA filings for missing clauses, liability and compliance gaps.",
    points: ["Clause & liability review on contracts", "RERA guideline verification"],
    tools: "RAG over pgvector",
  },
  {
    icon: PackageSearch,
    tone: "bg-danger-soft text-danger",
    title: "AI Procurement Agent",
    summary:
      "Evaluates RFQ bids on price, delivery and vendor history — then drafts purchase orders.",
    points: ["Cross-vendor RFQ comparison", "Anomaly alerts vs. market price indices"],
    tools: "RFQ workflow · Cost matching",
  },
  {
    icon: MessageCircle,
    tone: "bg-teal-soft text-teal",
    title: "AI Customer Agent",
    summary:
      "Handles every buyer on WhatsApp — and follows up payment reminders by email.",
    points: ["Payment-schedule answers & reminders", "Receipts, e-sign links & photo updates", "Overdue-invoice reminder emails via a shared outbox"],
    tools: "WhatsApp Business · Resend emails",
  },
];

export function Agents() {
  return (
    <section id="agents" className="scroll-mt-16 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">Multi-agent AI layer</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            A dedicated AI agent for every function
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Six specialised agents — coordinated on LangGraph — share one
            transactional database, so decisions made on the sales floor are
            instantly visible to finance, construction and legal. Every agent
            runs inside its workspace, scoped to a single tenant&apos;s schema,
            with email actions (welcome kit, resets, payment reminders) flowing
            through EstateFlow&apos;s own Resend-backed outbox.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <article
              key={agent.title}
              className="group flex flex-col rounded-lg border border-border bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-md ${agent.tone}`}>
                  <agent.icon size={18} aria-hidden />
                </span>
                <h3 className="text-base font-semibold text-text">{agent.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">{agent.summary}</p>
              <ul className="mt-4 space-y-2">
                {agent.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-text">
                    <span className="mt-1.5 h-1 w-3 shrink-0 rounded-full bg-teal" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-border pt-4 font-mono text-[11px] text-text-subtle">{agent.tools}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
