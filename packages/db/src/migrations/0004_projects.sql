CREATE TABLE platform.project (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  created_by_subject_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id),
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT
);
CREATE INDEX project_tenant_created_idx
  ON platform.project(tenant_id, created_at DESC, id DESC);

CREATE TABLE platform.project_create_idempotency (
  subject_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  idempotency_key_hash text NOT NULL CHECK (idempotency_key_hash ~ '^[0-9a-f]{64}$'),
  request_hash text NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  project_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subject_id, tenant_id, idempotency_key_hash),
  UNIQUE (project_id),
  FOREIGN KEY (tenant_id, subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (project_id, tenant_id)
    REFERENCES platform.project(id, tenant_id) ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE platform.project ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.project FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.project_create_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.project_create_idempotency FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION platform.current_subject_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION platform.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION platform.is_active_tenant_member(p_subject_id uuid, p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM platform.tenant_membership membership
    JOIN platform.tenant tenant ON tenant.id = membership.tenant_id
    WHERE membership.subject_id = p_subject_id
      AND membership.tenant_id = p_tenant_id
      AND membership.status = 'active'
      AND tenant.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION platform.can_create_project(p_subject_id uuid, p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT platform.is_active_tenant_member(p_subject_id, p_tenant_id)
    AND EXISTS (
      SELECT 1
      FROM platform.tenant_membership membership
      WHERE membership.subject_id = p_subject_id
        AND membership.tenant_id = p_tenant_id
        AND membership.role IN ('OWNER', 'ADMIN')
    )
$$;

CREATE OR REPLACE FUNCTION platform.is_project_created_event(p_event_name text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT p_event_name = 'project.created'
$$;

REVOKE ALL ON FUNCTION platform.current_subject_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.current_tenant_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.is_active_tenant_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.can_create_project(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.is_project_created_event(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.current_subject_id() TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.current_tenant_id() TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.is_active_tenant_member(uuid, uuid) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.can_create_project(uuid, uuid) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.is_project_created_event(text) TO spryxel_app;

CREATE POLICY project_select_active_member ON platform.project
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), project.tenant_id)
  );

CREATE POLICY project_insert_owner_admin ON platform.project
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.can_create_project(created_by_subject_id, tenant_id)
  );

CREATE POLICY project_idempotency_select_self ON platform.project_create_idempotency
  FOR SELECT USING (
    subject_id = platform.current_subject_id()
    AND tenant_id = platform.current_tenant_id()
    AND platform.can_create_project(subject_id, tenant_id)
  );

CREATE POLICY project_idempotency_insert_owner_admin ON platform.project_create_idempotency
  FOR INSERT WITH CHECK (
    subject_id = platform.current_subject_id()
    AND tenant_id = platform.current_tenant_id()
    AND platform.can_create_project(subject_id, tenant_id)
  );

ALTER TABLE platform.security_event
  DROP CONSTRAINT security_event_event_type_check;
ALTER TABLE platform.security_event
  ADD CONSTRAINT security_event_event_type_check
  CHECK (
    event_type IN ('identity.bootstrap', 'session.revoked')
    OR platform.is_project_created_event(event_type)
  );
ALTER TABLE platform.security_event
  ADD COLUMN project_id uuid;
ALTER TABLE platform.security_event
  ADD CONSTRAINT security_event_project_tenant_fk
  FOREIGN KEY (project_id, tenant_id)
  REFERENCES platform.project(id, tenant_id) ON DELETE RESTRICT;
ALTER TABLE platform.security_event
  ADD CONSTRAINT security_event_project_reference_check
  CHECK (
    (platform.is_project_created_event(event_type) AND project_id IS NOT NULL)
    OR (NOT platform.is_project_created_event(event_type) AND project_id IS NULL)
  );
DROP POLICY security_event_insert_self ON platform.security_event;
CREATE POLICY security_event_insert_self ON platform.security_event
  FOR INSERT WITH CHECK (
    subject_id = platform.current_subject_id()
    AND tenant_id = platform.current_tenant_id()
    AND (
      NOT platform.is_project_created_event(event_type)
      OR EXISTS (
        SELECT 1 FROM platform.project project
        WHERE project.id = security_event.project_id
          AND project.tenant_id = security_event.tenant_id
          AND project.created_by_subject_id = security_event.subject_id
      )
    )
  );
CREATE UNIQUE INDEX security_event_project_created_once
  ON platform.security_event(project_id)
  WHERE platform.is_project_created_event(event_type);

GRANT SELECT, INSERT ON platform.project TO spryxel_app;
GRANT SELECT, INSERT ON platform.project_create_idempotency TO spryxel_app;
