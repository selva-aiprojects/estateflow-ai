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

// =============================================================================
// PROCUREMENT & VENDOR MANAGEMENT
// =============================================================================

export type VendorStatus = "verified" | "pending" | "blacklisted";
export type RfqStatus = "draft" | "published" | "under_evaluation" | "awarded" | "closed";
export type PoStatus = "draft" | "sent" | "partially_received" | "received";
export type GrnStatus = "pending_verification" | "verified" | "rejected";
export type GrnMatch = "two_way" | "three_way" | "mismatch";

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  gstin: string;
  rating: number;
  status: VendorStatus;
  city: string;
}

export interface Rfq {
  id: string;
  rfqNo: string;
  title: string;
  project: string;
  category: string;
  deadline: string;
  responses: number;
  bestRate: number;
  marketIndex: number;
  status: RfqStatus;
  aiFlag?: boolean;
  aiNote?: string;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  vendor: string;
  project: string;
  rfqNo: string;
  total: number;
  status: PoStatus;
  aiDrafted: boolean;
  items: { name: string; qty: number; uom: string }[];
}

export interface Grn {
  id: string;
  grnNo: string;
  poNo: string;
  vendor: string;
  receivedAt: string;
  status: GrnStatus;
  match: GrnMatch;
  variancePct: number;
}

export const vendors: Vendor[] = [
  { id: "v1", code: "VND-001", name: "Shree Cement Supplies", category: "Cement", gstin: "29AACCS1234K1Z5", rating: 4.6, status: "verified", city: "Bengaluru" },
  { id: "v2", code: "VND-002", name: "Jindal Steel Traders", category: "Steel / Rebar", gstin: "29AAFCJ2345N1Z2", rating: 4.4, status: "verified", city: "Hosur" },
  { id: "v3", code: "VND-003", name: "Koncept Readymix Concrete", category: "Ready-Mix Concrete", gstin: "29AAFCK3456P1Z8", rating: 4.1, status: "verified", city: "Bengaluru" },
  { id: "v4", code: "VND-004", name: "Sri Venkateshwara Bricks", category: "Bricks & Blocks", gstin: "29AAJFV4567Q1Z3", rating: 3.8, status: "pending", city: "Malur" },
  { id: "v5", code: "VND-005", name: "Apex Facade Systems", category: "Facade / Glazing", gstin: "29AAKFA5678R1Z1", rating: 4.7, status: "verified", city: "Bengaluru" },
  { id: "v6", code: "VND-006", name: "Prime Plumbing Pipes", category: "Plumbing / Sanitary", gstin: "29AAKPP6789S1Z6", rating: 3.5, status: "blacklisted", city: "Peenya" },
];

export const rfqs: Rfq[] = [
  { id: "r1", rfqNo: "RFQ-2026-018", title: "Structural steel rebar — T2 & T3", project: "Elevate Residences", category: "Steel / Rebar", deadline: "2026-08-12", responses: 4, bestRate: 48200, marketIndex: 51000, status: "under_evaluation" },
  { id: "r2", rfqNo: "RFQ-2026-017", title: "Ready-mix concrete M40 (10k cum)", project: "Elevate Residences", category: "Ready-Mix Concrete", deadline: "2026-08-08", responses: 3, bestRate: 5600, marketIndex: 5850, status: "under_evaluation" },
  { id: "r3", rfqNo: "RFQ-2026-016", title: "Facade glazing units — Opus", project: "Opus Business Park", category: "Facade / Glazing", deadline: "2026-08-05", responses: 5, bestRate: 12400, marketIndex: 11900, status: "awarded", aiFlag: true, aiNote: "Best quote is 4.2% above market index — shortlist #3 (Apex) has best past-delivery rating." },
  { id: "r4", rfqNo: "RFQ-2026-015", title: "OPC 53 grade cement (bulk)", project: "Elevate Residences", category: "Cement", deadline: "2026-08-02", responses: 6, bestRate: 375, marketIndex: 398, status: "awarded" },
  { id: "r5", rfqNo: "RFQ-2026-014", title: "Autoclaved blocks 200mm", project: "Elevate Residences", category: "Bricks & Blocks", deadline: "2026-07-28", responses: 2, bestRate: 46, marketIndex: 44, status: "published", aiFlag: true, aiNote: "Sri Venkateshwara quote is 4.5% above index — PAN verification pending." },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "p1", poNo: "PO-2026-041", vendor: "Jindal Steel Traders", project: "Elevate Residences", rfqNo: "RFQ-2026-018", total: 48200000, status: "sent", aiDrafted: true, items: [{ name: "TMT Fe500D rebar", qty: 1000, uom: "MT" }] },
  { id: "p2", poNo: "PO-2026-040", vendor: "Shree Cement Supplies", project: "Elevate Residences", rfqNo: "RFQ-2026-015", total: 56250000, status: "partially_received", aiDrafted: true, items: [{ name: "OPC 53 grade bulk", qty: 150000, uom: "bags" }] },
  { id: "p3", poNo: "PO-2026-039", vendor: "Apex Facade Systems", project: "Opus Business Park", rfqNo: "RFQ-2026-016", total: 12400000, status: "received", aiDrafted: false, items: [{ name: "Glazing units (low-E)", qty: 1000, uom: "sq.m" }] },
  { id: "p4", poNo: "PO-2026-038", vendor: "Koncept Readymix Concrete", project: "Elevate Residences", rfqNo: "RFQ-2026-017", total: 56000000, status: "sent", aiDrafted: true, items: [{ name: "RMC M40", qty: 10000, uom: "cum" }] },
];

export const grns: Grn[] = [
  { id: "g1", grnNo: "GRN-2026-022", poNo: "PO-2026-040", vendor: "Shree Cement Supplies", receivedAt: "2026-08-04T10:12:00", status: "verified", match: "three_way", variancePct: 0.2 },
  { id: "g2", grnNo: "GRN-2026-021", poNo: "PO-2026-039", vendor: "Apex Facade Systems", receivedAt: "2026-08-03T16:40:00", status: "verified", match: "three_way", variancePct: 0 },
  { id: "g3", grnNo: "GRN-2026-020", poNo: "PO-2026-040", vendor: "Shree Cement Supplies", receivedAt: "2026-08-02T09:55:00", status: "pending_verification", match: "two_way", variancePct: 1.4 },
  { id: "g4", grnNo: "GRN-2026-019", poNo: "PO-2026-038", vendor: "Koncept Readymix Concrete", receivedAt: "2026-08-01T11:30:00", status: "rejected", match: "mismatch", variancePct: 6.8 },
];

export const procurementSummary = {
  openRfqs: 3,
  activePos: 4,
  grnExceptions: 2,
  verifiedVendors: 24,
  savingsYtd: 31200000,
};

// =============================================================================
// LEGAL & RERA COMPLIANCE
// =============================================================================

export type AgreementStatus = "draft" | "pending_signature" | "executed" | "cancelled";
export type ReraStatus = "registered" | "in_progress" | "rejected" | "expired";
export type SyncStatus = "not_synced" | "syncing" | "synced" | "failed" | "pending";
export type LitigationStatus = "active" | "closed" | "settled";

export interface LegalAgreement {
  id: string;
  agreementNo: string;
  type: string;
  customer: string;
  asset: string;
  status: AgreementStatus;
  esign: boolean;
  digilocker: SyncStatus;
}

export interface ReraRegistration {
  id: string;
  project: string;
  regNo: string;
  authority: string;
  validTo: string;
  status: ReraStatus;
  lastSync: string;
  disclosures: { quarter: string; progress: number; submitted: boolean }[];
}

export interface Litigation {
  id: string;
  caseNo: string;
  parcel: string;
  court: string;
  status: LitigationStatus;
  nextHearing: string;
  summary: string;
}

export interface ComplianceDue {
  id: string;
  label: string;
  project: string;
  due: string;
  status: "due" | "upcoming" | "done";
}

export const legalAgreements: LegalAgreement[] = [
  { id: "a1", agreementNo: "AFS-2026-0112", type: "Agreement for Sale", customer: "Rohan Mehta", asset: "T1-03-A · Elevate", status: "pending_signature", esign: true, digilocker: "pending" },
  { id: "a2", agreementNo: "AFS-2026-0111", type: "Agreement for Sale", customer: "Priya Sharma", asset: "T1-02-C · Elevate", status: "pending_signature", esign: true, digilocker: "pending" },
  { id: "a3", agreementNo: "AFS-2026-0110", type: "Agreement for Sale", customer: "Aditya Joshi", asset: "T1-02-A · Elevate", status: "executed", esign: true, digilocker: "synced" },
  { id: "a4", agreementNo: "AFS-2026-0109", type: "Agreement for Sale", customer: "Karthik Reddy", asset: "OP-02-A · Opus", status: "executed", esign: true, digilocker: "synced" },
  { id: "a5", agreementNo: "ALO-2026-003", type: "Allotment Letter", customer: "Meera Reddy", asset: "VL-11 · Verdant", status: "draft", esign: false, digilocker: "not_synced" },
  { id: "a6", agreementNo: "ALO-2026-002", type: "Allotment Letter", customer: "Rajesh Kumar", asset: "LP-SAR-01 · Sarjapura", status: "pending_signature", esign: false, digilocker: "not_synced" },
];

export const reraRegistrations: ReraRegistration[] = [
  {
    id: "rera1",
    project: "Elevate Residences",
    regNo: "PRM/KA/RERA/1251/310/PR/2026",
    authority: "K-RERA Bengaluru",
    validTo: "2029-03-31",
    status: "registered",
    lastSync: "2026-08-04T18:00:00",
    disclosures: [
      { quarter: "Q2 2026", progress: 61.2, submitted: true },
      { quarter: "Q3 2026", progress: 74.5, submitted: true },
      { quarter: "Q4 2026", progress: 0, submitted: false },
    ],
  },
  {
    id: "rera2",
    project: "Opus Business Park",
    regNo: "PRM/KA/RERA/1252/446/PR/2026",
    authority: "K-RERA Bengaluru",
    validTo: "2029-03-31",
    status: "registered",
    lastSync: "2026-08-03T18:00:00",
    disclosures: [
      { quarter: "Q2 2026", progress: 44.0, submitted: true },
      { quarter: "Q3 2026", progress: 58.2, submitted: false },
    ],
  },
];

export const litigations: Litigation[] = [
  { id: "lit1", caseNo: "O.S. 4821/2024", parcel: "LP-ATT-05 · Attibele", court: "Civil Court, Anekal", status: "active", nextHearing: "2026-08-19", summary: "Encumbrance dispute with prior mortgagee — title in review, parcel on hold." },
  { id: "lit2", caseNo: "M.S. 903/2023", parcel: "LP-SAR-01 · Sarjapura", court: "Sub-Court, Bengaluru", status: "settled", nextHearing: "—", summary: "Boundary dispute settled Dec 2025 — full title now clear." },
];

export const complianceDue: ComplianceDue[] = [
  { id: "c1", label: "Q4 2026 RERA disclosure", project: "Elevate Residences", due: "2026-10-15", status: "upcoming" },
  { id: "c2", label: "Form 5C — labour register renewal", project: "Elevate Residences", due: "2026-08-20", status: "due" },
  { id: "c3", label: "Pollution Board consent renewal", project: "Opus Business Park", due: "2026-08-25", status: "due" },
  { id: "c4", label: "TDS certificate 16A quarter filing", project: "All projects", due: "2026-08-31", status: "upcoming" },
];

// =============================================================================
// HR & CONTRACT LABOUR
// =============================================================================

export type AttendanceStatus = "present" | "late" | "absent" | "on_leave";

export interface AttendanceRow {
  id: string;
  name: string;
  role: string;
  department: string;
  checkIn: string;
  status: AttendanceStatus;
  geoVerified: boolean;
}

export interface ContractLabourRow {
  id: string;
  name: string;
  vendor: string;
  role: string;
  dailyWage: number;
  active: boolean;
  attendancePct: number;
}

export const attendanceRows: AttendanceRow[] = [
  { id: "e1", name: "Rahul Verma", role: "Site Engineer", department: "Construction", checkIn: "08:42", status: "present", geoVerified: true },
  { id: "e2", name: "Sana Khan", role: "DPR Coordinator", department: "Construction", checkIn: "08:55", status: "present", geoVerified: true },
  { id: "e3", name: "Prakash Rao", role: "Quality Inspector", department: "Construction", checkIn: "09:20", status: "late", geoVerified: true },
  { id: "e4", name: "Deepak Menon", role: "Store Manager", department: "Procurement", checkIn: "08:30", status: "present", geoVerified: true },
  { id: "e5", name: "Lakshmi Nair", role: "Accounts Associate", department: "Finance", checkIn: "—", status: "absent", geoVerified: false },
  { id: "e6", name: "Imran Sheikh", role: "Safety Officer", department: "Construction", checkIn: "—", status: "on_leave", geoVerified: false },
];

export const contractLabourRows: ContractLabourRow[] = [
  { id: "cl1", name: "Mohan Lal", vendor: "Sri Krishna Manpower", role: "Mason", dailyWage: 850, active: true, attendancePct: 96 },
  { id: "cl2", name: "Ramesh K", vendor: "Sri Krishna Manpower", role: "Bar Bender", dailyWage: 820, active: true, attendancePct: 91 },
  { id: "cl3", name: "Suresh G", vendor: "Ganga Scaffolding", role: "Scaffolder", dailyWage: 720, active: true, attendancePct: 84 },
  { id: "cl4", name: "Arjun P", vendor: "Ganga Scaffolding", role: "Carpenter", dailyWage: 780, active: true, attendancePct: 79 },
  { id: "cl5", name: "Vijay R", vendor: "Sri Krishna Manpower", role: "Helper", dailyWage: 560, active: false, attendancePct: 62 },
];

export const attendanceSummary = {
  total: 186,
  present: 172,
  late: 9,
  absent: 5,
  onTimePct: 92.5,
};

// =============================================================================
// FACILITY MANAGEMENT & SOCIETY OPS
// =============================================================================

export type AmcStatus = "active" | "expired" | "cancelled" | "renewed";

export interface AmcContract {
  id: string;
  service: string;
  vendor: string;
  society: string;
  amount: number;
  expires: string;
  status: AmcStatus;
  autoRenew: boolean;
}

export interface VisitorEntry {
  id: string;
  visitor: string;
  unit: string;
  purpose: string;
  checkIn: string;
  status: "inside" | "checked_out";
  qr: boolean;
}

export interface MaintenanceBill {
  id: string;
  billNo: string;
  unit: string;
  period: string;
  amount: number;
  status: "issued" | "paid" | "overdue";
}

export interface ServiceTicket {
  id: string;
  ticketNo: string;
  customer: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved";
  ageDays: number;
}

export const amcContracts: AmcContract[] = [
  { id: "amc1", service: "Lift AMC — 6 elevators", vendor: "KONE India", society: "Elevate Residences", amount: 840000, expires: "2027-03-15", status: "active", autoRenew: true },
  { id: "amc2", service: "DG sets maintenance", vendor: "Cummins Power", society: "Elevate Residences", amount: 420000, expires: "2026-09-30", status: "active", autoRenew: true },
  { id: "amc3", service: "STP operations & sludge", vendor: "EcoClear Water", society: "Elevate Residences", amount: 360000, expires: "2026-08-28", status: "active", autoRenew: false },
  { id: "amc4", service: "Fire suppression systems", vendor: "SafeGuard Fire", society: "Opus Business Park", amount: 280000, expires: "2026-07-20", status: "expired", autoRenew: false },
];

export const visitorEntries: VisitorEntry[] = [
  { id: "vis1", visitor: "Rohit Sharma", unit: "T1-04-C", purpose: "Interior vendor", checkIn: "09:40", status: "inside", qr: true },
  { id: "vis2", visitor: "Anita Desai", unit: "T2-02-A", purpose: "Guest", checkIn: "10:15", status: "inside", qr: true },
  { id: "vis3", visitor: "Courier — BlueDart", unit: "Facility office", purpose: "Delivery", checkIn: "08:50", status: "checked_out", qr: true },
  { id: "vis4", visitor: "Nikhil Patil", unit: "T1-05-B", purpose: "Plumbing service", checkIn: "11:05", status: "inside", qr: false },
];

export const maintenanceBills: MaintenanceBill[] = [
  { id: "mb1", billNo: "MB-2026-0812", unit: "T1-03-A", period: "Aug 2026", amount: 6200, status: "issued" },
  { id: "mb2", billNo: "MB-2026-0811", unit: "T1-02-C", period: "Aug 2026", amount: 5800, status: "paid" },
  { id: "mb3", billNo: "MB-2026-0810", unit: "T2-01-D", period: "Jul 2026", amount: 5400, status: "overdue" },
  { id: "mb4", billNo: "MB-2026-0809", unit: "OP-01-B", period: "Aug 2026", amount: 12400, status: "issued" },
];

export const serviceTickets: ServiceTicket[] = [
  { id: "t1", ticketNo: "TK-2026-118", customer: "Rohan Mehta", category: "Plumbing", priority: "high", status: "in_progress", ageDays: 2 },
  { id: "t2", ticketNo: "TK-2026-117", customer: "Karthik Reddy", category: "Power backup", priority: "urgent", status: "open", ageDays: 1 },
  { id: "t3", ticketNo: "TK-2026-116", customer: "Divya Menon", category: "Painting touch-up", priority: "low", status: "resolved", ageDays: 4 },
  { id: "t4", ticketNo: "TK-2026-115", customer: "Priya Sharma", category: "Appliances", priority: "medium", status: "in_progress", ageDays: 3 },
];

// =============================================================================
// RENTAL OPERATIONS
// =============================================================================

export type LeaseStatus = "draft" | "pending_signature" | "active" | "terminated" | "expired";

export interface Lease {
  id: string;
  leaseNo: string;
  unit: string;
  tenant: string;
  start: string;
  end: string;
  monthlyRent: number;
  escalationPct: number;
  deposit: number;
  status: LeaseStatus;
}

export interface RentInvoice {
  id: string;
  invNo: string;
  unit: string;
  tenant: string;
  month: string;
  amount: number;
  due: string;
  status: "issued" | "paid" | "overdue";
}

export const leases: Lease[] = [
  { id: "ls1", leaseNo: "LSE-2026-014", unit: "T1-06-A · Elevate", tenant: "Naveen & Co", start: "2026-03-01", end: "2027-02-28", monthlyRent: 85000, escalationPct: 8, deposit: 340000, status: "active" },
  { id: "ls2", leaseNo: "LSE-2026-013", unit: "T1-06-B · Elevate", tenant: "Anil Kapoor", start: "2026-05-01", end: "2027-04-30", monthlyRent: 72000, escalationPct: 0, deposit: 288000, status: "active" },
  { id: "ls3", leaseNo: "LSE-2026-012", unit: "OP-03-A · Opus", tenant: "Zenith Tech Pvt Ltd", start: "2026-04-01", end: "2027-03-31", monthlyRent: 410000, escalationPct: 10, deposit: 1640000, status: "active" },
  { id: "ls4", leaseNo: "LSE-2026-010", unit: "T1-06-C · Elevate", tenant: "Kavita Rao", start: "2025-09-01", end: "2026-08-31", monthlyRent: 68000, escalationPct: 0, deposit: 272000, status: "expired" },
];

export const rentInvoices: RentInvoice[] = [
  { id: "ri1", invNo: "RINV-2026-070", unit: "T1-06-A · Elevate", tenant: "Naveen & Co", month: "Aug 2026", amount: 85000, due: "2026-08-05", status: "paid" },
  { id: "ri2", invNo: "RINV-2026-069", unit: "T1-06-B · Elevate", tenant: "Anil Kapoor", month: "Aug 2026", amount: 72000, due: "2026-08-05", status: "paid" },
  { id: "ri3", invNo: "RINV-2026-068", unit: "OP-03-A · Opus", tenant: "Zenith Tech Pvt Ltd", month: "Aug 2026", amount: 410000, due: "2026-08-07", status: "issued" },
  { id: "ri4", invNo: "RINV-2026-064", unit: "T1-06-B · Elevate", tenant: "Anil Kapoor", month: "Jul 2026", amount: 72000, due: "2026-07-05", status: "overdue" },
];

export const rentalSummary = {
  activeLeases: 3,
  monthlyRentRun: 567000,
  overdueAmount: 72000,
  avgOccupancy: 97.5,
};

// =============================================================================
// INTEGRATED MARKETPLACE
// =============================================================================

export type PartnerCategory = "home_loan" | "interiors" | "legal" | "packers" | "insurance" | "furnishing";

export interface MarketplacePartner {
  id: string;
  name: string;
  category: PartnerCategory;
  city: string;
  rating: number;
  deals: number;
  conversion: number;
  verified: boolean;
}

export interface MarketplaceDeal {
  id: string;
  customer: string;
  partner: string;
  category: PartnerCategory;
  commission: number;
  revenue: number;
  stage: "matched" | "proposal" | "converted" | "closed";
  aiScore: number;
}

export const partnerCategoryMeta: Record<PartnerCategory, { label: string; tone: "primary" | "info" | "success" | "warning" | "danger" | "muted" }> = {
  home_loan: { label: "Home Loan", tone: "primary" },
  interiors: { label: "Interiors", tone: "info" },
  legal: { label: "Legal / Doc", tone: "warning" },
  packers: { label: "Packers & Movers", tone: "success" },
  insurance: { label: "Insurance", tone: "muted" },
  furnishing: { label: "Furnishing", tone: "primary" },
};

export const marketplacePartners: MarketplacePartner[] = [
  { id: "mp1", name: "Axis Bank — Home Loans", category: "home_loan", city: "Bengaluru", rating: 4.5, deals: 12, conversion: 71, verified: true },
  { id: "mp2", name: "Livspace Studio", category: "interiors", city: "Bengaluru", rating: 4.2, deals: 9, conversion: 58, verified: true },
  { id: "mp3", name: "LegitDocs Legal", category: "legal", city: "Bengaluru", rating: 4.7, deals: 14, conversion: 82, verified: true },
  { id: "mp4", name: "DBS Insurance Brokers", category: "insurance", city: "Bengaluru", rating: 4.0, deals: 6, conversion: 44, verified: true },
  { id: "mp5", name: "Agarwal Packers & Movers", category: "packers", city: "Hosur", rating: 3.9, deals: 5, conversion: 52, verified: false },
];

export const marketplaceDeals: MarketplaceDeal[] = [
  { id: "md1", customer: "Rohan Mehta", partner: "Axis Bank — Home Loans", category: "home_loan", commission: 120000, revenue: 12000000, stage: "proposal", aiScore: 94 },
  { id: "md2", customer: "Priya Sharma", partner: "Livspace Studio", category: "interiors", commission: 45000, revenue: 1500000, stage: "converted", aiScore: 88 },
  { id: "md3", customer: "Rajesh Kumar", partner: "LegitDocs Legal", category: "legal", commission: 30000, revenue: 300000, stage: "closed", aiScore: 81 },
  { id: "md4", customer: "Meera Reddy", partner: "DBS Insurance Brokers", category: "insurance", commission: 12000, revenue: 240000, stage: "matched", aiScore: 76 },
];

// =============================================================================
// CHANNEL PARTNER DESK
// =============================================================================

export type PartnerTier = "silver" | "gold" | "platinum";

export interface ChannelPartner {
  id: string;
  name: string;
  agency: string;
  tier: PartnerTier;
  dealsActive: number;
  commissionRate: number;
  payoutYtd: number;
  rating: number;
}

export interface CpDeal {
  id: string;
  dealNo: string;
  partner: string;
  customer: string;
  project: string;
  value: number;
  commission: number;
  stage: "registered" | "verified" | "converted" | "paid";
  duplicate: boolean;
}

export const channelPartners: ChannelPartner[] = [
  { id: "cp1", name: "Sanjay Malhotra", agency: "Malhotra Realty", tier: "platinum", dealsActive: 7, commissionRate: 1.2, payoutYtd: 1840000, rating: 4.8 },
  { id: "cp2", name: "Farida Shaikh", agency: "FS Estates", tier: "gold", dealsActive: 4, commissionRate: 1.0, payoutYtd: 960000, rating: 4.5 },
  { id: "cp3", name: "Vivek Anand", agency: "Anand Properties", tier: "silver", dealsActive: 2, commissionRate: 0.8, payoutYtd: 320000, rating: 4.1 },
  { id: "cp4", name: "Ritu Jindal", agency: "Jindal & Co", tier: "gold", dealsActive: 5, commissionRate: 1.0, payoutYtd: 1210000, rating: 4.6 },
];

export const cpDeals: CpDeal[] = [
  { id: "cpd1", dealNo: "CPD-2026-042", partner: "Malhotra Realty", customer: "Vikram Singh", project: "Elevate Residences", value: 9600000, commission: 115200, stage: "converted", duplicate: false },
  { id: "cpd2", dealNo: "CPD-2026-041", partner: "FS Estates", customer: "Sneha Kulkarni", project: "Opus Business Park", value: 20000000, commission: 200000, stage: "verified", duplicate: false },
  { id: "cpd3", dealNo: "CPD-2026-040", partner: "Anand Properties", customer: "Suresh Patil", project: "Opus Business Park", value: 45000000, commission: 360000, stage: "registered", duplicate: true },
  { id: "cpd4", dealNo: "CPD-2026-039", partner: "Jindal & Co", customer: "Meera Reddy", project: "Verdant Layout", value: 3520000, commission: 35200, stage: "paid", duplicate: false },
];

// =============================================================================
// AI COMMAND CENTER
// =============================================================================

export type AgentKey = "sales" | "construction" | "finance" | "legal" | "procurement" | "customer";

export interface AiAgent {
  key: AgentKey;
  name: string;
  role: string;
  status: "active" | "idle" | "training";
  activeTasks: number;
  successRate: number;
  latencyMs: number;
  lastActivity: string;
}

export interface AiInsight {
  id: string;
  agent: AgentKey;
  tone: "info" | "warning" | "success" | "danger";
  title: string;
  body: string;
  time: string;
}

export interface AgentTask {
  id: string;
  agent: AgentKey;
  title: string;
  target: string;
  status: "running" | "queued" | "done";
  progress: number;
}

export const aiAgents: AiAgent[] = [
  { key: "sales", name: "Sales Agent", role: "Lead scoring · booking engine", status: "active", activeTasks: 4, successRate: 97.2, latencyMs: 480, lastActivity: "Qualified Rohan Mehta (92%)" },
  { key: "construction", name: "Construction Agent", role: "DPR vision · delay alerts", status: "active", activeTasks: 3, successRate: 94.1, latencyMs: 920, lastActivity: "Flagged cement stock below reorder" },
  { key: "finance", name: "Finance Agent", role: "Cash forecasts · reconciliation · reminders", status: "active", activeTasks: 3, successRate: 96.4, latencyMs: 610, lastActivity: "Auto-matched 3 bank transactions · queued payment reminders" },
  { key: "legal", name: "Legal Agent", role: "Clause audits · compliance", status: "idle", activeTasks: 1, successRate: 91.8, latencyMs: 1130, lastActivity: "Audited AFS-2026-0112 clauses" },
  { key: "procurement", name: "Procurement Agent", role: "RFQ scoring · anomaly flags", status: "active", activeTasks: 2, successRate: 95.0, latencyMs: 540, lastActivity: "Flagged facade quote 4.2% above index" },
  { key: "customer", name: "Customer Agent", role: "WhatsApp concierge · reminder emails", status: "training", activeTasks: 1, successRate: 89.5, latencyMs: 760, lastActivity: "Sent overdue-payment reminder emails (Resend)" },
];

export const aiInsights: AiInsight[] = [
  { id: "i1", agent: "sales", tone: "success", title: "Premium 3BHK to clear this quarter", body: "At current velocity (6.2 units/mo), all 8 remaining premium 3BHK units will sell before 30 Sep. Raise price on T2-05 stack by 1.5%.", time: "12m ago" },
  { id: "i2", agent: "construction", tone: "warning", title: "Cement stock below reorder level", body: "Tower 2 plastering needs 480 bags more than current stock. Auto-suggested PO-2026-040 partial replenishment.", time: "18m ago" },
  { id: "i3", agent: "finance", tone: "info", title: "Cash gap of ₹2.1 Cr in Nov", body: "Planned outflow spikes (RMC + facade milestone) exceed collections. Suggest preponing two RERA demand letters.", time: "32m ago" },
  { id: "i4", agent: "procurement", tone: "warning", title: "Vendor quote anomaly detected", body: "Apex Facade quote 4.2% above index. Cross-checked — their delivery rating is 4.7/5, recommend negotiation to index.", time: "1h ago" },
  { id: "i5", agent: "legal", tone: "info", title: "AFS-2026-0112 missing clause", body: "Force majeure clause omitted from draft agreement for Rohan Mehta. Added suggested clause — awaiting counsel review.", time: "2h ago" },
  { id: "i6", agent: "finance", tone: "warning", title: "3 invoices past due — reminders queued", body: "Payment reminder emails drafted for overdue invoices (incl. RINV-2026-064 ₹72,000) and queued via the Resend outbox. First batch sent today.", time: "5m ago" },
];

export const agentTasks: AgentTask[] = [
  { id: "task1", agent: "sales", title: "Re-rank lead queue with new IVR intents", target: "1,048 leads", status: "running", progress: 68 },
  { id: "task2", agent: "construction", title: "Compare DPR photos vs master schedule", target: "T1 · 12 floors", status: "running", progress: 41 },
  { id: "task3", agent: "finance", title: "Reconcile Aug MT940 statement", target: "1,284 rows", status: "queued", progress: 0 },
  { id: "task4", agent: "procurement", title: "Score 4 RFQ responses vs market index", target: "Steel rebar", status: "done", progress: 100 },
  { id: "task5", agent: "finance", title: "Send payment-reminder emails for overdue invoices", target: "3 invoices · Resend", status: "running", progress: 42 },
];

// =============================================================================
// SALES ENGINE
// =============================================================================

export type SalesLeadStage = "new" | "qualified" | "visit_scheduled" | "offer" | "booked" | "won" | "lost";

export const leadStageMeta: Record<SalesLeadStage, { label: string; tone: "muted" | "info" | "primary" | "warning" | "success" | "danger" }> = {
  new: { label: "New", tone: "info" },
  qualified: { label: "Qualified", tone: "primary" },
  visit_scheduled: { label: "Visit Scheduled", tone: "warning" },
  offer: { label: "Offer Out", tone: "warning" },
  booked: { label: "Booked", tone: "success" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "danger" },
};

export type SalesLeadSource = "facebook" | "google_ads" | "whatsapp" | "ivr" | "referral" | "walkin" | "channel";

export const leadSourceMeta: Record<SalesLeadSource, { label: string; tone: "muted" | "info" | "primary" | "warning" | "success" | "danger" }> = {
  facebook: { label: "Facebook", tone: "info" },
  google_ads: { label: "Google Ads", tone: "primary" },
  whatsapp: { label: "WhatsApp", tone: "success" },
  ivr: { label: "IVR", tone: "warning" },
  referral: { label: "Referral", tone: "muted" },
  walkin: { label: "Walk-in", tone: "muted" },
  channel: { label: "Channel Partner", tone: "warning" },
};

export interface SalesLead {
  id: string;
  name: string;
  phone: string;
  source: SalesLeadSource;
  project: string;
  unitType: string;
  budget: number;
  score: number;
  stage: SalesLeadStage;
  assigned: string;
  segment: Segment;
  createdAt: string;
}

// =============================================================================
// CUSTOMER PORTAL · AMENITIES
// =============================================================================

export type AmenityKind =
  | "parking"
  | "charging"
  | "clubhouse"
  | "pool"
  | "gym"
  | "garden"
  | "play"
  | "jogging"
  | "sports"
  | "security"
  | "backup"
  | "lifts"
  | "fire"
  | "water"
  | "stp"
  | "concierge";

export interface UnitAmenity {
  kind: AmenityKind;
  name: string;
  detail?: string;
}

export const unitAmenities: UnitAmenity[] = [
  { kind: "parking", name: "Car Parking", detail: "Lot B-2 · Tower 3 · Level P2" },
  { kind: "charging", name: "EV Charging Slot", detail: "Slot C-04 · Tower 3 · Level P1" },
  { kind: "clubhouse", name: "Clubhouse", detail: "Club Wing · Ground floor" },
  { kind: "pool", name: "Swimming Pool", detail: "Deck 1 · Between Tower 2 & 3" },
  { kind: "gym", name: "Fully-Equipped Gym", detail: "Club Wing · Ground floor" },
  { kind: "garden", name: "Landscaped Gardens", detail: "Central courtyard" },
  { kind: "play", name: "Children's Play Area", detail: "Courtyard · North wing" },
  { kind: "jogging", name: "Jogging Track", detail: "1.2 km · Perimeter ring" },
  { kind: "sports", name: "Indoor Sports Courts", detail: "Club Wing · Level 1" },
  { kind: "security", name: "24×7 Security & CCTV", detail: "Biometric + concierge at all gates" },
  { kind: "backup", name: "Power Backup (DG)", detail: "100% common areas · 10kVA per unit" },
  { kind: "lifts", name: "High-Speed Lifts", detail: "3 lifts per tower · 2.5 m/s" },
  { kind: "fire", name: "Fire Safety Systems", detail: "Sprinklers + NOC (Karnataka Fire & Emergency)" },
  { kind: "water", name: "Rainwater Harvesting", detail: "3 recharge wells" },
  { kind: "stp", name: "Water Treatment (STP)", detail: "120 kLD · Recycled for landscape" },
  { kind: "concierge", name: "Concierge Desk", detail: "Lobby · Tower 1" },
];

export const salesLeads: SalesLead[] = [
  { id: "SL-1188", name: "Rohan Mehta", phone: "+91 98450 11223", source: "facebook", project: "Elevate Residences", unitType: "3BHK", budget: 14000000, score: 92, stage: "offer", assigned: "Arjun Nair", segment: "apartments", createdAt: "2026-08-05T09:12:00" },
  { id: "SL-1187", name: "Priya Sharma", phone: "+91 98110 44556", source: "google_ads", project: "Elevate Residences", unitType: "2BHK", budget: 9800000, score: 84, stage: "visit_scheduled", assigned: "Neha Gupta", segment: "apartments", createdAt: "2026-08-05T08:40:00" },
  { id: "SL-1186", name: "Karthik Reddy", phone: "+91 99860 77889", source: "whatsapp", project: "Opus Business Park", unitType: "office", budget: 46000000, score: 78, stage: "qualified", assigned: "Arjun Nair", segment: "apartments", createdAt: "2026-08-05T07:55:00" },
  { id: "SL-1185", name: "Ananya Iyer", phone: "+91 98400 33445", source: "ivr", project: "Elevate Residences", unitType: "3BHK", budget: 14200000, score: 71, stage: "new", assigned: "Unassigned", segment: "apartments", createdAt: "2026-08-05T07:20:00" },
  { id: "SL-1184", name: "Vikram Singh", phone: "+91 98220 55667", source: "channel", project: "Elevate Residences", unitType: "2BHK", budget: 9600000, score: 66, stage: "booked", assigned: "Neha Gupta", segment: "apartments", createdAt: "2026-08-04T18:05:00" },
  { id: "SL-1183", name: "Sneha Kulkarni", phone: "+91 90080 66778", source: "walkin", project: "Opus Business Park", unitType: "retail", budget: 20000000, score: 58, stage: "new", assigned: "Unassigned", segment: "apartments", createdAt: "2026-08-04T17:30:00" },
  { id: "SL-1182", name: "Aditya Joshi", phone: "+91 98330 88990", source: "google_ads", project: "Elevate Residences", unitType: "3BHK", budget: 13800000, score: 88, stage: "won", assigned: "Arjun Nair", segment: "apartments", createdAt: "2026-08-04T15:10:00" },
  { id: "SL-1181", name: "Farhan Ali", phone: "+91 98190 22334", source: "referral", project: "Elevate Residences", unitType: "2BHK", budget: 9500000, score: 52, stage: "lost", assigned: "Neha Gupta", segment: "apartments", createdAt: "2026-08-03T11:45:00" },
  { id: "SL-1180", name: "Divya Menon", phone: "+91 98860 11223", source: "ivr", project: "Elevate Residences", unitType: "3BHK", budget: 14300000, score: 74, stage: "qualified", assigned: "Arjun Nair", segment: "apartments", createdAt: "2026-08-03T10:22:00" },
  { id: "SL-1179", name: "Rajesh Kumar", phone: "+91 98470 22331", source: "whatsapp", project: "Land · Sarjapura", unitType: "Land parcel", budget: 180000000, score: 81, stage: "offer", assigned: "Arjun Nair", segment: "land", createdAt: "2026-08-05T10:02:00" },
  { id: "SL-1178", name: "Meera Reddy", phone: "+91 90000 44556", source: "google_ads", project: "Verdant Layout", unitType: "Plot", budget: 2600000, score: 67, stage: "visit_scheduled", assigned: "Neha Gupta", segment: "land", createdAt: "2026-08-04T12:15:00" },
];
