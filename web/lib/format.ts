export const inr = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
  }).format(value);

export const inrCompact = (value: number) => {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(value % 1_00_00_000 === 0 ? 0 : 1)} Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(value % 1_00_000 === 0 ? 0 : 1)} L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return inr(value);
};

export const formatDate = (date: string | Date, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(new Date(date));

export const formatDateTime = (date: string | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export const percent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;
