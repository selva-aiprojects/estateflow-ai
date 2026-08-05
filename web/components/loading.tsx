import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-muted", className)} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in" role="status" aria-label="Loading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="mt-3 h-6 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card lg:col-span-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-6 h-44 w-full rounded-md" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-32 w-full rounded-md" />
            <Skeleton className="mt-3 h-3 w-3/4" />
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-4 h-28 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
