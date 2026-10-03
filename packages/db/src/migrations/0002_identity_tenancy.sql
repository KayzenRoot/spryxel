CREATE TABLE platform.identity_subject (
  id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE platform.external_auth_identity (
  provider text NOT NULL CHECK (provider ~ '^[a-z][a-z0-9_-]{0,31}$'),
  external_subject text NOT NULL CHECK (length(external_subject) BETWEEN 1 AND 255),
  subject_id uuid NOT NULL REFERENCES platform.identity_subject(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, external_subject),
  UNIQUE (provider, external_subject, subject_id)
);
CREATE INDEX external_auth_identity_subject_idx ON platform.external_auth_identity(subject_id);

CREATE TABLE platform.tenant (
  id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (length(display_name) BETWEEN 1 AND 120),
  created_by_subject_id uuid NOT NULL REFERENCES platform.identity_subject(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE platform.tenant_membership (
  tenant_id uuid NOT NULL REFERENCES platform.tenant(id) ON DELETE RESTRICT,
  subject_id uuid NOT NULL REFERENCES platform.identity_subject(id) ON DELETE RESTRICT,
  role text NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, subject_id)
);
CREATE INDEX tenant_membership_subject_idx ON platform.tenant_membership(subject_id, status, created_at);

CREATE TABLE platform.security_event (
  id uuid PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES platform.identity_subject(id) ON DELETE RESTRICT,
  tenant_id uuid NOT NULL REFERENCES platform.tenant(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('identity.bootstrap', 'session.revoked')),
  external_session_ref text CHECK (external_session_ref IS NULL OR length(external_session_ref) BETWEEN 1 AND 255),
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 80),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX security_event_tenant_created_idx ON platform.security_event(tenant_id, created_at DESC);

ALTER TABLE platform.tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.tenant FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.identity_subject ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.identity_subject FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.external_auth_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.external_auth_identity FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.tenant_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.tenant_membership FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.security_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.security_event FORCE ROW LEVEL SECURITY;

CREATE POLICY identity_subject_select_self ON platform.identity_subject
  FOR SELECT USING (id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid);
CREATE POLICY identity_subject_insert_self ON platform.identity_subject
  FOR INSERT WITH CHECK (id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid);

CREATE POLICY external_auth_identity_select_self ON platform.external_auth_identity
  FOR SELECT USING (
    provider = NULLIF(current_setting('spryxel.external_provider', true), '')
    AND external_subject = NULLIF(current_setting('spryxel.external_subject', true), '')
  );
CREATE POLICY external_auth_identity_insert_self ON platform.external_auth_identity
  FOR INSERT WITH CHECK (
    provider = NULLIF(current_setting('spryxel.external_provider', true), '')
    AND external_subject = NULLIF(current_setting('spryxel.external_subject', true), '')
    AND subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
  );

CREATE POLICY tenant_select_own ON platform.tenant
  FOR SELECT USING (
    id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND (
      created_by_subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
      OR EXISTS (
        SELECT 1 FROM platform.tenant_membership membership
        WHERE membership.tenant_id = tenant.id
          AND membership.subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
          AND membership.status = 'active'
      )
    )
  );
CREATE POLICY tenant_insert_bootstrap ON platform.tenant
  FOR INSERT WITH CHECK (
    id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND created_by_subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
  );
CREATE POLICY tenant_update_privileged ON platform.tenant
  FOR UPDATE USING (
    id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM platform.tenant_membership membership
      WHERE membership.tenant_id = tenant.id
        AND membership.subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
        AND membership.status = 'active'
        AND membership.role IN ('OWNER', 'ADMIN')
    )
  ) WITH CHECK (id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid);

CREATE POLICY tenant_membership_select_self ON platform.tenant_membership
  FOR SELECT USING (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND (
      NULLIF(current_setting('spryxel.tenant_id', true), '') IS NULL
      OR tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    )
  );
CREATE POLICY tenant_membership_insert_owner_bootstrap ON platform.tenant_membership
  FOR INSERT WITH CHECK (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND role = 'OWNER'
    AND EXISTS (
      SELECT 1 FROM platform.tenant tenant
      WHERE tenant.id = tenant_membership.tenant_id
        AND tenant.created_by_subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    )
  );

CREATE POLICY security_event_select_self ON platform.security_event
  FOR SELECT USING (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
  );
CREATE POLICY security_event_insert_self ON platform.security_event
  FOR INSERT WITH CHECK (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
  );

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spryxel_app') THEN
    RAISE EXCEPTION 'Required NOBYPASSRLS role spryxel_app must exist before applying identity migration';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spryxel_app' AND (rolsuper OR rolbypassrls)) THEN
    RAISE EXCEPTION 'spryxel_app must not be superuser or bypass row-level security';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA platform TO spryxel_app;
GRANT SELECT, INSERT ON platform.identity_subject, platform.external_auth_identity TO spryxel_app;
GRANT SELECT, INSERT, UPDATE ON platform.tenant TO spryxel_app;
GRANT SELECT, INSERT ON platform.tenant_membership, platform.security_event TO spryxel_app;
