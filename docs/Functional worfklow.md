# EstateFlow AI — User Manual

**Product:** EstateFlow — India's first AI-powered, multi-tenant End-to-End Real Estate Operating System
**Version:** Demo (web application)
**Audience:** All user groups — Management, Sales, Construction, Finance, HR, and Customers

---

## 1. About EstateFlow

EstateFlow is a single operating system for real estate developers. It combines CRM, sales,
construction ERP, finance and compliance, HR, customer self-service, facility management,
rentals, and an integrated marketplace — with AI agents that act across every module.

Every customer (a **builder/developer**) gets their own **tenant workspace** (e.g., *Builder A
Homes*, *GreenAcre Developers*, *Aarav Towers*). Data is isolated per tenant, and the workspace
is accessed from a subdomain such as `builder-a.estateflow.in`.

### 1.1 User groups covered in this manual

| Group | Typical roles | What they use |
|---|---|---|
| **Management** | VP Sales & Ops, Director, CXO | Executive Dashboard, Legal & RERA, AI Command Center |
| **Sales** | Sales Executive, Channel Partner Manager | Sales Engine, Inventory, Land Portfolio, Leads, Quotes, Marketplace, Partners |
| **Construction** | Site Engineer, Project Manager | Construction & DPR, Procurement |
| **Finance** | Accounts Lead, Finance Manager | Finance & Collections, Rental Operations |
| **HR** | HR Admin, Compliance Officer | HR & Contract Labour |
| **Customer** | Unit / Plot Owner | Customer Portal, Facility & Society Ops |

---

## 2. Logging In & Your Workspace

### 2.1 Sign in

1. Open your company subdomain (e.g., `builder-a.estateflow.in`) in a browser.
2. Enter your work email and password on the login screen.
3. If you have forgotten your password, use **Forgot password** on the login page. You will
   receive a reset link on your registered email.

### 2.2 Switching tenant (multi-company users)

Users who manage more than one company can switch workspaces from the **Tenant** dropdown at the
top of the left sidebar. Choose a company to load that company's data and subscription plan.

### 2.3 Switching your role (persona)

The **Persona** dropdown on the left sidebar lets you switch the navigation to a specific role's
view — e.g., *Sales*, *Construction*, *Finance*, *Customer*. This helps each user see only the
modules relevant to them.

### 2.4 Global elements

- **Sidebar navigation** — grouped by department: Management, Sales, Construction, Finance, HRMS, Customer.
- **Top bar** — global search, **AI Online** indicator, notifications bell, and your profile chip.
- **Footer** — confirms the active tenant and its data region (data stays in India, per DPDP 2023).

---

## 3. Subscriptions at a Glance

A tenant subscribes to one of three plans. The plan decides which **segments** the tenant works
with (land, apartments, or both) and therefore which modules are available.

| Plan | Price | Segment | Best for |
|---|---|---|---|
| **Land Portfolio** | ₹49,999/mo | Land | Land acquisition, titles & plotted development |
| **Homes & Towers** | ₹39,999/mo | Apartments | Residential/commercial tower projects |
| **Land + Homes (Enterprise)** | ₹79,999/mo | Land + Apartments | The complete real estate OS |

### 3.1 Module availability by plan

| Module | Land | Homes | Enterprise |
|---|:---:|:---:|:---:|
| Executive Dashboard | ✅ | ✅ | ✅ |
| Sales Engine | ✅ | ✅ | ✅ |
| Inventory Heat Map | — | ✅ | ✅ |
| Land Portfolio | ✅ | — | ✅ |
| Lead Pipeline | ✅ | ✅ | ✅ |
| Quotations & Approvals | ✅ | ✅ | ✅ |
| Construction & DPR | — | ✅ | ✅ |
| Procurement & Vendors | ✅ | ✅ | ✅ |
| Finance & Collections | ✅ | ✅ | ✅ |
| Legal & RERA | ✅ | ✅ | ✅ |
| HR & Contract Labour | ✅ | ✅ | ✅ |
| Customer Portal | ✅ | ✅ | ✅ |
| Facility & Society Ops | ✅ | ✅ | ✅ |
| Rental Operations | ✅ | ✅ | ✅ |
| Marketplace | ✅ | ✅ | ✅ |
| Channel Partners | ✅ | ✅ | ✅ |
| AI Command Center | ✅ | ✅ | ✅ |

> **Enterprise advantage:** cross-portfolio executive dashboard (homes + land in one view),
> priority AI agents, advanced analytics, and a dedicated success manager.

The rest of this manual is organised **by user group**. For each group, the sections show what is
available in each subscription and how to complete day-to-day tasks.

---

## 4. Management (VP Sales & Ops)

**Available modules:** Executive Dashboard, Legal & RERA, AI Command Center — on all three plans.

### 4.1 Executive Dashboard

A single screen with the health of the entire company:

- **KPIs** — pipeline value, bookings won, cash position, and open alerts, with trend deltas.
- **Cash Flow Forecast** — projected inflows vs. outflows in ₹ Cr. Click **Report** for details.
- **Inventory / Land Mix** — live share of unit statuses (or land statuses), by tenant segment.
- **Land summary** — total acres, average rate/acre, value realised, and title-verification
  queue (Land Portfolio / Enterprise plans).
- **Deals in pipeline** — leads flowing in from WhatsApp and IVR channels.
- **Enquiry velocity** — bar chart of enquiries over time.
- **Project health** — per-tower progress bars including RERA disclosure status (Homes /
  Enterprise), or land title health (Land / Enterprise).
- **Approval queues** — quotes waiting for discount approval.
- **Natural-language bar** — ask questions in plain English (see §4.3).
- **AI Sales Agent** — live chat panel that shows what the bot is doing for customers.

**Common tasks**

- *Review the company's health:* check KPI cards and cash flow each morning.
- *Check a tower's build status:* scroll to **Project Health** and review per-tower progress and
  RERA disclosures.
- *Approve a discount:* open the **Approval queue** from the dashboard.

### 4.2 Legal & RERA

Ownership of titles, agreements, and compliance:

- **Agreements & allotment letters** — every contract with e-Sign status and DigiLocker sync status.
- **Compliance calendar** — upcoming RERA filings and deadlines.
- **RERA project registrations** — registration number, authority, validity, and quarterly
  disclosure progress bars.
- **Litigations & title review** — case number, court, next hearing, and summary.

**Common tasks**

- *Run a clause audit:* click **AI clause audit** to scan draft agreements for missing clauses.
  Review the AI suggestions and share them with counsel.
- *Track a filing:* open the relevant RERA registration card and confirm the quarterly
  disclosure progress.

### 4.3 Asking questions in plain English

On the dashboard or the AI Command Center, type a question such as *"Which towers are behind
schedule?"* or *"Show sales this quarter by project."* The AI:

1. Understands the question,
2. Generates a read-only SQL query against the tenant's data (only your tenant — nothing
   cross-tenant),
3. Returns a plain-English summary and a structured result table.

Every query is audit-logged. You cannot modify data through this interface.

### 4.4 AI Command Center

Fleet-level view of every AI agent working for the company:

- **Agent fleet** — status, role, active tasks, success rate, and latency of each agent (Sales,
  Construction, Finance, Procurement, Legal, Customer).
- **Insights feed** — intelligence generated by agents, colour-coded by severity.
- **Active workflows** — Temporal workflows in flight, with progress bars and execution logs.
- **Voice briefing** — get a spoken summary of agent status and alerts.

---

## 5. Sales (Sales Executive & Channel Partner Manager)

**Available modules:** Sales Engine, Inventory Heat Map (Homes/Enterprise), Land Portfolio
(Land/Enterprise), Lead Pipeline, Quotations & Approvals, Marketplace, Channel Partners — on all plans.

### 5.1 Sales Engine

Your daily pipeline overview:

- KPIs: active pipeline value, won YTD, win rate, average response time.
- **Pipeline funnel** — how many leads sit at each stage, with conversion percentages.
- **Source mix** — where enquiries come from (Facebook, Google Ads, WhatsApp, IVR).
- **Lead queue** — AI-scored leads with budget, owner, and source.
- **Booking velocity** — bookings over time.

**Common task:** *Re-prioritise your day* — click **AI re-rank queue** to re-score the queue and
work the hottest leads first.

### 5.2 Inventory Heat Map *(Homes & Towers and Enterprise plans)*

A colour-coded map of every apartment unit, floor by floor.

**Unit status colours:**

| Status | Colour | Meaning |
|---|---|---|
| Available | Green | Open for sale |
| Blocked | Yellow | Held / tentative |
| Token Paid | Blue | Token received |
| Sold | Red | Sold |
| Under Maintenance | Grey | Not on sale |

**Common tasks**

1. Choose a **project** and **tower** from the filters.
2. Click any unit to see carpet area, status, base price, and the AI Sales Agent's demand note.
3. Click **Generate Quote** — the unit is locked with a **15-minute hold** so nobody can
   double-book it.
4. For serious buyers, click **Book Visit**.

### 5.3 Land Portfolio *(Land Portfolio and Enterprise plans)*

Manage land parcels and plotted layouts:

- KPIs: total acres, average rate/acre, available parcels, title-verification queue.
- **Land Parcels tab** — parcel cards with village, district, survey number, zoning, title
  status, extent, rate/acre, and value.
- **Plot Layouts tab** — status-coloured plots within each layout.
- **Detail panel** — title status, zoning, consideration, documents, seller, and the AI Legal
  Agent's note.

**Common tasks**

1. *Evaluate a parcel:* open a parcel card and review the AI Legal Agent note on title.
2. *Generate a quote:* click **Generate Quote** (a 2% discount is pre-applied). The parcel/plot
   gets a 15-minute hold; discounts over 5% route to Management for approval.
3. *Arrange a visit:* click **Book Site Visit**.

### 5.4 Lead Pipeline

All inbound leads (Facebook, Google Ads, WhatsApp, IVR):

- **Status tabs** — New, Contacted, Qualified, Visit Scheduled, Booking, Won, Lost.
- **Lead table** — phone, Home/Land segment, source, project, budget, AI score %, status,
  assigned owner, AI-engaged flag.
- **Detail panel** — budget, intent, AI Sales Agent summary, and recommended *next best actions*.

**Common tasks**

1. *Take a new lead:* open the lead, review the AI summary, then click **Move to Qualified** once
   you have qualified them.
2. *Reassign work:* use **Round-robin / Reassign** to hand a lead to another executive.
3. *Close the loop:* click **Mark Lost** when a lead is no longer active.
4. *Refresh scoring:* click **Run AI scoring** to re-score the pipeline.

### 5.5 Quotations & Approvals

Create quotes for apartments and land, with a built-in approval workflow:

- **Rule:** a discount of **> 5%** pauses the booking and routes the quote to Management for
  approval. Below 5%, the quote proceeds as a draft.
- **Approval queue** — pending discount approvals with **Approve / Reject**.
- **Quote table** — every quote with base amount, discount, total, status, and date.

**Common tasks**

1. *Create a quote:* click **New Quotation**, choose the segment (Apartments or Land), pick the
   project + unit (or land asset), enter the customer name and discount %, and review the live
   price breakdown.
2. *If the discount is > 5%,* submit for approval. Watch for the approval banner.
3. *As Management:* open the approval queue and Approve or Reject.

### 5.6 Marketplace

Commission-led revenue from verified partners (home loans, interiors, legal, movers):

- **Deal pipeline** — customer-to-partner matches with AI match score and stage.
- **Partner directory** — verified partners with ratings, deals, and conversion.

**Common task:** *Match a customer:* click **AI match deal** to pair a customer with the best
partner and auto-send a proposal.

### 5.7 Channel Partners

Deals registered by external channel partners/brokers:

- **CP deals** — deal number, partner, customer, project, value, commission, stage, duplicate flag.
- **Partner tiers** — Silver/Gold/Platinum partners with commission rate and payout YTD.

**Common task:** *Register a deal:* click **AI register deal** — the system cross-checks for
duplicates against closed deals and estimates commission.

---

## 6. Construction (Site Engineer & Project Manager)

**Available modules:** Construction & DPR (Homes/Enterprise), Procurement & Vendors (all plans).

### 6.1 Construction & DPR *(Homes & Towers and Enterprise plans)*

Track milestones and daily progress reports (DPR) filed from the site engineer's mobile app:

- **KPIs** — overall progress %, site labour, concrete cast/week, AI flags.
- **Milestone timeline** — Foundation, Podium, Structure to Floor 3, and beyond, each with status
  (Completed / On Track / At Risk / Pending / Delayed) and progress bar.
- **Per-tower stats** — progress, labour, concrete (m³), and days ahead/behind.
- **AI Site Agent** — flags material shortages and schedule risks automatically.
- **DPR table** — daily entries with progress %, labour, concrete, engineer note, and photo.

**Common tasks**

1. *File/review the day's DPR:* open the latest entry and check the engineer's note against
   planned progress.
2. *Review the AI flag:* if the AI Site Agent warns of a material shortage, escalate through your
   manager.
3. *View site photos:* toggle **Show site photos** to see the gallery synced from site.

### 6.2 Procurement & Vendors

End-to-end RFQ → PO → GRN → invoice matching:

- **KPIs** — open RFQs, active POs + committed value, match exceptions, AI savings YTD.
- **RFQ pipeline** — each line item with deadline, responses, best rate vs. market index,
  variance %, and AI anomaly flags.
- **Purchase orders** — vendor, value, status, AI-drafted vs. manual.
- **GRN & 3-way matching** — PO ↔ GRN ↔ vendor invoice, with variance % and exceptions.

**Common tasks**

1. *Draft a PO:* when an RFQ is awarded, click **AI draft PO** to generate the purchase order
   from the winning response.
2. *Check for anomalies:* review the RFQ table for AI anomaly flags (price far above market
   index) before buying.

---

## 7. Finance (Accounts Lead & Finance Manager)

**Available modules:** Finance & Collections, Rental Operations — all plans.

### 7.1 Finance & Collections

Escrow-based collections with automated bank reconciliation:

- **KPIs** — quarterly collections, unreconciled inflow, auto-match rate, unmatched items.
- **Cash flow forecast** and **collections by quarter** charts.
- **Bank statement reconciliation** — each MT940 line (reference, date, description, amount,
  in/out) with match confidence and matched/unmatched status.

**Common tasks**

1. *Match a payment:* click **AI auto-match** (or the per-row **Suggest** button) to reconcile an
   unidentified NEFT against the customer ledger. Confidence rises automatically.
2. *Close exceptions:* work through the unmatched rows until the queue is clean before month-end.

### 7.2 Rental Operations *(all plans)*

Lease and rent management for completed inventory:

- **KPIs** — active leases, monthly rent run, overdue rent, occupancy %.
- **Lease register** — lease no, unit, tenant, term, rent/month, escalation %, deposit, status.
- **Rent invoices** — auto-generated monthly invoices with due dates and payment status.

**Common task:** *Chase arrears:* click **AI rent reminders** to send WhatsApp reminders to
overdue tenants (UPI payment references confirm automatically).

---

## 8. HR & Contract Labour (HR Admin / Compliance Officer)

**Available modules:** HR & Contract Labour — all plans.

### 8.1 Site Attendance

Biometric + geofenced attendance from the site:

- KPIs: present/total staff, on-time %, contract labour active, monthly wage run.
- **Attendance table** — employee, role, department, check-in time, geo-verified badge, and
  status (Present / Late / Absent / On Leave).

### 8.2 Contract Labour Register

- Worker name, contractor (vendor), role, daily wage, attendance %, active/inactive status.

**Common tasks**

1. *Verify attendance integrity:* click **AI geofence sweep** to check that all check-ins happened
   inside the site boundary; out-of-radius check-ins are flagged.
2. *Maintain the register:* keep worker and contractor records current so compliance reports
   (e.g., Form 5C) are accurate.

---

## 9. Customer (Unit / Plot Owner)

**Available modules:** Customer Portal, Facility & Society Ops — all plans (portal features apply
to the customer's booked unit or plot).

The Customer Portal is your self-service home. From the greeting header you can check your
**loyalty points/tier**, **KYC status**, and switch the interface language (English, हिन्दी,
ಕನ್ನಡ, தமிழ்).

### 9.1 Overview tab

- Your unit facts (unit number, project, type, carpet area, floor, consideration).
- Project construction progress and the latest site photo.
- Your **next payment due** with a **Pay now** action.
- A feed of the latest project updates.

### 9.2 Site Updates tab

- Photo/video gallery of the project, with video playback and full-screen lightbox.

### 9.3 Payments tab

- **Tax statement (GST)** — base amount, CGST, SGST, IGST, TDS and total; printable.
- **Statement of account** — every receipt with number, date, description, amount, and mode.
- **Milestone payment schedule** — each installment with due date, amount, and paid status.
- **Pay online** — select an installment, choose UPI or card, and pay. A receipt is generated
  immediately and reflected in the statement.

### 9.4 Documents tab

- Executed documents (e.g., Agreement for Sale, RERA registration) with e-Sign status.
- Click a document to open the print window and save a PDF copy.

### 9.5 Amenities tab

- The list of amenities included with your unit (clubhouse, pool, gym, co-working, and more).

### 9.6 Home Loans tab

- **EMI calculator** — adjust amount, interest rate, and tenure to estimate your monthly payment.
- **Bank partners** — verified home-loan partners (e.g., Axis, HDFC) with their offers and an
  **Apply** link.
- Other partner services available to you.

### 9.7 Events tab

- Upcoming homeowner events with date, location, capacity, and description.
- **RSVP** as *Going*, *Interested*, or *Declined* — you can change your response later.

### 9.8 Support tab

- **Raise a request** — choose a category (Plumbing, Electrical, Snagging, Appliances, Interiors,
  Other), a priority, subject, and description.
- **Ticket thread** — open a ticket to view the conversation, **add comments**, and **escalate**
  for urgent help.
- **KYC verification** — if KYC is pending, complete it with your PAN and last 4 digits of
  Aadhaar. Your status updates to *verified* immediately.
- Contact the support desk by phone or WhatsApp.

### 9.9 Possession tab

- **Handover checklist** — review each possession step (structure completion, occupancy NOC,
  etc.) and **sign off** as each is completed.
- **Snag list** — any outstanding snags you have raised.
- **Warranty & handover documents** — structural and fittings warranties, plus the handover
  letter.

### 9.10 Rewards tab

- **Referral program** — your unique code, the reward per referral, and how much you have earned.
  **Copy** the code or **share via WhatsApp**.
- **Loyalty tier** — your points, tier (Member / Silver / Gold / Platinum), and perks.
- **Referred friends** — status of each referral (site visit, booked, converted).
- **Owner marketplace** — publish your own **sale or rent listing** for the community. Enter a
  title, description, and price, then publish.

### 9.11 Facility & Society Ops

For built projects, society management also surfaces to the customer side:

- **AMC contracts** — what is covered, the vendor, and when it renews.
- **Visitor gate log** — who checked in, which unit, and whether it was QR-verified.
- **Maintenance billing** — monthly society maintenance bills and their status.
- **Service tickets** — after-sales tickets and their status.

**Common tasks**

1. *Pay an installment:* Payments tab → choose the due installment → **Pay online** → confirm. Your
   receipt appears instantly.
2. *Download a document:* Documents tab → click the document → print / save as PDF.
3. *Raise a snag:* Support tab → **New request** → category *Snagging* → describe the issue → submit.
4. *Earn a reward:* share your referral code on WhatsApp and track conversions in **Rewards**.

---

## 10. AI Everywhere — Common Cross-Role Notes

AI agents work across every module and user group. Key behaviours to understand:

- **Read-only intelligence:** natural-language queries and AI analyses never modify data unless a
  dedicated, RBAC-checked action button is used.
- **Tenant isolation:** every AI call, query, and vector search is scoped to your tenant only.
- **Human-in-the-loop:** high-impact actions (discount approvals, contractual changes) always
  pause for a human decision.
- **Auditability:** AI-generated SQL, agent actions, and workflow runs are logged for review.

### 10.1 When things need a human

| Situation | Who decides | Where |
|---|---|---|
| Discount > 5% on a quote | Management | Quotations & Approvals approval queue |
| Material shortage flagged by AI Site Agent | Construction manager | Construction & DPR |
| Out-of-radius attendance check-in | HR admin | HR & Contract Labour |
| Duplicate channel-partner deal | Sales manager | Channel Partners |

---

## 11. Frequently Asked Questions

**Q. I don't see the Land Portfolio / Inventory Heat Map module.**
These modules depend on your subscription segment. Land Portfolio requires the Land Portfolio or
Enterprise plan; Inventory Heat Map and Construction & DPR require Homes & Towers or Enterprise.
Contact your administrator to change the plan.

**Q. A unit I want to quote shows as locked.**
Units are held for 15 minutes once a quote is generated, to prevent double-booking. Wait for the
hold to expire or contact the sales executive who holds it.

**Q. Can I change a customer's language in the portal?**
Yes — from the greeting header on the Customer Portal, use the language selector (English,
हिन्दी, ಕನ್ನಡ, தமிழ்).

**Q. How do I download my GST statement?**
Payments tab → GST statement → **Print / Save as PDF**.

**Q. Where do pending approvals appear?**
Management sees them on the Executive Dashboard (Approval queues) and in Quotations & Approvals.

**Q. Is my data visible to other companies?**
No. Every tenant's data is isolated (schema-per-tenant) and AI is scoped per tenant.

---

*EstateFlow — Data resides in India (AWS ap-south-1) in compliance with DPDP Act 2023 and RERA.*
