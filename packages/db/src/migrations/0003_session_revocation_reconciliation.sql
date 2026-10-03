CREATE TABLE platform.session_revocation_intent (
  id uuid PRIMARY KEY,
  subject_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  external_session_ref text NOT NULL CHECK (length(external_session_ref) BETWEEN 1 AND 255),
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 80),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'retryable', 'provider_confirmed', 'finalized')),
  failure_code text CHECK (failure_code IS NULL OR failure_code IN ('provider_unavailable', 'provider_not_confirmed')),
  provider_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  UNIQUE (subject_id, tenant_id, external_session_ref),
  UNIQUE (id, subject_id, tenant_id),
  CHECK (
    (status = 'retryable' AND failure_code IS NOT NULL)
    OR (status <> 'retryable' AND failure_code IS NULL)
  ),
  CHECK (
    (status IN ('provider_confirmed', 'finalized') AND provider_confirmed_at IS NOT NULL)
    OR (status IN ('pending', 'retryable') AND provider_confirmed_at IS NULL)
  )
);
CREATE INDEX session_revocation_intent_pending_idx
  ON platform.session_revocation_intent(tenant_id, subject_id, updated_at)
  WHERE status IN ('pending', 'retryable', 'provider_confirmed');

ALTER TABLE platform.session_revocation_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.session_revocation_intent FORCE ROW LEVEL SECURITY;

CREATE POLICY session_revocation_intent_select_self
  ON platform.session_revocation_intent
  FOR SELECT USING (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
  );
CREATE POLICY session_revocation_intent_insert_self
  ON platform.session_revocation_intent
  FOR INSERT WITH CHECK (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM platform.tenant_membership membership
      WHERE membership.subject_id = session_revocation_intent.subject_id
        AND membership.tenant_id = session_revocation_intent.tenant_id
        AND membership.status = 'active'
    )
  );
CREATE POLICY session_revocation_intent_update_self
  ON platform.session_revocation_intent
  FOR UPDATE USING (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM platform.tenant_membership membership
      WHERE membership.subject_id = session_revocation_intent.subject_id
        AND membership.tenant_id = session_revocation_intent.tenant_id
        AND membership.status = 'active'
    )
  ) WITH CHECK (
    subject_id = NULLIF(current_setting('spryxel.subject_id', true), '')::uuid
    AND tenant_id = NULLIF(current_setting('spryxel.tenant_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM platform.tenant_membership membership
      WHERE membership.subject_id = session_revocation_intent.subject_id
        AND membership.tenant_id = session_revocation_intent.tenant_id
        AND membership.status = 'active'
    )
  );

ALTER TABLE platform.security_event
  ADD COLUMN session_revocation_intent_id uuid;
ALTER TABLE platform.security_event
  ADD CONSTRAINT security_event_session_revocation_intent_tenant_fk
  FOREIGN KEY (session_revocation_intent_id, subject_id, tenant_id)
  REFERENCES platform.session_revocation_intent(id, subject_id, tenant_id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX security_event_session_revocation_intent_once
  ON platform.security_event(session_revocation_intent_id)
  WHERE session_revocation_intent_id IS NOT NULL;

GRANT SELECT, INSERT ON platform.session_revocation_intent TO spryxel_app;
GRANT UPDATE (status, failure_code, provider_confirmed_at, updated_at)
  ON platform.session_revocation_intent TO spryxel_app;
GRANT SELECT ON platform.security_event TO spryxel_app;
