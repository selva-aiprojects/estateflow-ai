import { MessageSquare, BrainCircuit, FileCheck2, HardHat, Wallet } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Leads land",
    copy: "From WhatsApp, Meta, Google Ads or IVR — every enquiry is ingested as an event.",
  },
  {
    icon: BrainCircuit,
    title: "AI scores & routes",
    copy: "Budget, location intent and history are scored in under 2 minutes and routed by dynamic round-robin.",
  },
  {
    icon: FileCheck2,
    title: "Quote with lock",
    copy: "Payment schedules follow milestones; the unit is Redis-locked for 15 minutes and discount >5% routes to approval.",
  },
  {
    icon: HardHat,
    title: "Build & track",
    copy: "Site DPRs, BOQ and AI vision keep the master timeline honest across every tower.",
  },
  {
    icon: Wallet,
    title: "Billing & collect",
    copy: "Milestone invoices auto-reconcile from bank statements — GST, TDS and RERA disclosures included.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="scroll-mt-16 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            From lead to handover, one pipeline
          </h2>
        </div>

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <step.icon size={18} aria-hidden />
                </span>
                <span className="font-mono text-xs text-text-subtle tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
