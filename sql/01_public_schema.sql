-- =====================================================================
-- EstateFlow — Control Plane (public schema)
-- Holds tenant registry, routing metadata, global identity, and
-- platform-level configuration. Applied once at the platform level.
-- Operational data for a tenant lives in its own dedicated schema
-- (see 02_tenant_schema.sql).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- Tenant registry
-- ---------------------------------------------------------------------

CREATE TABLE tenants (
    id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    code          varchar(50)  NOT NULL UNIQUE,
    name          varchar(200) NOT NULL,
    subdomain     varchar(63)  NOT NULL UNIQUE,
    db_schema     varchar(63)  NOT NULL UNIQUE,
    status        varchar(20)  NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','suspended','archived','provisioning')),
    plan_id       varchar(30)  NOT NULL DEFAULT 'plan-enterprise',
    segments      varchar(20)[] NOT NULL DEFAULT ARRAY['land','apartments']
                               CHECK (segments <@ ARRAY['land','apartments']::varchar[]),
    region        varchar(30)  NOT NULL DEFAULT 'ap-south-1',
    branding_json jsonb        NOT NULL DEFAULT '{}'::jsonb,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_status ON tenants(status);

CREATE TABLE tenant_feature_flags (
    tenant_id  uuid         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    flag_key   varchar(100) NOT NULL,
    enabled    boolean      NOT NULL DEFAULT true,
    PRIMARY KEY (tenant_id, flag_key)
);

-- ---------------------------------------------------------------------
-- Global identity (IdP-backed)
-- ---------------------------------------------------------------------

CREATE TABLE users (
    id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    idp_subject  varchar(255),
    idp_provider varchar(30)  NOT NULL DEFAULT 'keycloak',
    email        varchar(320) UNIQUE,
    phone        varchar(20)  UNIQUE,
    display_name varchar(200),
    status       varchar(20)  NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active','locked','deactivated')),
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE tenant_memberships (
    tenant_id uuid        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id   uuid        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role      varchar(50) NOT NULL,
    status    varchar(20) NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','suspended','removed')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX idx_memberships_user ON tenant_memberships(user_id);

-- ---------------------------------------------------------------------
-- Platform-level audit
-- ---------------------------------------------------------------------

CREATE TABLE system_audit_log (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id  uuid,
    actor_id   uuid,
    action     varchar(100) NOT NULL,
    entity     varchar(100),
    entity_id  uuid,
    payload    jsonb,
    ip_address inet,
    created_at timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_audit_tenant_time ON system_audit_log(tenant_id, created_at);

-- ---------------------------------------------------------------------
-- Tenant provisioning helper
-- Creates the physical schema for a tenant and registers it.
-- The DDL template (02_tenant_schema.sql) is applied by the
-- provisioning job with search_path set to the new schema.
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION create_tenant_schema(p_tenant_id uuid)
RETURNS text AS $$
DECLARE
    v_schema text;
BEGIN
    SELECT t.db_schema INTO v_schema FROM tenants t WHERE t.id = p_tenant_id;
    IF v_schema IS NULL THEN
        RAISE EXCEPTION 'tenant % not found', p_tenant_id;
    END IF;
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);
    RETURN v_schema;
END;
$$ LANGUAGE plpgsql;
