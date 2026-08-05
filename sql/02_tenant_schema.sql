-- =====================================================================
-- EstateFlow — Tenant Schema Template
-- One copy of this schema is provisioned per tenant. The provisioning
-- job executes this script inside the tenant's own schema (search_path
-- set to <tenant_schema>, typically via create_tenant_schema() and a
-- migration runner). No tenant_id columns are required because the
-- schema itself defines the tenant boundary.
--
-- Modules: Common · RBAC · CRM · Inventory · Sales · Construction ·
-- Procurement · Finance · Legal/RERA · HR · Customer · Facility ·
-- Rental · Marketplace · AI · Notifications
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------
-- 1. COMMON / FOUNDATION
-- ---------------------------------------------------------------------

CREATE TABLE app_config (
    key           varchar(100) PRIMARY KEY,
    value         jsonb NOT NULL DEFAULT '{}'::jsonb,
    description   varchar(255),
    updated_by    uuid,
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    line1       varchar(200),
    line2       varchar(200),
    city        varchar(100),
    state       varchar(100),
    state_code  varchar(2),
    pincode     varchar(10),
    country     varchar(60) NOT NULL DEFAULT 'India',
    geo         point,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE file_assets (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket        varchar(120) NOT NULL,
    object_key    varchar(512) NOT NULL,
    original_name varchar(255) NOT NULL,
    mime_type     varchar(120),
    size_bytes    bigint NOT NULL DEFAULT 0,
    sha256        char(64),
    access_level  varchar(20) NOT NULL DEFAULT 'private'
                              CHECK (access_level IN ('private','internal','public')),
    uploaded_by   uuid,
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (bucket, object_key)
);

CREATE TABLE sequence_numbers (
    sequence_key varchar(120) PRIMARY KEY,
    last_value   bigint NOT NULL DEFAULT 0
);

CREATE TABLE tax_codes (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code      varchar(20) NOT NULL UNIQUE,
    name      varchar(120) NOT NULL,
    gst_type  varchar(10) NOT NULL CHECK (gst_type IN ('cgst_sgst','igst','nil','exempt')),
    cgst_rate numeric(5,2) NOT NULL DEFAULT 0,
    sgst_rate numeric(5,2) NOT NULL DEFAULT 0,
    igst_rate numeric(5,2) NOT NULL DEFAULT 0,
    tds_rate  numeric(5,2) NOT NULL DEFAULT 0,
    tds_section varchar(20)
);

CREATE TABLE audit_logs (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id   uuid,
    table_name varchar(120) NOT NULL,
    row_id     uuid,
    action     varchar(20) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE','APPROVE','REJECT','CUSTOM')),
    old_value  jsonb,
    new_value  jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(table_name, row_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 2. IDENTITY & RBAC (tenant-scoped)
-- ---------------------------------------------------------------------

CREATE TABLE roles (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        varchar(60)  NOT NULL UNIQUE,
    name        varchar(120) NOT NULL,
    description varchar(255),
    created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code      varchar(120) NOT NULL UNIQUE,
    scope     varchar(60)  NOT NULL DEFAULT 'tenant',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id       uuid NOT NULL REFERENCES roles(id)        ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permissions(id)  ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    global_user  uuid         NOT NULL,
    email        varchar(320) NOT NULL,
    phone        varchar(20),
    display_name varchar(200) NOT NULL,
    status       varchar(20)  NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','locked','deactivated')),
    locale       varchar(10)  NOT NULL DEFAULT 'en-IN',
    timezone     varchar(60)  NOT NULL DEFAULT 'Asia/Kolkata',
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now(),
    UNIQUE (global_user)
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_roles (
    user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id    uuid        NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by uuid,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_devices (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token    text,
    device_type  varchar(20) NOT NULL CHECK (device_type IN ('ios','android','web')),
    last_seen_at timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 3. CRM & OMNICHANNEL LEADS
-- ---------------------------------------------------------------------

CREATE TABLE lead_sources (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code       varchar(40) NOT NULL UNIQUE,
    name       varchar(120) NOT NULL,
    channel    varchar(30) NOT NULL CHECK (channel IN ('facebook','google_ads','whatsapp','ivr','referral','website','marketplace','other')),
    is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE campaigns (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_source_id uuid REFERENCES lead_sources(id),
    name         varchar(200) NOT NULL,
    started_at   date,
    ended_at     date,
    budget       numeric(19,2),
    is_active    boolean NOT NULL DEFAULT true
);

CREATE TABLE leads (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_source_id    uuid NOT NULL REFERENCES lead_sources(id),
    campaign_id       uuid REFERENCES campaigns(id),
    external_ref      varchar(120),
    status            varchar(30) NOT NULL DEFAULT 'new'
                                 CHECK (status IN ('new','contacted','qualified','site_visit_scheduled','booking_initiated','won','lost','duplicate')),
    name              varchar(200),
    phone             varchar(20),
    email             varchar(320),
    whatsapp_id       varchar(120),
    budget_min        numeric(19,2),
    budget_max        numeric(19,2),
    location_intent   varchar(200),
    project_interest  uuid,
    unit_type_interest varchar(50),
    score             numeric(5,2),
    score_reason      jsonb,
    assigned_to       uuid REFERENCES users(id),
    assigned_at       timestamptz,
    source_payload    jsonb,
    dedupe_key        varchar(255),
    converted_customer uuid,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_leads_dedupe ON leads(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to, status);

CREATE TABLE lead_activities (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id    uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type varchar(40) NOT NULL CHECK (activity_type IN ('call','whatsapp','email','visit','note','status_change','ai_chat','ivr')),
    summary    text,
    duration_s int,
    ai_generated boolean NOT NULL DEFAULT false,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    actor_id   uuid
);

CREATE TABLE lead_score_history (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id   uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    score     numeric(5,2) NOT NULL,
    factors   jsonb NOT NULL DEFAULT '{}'::jsonb,
    model_version varchar(40),
    scored_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lead_status_history (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id   uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    from_status varchar(30),
    to_status   varchar(30) NOT NULL,
    changed_by  uuid,
    reason      varchar(255),
    changed_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. PROPERTY & INVENTORY
-- ---------------------------------------------------------------------

CREATE TABLE projects (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code              varchar(40) NOT NULL UNIQUE,
    name              varchar(200) NOT NULL,
    project_type      varchar(40) NOT NULL CHECK (project_type IN ('residential','commercial','mixed_use','plotted')),
    address_id        uuid REFERENCES addresses(id),
    status            varchar(30) NOT NULL DEFAULT 'planning'
                               CHECK (status IN ('planning','under_construction','handed_over','completed','archived')),
    handover_mode     varchar(30) CHECK (handover_mode IN ('society','association','none')),
    total_units       int,
    total_sqft        numeric(19,2),
    planned_start     date,
    planned_end       date,
    master_timeline   jsonb,
    google_place_id   varchar(120),
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE towers (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code       varchar(40) NOT NULL,
    name       varchar(120),
    total_floors int,
    UNIQUE (project_id, code)
);

CREATE TABLE floors (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tower_id  uuid NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    floor_no  int NOT NULL,
    label     varchar(40),
    UNIQUE (tower_id, floor_no)
);

CREATE TABLE blocks (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id  uuid NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    code      varchar(40) NOT NULL,
    UNIQUE (floor_id, code)
);

CREATE TABLE unit_status (
    code varchar(30) PRIMARY KEY,
    name varchar(60) NOT NULL,
    color varchar(9) NOT NULL
);

INSERT INTO unit_status (code, name, color) VALUES
    ('available',     'Available',     '#22c55e'),
    ('blocked',       'Blocked',       '#eab308'),
    ('token_paid',    'Token Paid',    '#3b82f6'),
    ('sold',          'Sold',          '#ef4444'),
    ('under_maintenance', 'Under Maintenance', '#94a3b8');

CREATE TABLE units (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id      uuid NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    unit_no       varchar(40) NOT NULL,
    unit_type     varchar(40) NOT NULL CHECK (unit_type IN ('1BHK','2BHK','3BHK','4BHK','5BHK','penthouse','office','retail','plot','villa','studio','other')),
    facing        varchar(40),
    carpet_area_sqft numeric(19,2),
    super_area_sqft  numeric(19,2),
    bsp_price     numeric(19,2),
    status        varchar(30) NOT NULL DEFAULT 'available' REFERENCES unit_status(code),
    status_changed_at timestamptz NOT NULL DEFAULT now(),
    current_booking_id uuid,
    version       int NOT NULL DEFAULT 1,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (block_id, unit_no)
);

CREATE INDEX idx_units_project_status ON units(status);
CREATE INDEX idx_units_block ON units(block_id);

CREATE TABLE unit_status_history (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id     uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    from_status varchar(30),
    to_status   varchar(30) NOT NULL,
    reason      varchar(255),
    changed_by  uuid,
    changed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE unit_holds (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id     uuid NOT NULL REFERENCES units(id),
    quote_id    uuid,
    held_by     uuid NOT NULL,
    expires_at  timestamptz NOT NULL,
    released_at timestamptz,
    reason      varchar(120),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unit_holds_active ON unit_holds(unit_id) WHERE released_at IS NULL;

CREATE TABLE amenities (
    id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(40) NOT NULL UNIQUE,
    name varchar(120) NOT NULL
);

CREATE TABLE unit_amenities (
    unit_id    uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amenity_id uuid NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (unit_id, amenity_id)
);

CREATE TABLE price_lists (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       varchar(120) NOT NULL,
    valid_from date,
    valid_to   date,
    is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE price_list_items (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id uuid NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    unit_type     varchar(40) NOT NULL,
    base_rate_per_sqft numeric(19,2) NOT NULL,
    floor_adjustment  numeric(19,2) NOT NULL DEFAULT 0,
    status        varchar(20) NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','inactive'))
);

-- ---------------------------------------------------------------------
-- 5. SALES, QUOTATIONS & COLLECTIONS
-- ---------------------------------------------------------------------

CREATE TABLE customers (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid REFERENCES users(id),
    name          varchar(200) NOT NULL,
    pan           varchar(10),
    aadhaar_hash  char(64),
    kyc_status    varchar(30) NOT NULL DEFAULT 'pending'
                           CHECK (kyc_status IN ('pending','verified','rejected','not_applicable')),
    address_id    uuid REFERENCES addresses(id),
    primary_phone varchar(20),
    primary_email varchar(320),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quotations (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_no          varchar(40) NOT NULL UNIQUE,
    customer_id       uuid NOT NULL REFERENCES customers(id),
    project_id        uuid NOT NULL REFERENCES projects(id),
    unit_id           uuid NOT NULL REFERENCES units(id),
    sales_executive   uuid REFERENCES users(id),
    status            varchar(30) NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','pending_approval','approved','rejected','accepted','expired','cancelled')),
    base_amount       numeric(19,2) NOT NULL DEFAULT 0,
    discount_pct      numeric(5,2) NOT NULL DEFAULT 0,
    discount_amount   numeric(19,2) NOT NULL DEFAULT 0,
    taxable_amount    numeric(19,2) NOT NULL DEFAULT 0,
    tax_amount        numeric(19,2) NOT NULL DEFAULT 0,
    total_amount      numeric(19,2) NOT NULL DEFAULT 0,
    valid_until       date,
    terms_json        jsonb,
    version           int NOT NULL DEFAULT 1,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_unit ON quotations(unit_id, status);

CREATE TABLE quotation_approvals (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    requested_by uuid NOT NULL,
    approved_by  uuid,
    discount_pct numeric(5,2) NOT NULL,
    status       varchar(20) NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','approved','rejected')),
    decided_at   timestamptz,
    comments     text,
    notified_via varchar(30)
);

CREATE TABLE bookings (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_no   varchar(40) NOT NULL UNIQUE,
    quotation_id uuid NOT NULL REFERENCES quotations(id),
    customer_id  uuid NOT NULL REFERENCES customers(id),
    unit_id      uuid NOT NULL REFERENCES units(id),
    status       varchar(30) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','cancelled','reverted')),
    token_amount numeric(19,2),
    token_receipt_id uuid,
    created_by   uuid,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (unit_id)
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id, status);

CREATE TABLE payment_schedules (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id   uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    schedule_type varchar(30) NOT NULL CHECK (schedule_type IN ('milestone','time_linked','hybrid')),
    total_amount numeric(19,2) NOT NULL DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payment_schedule_lines (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id       uuid NOT NULL REFERENCES payment_schedules(id) ON DELETE CASCADE,
    installment_no    int NOT NULL,
    label             varchar(200),
    milestone_id      uuid,
    due_date          date,
    amount            numeric(19,2) NOT NULL,
    tax_amount        numeric(19,2) NOT NULL DEFAULT 0,
    total_due         numeric(19,2) NOT NULL,
    paid_amount       numeric(19,2) NOT NULL DEFAULT 0,
    status            varchar(30) NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','due','partially_paid','paid','overdue','waived')),
    UNIQUE (schedule_id, installment_no)
);

CREATE TABLE invoices (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no     varchar(40) NOT NULL UNIQUE,
    customer_id    uuid NOT NULL REFERENCES customers(id),
    booking_id     uuid REFERENCES bookings(id),
    schedule_line_id uuid REFERENCES payment_schedule_lines(id),
    invoice_type   varchar(30) NOT NULL CHECK (invoice_type IN ('customer','rent','maintenance','amc','misc')),
    status         varchar(30) NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','issued','partially_paid','paid','overdue','cancelled')),
    base_amount    numeric(19,2) NOT NULL DEFAULT 0,
    cgst           numeric(19,2) NOT NULL DEFAULT 0,
    sgst           numeric(19,2) NOT NULL DEFAULT 0,
    igst           numeric(19,2) NOT NULL DEFAULT 0,
    cess           numeric(19,2) NOT NULL DEFAULT 0,
    tds            numeric(19,2) NOT NULL DEFAULT 0,
    total_amount   numeric(19,2) NOT NULL DEFAULT 0,
    due_date       date,
    issued_at      timestamptz,
    gstin          varchar(15),
    posted         boolean NOT NULL DEFAULT false,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id, status);

CREATE TABLE invoice_lines (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description varchar(255) NOT NULL,
    quantity    numeric(19,3) NOT NULL DEFAULT 1,
    rate        numeric(19,2) NOT NULL,
    tax_code_id uuid,
    amount      numeric(19,2) NOT NULL,
    tax_amount  numeric(19,2) NOT NULL DEFAULT 0,
    total       numeric(19,2) NOT NULL
);

CREATE TABLE receipts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no   varchar(40) NOT NULL UNIQUE,
    customer_id  uuid NOT NULL REFERENCES customers(id),
    booking_id   uuid REFERENCES bookings(id),
    invoice_id   uuid REFERENCES invoices(id),
    amount       numeric(19,2) NOT NULL,
    payment_mode varchar(30) NOT NULL CHECK (payment_mode IN ('cash','cheque','upi','card','neft','rtgs','gateway','other')),
    gateway_txn_id varchar(120),
    reference    varchar(120),
    received_at  timestamptz NOT NULL,
    received_by  uuid,
    bank_match_id uuid,
    posted       boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_receipts_customer ON receipts(customer_id, received_at DESC);

-- ---------------------------------------------------------------------
-- 6. CONSTRUCTION ERP & SITE OPERATIONS
-- ---------------------------------------------------------------------

CREATE TABLE boq_categories (
    id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code   varchar(40) NOT NULL UNIQUE,
    name   varchar(120) NOT NULL
);

CREATE TABLE boq_items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category_id uuid REFERENCES boq_categories(id),
    code        varchar(60) NOT NULL,
    name        varchar(200) NOT NULL,
    uom         varchar(20) NOT NULL,
    unit_price  numeric(19,2),
    UNIQUE (project_id, code)
);

CREATE TABLE boq_line_items (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    boq_item_id   uuid NOT NULL REFERENCES boq_items(id),
    tower_id      uuid REFERENCES towers(id),
    authorized_qty numeric(19,3) NOT NULL DEFAULT 0,
    authorized_value numeric(19,2) NOT NULL DEFAULT 0,
    ordered_qty   numeric(19,3) NOT NULL DEFAULT 0,
    received_qty  numeric(19,3) NOT NULL DEFAULT 0,
    approved_overage_qty numeric(19,3) NOT NULL DEFAULT 0,
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boq_line_project ON boq_line_items(project_id);

CREATE TABLE construction_milestones (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code           varchar(40) NOT NULL,
    name           varchar(200) NOT NULL,
    planned_date   date,
    actual_date    date,
    status         varchar(30) NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','in_progress','completed','delayed','at_risk')),
    delay_days     int NOT NULL DEFAULT 0,
    sequence       int NOT NULL DEFAULT 0,
    UNIQUE (project_id, code)
);

CREATE TABLE dprs (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL REFERENCES projects(id),
    tower_id      uuid REFERENCES towers(id),
    report_date   date NOT NULL,
    site_engineer uuid NOT NULL,
    progress_pct  numeric(5,2),
    summary       text,
    weather       varchar(60),
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (project_id, tower_id, report_date)
);

CREATE INDEX idx_dprs_date ON dprs(report_date DESC);

CREATE TABLE dpr_images (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dpr_id    uuid NOT NULL REFERENCES dprs(id) ON DELETE CASCADE,
    file_asset_id uuid NOT NULL REFERENCES file_assets(id),
    caption   varchar(255),
    ai_analysis jsonb,
    captured_at timestamptz
);

CREATE TABLE site_incidents (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   uuid NOT NULL REFERENCES projects(id),
    reported_by  uuid NOT NULL,
    incident_type varchar(40) NOT NULL CHECK (incident_type IN ('safety','quality','material','labour','other')),
    severity     varchar(20) NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    description  text NOT NULL,
    status       varchar(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','closed')),
    reported_at  timestamptz NOT NULL DEFAULT now(),
    resolved_at  timestamptz
);

CREATE TABLE equipment (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL REFERENCES projects(id),
    code          varchar(60) NOT NULL UNIQUE,
    name          varchar(120) NOT NULL,
    type          varchar(60),
    status        varchar(20) NOT NULL DEFAULT 'available'
                          CHECK (status IN ('available','assigned','maintenance','retired'))
);

CREATE TABLE equipment_logs (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    log_date     date NOT NULL,
    hours        numeric(8,2) NOT NULL DEFAULT 0,
    operator     uuid,
    notes        text
);

CREATE TABLE material_requests (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL REFERENCES projects(id),
    boq_line_item_id uuid REFERENCES boq_line_items(id),
    requested_qty numeric(19,3) NOT NULL,
    approved_qty  numeric(19,3),
    requested_by  uuid NOT NULL,
    approved_by   uuid,
    status        varchar(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected','fulfilled')),
    requested_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 7. PROCUREMENT & VENDOR MANAGEMENT
-- ---------------------------------------------------------------------

CREATE TABLE vendors (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code    varchar(40) NOT NULL UNIQUE,
    name           varchar(200) NOT NULL,
    gstin          varchar(15),
    pan            varchar(10),
    address_id     uuid REFERENCES addresses(id),
    status         varchar(20) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','verified','blacklisted','inactive')),
    quality_rating numeric(3,2),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vendor_contacts (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id  uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name       varchar(200) NOT NULL,
    phone      varchar(20),
    email      varchar(320),
    is_primary boolean NOT NULL DEFAULT false
);

CREATE TABLE vendor_ratings (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id  uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    rated_by   uuid NOT NULL,
    rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments   text,
    rated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rfqs (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_no       varchar(40) NOT NULL UNIQUE,
    project_id   uuid NOT NULL REFERENCES projects(id),
    title        varchar(200) NOT NULL,
    status       varchar(30) NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','published','under_evaluation','awarded','cancelled','closed')),
    response_deadline timestamptz,
    created_by   uuid NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rfq_lines (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id       uuid NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    boq_line_item_id uuid REFERENCES boq_line_items(id),
    description  varchar(255) NOT NULL,
    quantity     numeric(19,3) NOT NULL,
    uom          varchar(20) NOT NULL
);

CREATE TABLE rfq_responses (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id        uuid NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id     uuid NOT NULL REFERENCES vendors(id),
    submitted_at  timestamptz NOT NULL DEFAULT now(),
    valid_until   date,
    status        varchar(20) NOT NULL DEFAULT 'received'
                             CHECK (status IN ('received','shortlisted','selected','rejected')),
    UNIQUE (rfq_id, vendor_id)
);

CREATE TABLE rfq_response_lines (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id   uuid NOT NULL REFERENCES rfq_responses(id) ON DELETE CASCADE,
    rfq_line_id   uuid NOT NULL REFERENCES rfq_lines(id),
    unit_price    numeric(19,2) NOT NULL,
    delivery_days int,
    total         numeric(19,2) NOT NULL
);

CREATE TABLE purchase_orders (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_no        varchar(40) NOT NULL UNIQUE,
    project_id   uuid NOT NULL REFERENCES projects(id),
    vendor_id    uuid NOT NULL REFERENCES vendors(id),
    rfq_response_id uuid REFERENCES rfq_responses(id),
    status       varchar(30) NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','sent','partially_received','received','cancelled','closed')),
    subtotal     numeric(19,2) NOT NULL DEFAULT 0,
    tax_total    numeric(19,2) NOT NULL DEFAULT 0,
    total        numeric(19,2) NOT NULL DEFAULT 0,
    delivery_required date,
    approved_by  uuid,
    ai_drafted   boolean NOT NULL DEFAULT false,
    created_by   uuid,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE po_lines (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id        uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    boq_line_item_id uuid REFERENCES boq_line_items(id),
    description  varchar(255) NOT NULL,
    quantity     numeric(19,3) NOT NULL,
    uom          varchar(20) NOT NULL,
    unit_price   numeric(19,2) NOT NULL,
    tax_code_id  uuid,
    total        numeric(19,2) NOT NULL,
    received_qty numeric(19,3) NOT NULL DEFAULT 0
);

CREATE TABLE grns (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_no       varchar(40) NOT NULL UNIQUE,
    po_id        uuid NOT NULL REFERENCES purchase_orders(id),
    vendor_id    uuid NOT NULL REFERENCES vendors(id),
    received_at  timestamptz NOT NULL DEFAULT now(),
    received_by  uuid NOT NULL,
    status       varchar(20) NOT NULL DEFAULT 'pending_verification'
                           CHECK (status IN ('pending_verification','verified','rejected'))
);

CREATE TABLE grn_lines (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id     uuid NOT NULL REFERENCES grns(id) ON DELETE CASCADE,
    po_line_id uuid NOT NULL REFERENCES po_lines(id),
    quantity   numeric(19,3) NOT NULL,
    condition_ok boolean NOT NULL DEFAULT true
);

CREATE TABLE vendor_invoices (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_inv_no varchar(60) NOT NULL,
    po_id        uuid NOT NULL REFERENCES purchase_orders(id),
    vendor_id    uuid NOT NULL REFERENCES vendors(id),
    grn_id       uuid REFERENCES grns(id),
    amount       numeric(19,2) NOT NULL,
    gstin        varchar(15),
    status       varchar(30) NOT NULL DEFAULT 'received'
                            CHECK (status IN ('received','matched','in_exception','paid','rejected')),
    received_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, vendor_inv_no)
);

CREATE TABLE invoice_matchings (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_invoice_id uuid NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
    match_status     varchar(20) NOT NULL CHECK (match_status IN ('two_way_ok','three_way_ok','mismatch')),
    mismatch_reason  varchar(255),
    matched_by       uuid,
    matched_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 8. FINANCE & INDIAN COMPLIANCE
-- ---------------------------------------------------------------------

CREATE TABLE chart_of_accounts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code         varchar(40) NOT NULL UNIQUE,
    name         varchar(160) NOT NULL,
    type         varchar(30) NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
    is_active    boolean NOT NULL DEFAULT true
);

CREATE TABLE journal_entries (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_no varchar(40) NOT NULL UNIQUE,
    entry_date date NOT NULL,
    reference_type varchar(40),
    reference_id  uuid,
    narration text,
    posted    boolean NOT NULL DEFAULT false,
    posted_at timestamptz,
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE journal_lines (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id     uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id     uuid NOT NULL REFERENCES chart_of_accounts(id),
    debit          numeric(19,2) NOT NULL DEFAULT 0,
    credit         numeric(19,2) NOT NULL DEFAULT 0,
    tax_code_id    uuid REFERENCES tax_codes(id),
    tds_amount     numeric(19,2) NOT NULL DEFAULT 0,
    project_id     uuid REFERENCES projects(id),
    description    varchar(255)
);

CREATE TABLE bank_accounts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name varchar(200) NOT NULL,
    bank_name    varchar(120) NOT NULL,
    account_no   varchar(40),
    ifsc         varchar(11),
    upi_id       varchar(80),
    is_active    boolean NOT NULL DEFAULT true
);

CREATE TABLE bank_statements (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    format         varchar(10) NOT NULL CHECK (format IN ('MT940','CAMT','CSV')),
    file_asset_id  uuid REFERENCES file_assets(id),
    statement_date date,
    imported_by    uuid,
    imported_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (bank_account_id, file_asset_id)
);

CREATE TABLE bank_statement_lines (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id uuid NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
    txn_reference varchar(80),
    txn_date     date NOT NULL,
    value_date   date,
    amount       numeric(19,2) NOT NULL,
    balance      numeric(19,2),
    description  varchar(255),
    counterparty varchar(200),
    matched_receipt_id uuid,
    UNIQUE (statement_id, txn_reference)
);

CREATE INDEX idx_bank_lines_match ON bank_statement_lines(matched_receipt_id);

CREATE TABLE reconciliation_runs (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_at         timestamptz NOT NULL DEFAULT now(),
    statement_id   uuid REFERENCES bank_statements(id),
    total_lines    int NOT NULL DEFAULT 0,
    matched_lines  int NOT NULL DEFAULT 0,
    unmatched_lines int NOT NULL DEFAULT 0,
    run_by         uuid
);

CREATE TABLE reconciliation_matches (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id       uuid NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
    bank_line_id uuid NOT NULL REFERENCES bank_statement_lines(id),
    receipt_id   uuid REFERENCES receipts(id),
    invoice_id   uuid REFERENCES invoices(id),
    confidence   numeric(5,2) NOT NULL,
    status       varchar(20) NOT NULL DEFAULT 'suggested'
                            CHECK (status IN ('suggested','confirmed','rejected'))
);

CREATE TABLE tds_records (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id    uuid REFERENCES invoices(id),
    vendor_id     uuid REFERENCES vendors(id),
    section       varchar(20) NOT NULL,
    pan           varchar(10) NOT NULL,
    base_amount   numeric(19,2) NOT NULL,
    tds_rate      numeric(5,2) NOT NULL,
    tds_amount    numeric(19,2) NOT NULL,
    certificate_no varchar(60),
    deposit_challan varchar(60),
    status        varchar(20) NOT NULL DEFAULT 'computed'
                          CHECK (status IN ('computed','deducted','deposited','certificate_issued'))
);

CREATE TABLE cash_flow_forecasts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   uuid REFERENCES projects(id),
    forecast_date date NOT NULL,
    expected_inflow  numeric(19,2) NOT NULL DEFAULT 0,
    expected_outflow numeric(19,2) NOT NULL DEFAULT 0,
    confidence   numeric(5,2),
    model_version varchar(40),
    generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE budget_variance_reports (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     uuid NOT NULL REFERENCES projects(id),
    boq_item_id    uuid REFERENCES boq_items(id),
    report_date    date NOT NULL,
    baseline_value numeric(19,2) NOT NULL,
    actual_value   numeric(19,2) NOT NULL,
    variance_pct   numeric(8,2) NOT NULL,
    severity       varchar(20) NOT NULL CHECK (severity IN ('info','warning','critical')),
    generated_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 9. LEGAL & RERA COMPLIANCE
-- ---------------------------------------------------------------------

CREATE TABLE documents (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type      varchar(60) NOT NULL,
    title         varchar(255) NOT NULL,
    file_asset_id uuid REFERENCES file_assets(id),
    project_id    uuid REFERENCES projects(id),
    status        varchar(20) NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','signed','executed','cancelled')),
    version       int NOT NULL DEFAULT 1,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE land_titles (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  uuid NOT NULL REFERENCES projects(id),
    title_no    varchar(80) NOT NULL,
    survey_no   varchar(80),
    district    varchar(100),
    area        numeric(19,4),
    status      varchar(30) NOT NULL DEFAULT 'in_review'
                           CHECK (status IN ('in_review','clear','disputed','under_litigation')),
    notes       text,
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE land_title_chain (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    land_title_id uuid NOT NULL REFERENCES land_titles(id) ON DELETE CASCADE,
    owner_name   varchar(200) NOT NULL,
    deed_no      varchar(80),
    deed_date    date,
    consideration numeric(19,2),
    sequence     int NOT NULL DEFAULT 0
);

CREATE TABLE litigations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  uuid REFERENCES projects(id),
    land_title_id uuid REFERENCES land_titles(id),
    case_number varchar(80) NOT NULL,
    court       varchar(200) NOT NULL,
    party_a     varchar(200),
    party_b     varchar(200),
    status      varchar(30) NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','closed','settled')),
    filed_date  date,
    next_hearing date,
    summary     text
);

CREATE TABLE rera_project_registrations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL UNIQUE REFERENCES projects(id),
    rera_reg_no   varchar(80) NOT NULL,
    authority     varchar(120) NOT NULL,
    valid_from    date,
    valid_to      date,
    status        varchar(30) NOT NULL DEFAULT 'registered'
                             CHECK (status IN ('registered','in_progress','rejected','expired')),
    sync_status   varchar(30) NOT NULL DEFAULT 'not_synced'
                            CHECK (sync_status IN ('not_synced','syncing','synced','failed')),
    last_synced_at timestamptz,
    raw_payload   jsonb
);

CREATE TABLE rera_disclosures (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rera_registration_id uuid NOT NULL REFERENCES rera_project_registrations(id) ON DELETE CASCADE,
    quarter         date NOT NULL,
    progress_pct    numeric(5,2) NOT NULL,
    disclosures     jsonb NOT NULL DEFAULT '{}'::jsonb,
    submission_status varchar(20) NOT NULL DEFAULT 'draft'
                                CHECK (submission_status IN ('draft','submitted','acknowledged','rejected')),
    submitted_at    timestamptz,
    UNIQUE (rera_registration_id, quarter)
);

CREATE TABLE agreements (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_no varchar(40) NOT NULL UNIQUE,
    agreement_type varchar(40) NOT NULL CHECK (agreement_type IN ('agreement_for_sale','rental_agreement','society_membership','broker_agreement','vendor_contract')),
    booking_id  uuid REFERENCES bookings(id),
    document_id uuid REFERENCES documents(id),
    parties_json jsonb NOT NULL DEFAULT '[]'::jsonb,
    status      varchar(30) NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','pending_signature','executed','cancelled')),
    executed_at timestamptz,
    digilocker_uri varchar(512),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE e_signatures (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id  uuid NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
    signer_user_id uuid REFERENCES users(id),
    signer_name   varchar(200) NOT NULL,
    signer_role   varchar(60) NOT NULL,
    status        varchar(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','signed','rejected')),
    signed_at     timestamptz,
    signature_ref varchar(255)
);

CREATE TABLE digilocker_syncs (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id uuid NOT NULL REFERENCES agreements(id),
    direction    varchar(10) NOT NULL CHECK (direction IN ('push','pull')),
    status       varchar(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','in_progress','success','failed')),
    document_uri varchar(512),
    retry_count  int NOT NULL DEFAULT 0,
    executed_at  timestamptz
);

CREATE TABLE clause_libraries (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clause_type varchar(60) NOT NULL,
    title       varchar(200) NOT NULL,
    body        text NOT NULL,
    is_standard boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 10. HR & CONTRACT LABOUR
-- ---------------------------------------------------------------------

CREATE TABLE departments (
    id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(40) NOT NULL UNIQUE,
    name varchar(120) NOT NULL
);

CREATE TABLE employees (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid REFERENCES users(id),
    department_id uuid REFERENCES departments(id),
    employee_code varchar(40) NOT NULL UNIQUE,
    name          varchar(200) NOT NULL,
    designation   varchar(120),
    employee_type varchar(30) NOT NULL CHECK (employee_type IN ('full_time','contract','consultant')),
    joining_date  date,
    status        varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave'))
);

CREATE TABLE geofences (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  uuid NOT NULL REFERENCES projects(id),
    name        varchar(120) NOT NULL,
    center      point NOT NULL,
    radius_m    numeric(10,2) NOT NULL,
    is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE biometric_devices (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id     uuid REFERENCES projects(id),
    device_code varchar(80) NOT NULL UNIQUE,
    device_type varchar(40) NOT NULL,
    status      varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','offline','retired'))
);

CREATE TABLE attendance_records (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id    uuid NOT NULL REFERENCES employees(id),
    project_id     uuid REFERENCES projects(id),
    work_date      date NOT NULL,
    check_in_at    timestamptz,
    check_out_at   timestamptz,
    method         varchar(30) NOT NULL CHECK (method IN ('biometric','face_recognition','manual','geofence')),
    device_id      uuid REFERENCES biometric_devices(id),
    geo_verified   boolean NOT NULL DEFAULT false,
    status         varchar(20) NOT NULL DEFAULT 'present'
                               CHECK (status IN ('present','absent','late','half_day','leave')),
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (employee_id, work_date)
);

CREATE TABLE contract_labour (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   uuid NOT NULL REFERENCES projects(id),
    vendor_id    uuid REFERENCES vendors(id),
    name         varchar(200) NOT NULL,
    aadhaar_hash char(64),
    role         varchar(120),
    daily_wage   numeric(19,2),
    contract_start date,
    contract_end   date,
    is_active    boolean NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------
-- 11. CUSTOMER PORTAL, TICKETS & NOTIFICATIONS
-- ---------------------------------------------------------------------

CREATE TABLE tickets (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no     varchar(40) NOT NULL UNIQUE,
    customer_id   uuid REFERENCES customers(id),
    project_id    uuid REFERENCES projects(id),
    unit_id       uuid REFERENCES units(id),
    category      varchar(60) NOT NULL,
    priority      varchar(20) NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('low','medium','high','urgent')),
    status        varchar(30) NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open','assigned','in_progress','on_hold','resolved','closed')),
    subject       varchar(255) NOT NULL,
    description   text,
    assigned_to   uuid REFERENCES users(id),
    opened_at     timestamptz NOT NULL DEFAULT now(),
    resolved_at   timestamptz,
    closed_at     timestamptz,
    channel       varchar(20) NOT NULL DEFAULT 'portal' CHECK (channel IN ('portal','whatsapp','email','phone','app'))
);

CREATE INDEX idx_tickets_customer ON tickets(customer_id, status);

CREATE TABLE ticket_comments (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id  uuid,
    is_internal boolean NOT NULL DEFAULT false,
    body       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_templates (
    id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code    varchar(60) NOT NULL UNIQUE,
    channel varchar(20) NOT NULL CHECK (channel IN ('whatsapp','email','push','sms','teams','slack')),
    subject varchar(255),
    body    text NOT NULL,
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE notifications (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL,
    template_id  uuid REFERENCES notification_templates(id),
    channel      varchar(20) NOT NULL,
    title        varchar(255) NOT NULL,
    body         text NOT NULL,
    payload      jsonb,
    status       varchar(20) NOT NULL DEFAULT 'queued'
                            CHECK (status IN ('queued','sent','delivered','read','failed')),
    created_at   timestamptz NOT NULL DEFAULT now(),
    sent_at      timestamptz,
    read_at      timestamptz
);

CREATE INDEX idx_notifications_user ON notifications(user_id, status, created_at DESC);

-- ---------------------------------------------------------------------
-- 12. FACILITY MANAGEMENT & SOCIETY OPERATIONS
-- ---------------------------------------------------------------------

CREATE TABLE societies (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL UNIQUE REFERENCES projects(id),
    name       varchar(200) NOT NULL,
    address_id uuid REFERENCES addresses(id),
    amc_in_charge uuid REFERENCES users(id)
);

CREATE TABLE amc_contracts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id   uuid NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    vendor_id    uuid REFERENCES vendors(id),
    service_name varchar(200) NOT NULL,
    amount       numeric(19,2) NOT NULL,
    starts_on    date NOT NULL,
    ends_on      date,
    renewal_period_months int,
    status       varchar(20) NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active','expired','cancelled','renewed'))
);

CREATE TABLE visitors (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id    uuid NOT NULL REFERENCES societies(id),
    name          varchar(200) NOT NULL,
    phone         varchar(20),
    id_proof_type varchar(40),
    id_proof_no   varchar(80),
    visiting_unit uuid REFERENCES units(id),
    purpose       varchar(120),
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE visitor_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id  uuid NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    check_in_at timestamptz NOT NULL DEFAULT now(),
    check_out_at timestamptz,
    qr_code     varchar(120),
    vehicle_no  varchar(20),
    gate        varchar(40),
    qr_verified boolean NOT NULL DEFAULT false
);

CREATE TABLE gate_passes (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_log_id uuid NOT NULL REFERENCES visitor_logs(id) ON DELETE CASCADE,
    pass_no     varchar(40) NOT NULL UNIQUE,
    valid_until timestamptz,
    issued_by   uuid,
    status      varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled'))
);

CREATE TABLE society_maintenance_bills (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_no       varchar(40) NOT NULL UNIQUE,
    society_id    uuid NOT NULL REFERENCES societies(id),
    unit_id       uuid NOT NULL REFERENCES units(id),
    period_start  date NOT NULL,
    period_end    date NOT NULL,
    amount        numeric(19,2) NOT NULL,
    invoice_id    uuid REFERENCES invoices(id),
    status        varchar(20) NOT NULL DEFAULT 'issued'
                              CHECK (status IN ('issued','partially_paid','paid','waived','overdue'))
);

-- ---------------------------------------------------------------------
-- 13. RENTAL OPERATIONS
-- ---------------------------------------------------------------------

CREATE TABLE leases (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_no    varchar(40) NOT NULL UNIQUE,
    unit_id     uuid NOT NULL REFERENCES units(id),
    landlord_customer_id uuid REFERENCES customers(id),
    start_date  date NOT NULL,
    end_date    date,
    monthly_rent numeric(19,2) NOT NULL,
    escalation_pct numeric(5,2) NOT NULL DEFAULT 0,
    escalation_interval_months int NOT NULL DEFAULT 12,
    security_deposit numeric(19,2) NOT NULL DEFAULT 0,
    notice_period_days int NOT NULL DEFAULT 90,
    status      varchar(30) NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','pending_signature','active','terminated','expired')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leases_unit ON leases(unit_id, status);

CREATE TABLE lease_tenants (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id  uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    tenant_customer_id uuid NOT NULL REFERENCES customers(id),
    is_primary boolean NOT NULL DEFAULT false
);

CREATE TABLE lease_invoices (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id      uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    invoice_id    uuid NOT NULL REFERENCES invoices(id),
    period_start  date NOT NULL,
    period_end    date NOT NULL,
    rent_amount   numeric(19,2) NOT NULL,
    escalation_applied numeric(5,2) NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lease_escalations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id      uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    effective_from date NOT NULL,
    old_rent      numeric(19,2) NOT NULL,
    new_rent      numeric(19,2) NOT NULL,
    pct           numeric(5,2) NOT NULL,
    applied_at    timestamptz,
    UNIQUE (lease_id, effective_from)
);

CREATE TABLE security_deposits (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id     uuid NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    amount       numeric(19,2) NOT NULL,
    received_at  timestamptz,
    refund_amount numeric(19,2),
    refunded_at  timestamptz,
    status       varchar(20) NOT NULL DEFAULT 'held'
                            CHECK (status IN ('held','partially_refunded','refunded','forfeited'))
);

-- ---------------------------------------------------------------------
-- 14. MARKETPLACE
-- ---------------------------------------------------------------------

CREATE TABLE marketplace_partners (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_type  varchar(40) NOT NULL CHECK (partner_type IN ('bank_home_loan','interior_designer','packers_movers','insurance','other')),
    vendor_id     uuid REFERENCES vendors(id),
    name          varchar(200) NOT NULL,
    status        varchar(20) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','verified','active','suspended')),
    verified_at   timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE partner_services (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id  uuid NOT NULL REFERENCES marketplace_partners(id) ON DELETE CASCADE,
    service_name varchar(200) NOT NULL,
    description text,
    commission_pct numeric(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE lead_referrals (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id       uuid NOT NULL REFERENCES leads(id),
    customer_id   uuid REFERENCES customers(id),
    partner_id    uuid NOT NULL REFERENCES marketplace_partners(id),
    service_id    uuid REFERENCES partner_services(id),
    status        varchar(30) NOT NULL DEFAULT 'sent'
                              CHECK (status IN ('sent','accepted','converted','rejected','expired')),
    commission_amount numeric(19,2),
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE commissions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id  uuid NOT NULL REFERENCES lead_referrals(id),
    partner_id   uuid NOT NULL REFERENCES marketplace_partners(id),
    amount       numeric(19,2) NOT NULL,
    status       varchar(20) NOT NULL DEFAULT 'earned'
                            CHECK (status IN ('earned','due','paid','reversed')),
    invoice_id   uuid REFERENCES invoices(id),
    earned_at    timestamptz NOT NULL DEFAULT now(),
    paid_at      timestamptz
);

-- ---------------------------------------------------------------------
-- 15. AI LAYER
-- ---------------------------------------------------------------------

CREATE TABLE ai_agents (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        varchar(40) NOT NULL UNIQUE,
    name        varchar(120) NOT NULL,
    agent_type  varchar(40) NOT NULL CHECK (agent_type IN ('sales','construction','finance','legal','procurement','customer','executive')),
    model       varchar(80) NOT NULL,
    is_enabled  boolean NOT NULL DEFAULT true,
    config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO ai_agents (code, name, agent_type, model) VALUES
    ('sales_agent',       'AI Sales Agent',       'sales',       'gpt-4o'),
    ('construction_agent','AI Construction Agent','construction','claude-3.5-sonnet'),
    ('finance_agent',     'AI Finance Agent',     'finance',     'gpt-4o'),
    ('legal_agent',       'AI Legal Agent',       'legal',       'gpt-4o'),
    ('procurement_agent', 'AI Procurement Agent', 'procurement', 'gpt-4o'),
    ('customer_agent',    'AI Customer Agent',    'customer',    'gpt-4o');

CREATE TABLE ai_conversations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id    uuid NOT NULL REFERENCES ai_agents(id),
    channel     varchar(30) NOT NULL CHECK (channel IN ('whatsapp','voice','web','mobile')),
    external_thread_id varchar(120),
    lead_id     uuid REFERENCES leads(id),
    customer_id uuid REFERENCES customers(id),
    status      varchar(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','escalated','closed')),
    language    varchar(20) NOT NULL DEFAULT 'en',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role         varchar(20) NOT NULL CHECK (role IN ('user','assistant','system','tool')),
    content      text NOT NULL,
    payload      jsonb,
    latency_ms   int,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_convo ON ai_messages(conversation_id, created_at);

CREATE TABLE ai_tool_calls (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES ai_conversations(id),
    tool_name      varchar(80) NOT NULL,
    input_json     jsonb,
    output_json    jsonb,
    status         varchar(20) NOT NULL DEFAULT 'success'
                               CHECK (status IN ('success','error','blocked_by_policy')),
    executed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_workflow_runs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_key    varchar(120) NOT NULL,
    tenant_entity   varchar(80),
    tenant_entity_id uuid,
    status          varchar(20) NOT NULL DEFAULT 'running'
                                CHECK (status IN ('running','completed','failed','needs_approval')),
    result_json     jsonb,
    started_at      timestamptz NOT NULL DEFAULT now(),
    completed_at    timestamptz
);

CREATE TABLE text_to_sql_runs (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by   uuid NOT NULL,
    natural_language text NOT NULL,
    generated_sql  text NOT NULL,
    executed       boolean NOT NULL DEFAULT false,
    row_count      int,
    result_summary text,
    status         varchar(20) NOT NULL DEFAULT 'generated'
                              CHECK (status IN ('generated','executed','denied','failed')),
    executed_at    timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vector_documents (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table   varchar(80) NOT NULL,
    source_row_id  uuid NOT NULL,
    doc_type       varchar(60) NOT NULL,
    content        text NOT NULL,
    embedding      vector(1536),
    metadata_json  jsonb NOT NULL DEFAULT '{}'::jsonb,
    indexed_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vector_documents_meta ON vector_documents USING gin (metadata_json);

CREATE TABLE ai_alerts (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type    varchar(60) NOT NULL,
    entity        varchar(80),
    entity_id     uuid,
    severity      varchar(20) NOT NULL CHECK (severity IN ('info','warning','critical')),
    title         varchar(255) NOT NULL,
    body          text NOT NULL,
    payload       jsonb,
    generated_at  timestamptz NOT NULL DEFAULT now(),
    acknowledged_by uuid,
    acknowledged_at timestamptz
);

CREATE INDEX idx_ai_alerts_severity ON ai_alerts(severity, generated_at DESC);

-- ---------------------------------------------------------------------
-- 16. SITE VISITS (Visit_Scheduler)
-- ---------------------------------------------------------------------

CREATE TABLE site_visits (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_no        varchar(40) NOT NULL UNIQUE,
    lead_id         uuid REFERENCES leads(id),
    customer_id     uuid REFERENCES customers(id),
    project_id      uuid NOT NULL REFERENCES projects(id),
    unit_id         uuid REFERENCES units(id),
    scheduled_at    timestamptz NOT NULL,
    status          varchar(30) NOT NULL DEFAULT 'requested'
                                CHECK (status IN ('requested','scheduled','confirmed','completed','cancelled','no_show')),
    assigned_to     uuid REFERENCES users(id),
    source          varchar(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ai_sales_agent','web','ivr','whatsapp')),
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_visits_date ON site_visits(scheduled_at);

-- ---------------------------------------------------------------------
-- 17. DEFERRED FOREIGN KEYS
-- Resolves forward/circular references created above so all referential
-- integrity is enforced. Applied at the end of the tenant template.
-- ---------------------------------------------------------------------

ALTER TABLE leads
    ADD CONSTRAINT fk_leads_converted_customer
    FOREIGN KEY (converted_customer) REFERENCES customers(id);

ALTER TABLE leads
    ADD CONSTRAINT fk_leads_project_interest
    FOREIGN KEY (project_interest) REFERENCES projects(id);

ALTER TABLE unit_holds
    ADD CONSTRAINT fk_unit_holds_quote
    FOREIGN KEY (quote_id) REFERENCES quotations(id);

ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_token_receipt
    FOREIGN KEY (token_receipt_id) REFERENCES receipts(id);

ALTER TABLE units
    ADD CONSTRAINT fk_units_current_booking
    FOREIGN KEY (current_booking_id) REFERENCES bookings(id);

ALTER TABLE payment_schedule_lines
    ADD CONSTRAINT fk_psl_milestone
    FOREIGN KEY (milestone_id) REFERENCES construction_milestones(id);

-- =====================================================================
-- END OF TENANT SCHEMA TEMPLATE
-- =====================================================================
