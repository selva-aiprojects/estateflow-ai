import {
  Lock,
  FileCheck2,
  Wallet,
  BadgeCheck,
  HardHat,
  Truck,
  Warehouse,
  Users,
  Home,
  Handshake,
  ClipboardCheck,
} from "lucide-react";

const matrix = [
  "s", "s", "b", "s", "t",
  "s", "s", "s", "b", "s",
  "t", "s", "s", "r", "s",
  "s", "t", "s", "s", "s",
  "b", "s", "s", "t", "s",
] as const;

const matrixColor: Record<string, string> = {
  s: "bg-success",
  b: "bg-warning",
  t: "bg-info",
  r: "bg-danger",
};

const matrixLabel: Record<string, string> = {
  s: "Available",
  b: "Blocked",
  t: "Token paid",
  r: "Sold",
};

const modules = [
  {
    kicker: "Inventory",
    title: "Live inventory heat maps",
    copy: "A Project → Tower → Floor → Block → Unit matrix that updates in real time. Every executive sees the same status — Available, Blocked, Token Paid or Sold — and every quote holds the unit with a 15-minute Redis lock.",
    points: [
      "Real-time status for every unit in every tower",
      "15-minute quote lock prevents double-booking",
      "Drill from tower to floor to a single unit",
    ],
    visual: <HeatMapVisual />,
  },
  {
    kicker: "Construction ERP",
    title: "DPR, BOQ and site intelligence",
    copy: "Site engineers log daily progress reports offline, upload photos straight to S3, and the AI Construction Agent compares actual vs. master schedule — alerting the team to delays and material shortages before they cascade.",
    points: [
      "BOQ enforcement — no over-ordering without approval",
      "Offline DPR logging from the Flutter app",
      "AI vision reads site photos against the timeline",
    ],
    visual: <DprVisual />,
  },
  {
    kicker: "Finance & compliance",
    title: "Indian compliance, automated",
    copy: "CGST, SGST, IGST and TDS 194-IA computed automatically. Bank e-statements (MT940/CAMT) reconcile collections against invoices, and RERA disclosures sync to the right authorities.",
    points: [
      "GST split and TDS 194-IA handled automatically",
      "Auto-match of bank statements to invoices",
      "DigiLocker sync for agreements of sale",
    ],
    visual: <FinanceVisual />,
  },
];

function HeatMapVisual() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Tower T1 · Level 14</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Live
        </span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1.5" role="img" aria-label="Inventory heat map preview">
        {matrix.map((status, i) => (
          <div key={i} className="aspect-square rounded-md border border-border bg-surface-muted" title={matrixLabel[status]}>
            <div className={`h-full w-full rounded-[6px] ${matrixColor[status]}`} />
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
        {(["s", "b", "t", "r"] as const).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${matrixColor[k]}`} aria-hidden />
            {matrixLabel[k]}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-info/20 bg-info-soft px-3 py-2">
        <Lock size={13} className="text-info" aria-hidden />
        <p className="text-xs text-info">
          Unit 14B-03 on hold for quote #QT-2041 · <span className="font-medium tabular-nums">12:47</span> left
        </p>
      </div>
    </div>
  );
}

function DprVisual() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Daily Progress Report</p>
        <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">
          Delay alert
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {[
          { label: "Tower T1 · Core concreting", value: 78 },
          { label: "Tower T2 · Masonry works", value: 52 },
          { label: "Clubhouse · Shuttering", value: 31 },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-text">{row.label}</span>
              <span className="text-text-muted tabular-nums">{row.value}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full ${row.value >= 70 ? "bg-success" : row.value >= 45 ? "bg-primary" : "bg-warning"}`}
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-warning/20 bg-warning-soft px-3 py-2">
        <HardHat size={13} className="text-warning" aria-hidden />
        <p className="text-xs text-warning">
          AI: Steel delivery 2 days late — reorder suggested vs. BOQ line 14
        </p>
      </div>
    </div>
  );
}

function FinanceVisual() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Invoice INV-8821</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
          <BadgeCheck size={12} aria-hidden />
          Reconciled
        </span>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-text-muted">Amount</dt>
          <dd className="font-semibold text-text tabular-nums">₹42,50,000</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-muted">TDS 194-IA</dt>
          <dd className="text-text tabular-nums">₹42,500</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-muted">CGST + SGST</dt>
          <dd className="text-text tabular-nums">₹1,27,500</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-success/20 bg-success-soft px-3 py-2">
        <Wallet size={13} className="text-success" aria-hidden />
        <p className="text-xs text-success">
          Matched to UTR 41287… automatically from the bank statement
        </p>
      </div>
    </div>
  );
}

const moreModules = [
  { icon: FileCheck2, label: "RERA & legal" },
  { icon: Home, label: "Customer portal" },
  { icon: ClipboardCheck, label: "Rentals & leases" },
  { icon: Warehouse, label: "Facility & societies" },
  { icon: Users, label: "HR & contract labour" },
  { icon: Handshake, label: "Vendor marketplace" },
  { icon: Truck, label: "Broker & channel" },
];

export function Platform() {
  return (
    <section id="platform" className="scroll-mt-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">Platform</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            One system of record, end to end
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Every module writes to the same database — so a discount approved in
            sales, a DPR logged on site and a payment reconciled in finance are
            the same moment, seen by every stakeholder.
          </p>
        </div>

        <div className="mt-14 space-y-20">
          {modules.map((module, i) => (
            <div
              key={module.title}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal">{module.kicker}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-text">{module.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-text-muted">{module.copy}</p>
                <ul className="mt-6 space-y-2.5">
                  {module.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-text">
                      <span className="mt-1.5 h-1 w-3 shrink-0 rounded-full bg-teal" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>{module.visual}</div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold text-text">Also on the platform</p>
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {moreModules.map((item) => (
              <li key={item.label} className="flex flex-col items-center gap-2.5 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-text-subtle">
                  <item.icon size={18} aria-hidden />
                </span>
                <span className="text-xs font-medium text-text-muted">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
