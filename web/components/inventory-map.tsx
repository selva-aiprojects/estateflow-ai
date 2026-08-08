"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Building2, CalendarClock, FileText, Info, Lock, RefreshCw } from "lucide-react";
import { unitStatusMeta, type Project, type Unit, type UnitStatus } from "@/lib/data";
import { useApiData, apiSend } from "@/lib/api-client";
import { inr, inrCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageSkeleton } from "@/components/loading";
import { Badge, Button, Card, Select } from "@/components/ui";

export function InventoryMap() {
  const [inventory] = useApiData<{ projects: Project[] }>("/api/inventory");
  const [projectId, setProjectId] = useState("");
  const [towerId, setTowerId] = useState("");
  const [selected, setSelected] = useState<Unit | null>(null);
  const [held, setHeld] = useState<Unit | null>(null);
  const [holdSeconds, setHoldSeconds] = useState(15 * 60);

  useEffect(() => {
    if (!inventory) return;
    const first = inventory.projects[0];
    if (!first) return;
    setProjectId((cur) => cur || first.id);
    setTowerId((cur) => cur || first.towers[0]?.id || "");
  }, [inventory]);

  const project = inventory?.projects.find((p) => p.id === projectId) ?? inventory?.projects[0];
  const tower = project?.towers.find((t) => t.id === towerId) ?? project?.towers[0];

  const floors = useMemo(() => {
    if (!tower) return [];
    const unique = [...new Set(tower.units.map((u) => u.floor))].sort((a, b) => b - a);
    return unique.map((f) => ({ floor: f, units: tower.units.filter((u) => u.floor === f).sort((a, b) => a.no.localeCompare(b.no)) }));
  }, [tower]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    tower?.units.forEach((u) => (c[u.status] = (c[u.status] ?? 0) + 1));
    return c;
  }, [tower]);

  if (!inventory) return <PageSkeleton />;

  const { projects } = inventory;
  const currentProject = project ?? projects[0];
  const currentTower = tower ?? currentProject.towers[0];

  const startHold = () => {
    if (!selected) return;
    apiSend<{ locked: boolean; expiresAt: number }>(`/api/inventory/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({ hold: true, heldBy: "demo-sales-executive" }),
    }).catch(() => {});
    setHeld(selected);
    setHoldSeconds(15 * 60);
    const id = setInterval(() => {
      setHoldSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setHeld(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const statusLabel = (s: UnitStatus) => unitStatusMeta[s].label;
  const heldUnitNo = held?.no;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {Object.values(unitStatusMeta).map((m) => (
                <span key={m.label} className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
                  {m.label}
                  <span className="font-medium text-text tabular-nums">{counts[Object.keys(unitStatusMeta).find((k) => unitStatusMeta[k as UnitStatus].label === m.label)!] ?? 0}</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={projectId}
                onChange={(v) => {
                  setProjectId(v);
                  const p = projects.find((x) => x.id === v)!;
                  setTowerId(p.towers[0].id);
                }}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
              />
              <Select
                value={towerId}
                onChange={setTowerId}
                options={currentProject.towers.map((t) => ({ value: t.id, label: t.name }))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">{currentTower.name}</h2>
              <p className="text-xs text-text-muted">
                {currentProject.name} · {currentProject.location} · RERA {currentProject.reraNo}
              </p>
            </div>
            <Badge tone="info">
              <span className="h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
              Live · Redis lock active
            </Badge>
          </div>

          <div className="space-y-2">
            {floors.map(({ floor, units }) => (
              <div key={floor} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-right text-xs font-medium text-text-muted tabular-nums">F{floor}</span>
                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                  {units.map((u) => {
                    const meta = unitStatusMeta[u.status];
                    const isHeld = heldUnitNo === u.no;
                    const isSelected = selected?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelected(u)}
                        title={`${u.no} · ${u.type} · ${u.sqft} sq.ft · ${inr(u.price)}`}
                        className={cn(
                          "group relative flex h-16 flex-col items-center justify-center rounded-md border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                          isSelected && "ring-2 ring-primary ring-offset-1",
                          isHeld && "animate-pulse",
                        )}
                        style={{
                          backgroundColor: `${meta.color}1f`,
                          borderColor: isSelected ? "hsl(var(--primary))" : `${meta.color}55`,
                        }}
                      >
                        <span className="text-xs font-semibold text-text" style={{ color: meta.color }}>
                          {u.no.split("-").slice(1).join("-")}
                        </span>
                        <span className="mt-0.5 text-[10px] text-text-muted tabular-nums">
                          {u.sqft} sq.ft
                        </span>
                        {isHeld && (
                          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                            <Lock size={9} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-border pt-3 text-[11px] text-text-subtle">
            Click any unit for details. Generating a quotation acquires a 15-minute Redis hold to prevent double-booking (TR-INV-004).
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {selected ? (
          <Card className="animate-fade-in">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md text-white" style={{ backgroundColor: unitStatusMeta[selected.status].color }}>
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">Unit {selected.no}</h3>
                  <p className="text-xs text-text-muted">{selected.type} · Floor {selected.floor} · {selected.tower}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close panel" className="rounded-md p-1.5 text-text-subtle hover:bg-surface-muted transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Facing</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">{selected.facing ?? "—"}</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Furnishing</p>
                  <p className="mt-0.5 text-sm font-semibold capitalize text-text">{selected.furnishing?.replace("_", " ") ?? "—"}</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Carpet Area</p>
                  <p className="mt-0.5 text-sm font-semibold text-text tabular-nums">{selected.sqft.toLocaleString("en-IN")} sq.ft</p>
                </div>
                <div className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Status</p>
                  <p className="mt-0.5 text-sm font-semibold" style={{ color: unitStatusMeta[selected.status].color }}>
                    {statusLabel(selected.status)}
                  </p>
                </div>
                <div className="col-span-2 rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">Base Sale Price</p>
                  <p className="mt-0.5 text-lg font-semibold text-text tabular-nums">{inr(selected.price)}</p>
                </div>
              </div>

              {selected.features?.length ? (
                <div>
                  <p className="mb-1.5 text-[11px] text-text-muted">Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => (
                      <span key={f} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {selected.planImageUrl ? (
                <div>
                  <p className="mb-1.5 text-[11px] text-text-muted">Floor Plan</p>
                  <div className="overflow-hidden rounded-md border border-border bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.planImageUrl} alt={`Floor plan for ${selected.no}`} className="w-full object-contain" loading="lazy" />
                  </div>
                </div>
              ) : null}

              <div className="rounded-md border border-warning/20 bg-warning-soft/60 p-3 text-[11px] leading-relaxed text-warning">
                <span className="inline-flex items-center gap-1 font-medium"><Info size={12} /> AI Sales Agent note:</span>{" "}
                Demand for {selected.type} at {currentProject.name} is strong — 2 leads within budget in the last 7 days.
              </div>

              {held?.id === selected.id ? (
                <div className="rounded-md border border-primary/20 bg-primary-soft p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Lock size={14} /> Unit held · 15-min Redis lock
                  </div>
                  <p className="mt-1 text-xs text-primary/80 tabular-nums">Expires in {Math.floor(holdSeconds / 60)}m {holdSeconds % 60}s</p>
                  <p className="mt-2 text-[11px] text-primary/70">No other executive can quote this unit during the hold.</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={startHold} disabled={selected.status !== "available" && selected.status !== "token_paid"}>
                    <FileText size={15} /> Generate Quote
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    <CalendarClock size={15} /> Book Visit
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Building2 size={20} />
            </div>
            <p className="mt-3 text-sm font-medium text-text">No unit selected</p>
            <p className="mt-1 max-w-[220px] text-xs text-text-muted">
              Select a unit on the heat map to view pricing, hold status, and quote actions.
            </p>
          </Card>
        )}

        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
            <RefreshCw size={14} className="text-text-muted" /> Legend & health
          </h3>
          <ul className="space-y-2 text-xs text-text-muted">
            <li className="flex items-center justify-between"><span>Available</span><b className="text-text tabular-nums">{counts.available ?? 0}</b></li>
            <li className="flex items-center justify-between"><span>Blocked</span><b className="text-text tabular-nums">{counts.blocked ?? 0}</b></li>
            <li className="flex items-center justify-between"><span>Token Paid</span><b className="text-text tabular-nums">{counts.token_paid ?? 0}</b></li>
            <li className="flex items-center justify-between"><span>Sold</span><b className="text-text tabular-nums">{counts.sold ?? 0}</b></li>
            <li className="flex items-center justify-between"><span>Under Maintenance</span><b className="text-text tabular-nums">{counts.under_maintenance ?? 0}</b></li>
          </ul>
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs text-text-muted">Sell-through rate</p>
            <p className="mt-1 text-2xl font-semibold text-text tabular-nums">
              {Math.round(((counts.sold ?? 0) / currentTower.units.length) * 100)}%
            </p>
            <p className="mt-0.5 text-[11px] text-text-subtle">{inrCompact(currentTower.units.reduce((s, u) => s + (u.status === "sold" ? u.price : 0), 0))} realized</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
