import { Layers, MapPin, KeyRound, ShieldCheck, FileCheck2, Activity } from "lucide-react";

const items = [
  {
    icon: Layers,
    title: "Data isolation",
    copy: "Your organisation runs in its own isolated database with dedicated vector storage — your data is never shared or exposed to any other business on the platform.",
  },
  {
    icon: MapPin,
    title: "Data sovereignty",
    copy: "All data, logs and backups reside in AWS Mumbai (ap-south-1) or Azure Central India, per DPDP Act 2023.",
  },
  {
    icon: KeyRound,
    title: "Encryption",
    copy: "AES-256 at rest with dedicated KMS keys per organisation, and TLS 1.3 for every request in transit.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-trust identity",
    copy: "MFA and fine-grained RBAC via Keycloak or Microsoft Entra ID across all seven personas.",
  },
  {
    icon: FileCheck2,
    title: "Governance",
    copy: "RERA disclosure workflows, DigiLocker integration and audit trails built into every module.",
  },
  {
    icon: Activity,
    title: "Reliability",
    copy: "99.95% uptime SLA across active-active regions, orchestrated on managed Kubernetes.",
  },
];

export function Security() {
  return (
    <section id="security" className="relative scroll-mt-16 overflow-hidden bg-hero text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(800px 400px at 15% -10%, hsl(var(--info) / 0.14), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">Enterprise security</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Isolation and compliance, baked in
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Built for Indian builders who operate across states and regulations —
            without ever compromising on data sovereignty.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-hero-border bg-white/[0.03] p-6 transition-colors duration-200 hover:bg-white/[0.06]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-teal">
                <item.icon size={18} aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
