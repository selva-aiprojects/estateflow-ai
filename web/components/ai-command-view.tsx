"use client";

import { useState } from "react";
import { Cpu, Bot, Mic, Activity, Gauge, CheckCircle2, TriangleAlert, Info } from "lucide-react";
import { type AgentKey, type AiAgent, type AiInsight, type AgentTask } from "@/lib/data";
import { useApiData } from "@/lib/api-client";
import { AiQueryBar } from "@/components/ai-query";
import { PageSkeleton } from "@/components/loading";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, CardHeader, PageHeader, Spinner } from "@/components/ui";

const agentMeta: Record<AgentKey, { tone: "primary" | "success" | "warning" | "info" | "danger" | "muted"; color: string }> = {
  sales: { tone: "success", color: "bg-success-soft text-success" },
  construction: { tone: "warning", color: "bg-warning-soft text-warning" },
  finance: { tone: "primary", color: "bg-primary-soft text-primary" },
  legal: { tone: "info", color: "bg-info-soft text-info" },
  procurement: { tone: "danger", color: "bg-danger-soft text-danger" },
  customer: { tone: "muted", color: "bg-surface-muted text-text-muted" },
};

const statusTone = { active: "success", idle: "muted", training: "warning" } as const;

const insightTone = { info: "info", warning: "warning", success: "success", danger: "danger" } as const;

export function AiCommandView() {
  const [ai] = useApiData<{ agents: AiAgent[]; insights: AiInsight[]; tasks: AgentTask[] }>("/api/ai-command");
  const [briefing, setBriefing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<AgentKey>("sales");

  if (!ai) return <PageSkeleton />;
  const { agents, insights, tasks } = ai;

  const activeCount = agents.filter((a) => a.status === "active").length;
  const runningTasks = tasks.filter((t) => t.status === "running").length;

  const brief = () => {
    setBriefing(true);
    setTimeout(() => {
      setBriefing(false);
      setToast("Voice briefing delivered: 4 agents active · premium 3BHK on track to clear · one procurement anomaly open · payment reminders sent for 3 overdue invoices.");
      setTimeout(() => setToast(null), 6000);
    }, 1600);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="AI Command Center"
        subtitle="Multi-agent LangGraph orchestration · text-to-SQL · email & reminder automations"
        action={
          <Button onClick={brief} disabled={briefing}>
            {briefing ? <Spinner /> : <Mic size={15} />}
            {briefing ? "Briefing…" : "Voice briefing"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Bot size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{activeCount}<span className="text-sm text-text-muted">/{agents.length}</span></p>
          <p className="text-xs text-text-muted">Agents online</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">1 training · 1 idle</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Activity size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{runningTasks}<span className="text-sm text-text-muted">/{tasks.length}</span></p>
          <p className="text-xs text-text-muted">Tasks in flight</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">Temporal orchestrating</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
            <Gauge size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">94.2%</p>
          <p className="text-xs text-text-muted">Avg. success rate</p>
          <p className="mt-0.5 text-[11px] text-success">↑ 0.4% this week</p>
        </Card>
        <Card className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning">
            <TriangleAlert size={16} />
          </div>
          <p className="mt-3 text-lg font-semibold text-text tabular-nums">{insights.filter((i) => i.tone === "warning" || i.tone === "danger").length}</p>
          <p className="text-xs text-text-muted">Actionable alerts</p>
          <p className="mt-0.5 text-[11px] text-text-subtle">from agent insights</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Natural Language Intelligence"
          subtitle="Text-to-SQL · schema security layer · tenant-scoped read-only"
          icon={<Cpu size={15} className="text-primary" />}
        />
        <div className="px-5 pb-5">
          <AiQueryBar />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Agent Fleet" subtitle="Autonomous agents · tool-augmented · shared memory" />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
            {agents.map((a) => (
              <button
                key={a.key}
                onClick={() => setSelected(a.key)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all duration-200 cursor-pointer",
                  selected === a.key ? "border-primary/40 bg-primary-soft/40 shadow-sm" : "border-border bg-surface-muted/30 hover:border-border-strong hover:shadow-sm",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", agentMeta[a.key].color)}>
                    <Bot size={16} />
                  </div>
                  <Badge tone={statusTone[a.status]} className="text-[10px]">{a.status}</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-text">{a.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">{a.role}</p>
                <p className="mt-2 text-[11px] text-text-subtle line-clamp-1">{a.lastActivity}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
                  <span className="tabular-nums">{a.activeTasks} tasks</span>
                  <span className="tabular-nums">{a.successRate}% ok</span>
                  <span className="tabular-nums">{a.latencyMs}ms</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Agent Insights" subtitle="Streaming intelligence feed" />
          <ul className="px-3 pb-3">
            {insights.map((i) => (
              <li key={i.id} className="flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface-muted/60">
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", agentMeta[i.agent].color)}>
                  <Bot size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-medium text-text">{i.title}</p>
                    <Badge tone={insightTone[i.tone]} className="shrink-0 text-[10px]">{i.agent}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{i.body}</p>
                  <p className="mt-1 text-[10px] text-text-subtle">{i.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Active Workflows" subtitle="Temporal durable execution · retry & human-in-the-loop on approval" action={<Badge tone="primary"><Activity size={11} /> {runningTasks} running</Badge>} />
        <div className="space-y-3 px-5 pb-5">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-surface-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", agentMeta[t.agent].color)}>
                    <Bot size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-text">{t.title}</p>
                    <p className="text-[11px] text-text-muted">{t.target}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-surface-muted sm:block">
                    <div className={cn("h-full rounded-full", t.status === "done" ? "bg-success" : "bg-primary")} style={{ width: `${t.progress}%` }} />
                  </div>
                  <Badge tone={t.status === "done" ? "success" : t.status === "running" ? "info" : "muted"}>{t.status}</Badge>
                </div>
              </div>
              {t.status !== "done" && (
                <p className="mt-2 text-[11px] text-text-muted tabular-nums">
                  <Info size={11} className="mr-1 inline text-text-subtle" />
                  progress {t.progress}% · <span className="text-primary">view execution log</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 animate-fade-in">
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-sidebar px-4 py-3 text-sm text-white shadow-lift">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" />
            <span className="text-white/90">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
