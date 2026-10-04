ALTER TABLE platform.job_attempt
  ADD COLUMN executor_kind text,
  ADD COLUMN executor_version text;

UPDATE platform.job_attempt
   SET executor_kind = 'spryxel.asset_contract.integrity_worker',
       executor_version = 'v1';

ALTER TABLE platform.job_attempt
  ALTER COLUMN executor_kind SET NOT NULL,
  ALTER COLUMN executor_version SET NOT NULL,
  ADD CONSTRAINT job_attempt_executor_provenance_check CHECK (
    executor_kind = 'spryxel.asset_contract.integrity_worker'
    AND executor_version = 'v1'
  );

CREATE FUNCTION platform.enforce_job_attempt_executor_provenance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.executor_kind := 'spryxel.asset_contract.integrity_worker';
    NEW.executor_version := 'v1';
    RETURN NEW;
  END IF;
  IF NEW.executor_kind IS DISTINCT FROM OLD.executor_kind
    OR NEW.executor_version IS DISTINCT FROM OLD.executor_version
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_attempt_executor_provenance_immutable';
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION platform.enforce_job_attempt_executor_provenance() FROM PUBLIC;
CREATE TRIGGER job_attempt_executor_provenance_immutable
  BEFORE INSERT OR UPDATE OF executor_kind, executor_version ON platform.job_attempt
  FOR EACH ROW EXECUTE FUNCTION platform.enforce_job_attempt_executor_provenance();

REVOKE ALL ON platform.job_attempt FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT SELECT ON platform.job_attempt TO spryxel_app;

DO $$
BEGIN
  IF pg_catalog.has_table_privilege('spryxel_app', 'platform.job_attempt', 'UPDATE')
    OR pg_catalog.has_column_privilege('spryxel_app', 'platform.job_attempt', 'executor_kind', 'UPDATE')
    OR pg_catalog.has_column_privilege('spryxel_app', 'platform.job_attempt', 'executor_version', 'UPDATE')
    OR pg_catalog.has_table_privilege('spryxel_worker', 'platform.job_attempt', 'INSERT')
    OR pg_catalog.has_table_privilege('spryxel_worker', 'platform.job_attempt', 'UPDATE')
    OR pg_catalog.has_table_privilege('spryxel_worker', 'platform.job_attempt', 'DELETE')
    OR pg_catalog.has_column_privilege('spryxel_worker', 'platform.job_attempt', 'executor_kind', 'UPDATE')
    OR pg_catalog.has_column_privilege('spryxel_worker', 'platform.job_attempt', 'executor_version', 'UPDATE')
  THEN
    RAISE EXCEPTION 'Runtime roles must not update Attempt executor provenance directly';
  END IF;
END
$$;
