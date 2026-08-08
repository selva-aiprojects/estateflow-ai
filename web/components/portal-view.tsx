"use client";

import { useState } from "react";
import {
  Home,
  CalendarDays,
  FileText,
  Camera,
  Download,
  ShieldCheck,
  PhoneCall,
  Bell,
  Building2,
  CircleParking,
  Plug,
  Waves,
  Dumbbell,
  Trees,
  Baby,
  Footprints,
  Trophy,
  BatteryCharging,
  MoveVertical,
  Flame,
  Droplets,
  Recycle,
  Headset,
  KeyRound,
  Gift,
  Copy,
  Check,
  Share2,
  ArrowUpRight,
  X,
  Plus,
  ReceiptText,
  Banknote,
  CalendarClock,
  Clock,
  ClipboardCheck,
  Play,
  PartyPopper,
  Sparkles,
  MessagesSquare,
  Calculator,
  TrendingUp,
  Languages,
  Send,
  Tag,
  Star,
  Loader2,
} from "lucide-react";
import { inr } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  IconButton,
  Input,
  ProgressBar,
  Select,
  Spinner,
  type Tone,
} from "@/components/ui";
import { useApiData, apiGet, apiSend } from "@/lib/api-client";
import { PageSkeleton } from "@/components/loading";
import type {
  Milestone,
  UnitAmenity,
  AmenityKind,
  PortalUpdate,
  PortalTicket,
  PortalPossessionStep,
  PortalSnag,
  PortalReferralProgram,
  PortalReferral,
  PortalPhoto,
  PortalEvent,
  PortalLoanPartner,
  PortalWarrantyDoc,
  PortalResaleListing,
  PortalLoyalty,
  PortalKyc,
  PortalTaxSummary,
  PortalChatMessage,
} from "@/lib/data";

type Instalment = { id: string; name: string; due: string; amount: number; paid: boolean; paidOn: string };
type Receipt = { no: string; date: string; desc: string; amount: number; mode: string };

interface PortalPayload {
  milestones: Milestone[];
  unit: { no: string; project: string; type: string; sqft: number; floor: string; price: number; facing?: string; furnishing?: string; features?: string[]; planImageUrl?: string };
  instalments: Instalment[];
  docs: { name: string; tag: string }[];
  amenities: UnitAmenity[];
  ledger: { total: number; paid: number; due: number; paidPct: number; receipts: Receipt[] };
  updates: PortalUpdate[];
  tickets: PortalTicket[];
  possession: { steps: PortalPossessionStep[]; snags: PortalSnag[]; possessionDate: string; signed: string[] };
  referrals: PortalReferralProgram;
  photos: PortalPhoto[];
  tax: PortalTaxSummary;
  loanPartners: PortalLoanPartner[];
  events: PortalEvent[];
  warranty: PortalWarrantyDoc[];
  loyalty: PortalLoyalty;
  kyc: PortalKyc;
  listings: PortalResaleListing[];
  chat: PortalChatMessage[];
}

const amenityIcon: Record<AmenityKind, React.ElementType> = {
  parking: CircleParking,
  charging: Plug,
  clubhouse: Building2,
  pool: Waves,
  gym: Dumbbell,
  garden: Trees,
  play: Baby,
  jogging: Footprints,
  sports: Trophy,
  security: ShieldCheck,
  backup: BatteryCharging,
  lifts: MoveVertical,
  fire: Flame,
  water: Droplets,
  stp: Recycle,
  concierge: Headset,
};

const prioTone: Record<PortalTicket["priority"], Tone> = { low: "muted", medium: "info", high: "warning", urgent: "danger" };
const statusTone: Record<PortalTicket["status"], Tone> = { open: "info", assigned: "primary", in_progress: "primary", on_hold: "warning", resolved: "success", closed: "muted" };
const statusLabel: Record<PortalTicket["status"], string> = { open: "Open", assigned: "Assigned", in_progress: "In progress", on_hold: "On hold", resolved: "Resolved", closed: "Closed" };
const snagTone: Record<PortalSnag["status"], Tone> = { open: "warning", in_progress: "info", resolved: "success" };
const refTone: Record<PortalReferral["status"], Tone> = { visited: "info", booked: "primary", converted: "success" };
const refLabel: Record<PortalReferral["status"], string> = { visited: "Site visit", booked: "Booked", converted: "Converted" };
const eventTone: Record<PortalEvent["type"], Tone> = { homeowner_meet: "primary", site_walkthrough: "info", webinar: "success", festival: "warning", community: "muted" };
const tierTone: Record<PortalLoyalty["tier"], Tone> = { member: "muted", silver: "info", gold: "warning", platinum: "primary" };
const warrantyTone: Record<PortalWarrantyDoc["status"], Tone> = { draft: "warning", signed: "info", executed: "success", cancelled: "muted" };

const LANGUAGES = [
  { code: "en", label: "English", greeting: "Welcome back" },
  { code: "hi", label: "हिन्दी", greeting: "आपका स्वागत है" },
  { code: "kn", label: "ಕನ್ನಡ", greeting: "ಮರಳಿ ಸ್ವಾಗತ" },
  { code: "ta", label: "தமிழ்", greeting: "மீண்டும் வரவேற்கிறோம்" },
];

const CATEGORIES = ["Plumbing", "Electrical", "Snagging", "Appliances", "Interiors", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const HOW_IT_WORKS = [
  "Share your code with friends and family",
  "They book a home at Elevate Residences",
  `${inr(50000, 0)} is credited to your account`,
];

const fmtDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${m[3]} ${months[Number(m[2]) - 1]} ${m[1]}`;
};

function printHtml(title: string, body: string) {
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return;
  const styles = `body{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1c1f26;padding:48px;max-width:720px;margin:0 auto;}
    .brand{font-size:22px;font-weight:800;color:#0f766e;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    th,td{padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;}
    th{background:#f3f5f8;color:#6b7280;font-weight:600;text-transform:uppercase;font-size:11px;}
    .muted{color:#6b7280;font-size:12px;}
    .amt{font-variant-numeric:tabular-nums;}`;
  win.document.write(
    `<!doctype html><html><head><title>${title}</title><style>${styles}</style></head><body>${body}</body></html>`,
  );
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}

function demandBodyHtml(i: Instalment, unit: PortalPayload["unit"]): string {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f766e;padding-bottom:16px;margin-bottom:28px;">
      <div>
        <div class="brand">EstateFlow Developers LLP</div>
        <div class="muted">Elevate Residences · Sarjapur Road, Bengaluru</div>
      </div>
      <div class="muted" style="text-align:right;">
        <div>RERA No. PRM/KA/RERA/1251/446/PR/2026</div>
        <div>PAN: AABCE1234F</div>
      </div>
    </div>
    <div style="margin-bottom:24px;">
      <div class="muted">Demand Letter · DEM-2026-0412 · ${fmtDate(i.due)}</div>
      <h2 style="font-size:18px;margin:6px 0 16px;">Instalment payment request</h2>
      <div class="muted">To,<br/><span style="color:#1c1f26;font-weight:600;">Mr. Rohan Mehta</span><br/>T1-03-A, Elevate Residences, Bengaluru</div>
    </div>
    <p class="muted" style="line-height:1.6;margin-bottom:24px;">
      Dear Mr. Mehta, with reference to your booking <b>BK-2026-001</b> of unit
      <b>${unit.no}</b> at <b>${unit.project}</b>, this is a request for payment of the following instalment
      against your milestone-linked payment schedule.
    </p>
    <table>
      <thead><tr><th>Instalment</th><th>Due date</th><th style="text-align:right;">Amount</th></tr></thead>
      <tbody>
        <tr><td>${i.name}</td><td>${fmtDate(i.due)}</td><td class="amt" style="text-align:right;">₹${Number(i.amount).toLocaleString("en-IN")}</td></tr>
        <tr><td class="muted">Balance payable on your booking</td><td></td><td class="amt" style="text-align:right;">₹${Number(i.amount).toLocaleString("en-IN")}</td></tr>
      </tbody>
    </table>
    <p class="muted" style="margin-top:24px;">
      Payments are held in a RERA-mandated escrow account until the corresponding milestone is
      physically verified. Please quote your booking number while remitting the amount.
    </p>
    <div style="margin-top:40px;" class="muted">For EstateFlow Developers LLP</div>`;
}

function receiptBodyHtml(r: Receipt, unit: PortalPayload["unit"]): string {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f766e;padding-bottom:16px;margin-bottom:28px;">
      <div><div class="brand">EstateFlow Developers LLP</div><div class="muted">Elevate Residences · Sarjapur Road, Bengaluru</div></div>
      <div class="muted" style="text-align:right;">RERA No. PRM/KA/RERA/1251/446/PR/2026</div>
    </div>
    <div style="margin-bottom:24px;">
      <div class="muted">Payment Receipt · ${r.no} · ${fmtDate(r.date)}</div>
      <h2 style="font-size:18px;margin:6px 0 16px;">Acknowledgement of payment</h2>
    </div>
    <table>
      <tbody>
        <tr><td class="muted">Received from</td><td style="font-weight:600;">Rohan Mehta</td></tr>
        <tr><td class="muted">Unit</td><td>${unit.no} · ${unit.project}</td></tr>
        <tr><td class="muted">Towards</td><td>${r.desc}</td></tr>
        <tr><td class="muted">Payment mode</td><td>${r.mode.toUpperCase()}</td></tr>
        <tr><td class="muted">Amount</td><td class="amt" style="font-weight:700;">₹${Number(r.amount).toLocaleString("en-IN")}</td></tr>
      </tbody>
    </table>
    <p class="muted" style="margin-top:24px;">This amount stands credited to the RERA-mandated escrow account of the project.</p>`;
}

export function PortalView() {
  const [portal, setPortal] = useApiData<PortalPayload>("/api/portal");
  const [tab, setTab] = useState<"overview" | "payments" | "docs" | "amenities" | "support" | "possession" | "referrals" | "site" | "loans" | "events">("overview");
  const [demand, setDemand] = useState<Instalment | null>(null);
  const [demandPaid, setDemandPaid] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [tickets, setTickets] = useState<PortalTicket[] | undefined>();
  const [ticketForm, setTicketForm] = useState({ category: "Other", priority: "medium", subject: "", description: "" });
  const [ticketError, setTicketError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [gateway, setGateway] = useState<Instalment | null>(null);
  const [gatewayMode, setGatewayMode] = useState<"upi" | "card">("upi");
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<PortalChatMessage[] | undefined>();
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [lang, setLang] = useState("en");
  const [kycForm, setKycForm] = useState({ pan: "", aadhaarLast4: "" });
  const [kycBusy, setKycBusy] = useState(false);
  const [thread, setThread] = useState<{ id: string; no: string; subject: string; status: string; priority: string; openedAt: string; comments: { body: string; createdAt: string; isInternal: boolean }[] } | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [threadBusy, setThreadBusy] = useState(false);
  const [listingForm, setListingForm] = useState({ listingType: "sale", title: "", description: "", price: "" });
  const [listingBusy, setListingBusy] = useState(false);
  const [listingMsg, setListingMsg] = useState("");
  const [emi, setEmi] = useState({ amount: 12000000, rate: 8.5, years: 20 });
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [signing, setSigning] = useState("");
  const [photoIdx, setPhotoIdx] = useState<number | null>(null);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Home },
    { id: "payments" as const, label: "Payments", icon: CalendarDays },
    { id: "site" as const, label: "Site Updates", icon: Camera },
    { id: "docs" as const, label: "Documents", icon: FileText },
    { id: "amenities" as const, label: "Amenities", icon: Building2 },
    { id: "loans" as const, label: "Home Loans", icon: TrendingUp },
    { id: "events" as const, label: "Events", icon: PartyPopper },
    { id: "support" as const, label: "Support", icon: Headset },
    { id: "possession" as const, label: "Possession", icon: KeyRound },
    { id: "referrals" as const, label: "Rewards", icon: Gift },
  ];

  if (!portal) return <PageSkeleton />;

  const {
    milestones, unit, instalments, docs, amenities, ledger, updates, possession, referrals,
    photos, tax, loanPartners, events, warranty, loyalty, kyc, listings, chat,
  } = portal;
  const nextDue = instalments.find((x) => !x.paid) ?? instalments[instalments.length - 1];
  const ticketList = tickets ?? portal.tickets;
  const doneSteps = possession.steps.filter((s) => s.status === "done").length;
  const chatThread = chatMsgs ?? chat;
  const langMeta = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const refreshPortal = async () => {
    try {
      setPortal(await apiGet<PortalPayload>("/api/portal"));
    } catch {
      /* keep current state */
    }
  };

  const emiMonthly = (() => {
    const p = emi.amount;
    const r = emi.rate / 12 / 100;
    const n = emi.years * 12;
    return p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referrals.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const shareInvite = () => {
    const text = `Hi! I'm buying a home at ${unit.project} with EstateFlow. Use my referral code ${referrals.code} when you book and we both earn ${inr(referrals.reward, 0)}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const printDoc = (d: { name: string; tag: string }) => {
    printHtml(
      d.name,
      `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f766e;padding-bottom:16px;margin-bottom:28px;">
         <div><div class="brand">EstateFlow Developers LLP</div><div class="muted">Elevate Residences · Sarjapur Road, Bengaluru</div></div>
         <div class="muted" style="text-align:right;">RERA No. PRM/KA/RERA/1251/446/PR/2026</div>
       </div>
       <div class="muted">Document · ${d.tag}</div>
       <h2 style="font-size:18px;margin:6px 0 24px;">${d.name}</h2>
       <div class="muted" style="line-height:1.6;">
         This document has been executed through EstateFlow's eSign workflow and is available
         in your portal. A stamped and registered copy is maintained with the project's legal team.
       </div>
       <div style="margin-top:48px;border:1px solid #0f766e;color:#0f766e;display:inline-block;padding:8px 16px;font-size:12px;font-weight:700;border-radius:6px;">
         ✓ eSign verified · EstateFlow Trust
       </div>`,
    );
  };

  const submitTicket = async () => {
    if (!ticketForm.subject.trim()) {
      setTicketError("Please add a short subject.");
      return;
    }
    setSubmitting(true);
    setTicketError("");
    try {
      const created = await apiSend<PortalTicket>("/api/portal/tickets", {
        method: "POST",
        body: JSON.stringify(ticketForm),
      });
      setTickets((prev) => [created, ...(prev ?? portal.tickets)]);
      setTicketForm({ category: "Other", priority: "medium", subject: "", description: "" });
      setShowTicketForm(false);
    } catch {
      setTicketError("Could not raise the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openThread = async (id: string) => {
    setThreadBusy(true);
    try {
      const t = await apiGet<{ id: string; no: string; subject: string; status: string; priority: string; openedAt: string; comments: { body: string; createdAt: string; isInternal: boolean }[] }>(`/api/portal/tickets/${id}`);
      setThread(t);
    } catch {
      setThread(null);
    } finally {
      setThreadBusy(false);
    }
  };

  const sendComment = async () => {
    if (!thread || !commentInput.trim()) return;
    setThreadBusy(true);
    try {
      await apiSend(`/api/portal/tickets/${thread.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: commentInput }),
      });
      setCommentInput("");
      await openThread(thread.id);
    } finally {
      setThreadBusy(false);
    }
  };

  const escalate = async () => {
    if (!thread) return;
    setThreadBusy(true);
    try {
      await apiSend(`/api/portal/tickets/${thread.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "escalate" }),
      });
      await openThread(thread.id);
    } finally {
      setThreadBusy(false);
    }
  };

  const submitKyc = async () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(kycForm.pan.toUpperCase()) || !/^\d{4}$/.test(kycForm.aadhaarLast4)) return;
    setKycBusy(true);
    try {
      await apiSend("/api/portal/kyc", {
        method: "POST",
        body: JSON.stringify({ pan: kycForm.pan, aadhaarLast4: kycForm.aadhaarLast4 }),
      });
      setKycForm({ pan: "", aadhaarLast4: "" });
      await refreshPortal();
    } finally {
      setKycBusy(false);
    }
  };

  const payNow = async () => {
    if (!gateway) return;
    setPaying(true);
    setPayResult(null);
    try {
      const res = await apiSend<{ ok: boolean; message: string }>("/api/portal/pay", {
        method: "POST",
        body: JSON.stringify({ lineId: gateway.id, amount: gateway.amount }),
      });
      setPayResult(res.message);
      await refreshPortal();
    } catch {
      setPayResult("Payment could not be processed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMsgs((prev) => [...(prev ?? chat), { from: "user", text }]);
    setChatInput("");
    setChatBusy(true);
    try {
      const msgs = await apiSend<PortalChatMessage[]>("/api/portal/chat", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setChatMsgs((prev) => [...(prev ?? chat), msgs[1]]);
    } catch {
      setChatMsgs((prev) => [...(prev ?? chat), { from: "ai", text: "Sorry, I couldn't reach the assistant right now. Please try again." }]);
    } finally {
      setChatBusy(false);
    }
  };

  const publishListing = async () => {
    if (!listingForm.title.trim() || !(Number(listingForm.price) > 0)) {
      setListingMsg("Title and a positive price are required.");
      return;
    }
    setListingBusy(true);
    setListingMsg("");
    try {
      const res = await apiSend<{ ok: boolean; message: string }>("/api/portal/listings", {
        method: "POST",
        body: JSON.stringify({
          listingType: listingForm.listingType,
          title: listingForm.title,
          description: listingForm.description,
          price: Number(listingForm.price),
        }),
      });
      setListingMsg(res.message);
      setListingForm({ listingType: "sale", title: "", description: "", price: "" });
      await refreshPortal();
    } finally {
      setListingBusy(false);
    }
  };

  const signStep = async (name: string) => {
    setSigning(name);
    try {
      await apiSend("/api/portal/possession", {
        method: "POST",
        body: JSON.stringify({ step: name }),
      });
      await refreshPortal();
    } finally {
      setSigning("");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar name="Rohan Mehta" size="lg" />
          <div>
            <p className="text-sm font-semibold text-text">{langMeta.greeting}, Rohan</p>
            <p className="text-xs text-text-muted">Owner · {unit.no} · {unit.project}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text">
            <Star size={13} className="text-warning" /> {loyalty.points} pts · {loyalty.tier}
          </span>
          <Badge tone={kyc.status === "verified" ? "success" : "warning"}>
            {kyc.status === "verified" ? "KYC done" : "KYC pending"}
          </Badge>
          <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text">
            <Languages size={13} className="text-text-muted" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language"
              className="cursor-pointer bg-transparent text-xs font-medium text-text outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <Button variant="secondary" size="sm" onClick={() => setTab("support")}>
            <PhoneCall size={14} /> Talk to support
          </Button>
          <div className="relative">
            <Button size="sm" onClick={() => setShowNotifs((v) => !v)} aria-expanded={showNotifs}>
              <Bell size={14} /> Notifications
            </Button>
            {showNotifs && (
              <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-border bg-surface shadow-lift">
                <div className="border-b border-border px-4 py-2.5">
                  <p className="text-xs font-semibold text-text">Latest updates</p>
                </div>
                <div className="divide-y divide-border/60">
                  {updates.slice(0, 3).map((u) => (
                    <button
                      key={`${u.date}-${u.note}`}
                      onClick={() => setShowNotifs(false)}
                      className="block w-full px-4 py-2.5 text-left transition-colors duration-200 hover:bg-surface-muted cursor-pointer"
                    >
                      <p className="text-xs leading-snug text-text">{u.note}</p>
                      <p className="mt-0.5 text-[11px] text-text-subtle">Tower {u.tower} · {fmtDate(u.date)}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setShowNotifs(false); setTab("site"); }}
                  className="block w-full border-t border-border px-4 py-2.5 text-left text-xs font-medium text-primary transition-colors duration-200 hover:bg-surface-muted cursor-pointer"
                >
                  View all updates →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer",
              tab === t.id ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text",
            )}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Your Home" subtitle={unit.no} action={<Badge tone="primary">Booked</Badge>} />
              <div className="flex aspect-[16/7] items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                {unit.planImageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={unit.planImageUrl} alt={`Floor plan for ${unit.no}`} className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <Home size={40} className="text-text-subtle" />
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {[
                  ["Project", unit.project],
                  ["Configuration", `${unit.type.replaceAll("_", " ")} · ${unit.sqft} sq.ft`],
                  ["Location", unit.floor],
                  ["Facing", unit.facing || "—"],
                  ["Furnishing", unit.furnishing ? unit.furnishing.replaceAll("_", " ") : "—"],
                  ["Base Price", inr(unit.price, 0)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-md bg-surface-muted/60 p-3">
                    <p className="text-[11px] text-text-muted">{k}</p>
                    <p className="mt-0.5 text-sm font-medium text-text">{v}</p>
                  </div>
                ))}
              </div>
              {unit.features?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {unit.features.map((f) => (
                    <span key={f} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      {f}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-[11px] text-text-muted">Total consideration</p>
                  <p className="text-lg font-semibold text-text tabular-nums">{inr(unit.price, 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-text-muted">Paid so far</p>
                  <p className="text-lg font-semibold text-success tabular-nums">{inr(ledger.paid, 0)}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader title="Project Progress" subtitle="Elevate Residences · live from site" />
                <div className="space-y-3 px-5 pb-5">
                  {milestones.slice(0, 4).map((m) => (
                    <div key={m.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">{m.name}</span>
                        <span className="font-medium text-text tabular-nums">{m.progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div className={cn("h-full rounded-full", m.status === "completed" ? "bg-success" : m.status === "on_track" ? "bg-primary" : "bg-warning")} style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Camera size={13} /> Latest site photo
                </p>
                {photos.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setTab("site")}
                    className="mt-2 block w-full cursor-pointer text-left"
                  >
                    <img
                      src={photos[0].url}
                      alt={photos[0].caption}
                      loading="lazy"
                      className="aspect-video w-full rounded-lg border border-border object-cover transition-opacity duration-200 hover:opacity-90"
                    />
                    <p className="mt-2 text-[11px] text-text-subtle">{photos[0].caption} · {fmtDate(photos[0].shotOn)}</p>
                  </button>
                ) : (
                  <div className="mt-2 flex aspect-video items-center justify-center rounded-lg bg-surface-muted text-text-subtle">
                    <Home size={26} />
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Next Payment Due"
              subtitle={nextDue.name}
              action={<Button size="sm" onClick={() => setGateway(nextDue)}>Pay online</Button>}
            />
            <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-semibold text-text tabular-nums">{inr(nextDue.amount, 0)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <CalendarDays size={13} /> Due {fmtDate(nextDue.due)} · escrow-protected (RERA)
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-surface-muted/60 px-3 py-2 text-xs text-text-muted">
                <ShieldCheck size={15} className="text-success" />
                Deposits held in RERA-mandated escrow account
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Project Updates"
              subtitle="Latest from site · synced from daily progress reports"
              action={<Badge tone="info">{updates.length} updates</Badge>}
            />
            <div className="space-y-0 px-5 pb-5">
              {updates.slice(0, 4).map((u) => (
                <div key={`${u.date}-${u.note}`} className="flex gap-3 pb-4 last:pb-0">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs leading-relaxed text-text">{u.note}</p>
                    <p className="mt-0.5 text-[11px] text-text-subtle">
                      {fmtDate(u.date)} · Tower {u.tower} · {u.progress}% overall · {u.engineer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === "site" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                <Camera size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Construction Gallery</p>
                <p className="text-xs text-text-muted">Fresh from site · synced from daily progress reports</p>
              </div>
            </div>
            <Badge tone="primary">{photos.length} media items</Badge>
          </div>
          {photos.length === 0 ? (
            <EmptyState icon={<Camera size={22} />} title="No photos yet" hint="Photos from the site will appear here as they are uploaded." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((p, i) => (
                <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                  {p.mediaType === "video" ? (
                    <video
                      src={p.url}
                      className="aspect-video w-full bg-surface-muted object-cover"
                      controls
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPhotoIdx(i)}
                      className="group relative block w-full cursor-pointer"
                    >
                      <img
                        src={p.url}
                        alt={p.caption}
                        loading="lazy"
                        className="aspect-video w-full bg-surface-muted object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute bottom-3 right-3 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-text opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        View larger
                      </div>
                    </button>
                  )}
                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="text-xs font-medium text-text">{p.caption}</p>
                    <p className="shrink-0 text-[11px] text-text-subtle tabular-nums">{fmtDate(p.shotOn)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "payments" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-[11px] text-text-muted">Total payable</p>
              <p className="mt-1 text-xl font-semibold text-text tabular-nums">{inr(ledger.total, 0)}</p>
              <p className="mt-1 text-[11px] text-text-subtle">As per payment schedule</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] text-text-muted">Paid till date</p>
              <p className="mt-1 text-xl font-semibold text-success tabular-nums">{inr(ledger.paid, 0)}</p>
              <div className="mt-2">
                <ProgressBar value={ledger.paidPct} tone="success" />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] text-text-muted">Balance due</p>
              <p className="mt-1 text-xl font-semibold text-warning tabular-nums">{inr(ledger.due, 0)}</p>
              <p className="mt-1 text-[11px] text-text-subtle">Next: {nextDue.name}</p>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Tax Statement"
              subtitle="GST / TDS breakup across your invoices"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    printHtml(
                      "GST Statement · INV-2026-101",
                      `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f766e;padding-bottom:16px;margin-bottom:28px;">
                         <div><div class="brand">EstateFlow Developers LLP</div><div class="muted">Elevate Residences · Sarjapur Road, Bengaluru</div></div>
                         <div class="muted" style="text-align:right;">GSTIN: 29ABCDE1234F1Z5<br/>RERA No. PRM/KA/RERA/1251/446/PR/2026</div>
                       </div>
                       <div class="muted">Tax statement · INV-2026-101 · Rohan Mehta · ${unit.no}</div>
                       <h2 style="font-size:18px;margin:6px 0 24px;">GST / TDS summary</h2>
                       <table>
                         <tbody>
                           <tr><td class="muted">Taxable base amount</td><td class="amt" style="text-align:right;font-weight:600;">₹${Number(tax.baseAmount).toLocaleString("en-IN")}</td></tr>
                           <tr><td class="muted">CGST (9%)</td><td class="amt" style="text-align:right;">₹${Number(tax.cgst).toLocaleString("en-IN")}</td></tr>
                           <tr><td class="muted">SGST (9%)</td><td class="amt" style="text-align:right;">₹${Number(tax.sgst).toLocaleString("en-IN")}</td></tr>
                           <tr><td class="muted">IGST</td><td class="amt" style="text-align:right;">₹${Number(tax.igst).toLocaleString("en-IN")}</td></tr>
                           <tr><td class="muted">TDS deducted (on sale value)</td><td class="amt" style="text-align:right;">₹${Number(tax.tds).toLocaleString("en-IN")}</td></tr>
                           <tr><td class="muted">Total invoice value</td><td class="amt" style="text-align:right;font-weight:700;">₹${Number(tax.total).toLocaleString("en-IN")}</td></tr>
                         </tbody>
                       </table>
                       <p class="muted" style="margin-top:24px;">This statement reflects the tax components declared in your invoices issued against booking BK-2026-001.</p>`,
                    )
                  }
                >
                  <Download size={13} /> GST statement
                </Button>
              }
            />
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-5">
              {[
                ["Taxable base", tax.baseAmount],
                ["CGST 9%", tax.cgst],
                ["SGST 9%", tax.sgst],
                ["IGST", tax.igst],
                ["TDS", tax.tds],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-md bg-surface-muted/60 p-3">
                  <p className="text-[11px] text-text-muted">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-text tabular-nums">{inr(Number(v), 0)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Statement of Account" subtitle={`Receipts against your booking · ${unit.no}`} />
            {ledger.receipts.length === 0 ? (
              <EmptyState icon={<ReceiptText size={22} />} title="No receipts yet" hint="Payments will appear here as they are posted." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/50 text-left">
                      {["Receipt no.", "Description", "Date", "Mode", "Amount", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.receipts.map((r) => (
                      <tr key={r.no} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium text-text">{r.no}</td>
                        <td className="px-4 py-3 text-text-muted">{r.desc}</td>
                        <td className="px-4 py-3 text-text-muted tabular-nums">{fmtDate(r.date)}</td>
                        <td className="px-4 py-3"><Badge tone="info">{r.mode.toUpperCase()}</Badge></td>
                        <td className="px-4 py-3 font-medium text-success tabular-nums">{inr(r.amount, 0)}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" onClick={() => setReceipt(r)}>
                            <Download size={13} /> Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Payment Schedule" subtitle="Milestone-linked instalments per agreement" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50 text-left">
                    {["Instalment", "Due date", "Amount", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instalments.map((i) => (
                    <tr key={i.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">{i.name}</p>
                        {i.paid && <p className="text-[11px] text-text-subtle">Paid {fmtDate(i.paidOn)}</p>}
                      </td>
                      <td className="px-4 py-3 text-text-muted tabular-nums">{fmtDate(i.due)}</td>
                      <td className="px-4 py-3 font-medium text-text tabular-nums">{inr(i.amount, 0)}</td>
                      <td className="px-4 py-3">
                        {i.paid ? (
                          <Badge tone="success">Paid</Badge>
                        ) : i.id === nextDue.id ? (
                          <Badge tone="warning">Due soon</Badge>
                        ) : (
                          <Badge tone="muted">Scheduled</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!i.paid && (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setDemandPaid(false); setDemand(i); }}>
                              <Download size={13} /> Demand letter
                            </Button>
                            {i.id === nextDue.id && (
                              <Button size="sm" onClick={() => setGateway(i)}>
                                <Banknote size={13} /> Pay online
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "docs" && (
        <Card>
          <CardHeader title="Documents" subtitle="Signed via eSign · copies available for download" />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
            {docs.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-text-muted">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{d.name}</p>
                    <p className="text-xs text-text-subtle">{d.tag}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => printDoc(d)}>
                  <Download size={13} /> PDF
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "amenities" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text">Amenities &amp; Services</p>
              <p className="text-xs text-text-muted">Everything included with {unit.no} · {unit.project}</p>
            </div>
            <Badge tone="primary">{amenities.length} amenities</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {amenities.map((a) => {
              const Icon = amenityIcon[a.kind] ?? Building2;
              return (
                <Card key={a.kind} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text">{a.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{a.detail ?? "Included with your home"}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab === "loans" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Home Loan &amp; Services</p>
                <p className="text-xs text-text-muted">Verified partners · pre-approved for this project</p>
              </div>
            </div>
            <Badge tone="primary">{loanPartners.length} partners</Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Card>
                <CardHeader title="EMI Calculator" subtitle="Estimate your monthly payment for this home" />
                <div className="grid grid-cols-1 gap-4 px-5 pb-4 sm:grid-cols-3">
                  <Input
                    label="Loan amount (₹)"
                    value={String(emi.amount)}
                    onChange={(v) => setEmi((e) => ({ ...e, amount: Number(v) || 0 }))}
                    placeholder="12000000"
                  />
                  <Input
                    label="Rate (% p.a.)"
                    value={String(emi.rate)}
                    onChange={(v) => setEmi((e) => ({ ...e, rate: Number(v) || 0 }))}
                    placeholder="8.5"
                  />
                  <Input
                    label="Tenure (years)"
                    value={String(emi.years)}
                    onChange={(v) => setEmi((e) => ({ ...e, years: Number(v) || 0 }))}
                    placeholder="20"
                  />
                </div>
                <div className="mx-5 mb-5 flex flex-col gap-3 rounded-md border border-primary/20 bg-primary-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] text-text-muted">Estimated monthly EMI</p>
                    <p className="text-2xl font-semibold text-primary tabular-nums">
                      {Number.isFinite(emiMonthly) ? inr(Math.round(emiMonthly), 0) : "—"}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">
                    For a {inr(emi.amount, 0)} loan at {emi.rate}% for {emi.years} yrs
                  </p>
                </div>
              </Card>

              <Card>
                <CardHeader title="Home Loan Partners" subtitle="Rated by buyers like you" />
                {loanPartners.filter((p) => p.category === "bank_home_loan").length === 0 ? (
                  <EmptyState icon={<Calculator size={22} />} title="No lenders yet" hint="Lender tie-ups will appear here soon." />
                ) : (
                  <div className="space-y-3 px-5 pb-5">
                    {loanPartners
                      .filter((p) => p.category === "bank_home_loan")
                      .map((p) => (
                        <div key={p.id} className="rounded-md border border-border p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                                <Calculator size={18} />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-text">{p.name}</p>
                                  {p.verified && <Badge tone="success">Verified</Badge>}
                                </div>
                                <p className="mt-0.5 text-[11px] text-text-subtle">
                                  {p.city} · {p.rating}★ · {p.deals} deals · {p.conversion}% conversion
                                </p>
                              </div>
                            </div>
                            <a
                              href={`mailto:care@estateflow.in?subject=Home%20loan%20enquiry%20—%20${encodeURIComponent(p.name)}%20—%20Unit%20${unit.no}`}
                              className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-primary-hover cursor-pointer"
                            >
                              Apply <ArrowUpRight size={13} />
                            </a>
                          </div>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {p.services.map((s) => (
                              <li key={s} className="rounded-full bg-surface-muted/70 px-2.5 py-1 text-[11px] text-text-muted">{s}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-5">
                <p className="text-sm font-semibold text-text">Other partner services</p>
                <p className="mt-0.5 text-xs text-text-muted">Curated vendors for your move-in journey.</p>
                <div className="mt-4 space-y-3">
                  {loanPartners
                    .filter((p) => p.category !== "bank_home_loan")
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-text">{p.name}</p>
                          <p className="mt-0.5 text-[11px] text-text-subtle">
                            {p.category.replace("_", " ")} · {p.rating}★ · {p.deals} deals
                          </p>
                        </div>
                        <Badge tone="info">{p.conversion}%</Badge>
                      </div>
                    ))}
                </div>
                <a
                  href={`mailto:care@estateflow.in?subject=Move-in%20services%20—%20Unit%20${unit.no}`}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-primary transition-colors duration-200 hover:bg-surface-muted cursor-pointer"
                >
                  <PhoneCall size={13} /> Get help with services
                </a>
              </Card>
            </div>
          </div>
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                <PartyPopper size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Owner Events</p>
                <p className="text-xs text-text-muted">Meets, walkthroughs and community gatherings for owners</p>
              </div>
            </div>
            <Badge tone="primary">{events.length} upcoming</Badge>
          </div>
          {events.length === 0 ? (
            <EmptyState icon={<PartyPopper size={22} />} title="No upcoming events" hint="We'll invite you to the next meet as soon as it's planned." />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {events.map((ev) => (
                <Card key={ev.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-primary-soft text-primary">
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{ev.title}</p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {new Date(ev.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                    <Badge tone={eventTone[ev.type]}>{ev.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-text-muted">{ev.description}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-text-subtle">
                    <Building2 size={12} /> {ev.location} · capacity {ev.capacity}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    {ev.rsvp === "going" ? (
                      <>
                        <Badge tone="success">You're going</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setRsvpBusy(true)} disabled={rsvpBusy}>
                          Change RSVP
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          disabled={rsvpBusy}
                          onClick={async () => {
                            setRsvpBusy(true);
                            try {
                              await apiSend("/api/portal/events/rsvp", {
                                method: "POST",
                                body: JSON.stringify({ eventId: ev.id, status: "going" }),
                              });
                              await refreshPortal();
                            } finally {
                              setRsvpBusy(false);
                            }
                          }}
                        >
                          <Check size={13} /> I'm going
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={rsvpBusy}
                          onClick={async () => {
                            setRsvpBusy(true);
                            try {
                              await apiSend("/api/portal/events/rsvp", {
                                method: "POST",
                                body: JSON.stringify({ eventId: ev.id, status: "interested" }),
                              });
                              await refreshPortal();
                            } finally {
                              setRsvpBusy(false);
                            }
                          }}
                        >
                          Interested
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "support" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader
                title="My Requests"
                subtitle="Support & service requests for your home"
                action={
                  <Button size="sm" onClick={() => setShowTicketForm((v) => !v)}>
                    {showTicketForm ? <X size={13} /> : <Plus size={13} />}
                    {showTicketForm ? "Close" : "New request"}
                  </Button>
                }
              />
              {ticketList.length === 0 ? (
                <EmptyState icon={<Headset size={22} />} title="No requests yet" hint="Raise a service request and track it here." />
              ) : (
                <div className="space-y-3 px-5 pb-5">
                  {ticketList.map((t) => (
                    <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-text">{t.subject}</p>
                          <Badge tone="muted">{t.no}</Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-text-subtle">
                          {t.category} · raised {t.ageDays === 0 ? "today" : `${t.ageDays}d ago`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={prioTone[t.priority]}>{t.priority}</Badge>
                        <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openThread(t.id)} disabled={threadBusy}>
                        <MessagesSquare size={13} /> Thread
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {showTicketForm && (
              <Card className="p-5">
                <p className="text-sm font-semibold text-text">Raise a new request</p>
                <p className="mt-0.5 text-xs text-text-muted">Our team picks this up within 4 working hours.</p>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                      label="Category"
                      value={ticketForm.category}
                      onChange={(v) => setTicketForm((f) => ({ ...f, category: v }))}
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                    <Select
                      label="Priority"
                      value={ticketForm.priority}
                      onChange={(v) => setTicketForm((f) => ({ ...f, priority: v }))}
                      options={PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                    />
                  </div>
                  <Input
                    label="Subject"
                    value={ticketForm.subject}
                    onChange={(v) => setTicketForm((f) => ({ ...f, subject: v }))}
                    placeholder="e.g. Water seepage near the window"
                  />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-text-muted">Describe the issue (optional)</span>
                    <textarea
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Add details so we can assign the right team"
                      rows={4}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-text-subtle transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  {ticketError && <p className="text-xs text-danger">{ticketError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setShowTicketForm(false)}>Cancel</Button>
                    <Button onClick={submitTicket} disabled={submitting}>
                      {submitting ? (<><Spinner /> Submitting…</>) : "Submit request"}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Headset size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Customer care</p>
                  <p className="text-xs text-text-muted">Mon–Sun · 9 AM – 8 PM</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <a
                  href="tel:+918047112200"
                  className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm text-text transition-colors duration-200 hover:bg-surface-muted cursor-pointer"
                >
                  <PhoneCall size={14} /> +91 80 4711 2200 <ArrowUpRight size={13} className="text-text-subtle" />
                </a>
                <a
                  href="https://wa.me/918047112200?text=Hi%2C%20I%20need%20help%20with%20my%20unit%20T1-03-A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm text-text transition-colors duration-200 hover:bg-surface-muted cursor-pointer"
                >
                  <Bell size={14} /> WhatsApp care <ArrowUpRight size={13} className="text-text-subtle" />
                </a>
              </div>
              <p className="mt-4 text-[11px] text-text-subtle">
                Average response under 4 working hours · every request tracked via ticket number.
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success-soft text-success">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">KYC verification</p>
                  <p className="text-xs text-text-muted">
                    {kyc.status === "verified" ? "Verified · Aadhaar & PAN on record" : "Required for documents & eSign"}
                  </p>
                </div>
              </div>
              {kyc.status === "verified" ? (
                <div className="mt-4 flex items-center gap-2 rounded-md bg-success-soft/60 px-3 py-2.5 text-xs text-success">
                  <Check size={14} /> KYC verified on record — no action needed
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <Input
                    label="PAN"
                    value={kycForm.pan}
                    onChange={(v) => setKycForm((f) => ({ ...f, pan: v.toUpperCase() }))}
                    placeholder="ABCDE1234F"
                  />
                  <Input
                    label="Aadhaar (last 4 digits)"
                    value={kycForm.aadhaarLast4}
                    onChange={(v) => setKycForm((f) => ({ ...f, aadhaarLast4: v.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="4521"
                  />
                  <Button
                    className="w-full"
                    disabled={kycBusy || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(kycForm.pan) || !/^\d{4}$/.test(kycForm.aadhaarLast4)}
                    onClick={submitKyc}
                  >
                    {kycBusy ? (<><Loader2 size={13} className="animate-spin" /> Verifying…</>) : "Verify KYC"}
                  </Button>
                  <p className="text-[11px] text-text-subtle">Encrypted · used only for statutory compliance</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === "possession" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary-soft/40 to-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Possession &amp; Handover</p>
                <p className="text-xs text-text-muted">Target {possession.possessionDate} · Tower 1 · {unit.project}</p>
              </div>
            </div>
            <Badge tone="primary">{doneSteps} of {possession.steps.length} steps done</Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Handover checklist" subtitle="Tracked against the RERA possession timeline" />
              <div className="px-5 pb-5">
                {possession.steps.map((s, i) => (
                  <div key={s.name} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < possession.steps.length - 1 && <div className="absolute bottom-0 left-[13px] top-7 w-px bg-border" aria-hidden />}
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                        s.status === "done" || possession.signed.includes(s.name)
                          ? "border-success bg-success text-white"
                          : s.status === "scheduled"
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-surface-muted text-text-subtle",
                      )}
                    >
                      {s.status === "done" || possession.signed.includes(s.name) ? <Check size={13} /> : s.status === "scheduled" ? <CalendarClock size={13} /> : <Clock size={13} />}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-text">{s.name}</p>
                        {s.date && <p className="mt-0.5 text-xs text-text-subtle">{s.date}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {s.status === "done" && <Badge tone="success">Done</Badge>}
                        {s.status === "scheduled" && !possession.signed.includes(s.name) && <Badge tone="primary">Scheduled</Badge>}
                        {s.status === "pending" && !possession.signed.includes(s.name) && <Badge tone="muted">Pending</Badge>}
                        {possession.signed.includes(s.name) && (
                          <Badge tone="success"><Check size={11} /> Signed</Badge>
                        )}
                        {(s.status === "scheduled" || s.status === "pending") && !possession.signed.includes(s.name) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={signing === s.name}
                            onClick={() => signStep(s.name)}
                          >
                            {signing === s.name ? <Loader2 size={13} className="animate-spin" /> : <ClipboardCheck size={13} />}
                            Sign off
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Snag list" subtitle={`${possession.snags.length} items under resolution`} />
              {possession.snags.length === 0 ? (
                <EmptyState icon={<ClipboardCheck size={22} />} title="No open snags" hint="Everything resolved — your home is in great condition." />
              ) : (
                <div className="space-y-3 px-5 pb-5">
                  {possession.snags.map((s) => (
                    <div key={s.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-text">{s.title}</p>
                        <Badge tone={snagTone[s.status]}>{s.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-text-subtle">{s.no} · {s.category} · raised {s.raised}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader title="Warranty & handover documents" subtitle="Coverage registered in your name" />
            {warranty.length === 0 ? (
              <EmptyState icon={<ShieldCheck size={22} />} title="No warranty documents yet" hint="Warranty policies will appear here after possession." />
            ) : (
              <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
                {warranty.map((w) => (
                  <div key={w.id} className="rounded-md border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success-soft text-success">
                        <ShieldCheck size={16} />
                      </div>
                      <Badge tone={warrantyTone[w.status]}>{w.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-medium text-text">{w.title}</p>
                    <p className="mt-1 text-[11px] text-text-subtle">Issued {w.issued}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "referrals" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Gift size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text">Refer friends, earn {inr(referrals.reward, 0)}</p>
                  <p className="text-xs text-text-muted">Credited to your account after their booking is confirmed.</p>
                </div>
                <Badge tone="success">{inr(referrals.earned, 0)} earned</Badge>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border-strong bg-surface-muted/50 p-4">
                <div className="min-w-0">
                  <p className="text-[11px] text-text-muted">Your referral code</p>
                  <p className="text-lg font-semibold tracking-widest text-primary">{referrals.code}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={copyCode}>
                  {copied ? (<><Check size={13} /> Copied</>) : (<><Copy size={13} /> Copy code</>)}
                </Button>
                <Button size="sm" onClick={shareInvite}>
                  <Share2 size={13} /> Share invite
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning-soft text-warning">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Owner Rewards</p>
                  <p className="text-xs text-text-muted">Loyalty points with every milestone</p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between rounded-md bg-surface-muted/60 p-4">
                <div>
                  <p className="text-3xl font-semibold text-text tabular-nums">{loyalty.points}</p>
                  <p className="mt-0.5 text-[11px] text-text-muted">points</p>
                </div>
                <Badge tone={tierTone[loyalty.tier]}>{loyalty.tier} tier</Badge>
              </div>
              <ul className="mt-4 space-y-2.5">
                {loyalty.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
                    <Check size={13} className="mt-0.5 shrink-0 text-success" /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-md bg-success-soft/60 px-3 py-2 text-xs text-success">
                <Sparkles size={13} /> +250 points per referral converted
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Referred friends" subtitle="Live from our referral CRM" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50 text-left">
                    {["Name", "Contact", "Status", "Reward"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {referrals.referred.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-medium text-text">{r.name}</td>
                      <td className="px-4 py-3 text-text-muted tabular-nums">{r.phone}</td>
                      <td className="px-4 py-3"><Badge tone={refTone[r.status]}>{refLabel[r.status]}</Badge></td>
                      <td className="px-4 py-3 font-medium text-success tabular-nums">
                        {r.reward ? `+${inr(r.reward, 0)}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Sell or rent your home"
              subtitle="List on the owner marketplace — visible to verified buyers"
              action={<Badge tone="success">{listings.filter((l) => l.status === "active").length} active</Badge>}
            />
            {listings.length > 0 && (
              <div className="space-y-3 px-5 pb-4">
                {listings.map((l) => (
                  <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                        <Tag size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{l.title}</p>
                        <p className="mt-0.5 text-[11px] text-text-subtle">{l.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={l.listingType === "sale" ? "primary" : "info"}>{l.listingType}</Badge>
                      <p className="text-sm font-semibold text-text tabular-nums">{inr(l.price, 0)}</p>
                      <Badge tone="success">{l.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-border px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Select
                  label="Listing type"
                  value={listingForm.listingType}
                  onChange={(v) => setListingForm((f) => ({ ...f, listingType: v }))}
                  options={[
                    { value: "sale", label: "For sale" },
                    { value: "rent", label: "For rent" },
                  ]}
                />
                <Input
                  label="Price (₹)"
                  value={listingForm.price}
                  onChange={(v) => setListingForm((f) => ({ ...f, price: v.replace(/[^\d]/g, "") }))}
                  placeholder="16000000"
                />
                <Input
                  label="Title"
                  value={listingForm.title}
                  onChange={(v) => setListingForm((f) => ({ ...f, title: v }))}
                  placeholder="3BHK for sale — Tower 1"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <Input
                  label="Short description (optional)"
                  value={listingForm.description}
                  onChange={(v) => setListingForm((f) => ({ ...f, description: v }))}
                  placeholder="Corner unit, 1650 sqft, east-facing…"
                />
                <Button disabled={listingBusy} onClick={publishListing}>
                  {listingBusy ? <Loader2 size={13} className="animate-spin" /> : <Tag size={13} />}
                  Publish listing
                </Button>
              </div>
              {listingMsg && <p className="mt-3 text-xs text-primary">{listingMsg}</p>}
              <p className="mt-3 text-[11px] text-text-subtle">
                Listings are reviewed and published to the marketplace within 1 working day. No listing fee for owners.
              </p>
            </div>
          </Card>
        </div>
      )}

      {demand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setDemand(null); setDemandPaid(false); }} />
          <div className="relative w-full max-w-2xl rounded-lg border border-border bg-surface shadow-lift">
            {demandPaid ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check size={22} />
                </div>
                <p className="mt-4 text-sm font-semibold text-text">Payment initiated</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-text-muted">
                  {inr(demand.amount, 0)} for “{demand.name}” · a secure payment link has been sent to your registered email and WhatsApp.
                </p>
                <Button className="mt-5" onClick={() => { setDemand(null); setDemandPaid(false); }}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-text">Demand Letter</p>
                    <p className="text-xs text-text-muted">DEM-2026-0412 · {fmtDate(demand.due)}</p>
                  </div>
                  <IconButton label="Close" onClick={() => setDemand(null)}>
                    <X size={15} />
                  </IconButton>
                </div>
                <div className="space-y-5 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <p className="text-base font-bold text-primary">EstateFlow Developers LLP</p>
                      <p className="text-xs text-text-muted">Elevate Residences · Sarjapur Road, Bengaluru</p>
                    </div>
                    <div className="text-right text-xs text-text-muted">
                      <p>RERA No. PRM/KA/RERA/1251/446/PR/2026</p>
                      <p className="mt-1">PAN: AABCE1234F</p>
                    </div>
                  </div>
                  <div className="text-xs text-text-muted">
                    <p>To,</p>
                    <p className="mt-1 font-medium text-text">Mr. Rohan Mehta</p>
                    <p>T1-03-A, {unit.project}, Bengaluru</p>
                  </div>
                  <p className="text-xs leading-relaxed text-text-muted">
                    With reference to your booking <span className="text-text">BK-2026-001</span> of unit{" "}
                    <span className="text-text">{unit.no}</span>, this is a request for payment of the following instalment
                    against your milestone-linked schedule.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-muted/50 text-left">
                        {["Instalment", "Due date", "Amount"].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-medium text-text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/60">
                        <td className="px-4 py-3 font-medium text-text">{demand.name}</td>
                        <td className="px-4 py-3 text-text-muted tabular-nums">{fmtDate(demand.due)}</td>
                        <td className="px-4 py-3 font-medium text-text tabular-nums">{inr(demand.amount, 0)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-xs text-text-subtle">Balance payable on booking</td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 font-medium text-text tabular-nums">{inr(demand.amount, 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex items-center gap-2 rounded-md bg-success-soft/60 px-3 py-2 text-xs text-success">
                    <ShieldCheck size={14} /> Payments are held in a RERA-mandated escrow account
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button variant="secondary" onClick={() => printHtml(`Demand Letter · ${demand.name}`, demandBodyHtml(demand, unit))}>
                      <Download size={13} /> Download PDF
                    </Button>
                    <Button onClick={() => setDemandPaid(true)}>
                      <Banknote size={13} /> Pay now
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReceipt(null)} />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-surface shadow-lift">
            <div className="flex items-start justify-between px-5 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success-soft text-success">
                <ReceiptText size={18} />
              </div>
              <IconButton label="Close" onClick={() => setReceipt(null)}>
                <X size={15} />
              </IconButton>
            </div>
            <div className="px-5 pb-5">
              <p className="text-sm font-semibold text-text">Payment Receipt</p>
              <p className="mt-0.5 text-xs text-text-muted">{receipt.no} · {fmtDate(receipt.date)}</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  ["Received from", "Rohan Mehta"],
                  ["Unit", `${unit.no} · ${unit.project}`],
                  ["Towards", receipt.desc],
                  ["Payment mode", receipt.mode.toUpperCase()],
                  ["Amount", inr(receipt.amount, 0)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
                    <dt className="text-xs text-text-muted">{k}</dt>
                    <dd className="font-medium text-text">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => printHtml(`Receipt · ${receipt.no}`, receiptBodyHtml(receipt, unit))}>
                  <Download size={13} /> Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
