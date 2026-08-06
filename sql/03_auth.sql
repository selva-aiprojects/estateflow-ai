-- =====================================================================
-- EstateFlow — Auth & Communications (public schema / control plane)
-- Identity, sessions, password reset, and the email outbox that backs
-- welcome kits, password resets and payment reminders.
-- Idempotent: safe to run repeatedly (migration style).
-- =====================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS short_code varchar(10);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS location varchar(100) NOT NULL DEFAULT '';

-- ---------------------------------------------------------------------
-- Sessions (httpOnly cookie carries the raw token; only its sha256
-- hash is stored server-side).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash  text        NOT NULL UNIQUE,
    ip_address  inet,
    user_agent  text,
    expires_at  timestamptz NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.sessions(expires_at);

-- ---------------------------------------------------------------------
-- Password reset tokens (hash stored, one-shot)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash text        NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON public.password_reset_tokens(user_id);

-- ---------------------------------------------------------------------
-- Email outbox — queued by domain logic (welcome kit, password reset,
-- payment reminders), flushed by the Resend adapter in lib/mailer.ts.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_outbox (
    id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            uuid         REFERENCES public.tenants(id) ON DELETE CASCADE,
    to_email             varchar(320) NOT NULL,
    to_name              varchar(200),
    template             varchar(100) NOT NULL,
    subject              text         NOT NULL,
    html                 text         NOT NULL,
    status               varchar(20)  NOT NULL DEFAULT 'queued'
                                     CHECK (status IN ('queued','sending','sent','failed')),
    provider             varchar(30)  NOT NULL DEFAULT 'resend',
    provider_message_id  text,
    error                text,
    created_at           timestamptz NOT NULL DEFAULT now(),
    sent_at              timestamptz
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON public.email_outbox(status, created_at);
