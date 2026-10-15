ALTER TABLE platform.asset_contract_version
  ADD COLUMN max_candidates integer NOT NULL DEFAULT 1,
  ADD COLUMN max_retries integer NOT NULL DEFAULT 2,
  ADD COLUMN max_repairs integer NOT NULL DEFAULT 0,
  ADD COLUMN max_wall_time_ms integer NOT NULL DEFAULT 5000,
  ADD CONSTRAINT asset_contract_execution_bounds_check CHECK (
    max_candidates = 1 AND max_retries = 2 AND max_repairs = 0 AND max_wall_time_ms = 5000
  );

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
    EXECUTE pg_catalog.format('ALTER TABLE platform.durable_job DROP CONSTRAINT %I', v_constraint.conname);
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

CREATE FUNCTION platform.enforce_job_cancel_safe_point()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
BEGIN
  IF OLD.status = 'running' AND NEW.status = 'cancel_requested' THEN
    NEW.lease_expires_at := OLD.lease_expires_at;
    RETURN NEW;
  END IF;
  IF OLD.status <> 'cancel_requested' OR NEW.status <> 'cancelled' THEN
    RETURN NEW;
  END IF;
  IF OLD.lease_expires_at IS NOT NULL AND OLD.lease_expires_at > clock_timestamp() THEN
    IF pg_catalog.current_setting('spryxel.finish_job_safe_point', true) = 'true' THEN
      RETURN NEW;
    END IF;
    RETURN NULL;
  END IF;
  IF pg_catalog.current_setting('spryxel.reconcile_cancel_safe_point', true) = 'true' THEN
    NEW.lease_expires_at := NULL;
    RETURN NEW;
  END IF;
  RETURN NULL;
END
$$;

REVOKE ALL ON FUNCTION platform.enforce_job_cancel_safe_point() FROM PUBLIC;
CREATE TRIGGER durable_job_cancel_safe_point
  BEFORE UPDATE OF status, lease_expires_at ON platform.durable_job
  FOR EACH ROW EXECUTE FUNCTION platform.enforce_job_cancel_safe_point();

CREATE FUNCTION platform.enforce_attempt_cancel_safe_point()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_status text;
  v_lease_expires_at timestamptz;
BEGIN
  IF OLD.status <> 'running' OR NEW.status <> 'cancelled' THEN
    RETURN NEW;
  END IF;
  SELECT job.status, job.lease_expires_at
    INTO v_status, v_lease_expires_at
    FROM platform.durable_job job
   WHERE job.id = OLD.job_id;
  IF v_status <> 'cancel_requested' THEN
    RETURN NEW;
  END IF;
  IF v_lease_expires_at IS NOT NULL AND v_lease_expires_at > clock_timestamp() THEN
    IF pg_catalog.current_setting('spryxel.finish_job_safe_point', true) = 'true' THEN
      RETURN NEW;
    END IF;
    RETURN NULL;
  END IF;
  IF pg_catalog.current_setting('spryxel.reconcile_cancel_safe_point', true) = 'true' THEN
    RETURN NEW;
  END IF;
  RETURN NULL;
END
$$;

REVOKE ALL ON FUNCTION platform.enforce_attempt_cancel_safe_point() FROM PUBLIC;
CREATE TRIGGER job_attempt_cancel_safe_point
  BEFORE UPDATE OF status ON platform.job_attempt
  FOR EACH ROW EXECUTE FUNCTION platform.enforce_attempt_cancel_safe_point();

ALTER FUNCTION platform.reconcile_jobs(integer) RENAME TO reconcile_jobs_before_cancel_safe_point;
REVOKE ALL ON FUNCTION platform.reconcile_jobs_before_cancel_safe_point(integer) FROM PUBLIC, spryxel_worker;
CREATE FUNCTION platform.reconcile_jobs(p_batch integer)
RETURNS TABLE(job_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
BEGIN
  IF session_user <> 'spryxel_worker' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  PERFORM pg_catalog.set_config('spryxel.reconcile_cancel_safe_point', 'true', true);
  RETURN QUERY SELECT * FROM platform.reconcile_jobs_before_cancel_safe_point(p_batch);
END
$$;
REVOKE ALL ON FUNCTION platform.reconcile_jobs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.reconcile_jobs(integer) TO spryxel_worker;

ALTER FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) RENAME TO finish_job_before_cancel_safe_point;
REVOKE ALL ON FUNCTION platform.finish_job_before_cancel_safe_point(uuid, uuid, uuid, text, text) FROM PUBLIC, spryxel_worker;
CREATE FUNCTION platform.finish_job(
  p_job_id uuid,
  p_attempt_id uuid,
  p_lease_token uuid,
  p_outcome text,
  p_failure_code text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_status text;
  v_lease_expires_at timestamptz;
  v_finished boolean;
BEGIN
  IF session_user <> 'spryxel_worker' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  SELECT job.status, job.lease_expires_at
    INTO v_status, v_lease_expires_at
    FROM platform.durable_job job
   WHERE job.id = p_job_id
   FOR UPDATE;
  IF NOT FOUND OR v_status NOT IN ('running', 'cancel_requested')
    OR v_lease_expires_at IS NULL OR v_lease_expires_at <= clock_timestamp()
  THEN
    RETURN false;
  END IF;
  PERFORM pg_catalog.set_config('spryxel.finish_job_safe_point', 'true', true);
  v_finished := platform.finish_job_before_cancel_safe_point(
    p_job_id, p_attempt_id, p_lease_token, p_outcome, p_failure_code
  );
  IF NOT v_finished THEN
    RETURN false;
  END IF;
  SELECT job.status INTO v_status
    FROM platform.durable_job job
   WHERE job.id = p_job_id;
  RETURN v_status NOT IN ('running', 'cancel_requested');
END
$$;
REVOKE ALL ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) TO spryxel_worker;

CREATE FUNCTION platform.read_claimed_job_execution_bounds(
  p_job_id uuid,
  p_attempt_id uuid,
  p_lease_token uuid
) RETURNS TABLE(
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
BEGIN
  IF session_user <> 'spryxel_worker' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'worker_operation_denied';
  END IF;
  RETURN QUERY
    SELECT job.max_attempts, job.max_wall_time_ms,
           version.max_candidates, version.max_retries, version.max_repairs, version.max_wall_time_ms,
           idempotency.request_sha256
      FROM platform.durable_job job
      JOIN platform.job_attempt attempt
        ON attempt.job_id = job.id AND attempt.id = p_attempt_id AND attempt.lease_token = p_lease_token
      JOIN platform.asset_contract_version version
        ON version.contract_id = job.contract_id AND version.version = job.contract_version
       AND version.tenant_id = job.tenant_id AND version.project_id = job.project_id
      JOIN platform.job_create_idempotency idempotency ON idempotency.job_id = job.id
     WHERE job.id = p_job_id AND job.operation_type = 'asset_contract.integrity_check.v1'
       AND job.status IN ('running', 'cancel_requested')
       AND job.lease_expires_at > clock_timestamp()
       AND attempt.status = 'running';
END
$$;
REVOKE ALL ON FUNCTION platform.read_claimed_job_execution_bounds(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.read_claimed_job_execution_bounds(uuid, uuid, uuid) TO spryxel_worker;

GRANT EXECUTE ON FUNCTION platform.reconcile_jobs(integer) TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.claim_job(uuid, text, integer) TO spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.finish_job(uuid, uuid, uuid, text, text) TO spryxel_worker;