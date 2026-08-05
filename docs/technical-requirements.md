# EstateFlow — Formal Technical Requirements (TRD)

**Product:** EstateFlow — India's first AI-powered, multi-tenant End-to-End Real Estate Operating System
**Source:** `docs/prd.md` (v1.0)
**Status:** Draft
**Audience:** Engineering, Architecture, QA, DevOps, Product

---

## 1. Introduction

### 1.1 Purpose
This document defines the formal technical requirements derived from the EstateFlow Product Requirements Document (PRD). It specifies the system architecture, functional capabilities per module, non-functional constraints, integration obligations, and the database design. Requirements are uniquely identified for traceability and acceptance testing.

### 1.2 Scope
- Vertical SaaS platform spanning CRM, ERP, Finance, Legal, HR, Customer portals, Facility Management, Rental, and Marketplace.
- Multi-tenant (builder-tenant) deployment with per-tenant database schema isolation.
- Deep multi-agent AI layer built on LangGraph.
- Flutter mobile applications for 7 user personas.
- India-specific compliance: RERA, DPDP Act 2023, GST (CGST/SGST/IGST), TDS.

### 1.3 Out of Scope
- Payment gateway certification (Razorpay/Cashfree perform certification).
- Hardware design of biometric devices (integration only).
- Aadhaar/UIDAI backend (consumed via authorized gateway only).

### 1.4 Conventions
- Priority: **M** = Must (release-blocking), **S** = Should, **C** = Could.
- Requirement IDs: `TR-<module>-<NNN>`.

---

## 2. Overall Architecture

### 2.1 Multi-Tenancy Model
- **Isolation:** Hybrid "Bridge" model on PostgreSQL. Each tenant receives its own database schema within the tenant database; a shared `public` (control-plane) schema holds tenant registry, identity, and cross-tenant routing metadata.
- **Routing:** Dynamic subdomain resolution (e.g., `builder-a.estateflow.in`) via an API gateway / reverse proxy that resolves tenant → schema and serves tenant-specific branding assets.
- **Isolation guarantees:** No cross-schema data leakage; tenant-scoped connection pooling; per-tenant backup/restore capability.
- **Vector isolation:** pgvector embeddings partitioned by tenant metadata tags or dedicated indices; no cross-tenant vector query leakage.

### 2.2 Technology Stack (mandated by PRD)
| Layer | Technology |
|---|---|
| Frontend (Web) | Next.js 15, React 19, Tailwind CSS |
| Backend | .NET 9 Web API (C#) |
| Database / ORM | PostgreSQL 16+, EF Core |
| Cache / Messaging | Redis (session/cache/locks), Kafka (or RabbitMQ) |
| Orchestration | Temporal |
| AI Orchestration | LangGraph, Semantic Kernel |
| LLMs | GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro |
| Vector DB | pgvector (primary) or Chroma |
| Mobile | Flutter (single codebase) |
| Identity | Keycloak or Microsoft Entra ID (OAuth2/OIDC, multi-tenant RBAC) |
| Infra | AWS (ap-south-1) or Azure (centralindia); Kubernetes |

### 2.3 Component Topology (Conceptual)

```
[ Clients: Web / Flutter Apps / WhatsApp / IVR / Partner APIs ]
                    │
            [ EstateFlow Gateway / Reverse Proxy ]   ← subdomain routing, TLS, ZTNA
                    │
      ┌─────────────┼──────────────┐
      │             │              │
[ .NET 9 API ] [ AI/LangGraph ] [ Temporal Workers ]
      │             │              │
[ PostgreSQL (per-tenant schemas + pgvector) ]  [ Redis ]  [ Kafka/RabbitMQ ]  [ S3-compatible Storage ]
```

---

## 3. Functional Requirements

### 3.1 CRM & Omnichannel Lead Management (Epic 1)

| ID | Requirement | Priority |
|---|---|---|
| TR-CRM-001 | Ingest leads from Facebook Ads, Google Ads, WhatsApp Business, and IVR via webhook/API endpoints. | M |
| TR-CRM-002 | Publish a `Lead_Ingested` event to Kafka/RabbitMQ on every lead ingestion. | M |
| TR-CRM-003 | AI Lead Scoring engine computes a predictive score using budget, location intent, and historical conversion data. Score must be persisted and re-calculable. | M |
| TR-CRM-004 | Temporal workflow assigns lead to Sales Executive using dynamic round-robin rules; must respect work-hours and capacity. | M |
| TR-CRM-005 | Maintain full lead lifecycle state (New → Contacted → Qualified → Lost → Won) with audit trail of state transitions. | M |
| TR-CRM-006 | Deduplicate leads (phone/email/WhatsApp ID) across sources before insertion. | S |
| TR-CRM-007 | Expose lead queue to Sales mobile app with click-to-call. | M |
| TR-CRM-008 | AI Sales Agent (WhatsApp + Twilio Voice AI) converses in English, Hindi, and regional languages, qualifies intent, answers pricing FAQs, and books site visits via authorized API endpoints. | M |

### 3.2 Property & Inventory Lifecycle (Epic 2)

| ID | Requirement | Priority |
|---|---|---|
| TR-INV-001 | Model hierarchical inventory: Project → Tower → Floor → Block → Unit. | M |
| TR-INV-002 | Unit states: Available (Green), Blocked (Yellow), Sold (Red), Token Paid (Blue); extensible status set. | M |
| TR-INV-003 | Real-time Interactive Inventory Heat Map rendering with dynamic state colors; state changes must propagate within 1s of commit. | M |
| TR-INV-004 | Concurrency lock: when a quotation is generated, Redis locks the Unit ID for 15 minutes to prevent double-booking; lock is renewable/expiring and auditable. | M |
| TR-INV-005 | Maintain unit status history for legal/audit and analytics. | M |
| TR-INV-006 | Inventory changes must be serialized per unit; optimistic concurrency control at the database level as backstop. | M |

### 3.3 Sales, Quotations & Collections (Epic 3)

| ID | Requirement | Priority |
|---|---|---|
| TR-SAL-001 | Dynamic payment schedule generation compliant with construction milestones or time-linked plans. | M |
| TR-SAL-002 | Automated discount approval: if discount > 5%, a Temporal workflow halts the booking and routes an approval notification to the VP of Sales mobile app. | M |
| TR-SAL-003 | Digital quote builder supporting multiple configurations and price lists per project/tower/floor. | M |
| TR-SAL-004 | Booking workflow: quotation → booking confirmation → token payment collection → agreement. | M |
| TR-SAL-005 | Payment schedule generation must produce amortized schedules with due dates, amounts, taxes, and milestone linkage. | M |
| TR-SAL-006 | Track bookings per unit ensuring 1:1 unit–booking constraint. | M |

### 3.4 Construction ERP & Site Operations (Epic 4)

| ID | Requirement | Priority |
|---|---|---|
| TR-CON-001 | BOQ enforcement: material/quantity tracking per project with authorized BOQ limits. | M |
| TR-CON-002 | Track labor, equipment, and daily progress on site. | M |
| TR-CON-003 | Site engineers log Daily Progress Reports (DPR) via Flutter Construction App, including offline mode. | M |
| TR-CON-004 | Upload site images to S3-compatible storage; image metadata updates the master project timeline. | M |
| TR-CON-005 | Material verification via QR/Barcode scanning; quantity checked against BOQ before GRN acceptance. | M |
| TR-CON-006 | Digital incident reporting for safety and site issues. | M |
| TR-CON-007 | AI Construction Agent (Claude 3.5 Sonnet Vision) analyzes site photos + DPR vs. master schedule; detects delays, alerts material shortages, adjusts estimated completion dates. | M |
| TR-CON-008 | Master project timeline (Gantt) updated from DPR, milestones, and AI predictions. | S |

### 3.5 Procurement & Vendor Management (Epic 5)

| ID | Requirement | Priority |
|---|---|---|
| TR-PRO-001 | Automate RFQ lifecycle: create → publish → collect responses → evaluate → award → PO. | M |
| TR-PRO-002 | Goods Received Notes (GRN) recorded against POs with quantity validation against authorized BOQ limits. | M |
| TR-PRO-003 | Safety check: quantity ordered must not exceed authorized BOQ limit without management approval workflow. | M |
| TR-PRO-004 | Two/three-way invoice matching: PO ↔ GRN ↔ vendor invoice with exception flagging. | M |
| TR-PRO-005 | Vendor onboarding, ratings, and historical quality tracking. | M |
| TR-PRO-006 | AI Procurement Agent evaluates RFQ responses on price, delivery time, and vendor quality; drafts optimal POs and flags price anomalies vs. market indices. | S |

### 3.6 Finance & Indian Compliance (Epic 6)

| ID | Requirement | Priority |
|---|---|---|
| TR-FIN-001 | Full-stack double-entry accounting (chart of accounts, journals, ledgers, receivables/payables). | M |
| TR-FIN-002 | Split tax rules: automatic CGST/SGST (intra-state) and IGST (inter-state) calculation on invoices. | M |
| TR-FIN-003 | TDS calculation under Section 194-IA for properties > ₹50 Lakhs; TDS deduction and certificate tracking. | M |
| TR-FIN-004 | Bank e-statement parsing (MT940/CAMT) to auto-match collections against pending customer invoices. | M |
| TR-FIN-005 | Reconciliation engine matches bank statement transactions to receipts/invoices with confidence scoring; unresolved items enter exception queue. | M |
| TR-FIN-006 | ERP sync (SAP/Tally Prime) for general ledger, asset valuations, and tax reports. | S |
| TR-FIN-007 | AI Finance Agent: cash-flow forecasting and budget variance alerts against BOQ baselines. | M |
| TR-FIN-008 | Payment gateway integration (Razorpay/Cashfree) for token bookings, maintenance dues, rental deposits. | M |

### 3.7 Legal & RERA Compliance (Epic 7)

| ID | Requirement | Priority |
|---|---|---|
| TR-LEG-001 | Manage land titles, litigation history, and ownership chain per project. | M |
| TR-LEG-002 | Mandatory quarterly RERA progress disclosures with submission tracking and filing reminders. | M |
| TR-LEG-003 | RERA project registration status sync via official portals/APIs. | M |
| TR-LEG-004 | Automated synchronization of final Agreements for Sale to DigiLocker via national API gateway. | M |
| TR-LEG-005 | AI Legal Agent (RAG over pgvector): scan vendor contracts and client agreements for missing clauses, liability risks, and RERA compliance. | M |
| TR-LEG-006 | E-signature execution for digital agreements (with audit trail). | M |

### 3.8 HR & Contract Labour (Epic 8)

| ID | Requirement | Priority |
|---|---|---|
| TR-HRM-001 | On-site attendance validation via biometric hardware integration. | M |
| TR-HRM-002 | Geofenced facial recognition attendance via Flutter Construction App. | M |
| TR-HRM-003 | Maintain contract labour registry with engagement contracts and daily attendance. | M |
| TR-HRM-004 | Attendance records must be tamper-evident (signed/timestamped server-side). | S |

### 3.9 Customer & Tenant Portals (Epic 9)

| ID | Requirement | Priority |
|---|---|---|
| TR-CUS-001 | Customer self-service: track construction progress via live video/photo feeds. | M |
| TR-CUS-002 | Download payment receipts and tax invoices. | M |
| TR-CUS-003 | Log maintenance tickets and track resolution. | M |
| TR-CUS-004 | Sign digital agreements (e-sign). | M |
| TR-CUS-005 | AI Customer Agent over WhatsApp: payment schedule queries, construction photo links, invoice follow-ups in personalized language. | M |

### 3.10 Facility Management & Society Operations (Epic 10)

| ID | Requirement | Priority |
|---|---|---|
| TR-FAC-001 | AMC contract management (scope, parties, term, renewals). | M |
| TR-FAC-002 | Visitor logs and gate passes; QR check-in via Facility & Security App. | M |
| TR-FAC-003 | Monthly maintenance billing for housing societies. | M |
| TR-FAC-004 | Vehicle entry logging. | S |

### 3.11 Rental Operations (Epic 11)

| ID | Requirement | Priority |
|---|---|---|
| TR-REN-001 | Lease lifecycle management (draft → signed → active → terminated). | M |
| TR-REN-002 | Automated monthly rent invoicing. | M |
| TR-REN-003 | Recurring rent escalations (X% per annum) with configurable start dates. | M |
| TR-REN-004 | Security deposit tracking and refund processing. | M |

### 3.12 Integrated Marketplace (Epic 12)

| ID | Requirement | Priority |
|---|---|---|
| TR-MKT-001 | Directory of verified third-party vendors (banks/home loans, interior designers, packers & movers). | M |
| TR-MKT-002 | Lead referral mechanism from buyer interactions to marketplace partners. | M |
| TR-MKT-003 | Commission tracking per successful referral, with billing. | M |
| TR-MKT-004 | Partner self-service via Vendor/Broker app to view RFQs, bid, track payment status. | S |

### 3.13 AI Executive Dashboard (Natural Language Interface)

| ID | Requirement | Priority |
|---|---|---|
| TR-AI-001 | Text-to-SQL engine with strict schema security layer (read-only, tenant-scoped, deny-list on sensitive columns). | M |
| TR-AI-002 | Executives can query enterprise data conversationally and receive plain-language summary + structured table. | M |
| TR-AI-003 | All generated SQL must be logged and auditable; executed against isolated tenant database only. | M |

### 3.14 AI Layer — Cross-Cutting (Section 4 of PRD)

| ID | Requirement | Priority |
|---|---|---|
| TR-AI-004 | Multi-agent coordination via LangGraph with shared transactional DB + vector layer as source of truth. | M |
| TR-AI-005 | Agents: Sales, Construction, Finance, Legal, Procurement, Customer — each with defined capabilities and guardrails. | M |
| TR-AI-006 | WhatsApp Business API integration for agent conversations and notifications. | M |
| TR-AI-007 | Twilio Voice AI for AI Sales Agent voice conversations. | S |
| TR-AI-008 | All agent writes to the database must occur through authorized API endpoints with RBAC checks (no direct DB writes). | M |
| TR-AI-009 | Human-in-the-loop escalation for high-impact actions (approvals, contractual changes). | M |

---

## 4. Mobile Applications (Persona-Based)

| ID | Requirement | App | Priority |
|---|---|---|---|
| TR-MOB-001 | Lead queues, click-to-call dialer, digital quote builder, interactive inventory matrix. | Sales | M |
| TR-MOB-002 | Offline DPR logging, material verification (QR/Barcode), digital incident reporting. | Construction | M |
| TR-MOB-003 | Construction milestone tracking, tax invoice download, e-signature, support tickets. | Customer | M |
| TR-MOB-004 | RFQ review, bid submission, payment status, dispatch notes upload. | Vendor | M |
| TR-MOB-005 | Unallocated inventory view, pricing tiers, marketing collateral, commission tracking. | Broker | M |
| TR-MOB-006 | Dashboards, cash flow indicators, approval queues. | Management | M |
| TR-MOB-007 | QR visitor check-in, vehicle entry logs, gate passes. | Facility & Security | M |
| TR-MOB-008 | Single codebase (Flutter) for iOS + Android; RBAC linked to primary IdP. | All | M |
| TR-MOB-009 | Offline-first sync for construction data with conflict resolution. | Construction | M |

---

## 5. Integrations Matrix

| ID | Requirement | Priority |
|---|---|---|
| TR-INT-001 | RERA Portals — scrapers/official APIs for registration status and public disclosures. | M |
| TR-INT-002 | DigiLocker — REST API push/pull of property documents (Agreements for Sale). | M |
| TR-INT-003 | Aadhaar eKYC — UIDAI authorized gateway for buyer/tenant/broker identity verification. | M |
| TR-INT-004 | NSDL / Income Tax — PAN verification API for customer and vendor onboarding. | M |
| TR-INT-005 | Razorpay / Cashfree — token bookings, maintenance dues, rental deposits. | M |
| TR-INT-006 | SAP / Tally Prime — GL, asset valuations, tax report sync. | S |
| TR-INT-007 | WhatsApp — Meta Business API for alerts, reminders, conversational bots. | M |
| TR-INT-008 | Google / Outlook Calendar — site visit schedule + agent calendar sync. | M |
| TR-INT-009 | Slack / Microsoft Teams — urgent alert routing (budget overruns, discount approvals). | S |
| TR-INT-010 | Google Maps API — location intelligence, micro-market plotting, site directions. | M |
| TR-INT-011 | All integrations must be adapter-based, retryable, idempotent, and auditable (event log). | M |

---

## 6. Non-Functional Requirements

### 6.1 Performance & Scalability (PRD §8.2)
| ID | Requirement | Priority |
|---|---|---|
| TR-NFR-001 | Transactional read/write API responses ≤ 200 ms at p95. | M |
| TR-NFR-002 | AI Sales text responses over WhatsApp: first token < 1.5 s. | M |
| TR-NFR-003 | Active-active multi-region, ≥ 99.95% uptime SLA, Kubernetes-managed. | M |
| TR-NFR-004 | Horizontal scale-out for web API, Temporal workers, and AI workers. | M |
| TR-NFR-005 | Real-time inventory state propagation ≤ 1 s to heat map clients. | M |

### 6.2 Security & Compliance (PRD §8.1)
| ID | Requirement | Priority |
|---|---|---|
| TR-SEC-001 | Data residency: all data, logs, backups within AWS Mumbai (ap-south-1) or Azure Central India (centralindia) per DPDP Act 2023 and RERA. | M |
| TR-SEC-002 | Encryption at rest: AES-256 with tenant-specific keys via AWS KMS / Azure Key Vault. | M |
| TR-SEC-003 | Encryption in transit: TLS 1.3. | M |
| TR-SEC-004 | Zero Trust Network Access (ZTNA) + MFA via Keycloak / Entra ID. | M |
| TR-SEC-005 | Tenant-scoped RBAC enforced at API and DB layers; no cross-tenant access. | M |
| TR-SEC-006 | PII minimization and consent tracking per DPDP Act 2023. | M |
| TR-SEC-007 | Audit logging of all financial, legal, and AI system actions (append-only). | M |
| TR-SEC-008 | Secrets managed via vault; no secrets in code, config, or logs. | M |
| TR-SEC-009 | Backup strategy: point-in-time recovery (PITR) per tenant; RPO ≤ 15 min, RTO ≤ 1 h. | M |

### 6.3 Reliability & Observability
| ID | Requirement | Priority |
|---|---|---|
| TR-NFR-006 | Outbox pattern for reliable event publishing (Kafka/RabbitMQ). | M |
| TR-NFR-007 | Temporal workflows must be idempotent and resumable after worker restart. | M |
| TR-NFR-008 | Distributed tracing (OpenTelemetry), structured logging, metrics dashboards. | M |
| TR-NFR-009 | Circuit breakers and retries with exponential backoff for third-party integrations. | M |

### 6.4 Maintainability & Quality
| ID | Requirement | Priority |
|---|---|---|
| TR-NFR-010 | Domain-driven modular monolith (or modular services) with clear bounded contexts. | M |
| TR-NFR-011 | API versioning; backward-compatible contract evolution. | M |
| TR-NFR-012 | Automated test pyramid: unit, integration, E2E; CI gate on coverage. | M |
| TR-NFR-013 | Database migrations via EF Core with forward-only, backward-compatible changes. | M |

---

## 7. Data Requirements

| ID | Requirement | Priority |
|---|---|---|
| TR-DAT-001 | Multi-tenant persistence: per-tenant PostgreSQL schema; `public` schema for tenant registry and routing. | M |
| TR-DAT-002 | All monetary values stored in high-precision numeric (INR); tax fields (CGST/SGST/IGST/TDS) as first-class columns or derived via engine. | M |
| TR-DAT-003 | Timestamps stored as UTC; tenant-local timezone applied at presentation. | M |
| TR-DAT-004 | Referential integrity and FK constraints enforced within tenant schema. | M |
| TR-DAT-005 | Soft-delete and audit columns (`created_by`, `updated_by`, `version`) on core entities. | M |
| TR-DAT-006 | Vector embeddings (pgvector) partitioned/isolated per tenant for RAG. | M |
| TR-DAT-007 | Financial and legal records must be immutable once posted (append-only ledger). | M |
| TR-DAT-008 | Redis used for sessions, cache, and inventory unit locks (ephemeral). | M |

See `docs/database-schema.md` and `sql/` for the full schema design.

---

## 8. Acceptance Criteria (Sample)

- **AC-CRM-01:** A Facebook lead webhook persists the lead, emits `Lead_Ingested`, scores it, and assigns it to a Sales Executive within 60 s (automated test + audit log).
- **AC-INV-01:** Concurrent quotation generation on the same unit results in exactly one successful hold (Redis lock) within 15-min window; other requests receive a "unit unavailable" response.
- **AC-SAL-01:** Discount > 5% blocks booking confirmation until approval; approved bookings proceed via Temporal workflow.
- **AC-FIN-01:** An inter-state invoice of ₹60L auto-computes IGST; an intra-state invoice computes CGST+SGST; TDS 194-IA is applied when property value > ₹50L.
- **AC-NFR-01:** p95 API latency < 200 ms under 5× baseline load; AI first token < 1.5 s (load test report).

---

## 9. Assumptions & Open Questions

1. Schema-per-tenant confirmed; single physical database for MVP with tenant-schema routing, with migration path to dedicated databases for large tenants.
2. Kafka chosen as the primary event broker; RabbitMQ as fallback for legacy/edge deployments.
3. UIDAI and DigiLocker integration depends on gateway approval timelines — stubbed adapters planned.
4. Text-to-SQL restricted to a curated, read-only view layer to guarantee schema safety.
5. Multi-region active-active is a target state; MVP may run single-region with standby (to be confirmed by infrastructure team).
