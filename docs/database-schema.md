# EstateFlow — Database Schema Design

**Engine:** PostgreSQL 16+
**Isolation model:** Hybrid "Bridge" multi-tenancy — per-tenant schemas + shared `public` control plane
**ORM:** EF Core (backed by migrations from `sql/02_tenant_schema.sql`)
**Vector:** pgvector (per-tenant partitioned)
**Caching/locks:** Redis (sessions, cache, unit hold locks) — ephemeral only

---

## 1. Design Principles

| Principle | Description |
|---|---|
| Schema-per-tenant | Each tenant's data lives in a dedicated PostgreSQL schema. No `tenant_id` filters required; isolation is enforced by the schema boundary. |
| No cross-tenant FKs | Foreign keys never cross tenant schemas; cross-tenant references go through the `public` control plane only. |
| Money as numeric | All monetary values use `numeric(19,2)`; tax fields (CGST/SGST/IGST/TDS) are first-class columns. |
| UTC everywhere | `timestamptz` storage; tenant timezone (`Asia/Kolkata`) applied at presentation. |
| Audit + immutability | `audit_logs` capture row changes; financial/legal records are posted (append-only) and never mutated. |
| Versioned entities | `version`/`updated_at` used with optimistic concurrency (critical for unit status). |
| Soft identity | Tenant `users` reference the platform `public.users` global identity; RBAC is resolved inside the tenant schema. |

---

## 2. Control Plane (`public`) — `sql/01_public_schema.sql`

```mermaid
erDiagram
    tenants ||--o{ tenant_feature_flags : "enables"
    tenants ||--o{ tenant_memberships : "has"
    users ||--o{ tenant_memberships : "joins"
    tenants ||--o{ system_audit_log : "is-audited"

    tenants {
        uuid id PK
        varchar code
        varchar subdomain UK
        varchar db_schema UK
        varchar status
        varchar plan_tier
        jsonb branding_json
    }
    tenant_feature_flags {
        uuid tenant_id PK,FK
        varchar flag_key PK
        boolean enabled
    }
    users {
        uuid id PK
        varchar idp_subject
        varchar email UK
        varchar phone UK
        varchar status
    }
    tenant_memberships {
        uuid tenant_id PK,FK
        uuid user_id PK,FK
        varchar role
    }
    system_audit_log {
        bigint id PK
        uuid tenant_id
        uuid actor_id
        varchar action
        jsonb payload
    }
```

**Tenant provisioning flow**
1. Insert row in `tenants` (generates unique `subdomain`, `db_schema`).
2. `create_tenant_schema(tenant_id)` creates the physical schema.
3. Provisioning job applies `02_tenant_schema.sql` with `search_path` set to that schema.
4. Bootstrap default roles, permissions, unit statuses, tax codes, AI agents.

---

## 3. Tenant Schema — Module ERDs

### 3.1 CRM & Omnichannel Leads

```mermaid
erDiagram
    lead_sources ||--o{ leads : "originates"
    campaigns ||--o{ leads : "tracks"
    leads ||--o{ lead_activities : "records"
    leads ||--o{ lead_score_history : "scores"
    leads ||--o{ lead_status_history : "transitions"
    leads }o--o| users : "assigned_to"

    leads {
        uuid id PK
        uuid lead_source_id FK
        uuid campaign_id FK
        varchar status
        varchar phone
        varchar dedupe_key UK
        numeric score
        uuid assigned_to FK
    }
    lead_score_history {
        uuid id PK
        uuid lead_id FK
        numeric score
        jsonb factors
    }
```

**Concurrency/dedupe:** `dedupe_key` (phone/email/WhatsApp ID) is unique-partial; duplicates rejected before insert (TR-CRM-006).

### 3.2 Property & Inventory

```mermaid
erDiagram
    projects ||--o{ towers : "contains"
    towers ||--o{ floors : "contains"
    floors ||--o{ blocks : "contains"
    blocks ||--o{ units : "contains"
    projects ||--o{ price_lists : "prices"
    price_lists ||--o{ price_list_items : "items"
    units ||--o{ unit_status_history : "tracks"
    units ||--o{ unit_holds : "holds"
    units ||--o{ unit_amenities : "has"
    amenities ||--o{ unit_amenities : "has"
    unit_status ||--o{ units : "state"

    units {
        uuid id PK
        uuid block_id FK
        varchar unit_no
        varchar status FK
        numeric bsp_price
        uuid current_booking_id
        int version
    }
    unit_holds {
        uuid id PK
        uuid unit_id FK
        timestamptz expires_at
        timestamptz released_at
    }
    unit_status {
        varchar code PK
        varchar color
    }
```

**Unit states:** `available`(green) / `blocked`(yellow) / `token_paid`(blue) / `sold`(red) / `under_maintenance`.
**Locking (TR-INV-004):** Redis holds the lock for 15 min at quote time; `unit_holds` persists an auditable trace. `units.version` + optimistic update is the DB backstop.

### 3.3 Sales, Quotations & Collections

```mermaid
erDiagram
    customers ||--o{ quotations : "requests"
    quotations ||--o{ quotation_approvals : "approves"
    customers ||--o{ bookings : "books"
    quotations ||--o| bookings : "converts"
    units ||--o| bookings : "1:1"
    bookings ||--o{ payment_schedules : "schedules"
    payment_schedules ||--o{ payment_schedule_lines : "lines"
    bookings ||--o{ invoices : "invoices"
    payment_schedule_lines ||--o{ invoices : "bills"
    invoices ||--o{ receipts : "collects"
    invoices ||--o{ invoice_lines : "details"

    quotations {
        uuid id PK
        varchar quote_no UK
        uuid unit_id FK
        uuid customer_id FK
        numeric discount_pct
        varchar status
    }
    quotation_approvals {
        uuid id PK
        uuid quotation_id FK
        varchar status
    }
    bookings {
        uuid id PK
        varchar booking_no UK
        uuid unit_id FK UK
        varchar status
    }
    payment_schedule_lines {
        uuid id PK
        uuid schedule_id FK
        date due_date
        numeric total_due
    }
```

**Discount rule (TR-SAL-002):** `discount_pct > 5` forces `quotations.status = pending_approval` and creates a `quotation_approvals` row routed to the VP of Sales via Temporal.

### 3.4 Construction ERP & Site Operations

```mermaid
erDiagram
    projects ||--o{ construction_milestones : "timelines"
    projects ||--o{ dprs : "reports"
    dprs ||--o{ dpr_images : "photos"
    boq_categories ||--o{ boq_items : "categorizes"
    boq_items ||--o{ boq_line_items : "authorizes"
    projects ||--o{ boq_line_items : "scopes"
    projects ||--o{ site_incidents : "incidents"
    projects ||--o{ equipment : "equipment"
    equipment ||--o{ equipment_logs : "usage"
    projects ||--o{ material_requests : "requests"

    boq_line_items {
        uuid id PK
        uuid project_id FK
        uuid boq_item_id FK
        numeric authorized_qty
        numeric ordered_qty
        numeric received_qty
        numeric approved_overage_qty
    }
    dprs {
        uuid id PK
        uuid project_id FK
        date report_date
        numeric progress_pct
    }
```

**BOQ enforcement (TR-CON-001, TR-PRO-003):** `ordered_qty + approved_overage_qty` cannot exceed `authorized_qty`; exceeding triggers an approval workflow.

### 3.5 Procurement & Vendor Management

```mermaid
erDiagram
    vendors ||--o{ vendor_contacts : "contacts"
    vendors ||--o{ vendor_ratings : "rated"
    rfqs ||--o{ rfq_lines : "asks"
    rfqs ||--o{ rfq_responses : "receives"
    rfq_responses ||--o{ rfq_response_lines : "bids"
    rfq_responses ||--o{ purchase_orders : "awards"
    purchase_orders ||--o{ po_lines : "items"
    po_lines ||--o{ grn_lines : "received"
    grns ||--o{ grn_lines : "lines"
    purchase_orders ||--o{ vendor_invoices : "billed"
    vendor_invoices ||--o| invoice_matchings : "matched"

    purchase_orders {
        uuid id PK
        varchar po_no UK
        uuid vendor_id FK
        varchar status
        boolean ai_drafted
    }
    grn_lines {
        uuid id PK
        uuid grn_id FK
        uuid po_line_id FK
        numeric quantity
    }
    vendor_invoices {
        uuid id PK
        varchar vendor_inv_no
        varchar status
    }
```

### 3.6 Finance & Indian Compliance

```mermaid
erDiagram
    chart_of_accounts ||--o{ journal_lines : "posted"
    journal_entries ||--o{ journal_lines : "contains"
    bank_accounts ||--o{ bank_statements : "imported"
    bank_statements ||--o{ bank_statement_lines : "lines"
    receipts ||--o{ bank_statement_lines : "matched_by"
    bank_statement_lines ||--o{ reconciliation_matches : "matched"
    reconciliation_runs ||--o{ reconciliation_matches : "runs"
    invoices ||--o{ tds_records : "deducted"
    projects ||--o{ budget_variance_reports : "variances"

    journal_lines {
        uuid id PK
        uuid journal_id FK
        uuid account_id FK
        numeric debit
        numeric credit
        uuid tax_code_id FK
    }
    invoices {
        uuid id PK
        varchar invoice_no UK
        numeric cgst
        numeric sgst
        numeric igst
        numeric tds
        boolean posted
    }
    tax_codes {
        uuid id PK
        varchar code UK
        varchar gst_type
        numeric tds_rate
        varchar tds_section
    }
    bank_statement_lines {
        uuid id PK
        uuid statement_id FK
        varchar txn_reference
        numeric amount
        uuid matched_receipt_id
    }
```

**Compliance (TR-FIN-002/003):** `tax_codes` drive CGST/SGST vs IGST by GSTIN/state; TDS 194-IA auto-applied when property value > ₹50 Lakh. `invoices.posted = true` makes the record immutable. Bank matching (MT940/CAMT) writes `reconciliation_matches` with confidence scores.

### 3.7 Legal & RERA Compliance

```mermaid
erDiagram
    projects ||--o| rera_project_registrations : "registered"
    rera_project_registrations ||--o{ rera_disclosures : "discloses"
    projects ||--o{ land_titles : "owns"
    land_titles ||--o{ land_title_chain : "chain"
    projects ||--o{ litigations : "litigates"
    bookings ||--o| agreements : "executed"
    agreements ||--o{ e_signatures : "signed"
    agreements ||--o{ digilocker_syncs : "synced"
    documents ||--o| agreements : "attached"

    rera_project_registrations {
        uuid id PK
        uuid project_id FK,UK
        varchar rera_reg_no
        varchar sync_status
    }
    agreements {
        uuid id PK
        varchar agreement_no UK
        varchar status
        varchar digilocker_uri
    }
```

### 3.8 HR, Facility, Rental, Marketplace (condensed)

```mermaid
erDiagram
    employees ||--o{ attendance_records : "attends"
    projects ||--o{ geofences : "bounds"
    projects ||--o{ biometric_devices : "devices"
    societies ||--o{ amc_contracts : "contracts"
    societies ||--o{ visitors : "visits"
    visitors ||--o{ visitor_logs : "check-in"
    visitor_logs ||--o| gate_passes : "passes"
    units ||--o{ leases : "leased"
    leases ||--o{ lease_invoices : "billed"
    leases ||--o{ lease_escalations : "escalates"
    leases ||--o{ security_deposits : "deposits"
    leads ||--o{ lead_referrals : "referred"
    marketplace_partners ||--o{ lead_referrals : "receives"
    marketplace_partners ||--o{ commissions : "earns"

    attendance_records {
        uuid id PK
        uuid employee_id FK
        date work_date
        varchar method
        boolean geo_verified
    }
    leases {
        uuid id PK
        uuid unit_id FK
        numeric monthly_rent
        numeric escalation_pct
        varchar status
    }
    lead_referrals {
        uuid id PK
        uuid lead_id FK
        uuid partner_id FK
        varchar status
    }
```

### 3.9 AI Layer & Site Visits

```mermaid
erDiagram
    ai_agents ||--o{ ai_conversations : "runs"
    ai_conversations ||--o{ ai_messages : "exchanges"
    ai_conversations ||--o{ ai_tool_calls : "invokes"
    leads ||--o{ ai_conversations : "context"
    ai_conversations ||--o{ site_visits : "books"
    vector_documents {
        uuid id PK
        varchar source_table
        uuid source_row_id
        vector embedding
        jsonb metadata_json
    }

    site_visits {
        uuid id PK
        uuid lead_id FK
        uuid project_id FK
        timestamptz scheduled_at
        varchar status
        varchar source
    }
```

---

## 4. Cross-Cutting Conventions

| Convention | Rule |
|---|---|
| Primary keys | `uuid` default `gen_random_uuid()` |
| Money | `numeric(19,2)` |
| Percentages | `numeric(5,2)` (discounts, GST, TDS) / `numeric(8,2)` (variance) |
| Booleans for business state | status columns with `CHECK` constraints instead of raw booleans |
| Enum policy | Native `CHECK` constraints (not PG enums) to allow additive migration without `ALTER TYPE` |
| Timestamps | `timestamptz`, UTC; `updated_at` maintained by app layer |
| Audit | `audit_logs` rows for INSERT/UPDATE/DELETE; immutable records use `posted` flags |
| Attachments | All files → S3-compatible storage via `file_assets`; DB stores references only |
| AI embeddings | `vector_documents.embedding` (pgvector, dim 1536 for OpenAI) tagged with tenant via schema isolation |

## 5. Files

| File | Contents |
|---|---|
| `sql/01_public_schema.sql` | Control plane: tenants, users, memberships, system audit, provisioning helper |
| `sql/02_tenant_schema.sql` | Tenant schema template: 117 tables across 16 modules |
