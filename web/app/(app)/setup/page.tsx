"use client";

import { useState } from "react";
import {
  Building2,
  Landmark,
  Users,
  UserCog,
  Truck,
  Award,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { inrCompact, formatAcres, formatDate } from "@/lib/format";
import { useApiData } from "@/lib/api-client";
import type { Project, LandParcel, PlotLayout } from "@/lib/data";

type Tab = "properties" | "land" | "customers" | "employees" | "vendors" | "amenities";

const UNIT_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "penthouse", "villa", "independent_house", "office", "retail", "studio", "plot", "other"];
const FACINGS = ["East", "West", "North", "South"];
const FURNISHING = ["unfurnished", "semi_furnished", "fully_furnished"];
const PLOT_ZONES = ["residential", "villa", "commercial"];
const PROJECT_TYPES = ["residential", "commercial", "mixed_use", "plotted"];

interface InventoryPayload {
  projects: Project[];
}
interface LandPayload {
  parcels: LandParcel[];
  layouts: PlotLayout[];
}
interface SetupCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  pan: string;
  kycStatus: string;
  createdAt: string;
}
interface SetupEmployee {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  employeeType: string;
  joiningDate: string;
  department: string;
  status: string;
}

interface UnitRow {
  unitNo: string;
  unitType: string;
  floor: string;
  blockCode: string;
  facing: string;
  furnishing: string;
  features: string;
  planImageUrl: string;
  sqft: string;
  price: string;
}
interface PlotRow {
  plotNo: string;
  zone: string;
  facing: string;
  features: string;
  sqft: string;
  price: string;
}

const emptyUnitRow = (): UnitRow => ({
  unitNo: "",
  unitType: "3BHK",
  floor: "1",
  blockCode: "",
  facing: "East",
  furnishing: "unfurnished",
  features: "",
  planImageUrl: "",
  sqft: "",
  price: "",
});
const emptyPlotRow = (): PlotRow => ({ plotNo: "", zone: "residential", facing: "East", features: "", sqft: "", price: "" });

const splitCsv = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function Notice({ tone, text }: { tone: "success" | "danger"; text: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        tone === "success" ? "border-success/20 bg-success-soft text-success" : "border-danger/20 bg-danger-soft text-danger",
      )}
    >
      {text}
    </p>
  );
}

export default function SetupPage() {
  const [tab, setTab] = useState<Tab>("properties");
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Setup"
        subtitle="Add properties, configure units and houses, register land, customers and employees."
      />
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "properties", label: "Properties & Houses", icon: Building2 },
            { id: "land", label: "Land", icon: Landmark },
            { id: "customers", label: "Customers", icon: Users },
            { id: "employees", label: "Employees", icon: UserCog },
            { id: "vendors", label: "Vendors", icon: Truck },
            { id: "amenities", label: "Amenities", icon: Award },
          ] as { id: Tab; label: string; icon: React.ElementType }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              tab === t.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>
      {tab === "properties" && <PropertiesTab />}
      {tab === "land" && <LandTab />}
      {tab === "customers" && <CustomersTab />}
      {tab === "employees" && <EmployeesTab />}
      {tab === "vendors" && <VendorsTab />}
      {tab === "amenities" && <AmenitiesTab />}
    </div>
  );
}

function PropertiesTab() {
  const [inventory, setInventory] = useApiData<InventoryPayload>("/api/inventory");
  const [form, setForm] = useState({
    code: "",
    name: "",
    projectType: "residential",
    location: "",
    towerCode: "",
    towerName: "",
  });
  const [units, setUnits] = useState<UnitRow[]>([emptyUnitRow(), emptyUnitRow()]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const setUnit = (i: number, patch: Partial<UnitRow>) =>
    setUnits((cur) => cur.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiSend<{ projectCode: string; units: number }>("/api/setup/projects", {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          projectType: form.projectType,
          location: form.location,
          towers: [
            {
              code: form.towerCode,
              name: form.towerName,
              units: units.map((u) => ({
                unitNo: u.unitNo,
                unitType: u.unitType,
                floor: Number(u.floor) || 1,
                blockCode: u.blockCode || undefined,
                facing: u.facing || undefined,
                furnishing: u.furnishing || undefined,
                features: splitCsv(u.features),
                planImageUrl: u.planImageUrl || undefined,
                sqft: u.sqft ? Number(u.sqft) : undefined,
                price: u.price ? Number(u.price) : undefined,
                status: "available",
              })),
            },
          ],
        }),
      });
      setNotice({ tone: "success", text: `Project "${res.projectCode}" created with ${res.units} unit(s).` });
      setForm({ code: "", name: "", projectType: "residential", location: "", towerCode: "", towerName: "" });
      setUnits([emptyUnitRow(), emptyUnitRow()]);
      apiGet<InventoryPayload>("/api/inventory").then(setInventory);
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Project creation failed." });
    } finally {
      setBusy(false);
    }
  };

  const valid = form.code.trim() && form.name.trim() && form.towerCode.trim() && units.some((u) => u.unitNo.trim());

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Add a property</h2>
            <p className="text-xs text-text-muted">Project + tower + unit configurations · independent houses included</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code (slug)" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="AURELIA" />
            <Select
              label="Project type"
              value={form.projectType}
              onChange={(v) => setForm({ ...form, projectType: v })}
              options={PROJECT_TYPES.map((t) => ({ value: t, label: t.replace("_", " ") }))}
            />
          </div>
          <Input label="Project name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Aurelia Residences" />
          <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="HSR Layout, Bengaluru" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tower / Row code" value={form.towerCode} onChange={(v) => setForm({ ...form, towerCode: v })} placeholder="T1" />
            <Input label="Tower / Row name" value={form.towerName} onChange={(v) => setForm({ ...form, towerName: v })} placeholder="Tower 1 · Skyline" />
          </div>

          <div className="rounded-md border border-border">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-medium text-text-muted">Units / Houses</span>
              <Button size="sm" variant="secondary" type="button" onClick={() => setUnits((cur) => [...cur, emptyUnitRow()])}>
                <Plus size={13} />
                Add unit
              </Button>
            </div>
            <div className="space-y-3 p-3">
              {units.map((u, i) => (
                <div key={i} className="rounded-md border border-border bg-surface p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">Unit {i + 1}</span>
                    {units.length > 1 && (
                      <IconTrash onClick={() => setUnits((cur) => cur.filter((_, idx) => idx !== i))} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Unit no" value={u.unitNo} onChange={(v) => setUnit(i, { unitNo: v })} placeholder="A" />
                    <Select
                      label="Type"
                      value={u.unitType}
                      onChange={(v) => setUnit(i, { unitType: v })}
                      options={UNIT_TYPES.map((t) => ({ value: t, label: t === "independent_house" ? "Independent House" : t }))}
                    />
                    <Input label="Floor" value={u.floor} onChange={(v) => setUnit(i, { floor: v })} placeholder="1" />
                    <Input label="Block (optional)" value={u.blockCode} onChange={(v) => setUnit(i, { blockCode: v })} placeholder="01" />
                    <Select
                      label="Facing"
                      value={u.facing}
                      onChange={(v) => setUnit(i, { facing: v })}
                      options={FACINGS.map((f) => ({ value: f, label: f }))}
                    />
                    <Select
                      label="Furnishing"
                      value={u.furnishing}
                      onChange={(v) => setUnit(i, { furnishing: v })}
                      options={FURNISHING.map((f) => ({ value: f, label: f.replace("_", " ") }))}
                    />
                    <Input label="Area (sqft)" value={u.sqft} onChange={(v) => setUnit(i, { sqft: v })} placeholder="1650" type="number" />
                    <Input label="Price (₹)" value={u.price} onChange={(v) => setUnit(i, { price: v })} placeholder="13200000" type="number" />
                    <div className="col-span-2">
                      <Input label="Features (comma separated)" value={u.features} onChange={(v) => setUnit(i, { features: v })} placeholder="24x7 Security, Power Backup" />
                    </div>
                    <div className="col-span-2">
                      <Input label="Floor plan image URL" value={u.planImageUrl} onChange={(v) => setUnit(i, { planImageUrl: v })} placeholder="/floorplans/3bhk.svg or https://…" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={busy || !valid} className="w-full">
            {busy ? "Creating…" : "Create property"}
            {!busy && <Sparkles size={14} />}
          </Button>
          <p className="text-[11px] leading-relaxed text-text-subtle">
            Pick <b>Independent House</b> as the unit type to add stand-alone houses (floor 1, one house per block). Facing, furnishing and
            features become visible on the inventory heat map and the customer portal.
          </p>
        </form>
      </Card>

      <div className="space-y-6 lg:col-span-3">
        {notice && <Notice tone={notice.tone} text={notice.text} />}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Projects & Houses</h2>
              <p className="text-xs text-text-muted">Apartment towers and independent-house rows on your workspace</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => apiGet<InventoryPayload>("/api/inventory").then(setInventory)}>
              <RefreshCw size={13} />
              Refresh
            </Button>
          </div>
          {!inventory ? (
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : inventory.projects.length === 0 ? (
            <EmptyState icon={<Building2 size={22} />} title="No projects yet" hint="Create the first property to see it here." />
          ) : (
            <ul className="divide-y divide-border">
              {inventory.projects.map((p) => {
                const allUnits = p.towers.flatMap((t) => t.units);
                const houses = allUnits.filter((u) => u.type === "independent_house").length;
                return (
                  <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                      {p.code.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-text">{p.name}</p>
                        {houses > 0 && <Badge tone="info">Independent houses</Badge>}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {p.code} · {p.location} · {p.towers.length} tower(s)
                      </p>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      <span className="text-sm font-medium text-text tabular-nums">{allUnits.length} units</span>
                      <span className="text-[11px] text-text-subtle">
                        {allUnits.filter((u) => u.status === "available").length} available
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function IconTrash({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded p-1 text-text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
      aria-label="Remove"
    >
      <Trash2 size={14} />
    </button>
  );
}

function LandTab() {
  const [land] = useApiData<LandPayload>("/api/land");
  const [form, setForm] = useState({
    code: "",
    name: "",
    village: "",
    district: "",
    surveyNo: "",
    acres: "",
    guntas: "",
    ratePerAcre: "",
    zoning: "NA_Residential",
    seller: "",
    facing: "East",
    provisions: "",
    layoutName: "",
  });
  const [plots, setPlots] = useState<PlotRow[]>([emptyPlotRow()]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const setPlot = (i: number, patch: Partial<PlotRow>) =>
    setPlots((cur) => cur.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiSend<{ parcelCode: string; plots: number }>("/api/setup/land", {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          village: form.village || undefined,
          district: form.district || undefined,
          surveyNo: form.surveyNo || undefined,
          acres: Number(form.acres),
          guntas: form.guntas ? Number(form.guntas) : 0,
          ratePerAcre: Number(form.ratePerAcre),
          zoning: form.zoning,
          seller: form.seller || undefined,
          facing: form.facing || undefined,
          provisions: splitCsv(form.provisions),
          layouts: form.layoutName.trim()
            ? [
                {
                  name: form.layoutName,
                  plots: plots
                    .filter((p) => p.plotNo.trim())
                    .map((p) => ({
                      plotNo: p.plotNo,
                      zone: p.zone,
                      areaSqft: Number(p.sqft),
                      price: Number(p.price),
                      facing: p.facing || undefined,
                      features: splitCsv(p.features),
                    })),
                },
              ]
            : undefined,
        }),
      });
      setNotice({ tone: "success", text: `Parcel "${res.parcelCode}" created with ${res.plots} plot(s).` });
      setForm({ code: "", name: "", village: "", district: "", surveyNo: "", acres: "", guntas: "", ratePerAcre: "", zoning: "NA_Residential", seller: "", facing: "East", provisions: "", layoutName: "" });
      setPlots([emptyPlotRow()]);
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Parcel creation failed." });
    } finally {
      setBusy(false);
    }
  };

  const valid = form.code.trim() && form.name.trim() && form.acres && form.ratePerAcre;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Add land</h2>
            <p className="text-xs text-text-muted">Parcel details + optional plotted layout</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="LP-HSR-07" />
            <Input label="Survey no" value={form.surveyNo} onChange={(v) => setForm({ ...form, surveyNo: v })} placeholder="34/2A" />
          </div>
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="HSR Greenfield Parcel" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Village" value={form.village} onChange={(v) => setForm({ ...form, village: v })} placeholder="HSR Layout" />
            <Input label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} placeholder="Bengaluru Urban" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Acres" value={form.acres} onChange={(v) => setForm({ ...form, acres: v })} placeholder="3.2" type="number" />
            <Input label="Guntas" value={form.guntas} onChange={(v) => setForm({ ...form, guntas: v })} placeholder="0" type="number" />
            <Input label="Rate / acre (₹)" value={form.ratePerAcre} onChange={(v) => setForm({ ...form, ratePerAcre: v })} placeholder="30000000" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Zoning"
              value={form.zoning}
              onChange={(v) => setForm({ ...form, zoning: v })}
              options={["NA_Residential", "Mixed_Use", "Agricultural", "Industrial", "Commercial"].map((z) => ({ value: z, label: z.replace("_", " ") }))}
            />
            <Select
              label="Facing"
              value={form.facing}
              onChange={(v) => setForm({ ...form, facing: v })}
              options={FACINGS.map((f) => ({ value: f, label: f }))}
            />
          </div>
          <Input label="Seller" value={form.seller} onChange={(v) => setForm({ ...form, seller: v })} placeholder="S. Kumar & Family" />
          <Input label="Provisions (comma separated)" value={form.provisions} onChange={(v) => setForm({ ...form, provisions: v })} placeholder="4 Side Approach, Power Line" />

          <Input label="Layout name (optional)" value={form.layoutName} onChange={(v) => setForm({ ...form, layoutName: v })} placeholder="Sunrise Layout · Sector 2" />
          {form.layoutName.trim() && (
            <div className="rounded-md border border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-text-muted">Plots</span>
                <Button size="sm" variant="secondary" type="button" onClick={() => setPlots((cur) => [...cur, emptyPlotRow()])}>
                  <Plus size={13} />
                  Add plot
                </Button>
              </div>
              <div className="space-y-3 p-3">
                {plots.map((p, i) => (
                  <div key={i} className="rounded-md border border-border bg-surface p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">Plot {i + 1}</span>
                      {plots.length > 1 && <IconTrash onClick={() => setPlots((cur) => cur.filter((_, idx) => idx !== i))} />}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Plot no" value={p.plotNo} onChange={(v) => setPlot(i, { plotNo: v })} placeholder="01" />
                      <Select
                        label="Zone"
                        value={p.zone}
                        onChange={(v) => setPlot(i, { zone: v })}
                        options={PLOT_ZONES.map((z) => ({ value: z, label: z }))}
                      />
                      <Input label="Area (sqft)" value={p.sqft} onChange={(v) => setPlot(i, { sqft: v })} placeholder="1500" type="number" />
                      <Input label="Price (₹)" value={p.price} onChange={(v) => setPlot(i, { price: v })} placeholder="1950000" type="number" />
                      <Select
                        label="Facing"
                        value={p.facing}
                        onChange={(v) => setPlot(i, { facing: v })}
                        options={FACINGS.map((f) => ({ value: f, label: f }))}
                      />
                      <Input label="Features (comma separated)" value={p.features} onChange={(v) => setPlot(i, { features: v })} placeholder="Corner Plot" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={busy || !valid} className="w-full">
            {busy ? "Creating…" : "Create land parcel"}
            {!busy && <Sparkles size={14} />}
          </Button>
        </form>
      </Card>

      <div className="space-y-6 lg:col-span-3">
        {notice && <Notice tone={notice.tone} text={notice.text} />}
        <Card>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-text">Land portfolio</h2>
            <p className="text-xs text-text-muted">Parcels with facing, provisions and plot layouts</p>
          </div>
          {!land ? (
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : land.parcels.length === 0 ? (
            <EmptyState icon={<Landmark size={22} />} title="No parcels yet" hint="Register the first parcel to see it here." />
          ) : (
            <ul className="divide-y divide-border">
              {land.parcels.map((p) => (
                <li key={p.id} className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                      {p.code.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-text">{p.name}</p>
                        <Badge tone={p.status === "available" ? "success" : p.status === "hold" ? "warning" : "info"}>{p.status}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {p.code} · {p.village}, {p.district} · {formatAcres(p.acres, p.guntas)}
                      </p>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      <span className="text-sm font-medium text-text tabular-nums">{inrCompact(p.ratePerAcre)}/ac</span>
                      <span className="text-[11px] text-text-subtle">{p.facing ?? "—"} facing</span>
                    </div>
                  </div>
                  {(p.provisions?.length || p.highlight) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-14">
                      {p.provisions?.map((prov) => (
                        <span key={prov} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted">
                          {prov}
                        </span>
                      ))}
                      {p.highlight && <span className="text-[11px] text-text-subtle">{p.highlight}</span>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useApiData<SetupCustomer[]>("/api/setup/customers");
  const [form, setForm] = useState({ name: "", phone: "", email: "", pan: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiSend<SetupCustomer>("/api/setup/customers", {
        method: "POST",
        body: JSON.stringify({ name: form.name, phone: form.phone || undefined, email: form.email || undefined, pan: form.pan || undefined }),
      });
      setNotice({ tone: "success", text: `Customer "${res.name}" registered (KYC ${res.kycStatus}).` });
      setForm({ name: "", phone: "", email: "", pan: "" });
      apiGet<SetupCustomer[]>("/api/setup/customers").then(setCustomers);
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Customer registration failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Register a customer</h2>
            <p className="text-xs text-text-muted">Leads with KYC can be converted into customers</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <Input label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ravi Menon" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98xxxxxx" />
            <Input label="PAN" value={form.pan} onChange={(v) => setForm({ ...form, pan: v })} placeholder="ABCDE1234F" />
          </div>
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="ravi@example.in" />
          <Button type="submit" disabled={busy || !form.name.trim()} className="w-full">
            {busy ? "Saving…" : "Register customer"}
            {!busy && <Sparkles size={14} />}
          </Button>
          <p className="text-[11px] leading-relaxed text-text-subtle">
            Customers are created with <b>pending</b> KYC; they complete verification in the customer portal.
          </p>
        </form>
      </Card>

      <div className="space-y-6 lg:col-span-3">
        {notice && <Notice tone={notice.tone} text={notice.text} />}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Customers</h2>
              <p className="text-xs text-text-muted">Registered buyers, tenants and owners</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => apiGet<SetupCustomer[]>("/api/setup/customers").then(setCustomers)}>
              <RefreshCw size={13} />
              Refresh
            </Button>
          </div>
          {!customers ? (
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState icon={<Users size={22} />} title="No customers yet" hint="Register the first customer to see them here." />
          ) : (
            <ul className="divide-y divide-border">
              {customers.map((c) => (
                <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{c.name}</p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">{c.phone || "—"} {c.email && `· ${c.email}`}</p>
                  </div>
                  <Badge tone={c.kycStatus === "verified" ? "success" : c.kycStatus === "pending" ? "warning" : "muted"}>{c.kycStatus}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function EmployeesTab() {
  const [employees, setEmployees] = useApiData<SetupEmployee[]>("/api/setup/employees");
  const [form, setForm] = useState({ employeeCode: "", name: "", designation: "", department: "", employeeType: "full_time", joiningDate: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiSend<SetupEmployee>("/api/setup/employees", {
        method: "POST",
        body: JSON.stringify({
          employeeCode: form.employeeCode || undefined,
          name: form.name,
          designation: form.designation || undefined,
          department: form.department || undefined,
          employeeType: form.employeeType,
          joiningDate: form.joiningDate || undefined,
        }),
      });
      setNotice({ tone: "success", text: `Employee "${res.name}" onboarded (${res.employeeCode}).` });
      setForm({ employeeCode: "", name: "", designation: "", department: "", employeeType: "full_time", joiningDate: "" });
      apiGet<SetupEmployee[]>("/api/setup/employees").then(setEmployees);
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Employee creation failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Add an employee</h2>
            <p className="text-xs text-text-muted">Team members, consultants and contractors on payroll</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <Input label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Divya Krishnan" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Employee code" value={form.employeeCode} onChange={(v) => setForm({ ...form, employeeCode: v })} placeholder="EMP-0112" hint="Auto-generated if blank" />
            <Input label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} placeholder="Sales Executive" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Sales" hint="Created if new" />
            <Select
              label="Employee type"
              value={form.employeeType}
              onChange={(v) => setForm({ ...form, employeeType: v })}
              options={["full_time", "contract", "consultant"].map((t) => ({ value: t, label: t.replace("_", " ") }))}
            />
          </div>
          <Input label="Joining date" value={form.joiningDate} onChange={(v) => setForm({ ...form, joiningDate: v })} type="date" />
          <Button type="submit" disabled={busy || !form.name.trim()} className="w-full">
            {busy ? "Saving…" : "Add employee"}
            {!busy && <Sparkles size={14} />}
          </Button>
        </form>
      </Card>

      <div className="space-y-6 lg:col-span-3">
        {notice && <Notice tone={notice.tone} text={notice.text} />}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Employees</h2>
              <p className="text-xs text-text-muted">Full-time, contract and consultant headcount</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => apiGet<SetupEmployee[]>("/api/setup/employees").then(setEmployees)}>
              <RefreshCw size={13} />
              Refresh
            </Button>
          </div>
          {!employees ? (
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : employees.length === 0 ? (
            <EmptyState icon={<UserCog size={22} />} title="No employees yet" hint="Add the first team member to see them here." />
          ) : (
            <ul className="divide-y divide-border">
              {employees.map((emp) => (
                <li key={emp.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                    {emp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{emp.name}</p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {emp.employeeCode} · {emp.designation} · {emp.department}
                    </p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    <Badge tone={emp.status === "active" ? "success" : "muted"}>{emp.status}</Badge>
                    <span className="text-[11px] text-text-subtle">{emp.joiningDate ? formatDate(emp.joiningDate) : "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

interface SetupVendor {
  id: string;
  vendorCode: string;
  name: string;
  category: string;
  gstin: string;
  pan: string;
  city: string;
  status: string;
  primaryContact: string;
  contacts: number;
}

interface SetupAmenity {
  id: string;
  code: string;
  name: string;
}

const VENDOR_STATUS = ["pending", "verified", "blacklisted", "inactive"];
const VENDOR_CATEGORIES = ["construction", "mep", "furniture", "legal", "consulting", "security", "landscaping", "other"];

function VendorsTab() {
  const [vendors, setVendors] = useApiData<SetupVendor[]>("/api/setup/vendors");
  const [form, setForm] = useState({
    vendorCode: "",
    name: "",
    category: "construction",
    gstin: "",
    pan: "",
    city: "",
    status: "pending",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiSend<SetupVendor>("/api/setup/vendors", {
        method: "POST",
        body: JSON.stringify({
          vendorCode: form.vendorCode || undefined,
          name: form.name,
          category: form.category,
          gstin: form.gstin || undefined,
          pan: form.pan || undefined,
          city: form.city || undefined,
          status: form.status,
          contacts: form.contactName.trim()
            ? [{ name: form.contactName, phone: form.contactPhone || undefined, email: form.contactEmail || undefined, isPrimary: true }]
            : [],
        }),
      });
      setNotice({ tone: "success", text: `Vendor "${res.name}" onboarded (${res.vendorCode}, ${res.status}).` });
      setForm({ vendorCode: "", name: "", category: "construction", gstin: "", pan: "", city: "", status: "pending", contactName: "", contactPhone: "", contactEmail: "" });
      apiGet<SetupVendor[]>("/api/setup/vendors").then(setVendors);
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Vendor creation failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Add a vendor / supplier</h2>
            <p className="text-xs text-text-muted">Used across RFQs, purchase orders and GRNs</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <Input label="Vendor name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="ConcreteWorks India" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Vendor code" value={form.vendorCode} onChange={(v) => setForm({ ...form, vendorCode: v })} placeholder="V-0012" hint="Auto-generated if blank" />
            <Select
              label="Category"
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={VENDOR_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="GSTIN" value={form.gstin} onChange={(v) => setForm({ ...form, gstin: v })} placeholder="29ABCDE1234F1Z5" />
            <Input label="PAN" value={form.pan} onChange={(v) => setForm({ ...form, pan: v })} placeholder="ABCDE1234F" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Bengaluru" />
            <Select
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={VENDOR_STATUS.map((s) => ({ value: s, label: s }))}
            />
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-subtle">Primary contact (optional)</p>
            <div className="space-y-3">
              <Input label="Contact name" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} placeholder="Ramesh Iyer" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} placeholder="+91 98xxxxxx" />
                <Input label="Email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} placeholder="ramesh@cnci.in" />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={busy || !form.name.trim()} className="w-full">
            {busy ? "Saving…" : "Add vendor"}
            {!busy && <Sparkles size={14} />}
          </Button>
        </form>
      </Card>

      <div className="space-y-6 lg:col-span-3">
        {notice && <Notice tone={notice.tone} text={notice.text} />}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Vendors</h2>
              <p className="text-xs text-text-muted">Verified suppliers and service partners</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => apiGet<SetupVendor[]>("/api/setup/vendors").then(setVendors)}>
              <RefreshCw size={13} />
              Refresh
            </Button>
          </div>
          {!vendors ? (
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : vendors.length === 0 ? (
            <EmptyState icon={<Truck size={22} />} title="No vendors yet" hint="Add the first vendor or supplier to see them here." />
          ) : (
            <ul className="divide-y divide-border">
              {vendors.map((v) => (
                <li key={v.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                    {v.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{v.name}</p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {v.vendorCode} · {v.category} · {v.city} {v.gstin !== "—" && `· ${v.gstin}`}
                    </p>
                    {v.primaryContact !== "—" && <p className="mt-0.5 truncate text-[11px] text-text-subtle">Contact: {v.primaryContact}</p>}
                  </div>
                  <Badge tone={v.status === "verified" ? "success" : v.status === "pending" ? "warning" : v.status === "inactive" ? "muted" : "danger"}>{v.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function AmenitiesTab() {
  const [amenities, setAmenities] = useApiData<SetupAmenity[]>("/api/setup/amenities");
  const [form, setForm] = useState({ code: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await apiSend<SetupAmenity>("/api/setup/amenities", {
        method: "POST",
        body: JSON.stringify({ code: form.code, name: form.name }),
      });
      setNotice({ tone: "success", text: `Amenity "${res.name}" saved (${res.code}).` });
      setForm({ code: "", name: "" });
      apiGet<SetupAmenity[]>("/api/setup/amenities").then(setAmenities);
    } catch (err) {
      setNotice({ tone: "danger", text: err instanceof Error ? err.message : "Amenity creation failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Plus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Add an amenity</h2>
            <p className="text-xs text-text-muted">Clubhouse, pool, gym and other community offerings</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="POOL" hint="Uppercased, spaces become _"/>
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Swimming Pool" />
          </div>
          <Button type="submit" disabled={busy || !form.code.trim() || !form.name.trim()} className="w-full">
            {busy ? "Saving…" : "Add amenity"}
            {!busy && <Sparkles size={14} />}
          </Button>
        </form>
      </Card>

      <div className="space-y-6 lg:col-span-3">
        {notice && <Notice tone={notice.tone} text={notice.text} />}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Amenities</h2>
              <p className="text-xs text-text-muted">Catalog attached to units and shown in the customer portal</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => apiGet<SetupAmenity[]>("/api/setup/amenities").then(setAmenities)}>
              <RefreshCw size={13} />
              Refresh
            </Button>
          </div>
          {!amenities ? (
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : amenities.length === 0 ? (
            <EmptyState icon={<Award size={22} />} title="No amenities yet" hint="Add the first amenity to see them here." />
          ) : (
            <ul className="divide-y divide-border">
              {amenities.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-primary">
                    {a.code.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{a.name}</p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">{a.code}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
