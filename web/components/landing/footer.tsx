import Image from "next/image";
import { Zap, ShieldCheck } from "lucide-react";

const productLinks = [
  { label: "Inventory heat maps", href: "#platform" },
  { label: "Construction ERP & DPR", href: "#platform" },
  { label: "Finance & compliance", href: "#platform" },
  { label: "Customer portal", href: "#platform" },
  { label: "Rentals & facilities", href: "#platform" },
];

const agentLinks = [
  { label: "Sales agent", href: "#agents" },
  { label: "Construction agent", href: "#agents" },
  { label: "Finance agent", href: "#agents" },
  { label: "Legal & procurement", href: "#agents" },
  { label: "Customer agent", href: "#agents" },
];

const companyLinks = [
  { label: "Launch the app", href: "/dashboard" },
  { label: "Security & data isolation", href: "#security" },
  { label: "Book a demo", href: "mailto:sales@estateflow.in?subject=Book%20a%20demo" },
  { label: "Contact", href: "mailto:hello@estateflow.in" },
];

export function Footer() {
  return (
    <footer className="bg-hero text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Image
              src="/logo-white.png"
              alt="EstateFlow"
              width={521}
              height={90}
              className="h-8 w-auto"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              India&apos;s first AI-powered end-to-end real estate operating
              system — built by Cognivectra.
            </p>
            <p className="mt-6 flex items-center gap-2 text-xs text-white/45">
              <ShieldCheck size={14} aria-hidden />
              Data resides in AWS ap-south-1 · DPDP 2023
            </p>
          </div>

          <nav className="lg:col-span-3" aria-label="Product">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Product</p>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="AI agents">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">AI agents</p>
            <ul className="mt-4 space-y-2.5">
              {agentLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-3" aria-label="Company">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Company</p>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-hero-border pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 EstateFlow · Built by Cognivectra</span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} aria-hidden />
            First token &lt; 1.5s · p95 API &lt; 200ms
          </span>
        </div>
      </div>
    </footer>
  );
}
