import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type Tone = "muted" | "primary" | "success" | "warning" | "danger" | "info";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const badgeTones: Record<Tone, string> = {
  muted: "bg-surface-muted text-text-muted border border-border",
  primary: "bg-primary-soft text-primary border border-primary/15",
  success: "bg-success-soft text-success border border-success/15",
  warning: "bg-warning-soft text-warning border border-warning/15",
  danger: "bg-danger-soft text-danger border border-danger/15",
  info: "bg-info-soft text-info border border-info/15",
};

export function Badge({ tone = "muted", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className, onClick, hover }: { children: ReactNode; className?: string; onClick?: () => void; hover?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-surface shadow-card",
        hover && "transition-all duration-200 hover:shadow-lift hover:border-border-strong cursor-pointer",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div>
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-surface text-text border border-border hover:bg-surface-muted",
    ghost: "text-text-muted hover:text-text hover:bg-surface-muted",
    danger: "bg-danger text-white hover:opacity-90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, label, onClick, className }: { children: ReactNode; label: string; onClick?: () => void; className?: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-muted transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-11 w-11 text-sm" };
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-semibold", sizes[size])} aria-hidden>
      {initials}
    </div>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const tones = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger" };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-500", tones[tone])} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function StatusPill({ dot, label, color }: { dot?: string; label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
      <span className={cn("h-2 w-2 rounded-full", dot)} style={color ? { backgroundColor: color } : undefined} aria-hidden />
      {label}
    </span>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-subtle">{icon}</div>
      <p className="text-sm font-medium text-text">{title}</p>
      {hint && <p className="max-w-xs text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  hint,
  prefix,
  suffix,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-text-muted">{label}</span>}
      <div className="flex items-center rounded-md border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
        {prefix && <span className="pl-3 text-sm text-text-subtle">{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2 text-sm text-text outline-none placeholder:text-text-subtle"
        />
        {suffix && <span className="pr-3 text-sm text-text-subtle">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-text-muted">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-text tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function LinkButton({ href, children, variant = "secondary", className }: { href: string; children: ReactNode; variant?: "primary" | "secondary"; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        variant === "primary" ? "bg-primary text-white hover:bg-primary-hover shadow-sm" : "bg-surface text-text border border-border hover:bg-surface-muted",
        className,
      )}
    >
      {children}
    </Link>
  );
}
