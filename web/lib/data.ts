export type Segment = "land" | "apartments";

export interface Plan {
  id: string;
  code: string;
  name: string;
  tagline: string;
  segments: Segment[];
  price: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "plan-land",
    code: "LAND",
    name: "Land Portfolio",
    tagline: "Acquisition, titles & plotted development",
    segments: ["land"],
    price: "₹49,999/mo",
    features: [
      "Land parcel & plot inventory",
      "Title verification & litigation tracking",
      "Per-acre deal quotations",
      "Plot layout heat maps",
    ],
  },
  {
    id: "plan-homes",
    code: "HOMES",
    name: "Homes & Towers",
    tagline: "Residential & commercial towers",
    segments: ["apartments"],
    price: "₹39,999/mo",
    features: [
      "Unit inventory heat maps",
      "Tower-wise sales tracking",
      "Quotations & discount approvals",
      "Construction ERP & DPR",
    ],
  },
  {
    id: "plan-enterprise",
    code: "ENTERPRISE",
    name: "Land + Homes",
    tagline: "The complete real estate OS",
    segments: ["land", "apartments"],
    price: "₹79,999/mo",
    features: [
      "Everything in Land & Homes plans",
      "Cross-portfolio executive dashboard",
      "Priority AI agents & analytics",
      "Dedicated success manager",
    ],
  },
];

export interface Tenant {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  location: string;
  region: string;
  planId: string;
}

export const tenants: Tenant[] = [
  { id: "builder-a", code: "BA", name: "Builder A Homes", subdomain: "builder-a.estateflow.in", location: "Bengaluru", region: "ap-south-1", planId: "plan-enterprise" },
  { id: "green-acre", code: "GA", name: "GreenAcre Developers", subdomain: "greenacre.estateflow.in", location: "Hyderabad", region: "ap-south-1", planId: "plan-land" },
  { id: "aarav", code: "AH", name: "Aarav Towers", subdomain: "aarav.estateflow.in", location: "Chennai", region: "ap-south-1", planId: "plan-homes" },
];

export type UnitStatus = "available" | "blocked" | "token_paid" | "sold" | "under_maintenance";

export const unitStatusMeta: Record<
  UnitStatus,
  { label: string; color: string; dot: string }
> = {
  available: { label: "Available", color: "#16a34a", dot: "bg-[#16a34a]" },
  blocked: { label: "Blocked", color: "#ca8a04", dot: "bg-[#ca8a04]" },
  token_paid: { label: "Token Paid", color: "#2563eb", dot: "bg-[#2563eb]" },
  sold: { label: "Sold", color: "#dc2626", dot: "bg-[#dc2626]" },
  under_maintenance: { label: "Under Maintenance", color: "#64748b", dot: "bg-[#64748b]" },
};

export interface Unit {
  id: string;
  no: string;
  type: string;
  floor: number;
  tower: string;
  sqft: number;
  price: number;
  status: UnitStatus;
}

export interface Tower {
  id: string;
  code: string;
  name: string;
  units: Unit[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  location: string;
  reraNo: string;
  towers: Tower[];
}

export const projects: Project[] = [
  {
    id: "p1",
    code: "ELEVATE",
    name: "Elevate Residences",
    location: "Whitefield, Bengaluru",
    reraNo: "PRM/KA/RERA/1251/310/PR/2026",
    towers: [
      {
        id: "t1",
        code: "T1",
        name: "Tower 1 · Skyline",
        units: [
          { id: "u1", no: "T1-01-A", type: "3BHK", floor: 1, tower: "T1", sqft: 1650, price: 13200000, status: "sold" },
          { id: "u2", no: "T1-01-B", type: "3BHK", floor: 1, tower: "T1", sqft: 1680, price: 13450000, status: "sold" },
          { id: "u3", no: "T1-01-C", type: "2BHK", floor: 1, tower: "T1", sqft: 1180, price: 9200000, status: "available" },
          { id: "u4", no: "T1-01-D", type: "2BHK", floor: 1, tower: "T1", sqft: 1210, price: 9450000, status: "available" },
          { id: "u5", no: "T1-02-A", type: "3BHK", floor: 2, tower: "T1", sqft: 1650, price: 13300000, status: "token_paid" },
          { id: "u6", no: "T1-02-B", type: "3BHK", floor: 2, tower: "T1", sqft: 1680, price: 13550000, status: "sold" },
          { id: "u7", no: "T1-02-C", type: "2BHK", floor: 2, tower: "T1", sqft: 1180, price: 9280000, status: "blocked" },
          { id: "u8", no: "T1-02-D", type: "2BHK", floor: 2, tower: "T1", sqft: 1210, price: 9530000, status: "available" },
          { id: "u9", no: "T1-03-A", type: "3BHK", floor: 3, tower: "T1", sqft: 1650, price: 13400000, status: "available" },
          { id: "u10", no: "T1-03-B", type: "3BHK", floor: 3, tower: "T1", sqft: 1680, price: 13650000, status: "sold" },
          { id: "u11", no: "T1-03-C", type: "2BHK", floor: 3, tower: "T1", sqft: 1180, price: 9360000, status: "available" },
          { id: "u12", no: "T1-03-D", type: "2BHK", floor: 3, tower: "T1", sqft: 1210, price: 9610000, status: "available" },
          { id: "u13", no: "T1-04-A", type: "3BHK", floor: 4, tower: "T1", sqft: 1650, price: 13500000, status: "token_paid" },
          { id: "u14", no: "T1-04-B", type: "3BHK", floor: 4, tower: "T1", sqft: 1680, price: 13750000, status: "available" },
          { id: "u15", no: "T1-04-C", type: "2BHK", floor: 4, tower: "T1", sqft: 1180, price: 9440000, status: "blocked" },
          { id: "u16", no: "T1-04-D", type: "2BHK", floor: 4, tower: "T1", sqft: 1210, price: 9690000, status: "available" },
          { id: "u17", no: "T1-05-A", type: "3BHK", floor: 5, tower: "T1", sqft: 1650, price: 13600000, status: "available" },
          { id: "u18", no: "T1-05-B", type: "3BHK", floor: 5, tower: "T1", sqft: 1680, price: 13850000, status: "available" },
          { id: "u19", no: "T1-05-C", type: "2BHK", floor: 5, tower: "T1", sqft: 1180, price: 9520000, status: "available" },
          { id: "u20", no: "T1-05-D", type: "2BHK", floor: 5, tower: "T1", sqft: 1210, price: 9770000, status: "sold" },
        ],
      },
      {
        id: "t2",
        code: "T2",
        name: "Tower 2 · Verdant",
        units: [
          { id: "u21", no: "T2-01-A", type: "3BHK", floor: 1, tower: "T2", sqft: 1720, price: 13800000, status: "available" },
          { id: "u22", no: "T2-01-B", type: "3BHK", floor: 1, tower: "T2", sqft: 1750, price: 14050000, status: "sold" },
          { id: "u23", no: "T2-01-C", type: "3BHK", floor: 1, tower: "T2", sqft: 1690, price: 13550000, status: "available" },
          { id: "u24", no: "T2-01-D", type: "2BHK", floor: 1, tower: "T2", sqft: 1230, price: 9600000, status: "blocked" },
          { id: "u25", no: "T2-02-A", type: "3BHK", floor: 2, tower: "T2", sqft: 1720, price: 13900000, status: "available" },
          { id: "u26", no: "T2-02-B", type: "3BHK", floor: 2, tower: "T2", sqft: 1750, price: 14150000, status: "available" },
          { id: "u27", no: "T2-02-C", type: "3BHK", floor: 2, tower: "T2", sqft: 1690, price: 13650000, status: "token_paid" },
          { id: "u28", no: "T2-02-D", type: "2BHK", floor: 2, tower: "T2", sqft: 1230, price: 9680000, status: "sold" },
          { id: "u29", no: "T2-03-A", type: "3BHK", floor: 3, tower: "T2", sqft: 1720, price: 14000000, status: "available" },
          { id: "u30", no: "T2-03-B", type: "3BHK", floor: 3, tower: "T2", sqft: 1750, price: 14250000, status: "available" },
          { id: "u31", no: "T2-03-C", type: "3BHK", floor: 3, tower: "T2", sqft: 1690, price: 13750000, status: "sold" },
          { id: "u32", no: "T2-03-D", type: "2BHK", floor: 3, tower: "T2", sqft: 1230, price: 9760000, status: "available" },
          { id: "u33", no: "T2-04-A", type: "3BHK", floor: 4, tower: "T2", sqft: 1720, price: 14100000, status: "sold" },
          { id: "u34", no: "T2-04-B", type: "3BHK", floor: 4, tower: "T2", sqft: 1750, price: 14350000, status: "available" },
          { id: "u35", no: "T2-04-C", type: "3BHK", floor: 4, tower: "T2", sqft: 1690, price: 13850000, status: "available" },
          { id: "u36", no: "T2-04-D", type: "2BHK", floor: 4, tower: "T2", sqft: 1230, price: 9840000, status: "available" },
          { id: "u37", no: "T2-05-A", type: "3BHK", floor: 5, tower: "T2", sqft: 1720, price: 14200000, status: "available" },
          { id: "u38", no: "T2-05-B", type: "3BHK", floor: 5, tower: "T2", sqft: 1750, price: 14450000, status: "token_paid" },
          { id: "u39", no: "T2-05-C", type: "3BHK", floor: 5, tower: "T2", sqft: 1690, price: 13950000, status: "blocked" },
          { id: "u40", no: "T2-05-D", type: "2BHK", floor: 5, tower: "T2", sqft: 1230, price: 9920000, status: "available" },
        ],
      },
    ],
  },
  {
    id: "p2",
    code: "OPUS",
    name: "Opus Business Park",
    location: "Outer Ring Road, Bengaluru",
    reraNo: "PRM/KA/RERA/1322/412/PR/2026",
    towers: [
      {
        id: "t3",
        code: "OP",
        name: "Opus Tower · Commercial",
        units: [
          { id: "u41", no: "OP-01-A", type: "office", floor: 1, tower: "OP", sqft: 3200, price: 44800000, status: "sold" },
          { id: "u42", no: "OP-01-B", type: "office", floor: 1, tower: "OP", sqft: 2600, price: 36400000, status: "available" },
          { id: "u43", no: "OP-02-A", type: "office", floor: 2, tower: "OP", sqft: 3200, price: 45200000, status: "token_paid" },
          { id: "u44", no: "OP-02-B", type: "office", floor: 2, tower: "OP", sqft: 2600, price: 36800000, status: "available" },
          { id: "u45", no: "OP-03-A", type: "retail", floor: 3, tower: "OP", sqft: 1450, price: 18800000, status: "available" },
          { id: "u46", no: "OP-03-B", type: "retail", floor: 3, tower: "OP", sqft: 1500, price: 19500000, status: "blocked" },
          { id: "u47", no: "OP-04-A", type: "office", floor: 4, tower: "OP", sqft: 3200, price: 45600000, status: "available" },
          { id: "u48", no: "OP-04-B", type: "office", floor: 4, tower: "OP", sqft: 2600, price: 37200000, status: "sold" },
        ],
      },
    ],
  },
];

export type LandStatus = "available" | "hold" | "token_paid" | "registered" | "sold";

export const landStatusMeta: Record<LandStatus, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "#16a34a", dot: "bg-[#16a34a]" },
  hold: { label: "On Hold", color: "#ca8a04", dot: "bg-[#ca8a04]" },
  token_paid: { label: "Token Paid", color: "#2563eb", dot: "bg-[#2563eb]" },
  registered: { label: "Registered", color: "#0d9488", dot: "bg-[#0d9488]" },
  sold: { label: "Sold", color: "#dc2626", dot: "bg-[#dc2626]" },
};

export type TitleStatus = "clear" | "in_review" | "disputed" | "litigation";

export const titleStatusMeta: Record<TitleStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  clear: { label: "Title Clear", tone: "success" },
  in_review: { label: "In Review", tone: "warning" },
  disputed: { label: "Disputed", tone: "danger" },
  litigation: { label: "Under Litigation", tone: "danger" },
};

export type LandZoning = "NA_Residential" | "Mixed_Use" | "Agricultural" | "Industrial";

export const zoningMeta: Record<LandZoning, { label: string; tone: "primary" | "info" | "muted" | "warning" }> = {
  NA_Residential: { label: "NA · Residential", tone: "primary" },
  Mixed_Use: { label: "Mixed Use", tone: "info" },
  Agricultural: { label: "Agricultural", tone: "muted" },
  Industrial: { label: "Industrial", tone: "warning" },
};

export interface LandParcel {
  id: string;
  code: string;
  name: string;
  village: string;
  district: string;
  state: string;
  surveyNo: string;
  acres: number;
  guntas: number;
  ratePerAcre: number;
  zoning: LandZoning;
  titleStatus: TitleStatus;
  status: LandStatus;
  seller: string;
  docsCount: number;
  highlight?: string;
}

export const landParcels: LandParcel[] = [
  { id: "lp1", code: "LP-SAR-01", name: "Sarjapura Greenfield Parcel", village: "Sarjapura", district: "Bengaluru Urban", state: "Karnataka", surveyNo: "98/2B, 98/3A", acres: 4.5, guntas: 0, ratePerAcre: 32000000, zoning: "NA_Residential", titleStatus: "clear", status: "available", seller: "N. Ramesh & Family", docsCount: 14, highlight: "4 side approach · RMZ boundary" },
  { id: "lp2", code: "LP-HSK-02", name: "Hoskote Industrial Tract", village: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", surveyNo: "451, 452/1", acres: 7.25, guntas: 0, ratePerAcre: 24000000, zoning: "Industrial", titleStatus: "in_review", status: "available", seller: "Sri Lakshmi Estates", docsCount: 9, highlight: "Industrial zone · near KIADB park" },
  { id: "lp3", code: "LP-DEV-03", name: "Devanahalli Airport Belt", village: "Channahalli", district: "Bengaluru Rural", state: "Karnataka", surveyNo: "212, 214", acres: 3.1, guntas: 0, ratePerAcre: 41000000, zoning: "Mixed_Use", titleStatus: "clear", status: "token_paid", seller: "Suresh Gowda", docsCount: 18, highlight: "15 km from airport terminal" },
  { id: "lp4", code: "LP-SHB-04", name: "Shamshabad Agri Parcel", village: "Shamshabad", district: "Ranga Reddy", state: "Telangana", surveyNo: "1182, 1183/P", acres: 12.0, guntas: 0, ratePerAcre: 11000000, zoning: "Agricultural", titleStatus: "clear", status: "available", seller: "Uma Devi Agricultural Co.", docsCount: 11, highlight: "Single owner · full extent" },
  { id: "lp5", code: "LP-ATT-05", name: "Attibele SEZ Proximity", village: "Attibele", district: "Bengaluru Urban", state: "Karnataka", surveyNo: "67/4, 68", acres: 5.8, guntas: 0, ratePerAcre: 29000000, zoning: "NA_Residential", titleStatus: "litigation", status: "hold", seller: "Vijay Estates LLP", docsCount: 6, highlight: "Encumbrance litigation — legal review" },
  { id: "lp6", code: "LP-BEL-06", name: "Beltagurki Plotted Land", village: "Beltagurki", district: "Bengaluru Rural", state: "Karnataka", surveyNo: "34, 35", acres: 2.6, guntas: 0, ratePerAcre: 38000000, zoning: "NA_Residential", titleStatus: "clear", status: "registered", seller: "Anand Trust", docsCount: 22, highlight: "Layout approval in hand · 40 plots" },
];

export interface Plot {
  id: string;
  no: string;
  zone: "residential" | "commercial" | "villa";
  sqft: number;
  price: number;
  status: UnitStatus;
}

export interface PlotLayout {
  id: string;
  code: string;
  name: string;
  plots: Plot[];
}

export const plotLayouts: PlotLayout[] = [
  {
    id: "pl1",
    code: "VL",
    name: "Verdant Layout · Sector 1",
    plots: [
      { id: "pt1", no: "VL-01", zone: "residential", sqft: 1500, price: 1950000, status: "available" },
      { id: "pt2", no: "VL-02", zone: "residential", sqft: 1500, price: 1990000, status: "available" },
      { id: "pt3", no: "VL-03", zone: "residential", sqft: 1800, price: 2420000, status: "sold" },
      { id: "pt4", no: "VL-04", zone: "residential", sqft: 1800, price: 2460000, status: "available" },
      { id: "pt5", no: "VL-05", zone: "villa", sqft: 2400, price: 3400000, status: "token_paid" },
      { id: "pt6", no: "VL-06", zone: "villa", sqft: 2400, price: 3480000, status: "available" },
      { id: "pt7", no: "VL-07", zone: "commercial", sqft: 900, price: 1350000, status: "blocked" },
      { id: "pt8", no: "VL-08", zone: "commercial", sqft: 900, price: 1390000, status: "available" },
      { id: "pt9", no: "VL-09", zone: "residential", sqft: 1500, price: 2010000, status: "available" },
      { id: "pt10", no: "VL-10", zone: "residential", sqft: 1800, price: 2490000, status: "sold" },
      { id: "pt11", no: "VL-11", zone: "villa", sqft: 2400, price: 3520000, status: "available" },
      { id: "pt12", no: "VL-12", zone: "residential", sqft: 1500, price: 2030000, status: "available" },
    ],
  },
];

export interface LandSummary {
  totalAcres: number;
  availableParcels: number;
  avgRatePerAcre: number;
  titleQueue: number;
  realised: number;
  registeredParcels: number;
}

export function computeLandSummary(parcels: LandParcel[]): LandSummary {
  const available = parcels.filter((p) => p.status === "available");
  const totalAcres = parcels.reduce((s, p) => s + p.acres, 0);
  const realised = parcels.filter((p) => p.status === "sold").reduce((s, p) => s + p.acres * p.ratePerAcre, 0);
  return {
    totalAcres,
    availableParcels: available.length,
    avgRatePerAcre: available.length ? available.reduce((s, p) => s + p.ratePerAcre, 0) / available.length : 0,
    titleQueue: parcels.filter((p) => p.titleStatus !== "clear").length,
    realised,
    registeredParcels: parcels.filter((p) => p.status === "registered").length,
  };
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit_scheduled"
  | "booking_initiated"
  | "won"
  | "lost";

export const leadStatusMeta: Record<LeadStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "muted" },
  qualified: { label: "Qualified", tone: "primary" },
  site_visit_scheduled: { label: "Visit Scheduled", tone: "warning" },
  booking_initiated: { label: "Booking Initiated", tone: "success" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "danger" },
};

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: "facebook" | "google_ads" | "whatsapp" | "ivr" | "referral";
  project: string;
  unitType: string;
  budget: number;
  score: number;
  status: LeadStatus;
  assigned: string;
  aiEngaged: boolean;
  segment: Segment;
  createdAt: string;
}

export const leads: Lead[] = [
  { id: "L-1042", name: "Rohan Mehta", phone: "+91 98450 11223", source: "facebook", project: "Elevate Residences", unitType: "3BHK", budget: 14000000, score: 92, status: "qualified", assigned: "Arjun Nair", aiEngaged: true, segment: "apartments", createdAt: "2026-08-05T09:12:00" },
  { id: "L-1041", name: "Priya Sharma", phone: "+91 98110 44556", source: "google_ads", project: "Elevate Residences", unitType: "2BHK", budget: 9800000, score: 84, status: "site_visit_scheduled", assigned: "Neha Gupta", aiEngaged: true, segment: "apartments", createdAt: "2026-08-05T08:40:00" },
  { id: "L-1040", name: "Karthik Reddy", phone: "+91 99860 77889", source: "whatsapp", project: "Opus Business Park", unitType: "office", budget: 46000000, score: 78, status: "contacted", assigned: "Arjun Nair", aiEngaged: true, segment: "apartments", createdAt: "2026-08-05T07:55:00" },
  { id: "L-1039", name: "Ananya Iyer", phone: "+91 98400 33445", source: "ivr", project: "Elevate Residences", unitType: "3BHK", budget: 14200000, score: 71, status: "new", assigned: "Unassigned", aiEngaged: true, segment: "apartments", createdAt: "2026-08-05T07:20:00" },
  { id: "L-1038", name: "Vikram Singh", phone: "+91 98220 55667", source: "referral", project: "Elevate Residences", unitType: "2BHK", budget: 9600000, score: 66, status: "new", assigned: "Neha Gupta", aiEngaged: false, segment: "apartments", createdAt: "2026-08-04T18:05:00" },
  { id: "L-1037", name: "Sneha Kulkarni", phone: "+91 90080 66778", source: "facebook", project: "Opus Business Park", unitType: "retail", budget: 20000000, score: 58, status: "new", assigned: "Unassigned", aiEngaged: true, segment: "apartments", createdAt: "2026-08-04T17:30:00" },
  { id: "L-1036", name: "Aditya Joshi", phone: "+91 98330 88990", source: "google_ads", project: "Elevate Residences", unitType: "3BHK", budget: 13800000, score: 88, status: "booking_initiated", assigned: "Arjun Nair", aiEngaged: true, segment: "apartments", createdAt: "2026-08-04T15:10:00" },
  { id: "L-1035", name: "Farhan Ali", phone: "+91 98190 22334", source: "whatsapp", project: "Elevate Residences", unitType: "2BHK", budget: 9500000, score: 52, status: "lost", assigned: "Neha Gupta", aiEngaged: true, segment: "apartments", createdAt: "2026-08-03T11:45:00" },
  { id: "L-1034", name: "Divya Menon", phone: "+91 98860 11223", source: "ivr", project: "Elevate Residences", unitType: "3BHK", budget: 14300000, score: 74, status: "contacted", assigned: "Arjun Nair", aiEngaged: true, segment: "apartments", createdAt: "2026-08-03T10:22:00" },
  { id: "L-1033", name: "Suresh Patil", phone: "+91 98450 99001", source: "facebook", project: "Opus Business Park", unitType: "office", budget: 45000000, score: 61, status: "new", assigned: "Unassigned", aiEngaged: false, segment: "apartments", createdAt: "2026-08-03T09:00:00" },
  { id: "L-1032", name: "Rajesh Kumar", phone: "+91 98470 22331", source: "whatsapp", project: "Land · Sarjapura", unitType: "Land parcel", budget: 180000000, score: 81, status: "qualified", assigned: "Arjun Nair", aiEngaged: true, segment: "land", createdAt: "2026-08-05T10:02:00" },
  { id: "L-1031", name: "Meera Reddy", phone: "+91 90000 44556", source: "google_ads", project: "Verdant Layout", unitType: "Plot", budget: 2600000, score: 67, status: "site_visit_scheduled", assigned: "Neha Gupta", aiEngaged: true, segment: "land", createdAt: "2026-08-04T12:15:00" },
];

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: number;
  hint: string;
}

export const executiveKpis: Kpi[] = [
  { id: "k1", label: "Units Sold (YTD)", value: "318", delta: 12.4, hint: "vs. same period last year" },
  { id: "k2", label: "Collections (Q3)", value: "₹86.4 Cr", delta: 8.1, hint: "of ₹94 Cr invoiced" },
  { id: "k3", label: "Avg. Lead Response", value: "1m 42s", delta: -22.6, hint: "AI Sales Agent assisted" },
  { id: "k4", label: "Construction Variance", value: "2.1%", delta: -1.4, hint: "under budget baseline" },
];

export const landKpis: Kpi[] = [
  { id: "lk1", label: "Land Portfolio", value: "38.25 ac", delta: 12.5, hint: "across 6 parcels" },
  { id: "lk2", label: "Avg. Rate / Acre", value: "₹2.9 Cr", delta: 6.2, hint: "available parcels only" },
  { id: "lk3", label: "Title Verification", value: "2 open", delta: -33.3, hint: "1 in review · 1 litigation" },
  { id: "lk4", label: "Land Value Realised", value: "₹8.4 Cr", delta: 18.9, hint: "registered & sold parcels" },
];

export const cashFlowData = [
  { month: "Mar", inflow: 12.4, outflow: 9.8 },
  { month: "Apr", inflow: 14.1, outflow: 10.2 },
  { month: "May", inflow: 13.2, outflow: 11.4 },
  { month: "Jun", inflow: 16.8, outflow: 11.9 },
  { month: "Jul", inflow: 18.2, outflow: 12.6 },
  { month: "Aug", inflow: 21.5, outflow: 13.1 },
];

export const salesVelocity = [
  { month: "Mar", units: 22 },
  { month: "Apr", units: 27 },
  { month: "May", units: 24 },
  { month: "Jun", units: 31 },
  { month: "Jul", units: 35 },
  { month: "Aug", units: 41 },
];

export type QuoteStatus = "draft" | "pending_approval" | "approved" | "accepted" | "expired" | "cancelled";

export const quoteStatusMeta: Record<QuoteStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "muted" },
  pending_approval: { label: "Pending Approval", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  expired: { label: "Expired", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export interface Quote {
  id: string;
  quoteNo: string;
  customer: string;
  project: string;
  unit: string;
  base: number;
  discountPct: number;
  total: number;
  status: QuoteStatus;
  salesExecutive: string;
  segment: Segment;
  createdAt: string;
}

export const quotes: Quote[] = [
  { id: "q1", quoteNo: "QT-2026-0871", customer: "Rohan Mehta", project: "Elevate Residences", unit: "T1-03-A", base: 13400000, discountPct: 3.5, total: 12931000, status: "draft", salesExecutive: "Arjun Nair", segment: "apartments", createdAt: "2026-08-05T09:15:00" },
  { id: "q2", quoteNo: "QT-2026-0870", customer: "Priya Sharma", project: "Elevate Residences", unit: "T1-02-C", base: 9280000, discountPct: 6.0, total: 8723200, status: "pending_approval", salesExecutive: "Neha Gupta", segment: "apartments", createdAt: "2026-08-05T08:42:00" },
  { id: "q3", quoteNo: "QT-2026-0869", customer: "Karthik Reddy", project: "Opus Business Park", unit: "OP-02-A", base: 45200000, discountPct: 2.0, total: 44296000, status: "accepted", salesExecutive: "Arjun Nair", segment: "apartments", createdAt: "2026-08-04T16:20:00" },
  { id: "q4", quoteNo: "QT-2026-0868", customer: "Aditya Joshi", project: "Elevate Residences", unit: "T1-02-A", base: 13300000, discountPct: 4.0, total: 12768000, status: "approved", salesExecutive: "Arjun Nair", segment: "apartments", createdAt: "2026-08-04T14:05:00" },
  { id: "q5", quoteNo: "QT-2026-0867", customer: "Divya Menon", project: "Elevate Residences", unit: "T1-04-A", base: 13500000, discountPct: 5.5, total: 12757500, status: "pending_approval", salesExecutive: "Arjun Nair", segment: "apartments", createdAt: "2026-08-04T11:30:00" },
  { id: "q6", quoteNo: "QT-2026-0866", customer: "Suresh Patil", project: "Opus Business Park", unit: "OP-01-B", base: 36400000, discountPct: 1.5, total: 35854000, status: "expired", salesExecutive: "Neha Gupta", segment: "apartments", createdAt: "2026-08-02T13:10:00" },
  { id: "q7", quoteNo: "QT-2026-0872", customer: "Rajesh Kumar", project: "Land · Sarjapura", unit: "LP-SAR-01", base: 144000000, discountPct: 2.5, total: 140400000, status: "pending_approval", salesExecutive: "Arjun Nair", segment: "land", createdAt: "2026-08-05T10:20:00" },
  { id: "q8", quoteNo: "QT-2026-0873", customer: "Meera Reddy", project: "Verdant Layout", unit: "VL-11", base: 3520000, discountPct: 3.0, total: 3414400, status: "accepted", salesExecutive: "Neha Gupta", segment: "land", createdAt: "2026-08-04T12:40:00" },
];

export interface Milestone {
  id: string;
  name: string;
  planned: string;
  actual?: string;
  progress: number;
  status: "completed" | "on_track" | "at_risk" | "delayed" | "pending";
}

export const milestones: Milestone[] = [
  { id: "m1", name: "Foundation & PCC", planned: "2026-02-15", actual: "2026-02-11", progress: 100, status: "completed" },
  { id: "m2", name: "Podium + Ground Floor", planned: "2026-04-20", actual: "2026-04-18", progress: 100, status: "completed" },
  { id: "m3", name: "Structure up to Floor 3", planned: "2026-07-10", actual: "2026-07-06", progress: 100, status: "completed" },
  { id: "m4", name: "Structure up to Floor 5", planned: "2026-09-28", progress: 68, status: "on_track" },
  { id: "m5", name: "External & Facade Works", planned: "2026-11-15", progress: 12, status: "at_risk" },
  { id: "m6", name: "MEP Rough-in", planned: "2026-12-05", progress: 0, status: "pending" },
];

export const dprRows = [
  { date: "2026-08-05", tower: "T1", engineer: "Ravi Kumar", progress: 68.4, labour: 84, concreteCum: 42, note: "Level 5 slab shutter work in progress. 2 days ahead of schedule." },
  { date: "2026-08-04", tower: "T1", engineer: "Ravi Kumar", progress: 67.9, labour: 82, concreteCum: 38, note: "Steel fixing for slab completed on east wing." },
  { date: "2026-08-04", tower: "T2", engineer: "Suman Das", progress: 61.2, labour: 76, concreteCum: 35, note: "Blockwork level 3 ongoing; cement stock low — RFQ raised." },
  { date: "2026-08-03", tower: "T1", engineer: "Ravi Kumar", progress: 67.4, labour: 88, concreteCum: 44, note: "Level 4 slab cast completed." },
  { date: "2026-08-03", tower: "T2", engineer: "Suman Das", progress: 60.8, labour: 74, concreteCum: 33, note: "Site photos uploaded; AI flagged material shortage for plaster." },
];

export const financeRecon = [
  { ref: "SBI/MT940/0805-001", date: "2026-08-05", desc: "NEFT — Aditya Joshi (token)", amount: 500000, type: "in", matched: true, confidence: 99.2 },
  { ref: "SBI/MT940/0805-002", date: "2026-08-05", desc: "UPI — Priya Sharma", amount: 250000, type: "in", matched: true, confidence: 97.8 },
  { ref: "SBI/MT940/0805-003", date: "2026-08-05", desc: "RTGS — Vendor: Apex Cements", amount: -1840000, type: "out", matched: true, confidence: 95.4 },
  { ref: "SBI/MT940/0804-011", date: "2026-08-04", desc: "NEFT — Unidentified", amount: 340000, type: "in", matched: false, confidence: 41.3 },
  { ref: "SBI/MT940/0804-010", date: "2026-08-04", desc: "GST Payment — CGST/SGST", amount: -4200000, type: "out", matched: true, confidence: 99.0 },
  { ref: "SBI/MT940/0803-007", date: "2026-08-03", desc: "NEFT — Karthik Reddy (token)", amount: 1000000, type: "in", matched: true, confidence: 98.6 },
];

export const aiAgentChat = [
  { from: "user", text: "Hi, is a 3BHK at Elevate still available around ₹1.4 Cr?" },
  { from: "ai", text: "Yes! Tower 1 has a 3BHK (1,650 sq.ft) available at ₹1.34 Cr. Would you like to book a site visit this Saturday? I can also share the payment plan." },
  { from: "user", text: "Sure, Saturday morning works. And what's the token amount?" },
  { from: "ai", text: "Great — I've scheduled a visit for Sat, 9 Aug, 11:00 AM with our sales team. Token amount is ₹2,00,000 (refundable). Shall I send the details on WhatsApp?" },
];

export const notifications = [
  { id: "n1", title: "Discount approval required", body: "QT-2026-0870 · Priya Sharma · 6% discount", time: "2m ago", tone: "warning" },
  { id: "n2", title: "Material shortage flagged", body: "Tower 2 plaster: cement stock below reorder level", time: "18m ago", tone: "danger" },
  { id: "n3", title: "Site visit confirmed", body: "Rohan Mehta · Elevate · Sat 9 Aug, 11:00", time: "1h ago", tone: "info" },
  { id: "n4", title: "AI Procurement anomaly", body: "Vendor quote 12% above market index for steel", time: "3h ago", tone: "warning" },
];

export const reconciliationSummary = {
  total: 1284,
  matched: 1211,
  pending: 73,
  pendingAmount: 12400000,
  matchRate: 94.3,
};
