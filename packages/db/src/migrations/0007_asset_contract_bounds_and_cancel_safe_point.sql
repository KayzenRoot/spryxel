ALTER TABLE platform.asset_contract_version
  ADD COLUMN max_candidates integer NOT NULL DEFAULT 1,
  ADD COLUMN max_retries integer NOT NULL DEFAULT 2,
  ADD COLUMN max_repairs integer NOT NULL DEFAULT 0,
  ADD COLUMN max_wall_time_ms integer NOT NULL DEFAULT 5000,
  ADD CONSTRAINT asset_contract_execution_bounds_check CHECK (
    max_candidates = 1 AND max_retries = 2 AND max_repairs = 0 AND max_wall_time_ms = 5000
  );

DROP FUNCTION platform.create_integrity_job(text, text, text, text, text);
CREATE FUNCTION platform.create_integrity_job(
  p_idempotency_key_sha256 text,
  p_request_sha256 text,
  p_sku_id text,
  p_canonical_specification text,
  p_specification_sha256 text,
  p_max_candidates integer,
  p_max_retries integer,
  p_max_repairs integer,
  p_max_wall_time_ms integer
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
  v_specification jsonb;
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
  IF p_canonical_specification IS NULL
    OR octet_length(convert_to(p_canonical_specification, 'UTF8')) > 65536
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_contract';
  END IF;
  BEGIN
    v_specification := p_canonical_specification::jsonb;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_contract';
  END;
  IF p_sku_id NOT IN (
    'SKU-001','SKU-002','SKU-003','SKU-004','SKU-005','SKU-006','SKU-007','SKU-008','SKU-009','SKU-010','SKU-011','SKU-012','SKU-013','SKU-014','SKU-015',
    'SKU-MAP-001','SKU-MAP-002','SKU-MAP-003','SKU-MAP-004','SKU-MAP-005','SKU-MAP-006','SKU-MAP-007','SKU-MAP-008','SKU-MAP-009',
    'SKU-UI-001','SKU-UI-002','SKU-UI-003','SKU-UI-004','SKU-UI-005','SKU-UI-006','SKU-UI-007','SKU-UI-008','SKU-UI-009','SKU-UI-010'
  ) OR jsonb_typeof(v_specification) <> 'object'
    OR NOT platform.jsonb_envelope_within_bounds(v_specification)
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
    OR p_request_sha256 !~ '^[0-9a-f]{64}$'
    OR p_specification_sha256 !~ '^[0-9a-f]{64}$'
    OR p_max_candidates IS DISTINCT FROM 1
    OR p_max_retries IS DISTINCT FROM 2
    OR p_max_repairs IS DISTINCT FROM 0
    OR p_max_wall_time_ms IS DISTINCT FROM 5000
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
    (contract_id, tenant_id, project_id, version, schema_version, sku_id, specification, specification_sha256,
     max_candidates, max_retries, max_repairs, max_wall_time_ms)
    VALUES (v_contract, v_tenant, v_project, 1, 'asset-contract.v1', p_sku_id, v_specification, p_specification_sha256,
            p_max_candidates, p_max_retries, p_max_repairs, p_max_wall_time_ms);
  INSERT INTO platform.durable_job
    (id, tenant_id, project_id, created_by_subject_id, contract_id, contract_version, operation_type, status)
    VALUES (v_job, v_tenant, v_project, v_subject, v_contract, 1, 'asset_contract.integrity_check.v1', 'queued');
  RETURN QUERY SELECT v_job, v_contract, 1, false;
END
$$;

REVOKE ALL ON FUNCTION platform.create_integrity_job(text, text, text, text, text, integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.create_integrity_job(text, text, text, text, text, integer, integer, integer, integer) TO spryxel_app;

ALTER TABLE platform.durable_job
  ALTER COLUMN max_attempts DROP DEFAULT,
  ALTER COLUMN max_wall_time_ms DROP DEFAULT;

CREATE OR REPLACE FUNCTION platform.derive_durable_job_execution_bounds()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_max_retries integer;
  v_max_wall_time_ms integer;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.contract_id IS DISTINCT FROM OLD.contract_id
      OR NEW.contract_version IS DISTINCT FROM OLD.contract_version
      OR NEW.max_attempts IS DISTINCT FROM OLD.max_attempts
      OR NEW.max_wall_time_ms IS DISTINCT FROM OLD.max_wall_time_ms
    THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_execution_bounds_immutable';
    END IF;
    RETURN NEW;
  END IF;

  SELECT version.max_retries, version.max_wall_time_ms
    INTO v_max_retries, v_max_wall_time_ms
    FROM platform.asset_contract_version version
   WHERE version.contract_id = NEW.contract_id
     AND version.version = NEW.contract_version
     AND version.tenant_id = NEW.tenant_id
     AND version.project_id = NEW.project_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'job_contract_version_missing';
  END IF;

  NEW.max_attempts := v_max_retries + 1;
  NEW.max_wall_time_ms := v_max_wall_time_ms;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION platform.derive_durable_job_execution_bounds() FROM PUBLIC;
CREATE TRIGGER durable_job_execution_bounds
  BEFORE INSERT OR UPDATE OF contract_id, contract_version, max_attempts, max_wall_time_ms
  ON platform.durable_job
  FOR EACH ROW EXECUTE FUNCTION platform.derive_durable_job_execution_bounds();

DO $$
DECLARE
  v_constraint record;
BEGIN
  FOR v_constraint IN
    SELECT constraint_row.conname
      FROM pg_catalog.pg_constraint constraint_row
     WHERE constraint_row.conrelid = 'platform.durable_job'::regclass
       AND constraint_row.contype = 'c'
       AND pg_catalog.pg_get_constraintdef(constraint_row.oid) LIKE '%running%'
       AND pg_catalog.pg_get_constraintdef(constraint_row.oid) LIKE '%lease_expires_at IS NOT NULL%'
  LOOP
    EXECUTE pg_catalog.format(
      'ALTER TABLE platform.durable_job DROP CONSTRAINT %I',
      v_constraint.conname
    );
  END LOOP;
END
$$;

ALTER TABLE platform.durable_job
  ADD CONSTRAINT durable_job_active_lease_check CHECK (
    (status = 'running') = (lease_expires_at IS NOT NULL AND status <> 'cancel_requested')
  );

CREATE POLICY job_create_idempotency_worker_scope ON platform.job_create_idempotency
  FOR SELECT USING (
    session_user = 'spryxel_worker' AND EXISTS (
      SELECT 1 FROM platform.durable_job job
       WHERE job.id = job_create_idempotency.job_id
         AND job.operation_type = 'asset_contract.integrity_check.v1'
    )
  );

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
    UPDATE platform.durable_job SET status = 'cancel_requested', cancel_requested_at = now(), updated_at = now()
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
       AND (j.lease_expires_at IS NULL OR j.lease_expires_at <= clock_timestamp())
     ORDER BY j.cancel_requested_at, j.id
     LIMIT p_batch
     FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE platform.job_attempt SET status = 'cancelled', completed_at = now()
     WHERE platform.job_attempt.job_id = v_cancel.id AND platform.job_attempt.status = 'running';
    UPDATE platform.durable_job SET status = 'cancelled', lease_expires_at = NULL, updated_at = now()
     WHERE id = v_cancel.id AND status = 'cancel_requested';
  END LOOP;
  FOR v_expired IN
    SELECT j.id, j.attempt_count, j.max_attempts
      FROM platform.durable_job j
     WHERE j.status = 'running' AND j.lease_expires_at <= clock_timestamp()
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

DROP FUNCTION platform.claim_job(uuid, text, integer);
CREATE FUNCTION platform.claim_job(p_job_id uuid, p_worker_id text, p_lease_seconds integer)
RETURNS TABLE(
  job_id uuid,
  attempt_id uuid,
  lease_token uuid,
  attempt_number integer,
  specification jsonb,
  specification_sha256 text,
  sku_id text,
  contract_version integer,
  operation_type text,
  max_attempts integer,
  job_max_wall_time_ms integer,
  max_candidates integer,
  max_retries integer,
  max_repairs integer,
  max_wall_time_ms integer,
  request_sha256 text
)
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
    version.specification, version.specification_sha256, version.sku_id, version.version,
    v_job.operation_type, v_job.max_attempts, v_job.max_wall_time_ms,
    version.max_candidates, version.max_retries, version.max_repairs, version.max_wall_time_ms,
    idempotency.request_sha256
    FROM platform.asset_contract_version version
    JOIN platform.job_create_idempotency idempotency ON idempotency.job_id = v_job.id
   WHERE version.contract_id = v_job.contract_id AND version.version = v_job.contract_version
     AND version.tenant_id = v_job.tenant_id AND version.project_id = v_job.project_id;
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
  v_lease_expires_at timestamptz;
BEGIN
  IF session_user <> 'spryxel_worker' OR p_outcome NOT IN ('succeeded','failed','cancelled')
    OR (p_failure_code IS NOT NULL AND p_failure_code NOT IN ('contract_integrity_mismatch','attempts_exhausted','execution_timeout')) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  SELECT j.status, j.lease_expires_at INTO v_status, v_lease_expires_at
    FROM platform.durable_job j WHERE j.id = p_job_id FOR UPDATE;
  IF NOT FOUND OR v_status NOT IN ('running','cancel_requested')
    OR v_lease_expires_at IS NULL OR v_lease_expires_at <= clock_timestamp() THEN
    RETURN false;
  END IF;
  SELECT * INTO v_attempt FROM platform.job_attempt a
   WHERE a.id = p_attempt_id AND a.job_id = p_job_id AND a.lease_token = p_lease_token AND a.status = 'running'
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
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

REVOKE ALL ON FUNCTION platform.request_job_cancel(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.reconcile_jobs(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.claim_job(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.request_job_cancel(uuid) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.reconcile_jobs(integer) TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.claim_job(uuid, text, integer) TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) TO spryxel_worker;
