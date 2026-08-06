"use client";

import { useState } from "react";
import { Search, ShieldCheck, Table2, CornerDownRight } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { Skeleton } from "@/components/loading";

const exampleQueries = [
  "How many premium 3BHK units will remain unsold in Project Elevate next quarter?",
  "Show collections variance for July vs payment schedule",
  "Which towers have more than 20% units blocked?",
  "Which customers have overdue invoices, and has the reminder email been sent?",
];

interface QueryResult {
  summary: string;
  sql: string;
  columns: string[];
  rows: (string | number)[][];
}

const mockResults: Record<string, QueryResult> = {
  "How many premium 3BHK units will remain unsold in Project Elevate next quarter?": {
    summary:
      "Based on current sales velocity (41 units/quarter) and 14 unsold 3BHK units today, approximately 0 premium 3BHK units are projected to remain unsold — the project is on track to clear 3BHK inventory by end of this quarter.",
    sql: "SELECT COUNT(*) FROM units u JOIN projects p ON u.project_id = p.id WHERE p.code = 'ELEVATE' AND u.unit_type = '3BHK' AND u.status IN ('available','blocked') AND u.sold_quarter IS NULL;",
    columns: ["Project", "Unit Type", "Available Now", "Velocity (qtr)", "Projected Unsold"],
    rows: [
      ["Elevate Residences", "3BHK", 14, 41, "≈ 0 (sell-through) "],
    ],
  },
  "Which customers have overdue invoices, and has the reminder email been sent?": {
    summary:
      "3 invoices are past due, headed by RINV-2026-064 (₹72,000, due 30 Jul). The Finance Agent queued payment-reminder emails through the Resend outbox — deliveries are confirmed with provider IDs and logged in the audit trail.",
    sql: "SELECT i.invoice_no, i.due_date, i.total, c.primary_email, o.status FROM invoices i JOIN customers c ON i.customer_id = c.id LEFT JOIN email_outbox o ON o.subject LIKE '%' || i.invoice_no || '%' WHERE i.status = 'issued' AND i.due_date < now();",
    columns: ["Invoice", "Due", "Amount", "Email", "Reminder"],
    rows: [
      ["RINV-2026-064", "30 Jul", 72000, "anil.kapoor@example.in", "sent · 5 min ago"],
    ],
  },
  default: {
    summary:
      "The engine converted your question into a read-only, tenant-scoped SQL query, executed it against the isolated schema, and passed the result to the forecasting engine.",
    sql: "SELECT … FROM tenant_schema … -- read-only · row-level security enforced",
    columns: ["Result", "Confidence", "Status"],
    rows: [["Query executed successfully", "High", "Safe (schema security layer)"]],
  },
};

export function AiQueryBar() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"idle" | "thinking" | "done">("idle");
  const [result, setResult] = useState<QueryResult | null>(null);

  const run = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setState("thinking");
    setResult(null);
    setTimeout(() => {
      setResult(mockResults[q] ?? mockResults.default);
      setState("done");
    }, 1400);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Search size={15} className="shrink-0 text-text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(query)}
            placeholder='Ask your data… e.g. "How many 3BHK units unsold next quarter?"'
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-subtle"
            aria-label="AI executive query"
          />
          <ShieldCheck size={15} className="shrink-0 text-success" aria-label="Protected by schema security layer" />
        </div>
        <Button onClick={() => run(query)} disabled={state === "thinking"}>
          {state === "thinking" ? "Generating…" : "Ask AI"}
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {exampleQueries.map((q) => (
          <button
            key={q}
            onClick={() => run(q)}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-text-muted transition-colors duration-200 hover:border-border-strong hover:text-text cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {state === "thinking" && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Spinner className="text-primary" />
            Parsing intent → generating SQL against tenant schema…
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="rounded-md bg-surface-muted/70 p-3">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <div className="rounded-md bg-surface-muted/70 p-3">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
        </div>
      )}

      {state === "done" && result && (
        <div className="mt-4 rounded-lg border border-border bg-surface animate-fade-in">
          <div className="flex items-start gap-2 border-b border-border px-4 py-3">
            <CornerDownRight size={15} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-text">{result.summary}</p>
          </div>
          <div className="border-b border-border bg-surface-muted/50 px-4 py-2 font-mono text-[11px] text-text-subtle">
            {result.sql}
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {result.columns.map((c) => (
                    <th key={c} className="px-3 py-2 text-left text-xs font-medium text-text-muted">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-text tabular-nums">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-[11px] text-text-subtle">
            <Table2 size={12} /> Read-only view · tenant-scoped · full query logged for audit
          </div>
        </div>
      )}
    </div>
  );
}
