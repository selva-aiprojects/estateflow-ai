import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  MapPin,
  TrendingUp,
  Users,
  IndianRupee,
  Sparkles,
} from "lucide-react";

const units = [
  "s", "s", "b", "s", "t", "s",
  "s", "s", "s", "b", "s", "s",
  "t", "s", "s", "r", "s", "s",
  "s", "t", "s", "s", "s", "b",
] as const;

const unitColor: Record<string, string> = {
  s: "bg-success/80",
  b: "bg-warning/80",
  t: "bg-info/80",
  r: "bg-danger/80",
};

const unitLabel: Record<string, string> = {
  s: "Available",
  b: "Blocked",
  t: "Token paid",
  r: "Sold",
};

const trust = ["DPDP 2023 ready", "RERA compliance", "AWS ap-south-1"];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 480px at 85% -10%, hsl(var(--teal) / 0.18), transparent 60%), radial-gradient(700px 420px at -10% 110%, hsl(var(--info) / 0.16), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--hero-border) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--hero-border) / 0.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(720px 420px at 30% 0%, black, transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-28">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-hero-border bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
            India&apos;s first multi-tenant AI Real Estate OS
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            One AI-powered OS for your{" "}
            <span className="bg-gradient-to-r from-teal via-info to-white bg-clip-text text-transparent">
              entire real estate business
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            EstateFlow unifies CRM, ERP, finance and a fleet of autonomous AI
            agents — so sales, construction, finance and legal run off a single
            source of truth. From lead to handover, on one platform.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-hero shadow-sm transition-colors duration-200 hover:bg-white/90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Launch the product
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#platform"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Explore the platform
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={15} className="text-teal" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-teal/25 via-transparent to-info/25 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-xl border border-hero-border bg-hero-soft shadow-lift">
              <div className="flex items-center justify-between border-b border-hero-border px-4 py-3">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-white/60">
                  <Image src="/logo-white.png" alt="" width={521} height={90} className="h-3.5 w-auto" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  <span className="h-1 w-1 rounded-full bg-success" aria-hidden />
                  AI Online
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-hero-border px-4 py-4">
                <div className="rounded-lg border border-hero-border bg-white/[0.03] p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <IndianRupee size={11} className="text-teal" aria-hidden />
                    Collections
                  </div>
                  <p className="mt-1 text-sm font-semibold tabular-nums">₹48.2 Cr</p>
                  <p className="text-[10px] text-success">+12.4%</p>
                </div>
                <div className="rounded-lg border border-hero-border bg-white/[0.03] p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <TrendingUp size={11} className="text-info" aria-hidden />
                    Sold / Mo
                  </div>
                  <p className="mt-1 text-sm font-semibold tabular-nums">126</p>
                  <p className="text-[10px] text-success">+8</p>
                </div>
                <div className="rounded-lg border border-hero-border bg-white/[0.03] p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <Users size={11} className="text-warning" aria-hidden />
                    Pipeline
                  </div>
                  <p className="mt-1 text-sm font-semibold tabular-nums">214</p>
                  <p className="text-[10px] text-white/40">hot</p>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
                    <MapPin size={12} className="text-teal" aria-hidden />
                    Tower T1 · Level 12 · 24 units
                  </p>
                  <span className="text-[10px] text-white/40">Live</span>
                </div>

                <div className="mt-3 grid grid-cols-6 gap-1.5" role="img" aria-label="Inventory heat map preview">
                  {units.map((status, i) => (
                    <div key={i} className="aspect-square rounded-md border border-white/5 bg-white/[0.04]" title={unitLabel[status]}>
                      <div className={`h-full w-full rounded-[5px] ${unitColor[status]}`} />
                    </div>
                  ))}
                </div>

                <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/50">
                  {(["s", "b", "t", "r"] as const).map((k) => (
                    <li key={k} className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${unitColor[k]}`} aria-hidden />
                      {unitLabel[k]}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-2.5 border-t border-hero-border px-4 py-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal/20 text-teal">
                  <Bot size={13} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-white/80">
                    Lead #4821 scored 94 — site visit booked for Sat, 9 Aug.
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
                    <Sparkles size={10} aria-hidden />
                    AI Sales Agent · WhatsApp · 0.9s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
