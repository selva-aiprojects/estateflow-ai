const stats = [
  { value: "₹2,400 Cr+", label: "Collections tracked to the rupee" },
  { value: "< 2 min", label: "AI lead response time, 24/7" },
  { value: "7 personas", label: "One platform, site engineer to CEO" },
  { value: "99.95%", label: "Uptime across active-active regions" },
];

export function Stats() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-semibold tracking-tight text-text tabular-nums sm:text-4xl">{stat.value}</p>
            <p className="mt-2 text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
