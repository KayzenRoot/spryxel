CREATE TABLE platform.asset_contract (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  created_by_subject_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id, project_id),
  FOREIGN KEY (project_id, tenant_id)
    REFERENCES platform.project(id, tenant_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT
);

CREATE TABLE platform.asset_contract_version (
  contract_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  schema_version text NOT NULL CHECK (schema_version = 'asset-contract.v1'),
  sku_id text NOT NULL CHECK (sku_id ~ '^SKU-(MAP-|UI-)?[0-9]{3}$'),
  specification jsonb NOT NULL CHECK (jsonb_typeof(specification) = 'object'),
  specification_sha256 text NOT NULL CHECK (specification_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contract_id, version),
  UNIQUE (contract_id, version, tenant_id, project_id),
  FOREIGN KEY (contract_id, tenant_id, project_id)
    REFERENCES platform.asset_contract(id, tenant_id, project_id) ON DELETE RESTRICT
);

CREATE TABLE platform.durable_job (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  created_by_subject_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  contract_version integer NOT NULL,
  operation_type text NOT NULL CHECK (operation_type = 'asset_contract.integrity_check.v1'),
  status text NOT NULL CHECK (status IN ('queued', 'running', 'cancel_requested', 'succeeded', 'failed', 'cancelled')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 3),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts = 3),
  max_wall_time_ms integer NOT NULL DEFAULT 5000 CHECK (max_wall_time_ms = 5000),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_expires_at timestamptz,
  cancel_requested_at timestamptz,
  result_code text CHECK (result_code IS NULL OR result_code IN ('integrity_passed')),
  failure_code text CHECK (failure_code IS NULL OR failure_code IN ('contract_integrity_mismatch', 'attempts_exhausted', 'execution_timeout')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id, project_id),
  FOREIGN KEY (project_id, tenant_id)
    REFERENCES platform.project(id, tenant_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (contract_id, contract_version, tenant_id, project_id)
    REFERENCES platform.asset_contract_version(contract_id, version, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK ((status = 'running') = (lease_expires_at IS NOT NULL)),
  CHECK (status <> 'cancel_requested' OR cancel_requested_at IS NOT NULL),
  CHECK (cancel_requested_at IS NULL OR status IN ('cancel_requested', 'cancelled')),
  CHECK (status NOT IN ('succeeded', 'failed', 'cancelled') OR lease_expires_at IS NULL),
  CHECK ((status = 'succeeded') = (result_code IS NOT NULL)),
  CHECK ((status = 'failed') = (failure_code IS NOT NULL))
);

CREATE TABLE platform.job_create_idempotency (
  subject_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  operation_type text NOT NULL CHECK (operation_type = 'asset_contract.integrity_check.v1'),
  idempotency_key_sha256 text NOT NULL CHECK (idempotency_key_sha256 ~ '^[0-9a-f]{64}$'),
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  job_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subject_id, tenant_id, project_id, operation_type, idempotency_key_sha256),
  UNIQUE (job_id),
  FOREIGN KEY (tenant_id, subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (project_id, tenant_id)
    REFERENCES platform.project(id, tenant_id) ON DELETE RESTRICT,
  FOREIGN KEY (job_id, tenant_id, project_id)
    REFERENCES platform.durable_job(id, tenant_id, project_id) ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE platform.job_attempt (
  id uuid PRIMARY KEY,
  job_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  attempt_number integer NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  status text NOT NULL CHECK (status IN ('running', 'succeeded', 'failed', 'cancelled', 'expired')),
  worker_id text NOT NULL CHECK (length(worker_id) BETWEEN 1 AND 80),
  lease_token uuid NOT NULL,
  safe_failure_code text CHECK (safe_failure_code IS NULL OR safe_failure_code IN ('contract_integrity_mismatch', 'attempts_exhausted', 'execution_timeout', 'lease_expired')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (job_id, attempt_number),
  FOREIGN KEY (job_id, tenant_id, project_id)
    REFERENCES platform.durable_job(id, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK ((status = 'running') = (completed_at IS NULL))
);

CREATE INDEX durable_job_project_created_idx
  ON platform.durable_job(tenant_id, project_id, created_at DESC, id DESC);
CREATE INDEX durable_job_reconciliation_idx
  ON platform.durable_job(status, available_at, lease_expires_at, created_at, id);
CREATE INDEX job_attempt_project_job_idx
  ON platform.job_attempt(tenant_id, project_id, job_id, attempt_number DESC);
CREATE UNIQUE INDEX job_attempt_one_active_per_job
  ON platform.job_attempt(job_id) WHERE status = 'running';

ALTER TABLE platform.asset_contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_contract FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_contract_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_contract_version FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.durable_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.durable_job FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.job_create_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.job_create_idempotency FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.job_attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.job_attempt FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION platform.current_project_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$ SELECT NULLIF(current_setting('spryxel.project_id', true), '')::uuid $$;

CREATE POLICY asset_contract_select_member ON platform.asset_contract
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id()
    AND (platform.current_project_id() IS NULL OR project_id = platform.current_project_id())
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_contract_version_select_member ON platform.asset_contract_version
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id()
    AND (platform.current_project_id() IS NULL OR project_id = platform.current_project_id())
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY durable_job_select_member ON platform.durable_job
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id()
    AND (platform.current_project_id() IS NULL OR project_id = platform.current_project_id())
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY job_create_idempotency_select_self ON platform.job_create_idempotency
  FOR SELECT USING (
    subject_id = platform.current_subject_id()
    AND tenant_id = platform.current_tenant_id()
    AND (platform.current_project_id() IS NULL OR project_id = platform.current_project_id())
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY job_attempt_select_member ON platform.job_attempt
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id()
    AND (platform.current_project_id() IS NULL OR project_id = platform.current_project_id())
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_contract_insert_scoped ON platform.asset_contract
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_contract_version_insert_scoped ON platform.asset_contract_version
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND EXISTS (SELECT 1 FROM platform.asset_contract c
      WHERE c.id = asset_contract_version.contract_id AND c.tenant_id = tenant_id AND c.project_id = project_id)
  );
CREATE POLICY durable_job_insert_scoped ON platform.durable_job
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND created_by_subject_id = platform.current_subject_id() AND status = 'queued'
    AND operation_type = 'asset_contract.integrity_check.v1'
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY job_create_idempotency_insert_scoped ON platform.job_create_idempotency
  FOR INSERT WITH CHECK (
    subject_id = platform.current_subject_id() AND tenant_id = platform.current_tenant_id()
    AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY durable_job_cancel_update ON platform.durable_job
  FOR UPDATE USING (
    session_user = 'spryxel_app' AND tenant_id = platform.current_tenant_id()
    AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  ) WITH CHECK (
    session_user = 'spryxel_app' AND tenant_id = platform.current_tenant_id()
    AND project_id = platform.current_project_id()
    AND status IN ('queued', 'running', 'cancel_requested', 'cancelled', 'succeeded', 'failed')
  );
CREATE POLICY durable_job_worker_scope ON platform.durable_job
  FOR ALL USING (
    session_user = 'spryxel_worker' AND operation_type = 'asset_contract.integrity_check.v1'
    AND status IN ('queued', 'running', 'cancel_requested', 'succeeded', 'failed', 'cancelled')
  ) WITH CHECK (
    session_user = 'spryxel_worker' AND operation_type = 'asset_contract.integrity_check.v1'
  );
CREATE POLICY asset_contract_version_worker_scope ON platform.asset_contract_version
  FOR SELECT USING (
    session_user = 'spryxel_worker' AND EXISTS (
      SELECT 1 FROM platform.durable_job j WHERE j.contract_id = asset_contract_version.contract_id
        AND j.contract_version = asset_contract_version.version
        AND j.tenant_id = asset_contract_version.tenant_id AND j.project_id = asset_contract_version.project_id
        AND j.operation_type = 'asset_contract.integrity_check.v1'
    )
  );
CREATE POLICY job_attempt_worker_scope ON platform.job_attempt
  FOR ALL USING (
    session_user = 'spryxel_worker' AND EXISTS (
      SELECT 1 FROM platform.durable_job j WHERE j.id = job_attempt.job_id
        AND j.operation_type = 'asset_contract.integrity_check.v1'
    )
  ) WITH CHECK (
    session_user = 'spryxel_worker' AND EXISTS (
      SELECT 1 FROM platform.durable_job j WHERE j.id = job_attempt.job_id
        AND j.operation_type = 'asset_contract.integrity_check.v1'
    )
  );

CREATE OR REPLACE FUNCTION platform.jsonb_envelope_within_bounds(p_document jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  WITH RECURSIVE nodes(value, depth) AS (
    SELECT p_document, 0
    UNION ALL
    SELECT child.value, parent.depth + 1
      FROM nodes parent
      CROSS JOIN LATERAL (
        SELECT entry.value
          FROM jsonb_each(CASE WHEN jsonb_typeof(parent.value) = 'object' THEN parent.value ELSE '{}'::jsonb END) entry
        UNION ALL
        SELECT item.value
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(parent.value) = 'array' THEN parent.value ELSE '[]'::jsonb END) item
      ) child
  )
  SELECT count(*) <= 2048 AND max(depth) <= 16
    AND bool_and(CASE WHEN jsonb_typeof(value) = 'array' THEN jsonb_array_length(value) <= 128 ELSE true END)
    AND bool_and(CASE WHEN jsonb_typeof(value) = 'string' THEN octet_length(value #>> '{}') <= 4096 ELSE true END)
  FROM nodes
$$;

CREATE OR REPLACE FUNCTION platform.prevent_asset_contract_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_contract_immutable';
END
$$;
CREATE TRIGGER asset_contract_immutable
  BEFORE UPDATE OR DELETE ON platform.asset_contract
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_contract_mutation();
CREATE TRIGGER asset_contract_version_immutable
  BEFORE UPDATE OR DELETE ON platform.asset_contract_version
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_contract_mutation();

CREATE OR REPLACE FUNCTION platform.enforce_job_state_transition()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NOT (
    (OLD.status = 'queued' AND NEW.status IN ('running', 'cancelled')) OR
    (OLD.status = 'running' AND NEW.status IN ('queued', 'cancel_requested', 'succeeded', 'failed', 'cancelled')) OR
    (OLD.status = 'cancel_requested' AND NEW.status = 'cancelled')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'illegal_job_state_transition';
  END IF;
  RETURN NEW;
END
$$;
CREATE TRIGGER durable_job_state_transition
  BEFORE UPDATE OF status ON platform.durable_job
  FOR EACH ROW EXECUTE FUNCTION platform.enforce_job_state_transition();

CREATE OR REPLACE FUNCTION platform.create_integrity_job(
  p_idempotency_key_sha256 text,
  p_request_sha256 text,
  p_sku_id text,
  p_specification jsonb,
  p_specification_sha256 text
) RETURNS TABLE(job_id uuid, contract_id uuid, contract_version integer, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_subject uuid := platform.current_subject_id();
  v_tenant uuid := platform.current_tenant_id();
  v_project uuid := platform.current_project_id();
  v_job uuid := uuidv7();
  v_contract uuid := uuidv7();
  v_existing record;
BEGIN
  IF session_user <> 'spryxel_app' OR v_subject IS NULL OR v_tenant IS NULL OR v_project IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_creation_denied';
  END IF;
  IF NOT platform.is_active_tenant_member(v_subject, v_tenant)
    OR NOT EXISTS (SELECT 1 FROM platform.project p WHERE p.id = v_project AND p.tenant_id = v_tenant)
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_creation_denied';
  END IF;
  IF p_sku_id NOT IN (
    'SKU-001','SKU-002','SKU-003','SKU-004','SKU-005','SKU-006','SKU-007','SKU-008','SKU-009','SKU-010','SKU-011','SKU-012','SKU-013','SKU-014','SKU-015',
    'SKU-MAP-001','SKU-MAP-002','SKU-MAP-003','SKU-MAP-004','SKU-MAP-005','SKU-MAP-006','SKU-MAP-007','SKU-MAP-008','SKU-MAP-009',
    'SKU-UI-001','SKU-UI-002','SKU-UI-003','SKU-UI-004','SKU-UI-005','SKU-UI-006','SKU-UI-007','SKU-UI-008','SKU-UI-009','SKU-UI-010'
  ) OR jsonb_typeof(p_specification) <> 'object'
    OR octet_length(p_specification::text) > 65536
    OR NOT platform.jsonb_envelope_within_bounds(p_specification)
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
    OR p_request_sha256 !~ '^[0-9a-f]{64}$'
    OR p_specification_sha256 !~ '^[0-9a-f]{64}$'
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_contract';
  END IF;

  INSERT INTO platform.job_create_idempotency
    (subject_id, tenant_id, project_id, operation_type, idempotency_key_sha256, request_sha256, job_id)
  VALUES (v_subject, v_tenant, v_project, 'asset_contract.integrity_check.v1', p_idempotency_key_sha256, p_request_sha256, v_job)
  ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN
    SELECT m.job_id, m.request_sha256, j.contract_id, j.contract_version
      INTO v_existing
      FROM platform.job_create_idempotency m
      JOIN platform.durable_job j ON j.id = m.job_id
     WHERE m.subject_id = v_subject AND m.tenant_id = v_tenant AND m.project_id = v_project
       AND m.operation_type = 'asset_contract.integrity_check.v1'
       AND m.idempotency_key_sha256 = p_idempotency_key_sha256;
    IF NOT FOUND OR v_existing.request_sha256 <> p_request_sha256 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'idempotency_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.job_id, v_existing.contract_id, v_existing.contract_version, true;
    RETURN;
  END IF;

  INSERT INTO platform.asset_contract(id, tenant_id, project_id, created_by_subject_id)
    VALUES (v_contract, v_tenant, v_project, v_subject);
  INSERT INTO platform.asset_contract_version
    (contract_id, tenant_id, project_id, version, schema_version, sku_id, specification, specification_sha256)
    VALUES (v_contract, v_tenant, v_project, 1, 'asset-contract.v1', p_sku_id, p_specification, p_specification_sha256);
  INSERT INTO platform.durable_job
    (id, tenant_id, project_id, created_by_subject_id, contract_id, contract_version, operation_type, status)
    VALUES (v_job, v_tenant, v_project, v_subject, v_contract, 1, 'asset_contract.integrity_check.v1', 'queued');
  RETURN QUERY SELECT v_job, v_contract, 1, false;
END
$$;

CREATE OR REPLACE FUNCTION platform.request_job_cancel(p_job_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_subject uuid := platform.current_subject_id();
  v_tenant uuid := platform.current_tenant_id();
  v_project uuid := platform.current_project_id();
  v_status text;
  v_creator uuid;
  v_role text;
BEGIN
  IF session_user <> 'spryxel_app' OR v_subject IS NULL OR v_tenant IS NULL OR v_project IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_not_found';
  END IF;
  SELECT j.status, j.created_by_subject_id, m.role INTO v_status, v_creator, v_role
    FROM platform.durable_job j
    JOIN platform.tenant_membership m ON m.tenant_id = j.tenant_id AND m.subject_id = v_subject AND m.status = 'active'
   WHERE j.id = p_job_id AND j.tenant_id = v_tenant AND j.project_id = v_project
     AND j.tenant_id = platform.current_tenant_id()
     AND j.project_id = platform.current_project_id()
   FOR UPDATE OF j;
  IF NOT FOUND OR NOT platform.is_active_tenant_member(v_subject, v_tenant)
    OR (v_creator <> v_subject AND v_role NOT IN ('OWNER','ADMIN')) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_not_found';
  END IF;
  IF v_status = 'queued' THEN
    UPDATE platform.durable_job SET status = 'cancelled', updated_at = now()
     WHERE id = p_job_id AND status = 'queued';
    RETURN 'cancelled';
  ELSIF v_status = 'running' THEN
    UPDATE platform.durable_job SET status = 'cancel_requested', cancel_requested_at = now(), lease_expires_at = NULL, updated_at = now()
     WHERE id = p_job_id AND status = 'running';
    RETURN 'cancel_requested';
  END IF;
  RETURN v_status;
END
$$;

CREATE OR REPLACE FUNCTION platform.reconcile_jobs(p_batch integer)
RETURNS TABLE(job_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_expired record;
  v_cancel record;
BEGIN
  IF session_user <> 'spryxel_worker' OR p_batch NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  FOR v_cancel IN
    SELECT j.id FROM platform.durable_job j
     WHERE j.status = 'cancel_requested'
     ORDER BY j.cancel_requested_at, j.id
     LIMIT p_batch
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE platform.job_attempt SET status = 'cancelled', completed_at = now()
     WHERE platform.job_attempt.job_id = v_cancel.id AND platform.job_attempt.status = 'running';
    UPDATE platform.durable_job SET status = 'cancelled', updated_at = now()
     WHERE id = v_cancel.id AND status = 'cancel_requested';
  END LOOP;
  FOR v_expired IN
    SELECT j.id, j.attempt_count, j.max_attempts
      FROM platform.durable_job j
     WHERE j.status = 'running' AND j.lease_expires_at <= now()
     ORDER BY j.lease_expires_at, j.id
     LIMIT p_batch
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE platform.job_attempt SET status = 'expired', safe_failure_code = 'lease_expired', completed_at = now()
     WHERE platform.job_attempt.job_id = v_expired.id AND platform.job_attempt.status = 'running';
    IF v_expired.attempt_count >= v_expired.max_attempts THEN
      UPDATE platform.durable_job SET status = 'failed', lease_expires_at = NULL, failure_code = 'attempts_exhausted', updated_at = now()
       WHERE id = v_expired.id;
    ELSE
      UPDATE platform.durable_job SET status = 'queued', lease_expires_at = NULL, available_at = now(), updated_at = now()
       WHERE id = v_expired.id;
    END IF;
  END LOOP;
  RETURN QUERY
    SELECT j.id FROM platform.durable_job j
     WHERE j.operation_type = 'asset_contract.integrity_check.v1' AND j.status = 'queued'
       AND j.available_at <= now() AND j.attempt_count < j.max_attempts
     ORDER BY j.available_at, j.created_at, j.id LIMIT p_batch;
END
$$;

CREATE OR REPLACE FUNCTION platform.claim_job(p_job_id uuid, p_worker_id text, p_lease_seconds integer)
RETURNS TABLE(job_id uuid, attempt_id uuid, lease_token uuid, attempt_number integer, specification jsonb, specification_sha256 text, sku_id text, contract_version integer, operation_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_job platform.durable_job%ROWTYPE;
  v_attempt uuid;
  v_token uuid;
BEGIN
  IF session_user <> 'spryxel_worker' OR length(p_worker_id) NOT BETWEEN 1 AND 80 OR p_lease_seconds NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  SELECT * INTO v_job FROM platform.durable_job j
   WHERE j.id = p_job_id AND j.operation_type = 'asset_contract.integrity_check.v1'
     AND j.status = 'queued' AND j.available_at <= now() AND j.attempt_count < j.max_attempts
   FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RETURN; END IF;
  v_attempt := uuidv7();
  v_token := gen_random_uuid();
  UPDATE platform.durable_job SET status = 'running', attempt_count = attempt_count + 1,
    lease_expires_at = now() + make_interval(secs => p_lease_seconds), updated_at = now()
   WHERE id = p_job_id;
  INSERT INTO platform.job_attempt(id, job_id, tenant_id, project_id, attempt_number, status, worker_id, lease_token)
    VALUES (v_attempt, p_job_id, v_job.tenant_id, v_job.project_id, v_job.attempt_count + 1, 'running', p_worker_id, v_token);
  RETURN QUERY SELECT v_job.id, v_attempt, v_token, v_job.attempt_count + 1,
    v.specification, v.specification_sha256, v.sku_id, v.version, v_job.operation_type
    FROM platform.asset_contract_version v
   WHERE v.contract_id = v_job.contract_id AND v.version = v_job.contract_version
     AND v.tenant_id = v_job.tenant_id AND v.project_id = v_job.project_id;
END
$$;

CREATE OR REPLACE FUNCTION platform.finish_job(p_job_id uuid, p_attempt_id uuid, p_lease_token uuid, p_outcome text, p_failure_code text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_attempt platform.job_attempt%ROWTYPE;
  v_status text;
BEGIN
  IF session_user <> 'spryxel_worker' OR p_outcome NOT IN ('succeeded','failed','cancelled')
    OR (p_failure_code IS NOT NULL AND p_failure_code NOT IN ('contract_integrity_mismatch','attempts_exhausted','execution_timeout')) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  SELECT * INTO v_attempt FROM platform.job_attempt a
   WHERE a.id = p_attempt_id AND a.job_id = p_job_id AND a.lease_token = p_lease_token AND a.status = 'running'
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT j.status INTO v_status FROM platform.durable_job j WHERE j.id = p_job_id FOR UPDATE;
  IF v_status NOT IN ('running','cancel_requested') THEN RETURN false; END IF;
  IF v_status = 'cancel_requested' OR p_outcome = 'cancelled' THEN
    p_outcome := 'cancelled';
    p_failure_code := NULL;
  END IF;
  UPDATE platform.job_attempt SET status = p_outcome, safe_failure_code = p_failure_code, completed_at = now()
   WHERE id = p_attempt_id;
  UPDATE platform.durable_job SET status = p_outcome,
    lease_expires_at = NULL,
    result_code = CASE WHEN p_outcome = 'succeeded' THEN 'integrity_passed' ELSE NULL END,
    failure_code = CASE WHEN p_outcome = 'failed' THEN COALESCE(p_failure_code, 'contract_integrity_mismatch') ELSE NULL END,
    updated_at = now()
   WHERE id = p_job_id;
  RETURN true;
END
$$;

REVOKE ALL ON platform.asset_contract, platform.asset_contract_version, platform.durable_job,
  platform.job_create_idempotency, platform.job_attempt FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.current_project_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.jsonb_envelope_within_bounds(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.create_integrity_job(text, text, text, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.request_job_cancel(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.reconcile_jobs(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.claim_job(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) FROM PUBLIC;

GRANT SELECT ON platform.asset_contract, platform.asset_contract_version,
  platform.durable_job, platform.job_create_idempotency, platform.job_attempt TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.current_project_id() TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.create_integrity_job(text, text, text, jsonb, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.request_job_cancel(uuid) TO spryxel_app;

GRANT USAGE ON SCHEMA platform TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.reconcile_jobs(integer) TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.claim_job(uuid, text, integer) TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) TO spryxel_worker;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'spryxel_worker') THEN
    RAISE EXCEPTION 'Required least-privilege worker role spryxel_worker must exist before applying job migration';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'spryxel_worker'
    AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole OR rolreplication)) THEN
    RAISE EXCEPTION 'spryxel_worker must remain unprivileged and NOBYPASSRLS';
  END IF;
END
$$;
