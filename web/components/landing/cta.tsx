import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";

export function Cta() {
  return (
    <section className="bg-background pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-hero-border bg-hero px-6 py-14 text-center text-white sm:px-12 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 320px at 50% -20%, hsl(var(--teal) / 0.22), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring your next tower live on EstateFlow
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              See your inventory, agents and collections on one screen — in a
              single demo tenant, configured the way your projects run.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-hero shadow-sm transition-colors duration-200 hover:bg-white/90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Launch the product
                <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:sales@estateflow.in?subject=Book%20a%20demo"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <CalendarClock size={16} aria-hidden />
                Book a demo
              </a>
            </div>
            <p className="mt-6 text-xs text-white/45">
              Prefer to see it yourself? The live demo is one click away.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
