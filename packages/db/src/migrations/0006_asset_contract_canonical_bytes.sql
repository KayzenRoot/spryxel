DROP FUNCTION IF EXISTS platform.create_integrity_job(text, text, text, jsonb, text);

CREATE FUNCTION platform.create_integrity_job(
  p_idempotency_key_sha256 text,
  p_request_sha256 text,
  p_sku_id text,
  p_canonical_specification text,
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
    VALUES (v_contract, v_tenant, v_project, 1, 'asset-contract.v1', p_sku_id, v_specification, p_specification_sha256);
  INSERT INTO platform.durable_job
    (id, tenant_id, project_id, created_by_subject_id, contract_id, contract_version, operation_type, status)
    VALUES (v_job, v_tenant, v_project, v_subject, v_contract, 1, 'asset_contract.integrity_check.v1', 'queued');
  RETURN QUERY SELECT v_job, v_contract, 1, false;
END
$$;

REVOKE ALL ON FUNCTION platform.create_integrity_job(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.create_integrity_job(text, text, text, text, text) TO spryxel_app;
