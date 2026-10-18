CREATE FUNCTION platform.asset_core_iso_utc_timestamp(p_value text) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
DECLARE
  v_timestamp timestamptz;
BEGIN
  IF p_value !~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?Z$' THEN
    RETURN false;
  END IF;
  v_timestamp := p_value::timestamptz;
  RETURN isfinite(v_timestamp);
EXCEPTION WHEN others THEN
  RETURN false;
END
$$;

CREATE TABLE platform.project_dna (
  id uuid PRIMARY KEY CHECK (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
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

CREATE TABLE platform.project_dna_version (
  project_dna_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  version_id uuid NOT NULL UNIQUE CHECK (version_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  schema_version text NOT NULL CHECK (schema_version = 'project-dna.v1'),
  payload jsonb NOT NULL CHECK (
    jsonb_typeof(payload) = 'object'
    AND payload->>'schemaVersion' IS NOT DISTINCT FROM 'project-dna.v1'
  ),
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  idempotency_subject_id uuid NOT NULL,
  idempotency_key_sha256 text NOT NULL CHECK (idempotency_key_sha256 ~ '^[0-9a-f]{64}$'),
  provenance jsonb NOT NULL CHECK (
    jsonb_typeof(provenance) = 'object'
    AND platform.jsonb_envelope_within_bounds(provenance)
    AND jsonb_typeof(provenance->'source') IS NOT DISTINCT FROM 'string'
    AND provenance->>'source' IN ('manual', 'import', 'generation', 'restore', 'system')
    AND jsonb_typeof(provenance->'recordedAt') IS NOT DISTINCT FROM 'string'
    AND platform.asset_core_iso_utc_timestamp(provenance->>'recordedAt') IS TRUE
  ),
  restored_from_version_id uuid,
  created_by_subject_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_dna_id, version),
  UNIQUE (project_dna_id, version, tenant_id, project_id),
  UNIQUE (version_id, project_dna_id, tenant_id, project_id),
  UNIQUE (idempotency_subject_id, tenant_id, project_id, idempotency_key_sha256),
  FOREIGN KEY (project_dna_id, tenant_id, project_id)
    REFERENCES platform.project_dna(id, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, idempotency_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (restored_from_version_id, project_dna_id, tenant_id, project_id)
    REFERENCES platform.project_dna_version(version_id, project_dna_id, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK ((provenance->>'source' = 'restore') = (restored_from_version_id IS NOT NULL)),
  CHECK (NULLIF(provenance->>'sourceVersionId', '')::uuid IS NOT DISTINCT FROM restored_from_version_id)
);

CREATE TABLE platform.asset (
  id uuid PRIMARY KEY CHECK (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  asset_contract_id uuid,
  asset_contract_version integer,
  created_by_subject_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id, project_id),
  FOREIGN KEY (project_id, tenant_id)
    REFERENCES platform.project(id, tenant_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (asset_contract_id, asset_contract_version, tenant_id, project_id)
    REFERENCES platform.asset_contract_version(contract_id, version, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK ((asset_contract_id IS NULL) = (asset_contract_version IS NULL))
);

CREATE TABLE platform.asset_version (
  asset_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  version_id uuid NOT NULL UNIQUE CHECK (version_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  schema_version text NOT NULL CHECK (schema_version = 'asset-metadata.v1'),
  payload jsonb NOT NULL CHECK (
    jsonb_typeof(payload) = 'object'
    AND payload->>'schemaVersion' IS NOT DISTINCT FROM 'asset-metadata.v1'
  ),
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  idempotency_subject_id uuid NOT NULL,
  idempotency_key_sha256 text NOT NULL CHECK (idempotency_key_sha256 ~ '^[0-9a-f]{64}$'),
  provenance jsonb NOT NULL CHECK (
    jsonb_typeof(provenance) = 'object'
    AND platform.jsonb_envelope_within_bounds(provenance)
    AND jsonb_typeof(provenance->'source') IS NOT DISTINCT FROM 'string'
    AND provenance->>'source' IN ('manual', 'import', 'generation', 'restore', 'system')
    AND jsonb_typeof(provenance->'recordedAt') IS NOT DISTINCT FROM 'string'
    AND platform.asset_core_iso_utc_timestamp(provenance->>'recordedAt') IS TRUE
  ),
  project_dna_id uuid,
  project_dna_version integer,
  restored_from_version_id uuid,
  created_by_subject_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (asset_id, version),
  UNIQUE (asset_id, version, tenant_id, project_id),
  UNIQUE (version_id, asset_id, tenant_id, project_id),
  UNIQUE (asset_id, version_id, tenant_id, project_id),
  UNIQUE (idempotency_subject_id, tenant_id, project_id, idempotency_key_sha256),
  FOREIGN KEY (asset_id, tenant_id, project_id)
    REFERENCES platform.asset(id, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, idempotency_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (project_dna_id, project_dna_version, tenant_id, project_id)
    REFERENCES platform.project_dna_version(project_dna_id, version, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (restored_from_version_id, asset_id, tenant_id, project_id)
    REFERENCES platform.asset_version(version_id, asset_id, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK ((project_dna_id IS NULL) = (project_dna_version IS NULL)),
  CHECK ((provenance->>'source' = 'restore') = (restored_from_version_id IS NOT NULL)),
  CHECK (NULLIF(provenance->>'sourceVersionId', '')::uuid IS NOT DISTINCT FROM restored_from_version_id)
);

CREATE TABLE platform.asset_version_lineage (
  id uuid PRIMARY KEY CHECK (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  asset_id uuid NOT NULL,
  asset_version_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  relation text NOT NULL CHECK (relation IN ('derived_from', 'variant_of', 'component_of', 'frame_of', 'source')),
  source_asset_id uuid NOT NULL,
  source_asset_version_id uuid,
  created_by_subject_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (asset_version_id, relation, source_asset_id, source_asset_version_id),
  FOREIGN KEY (asset_id, asset_version_id, tenant_id, project_id)
    REFERENCES platform.asset_version(asset_id, version_id, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (source_asset_id, tenant_id, project_id)
    REFERENCES platform.asset(id, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (source_asset_version_id, source_asset_id, tenant_id, project_id)
    REFERENCES platform.asset_version(version_id, asset_id, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, created_by_subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  CHECK (source_asset_id <> asset_id OR source_asset_version_id IS NOT NULL)
);

CREATE INDEX project_dna_version_scope_idx
  ON platform.project_dna_version(tenant_id, project_id, project_dna_id, version DESC);
CREATE INDEX asset_version_scope_idx
  ON platform.asset_version(tenant_id, project_id, asset_id, version DESC);
CREATE INDEX asset_version_dna_idx
  ON platform.asset_version(tenant_id, project_id, project_dna_id, project_dna_version)
  WHERE project_dna_id IS NOT NULL;
CREATE INDEX asset_version_lineage_source_idx
  ON platform.asset_version_lineage(tenant_id, project_id, source_asset_id, source_asset_version_id);

ALTER TABLE platform.project_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.project_dna FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.project_dna_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.project_dna_version FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.asset FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_version FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_version_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.asset_version_lineage FORCE ROW LEVEL SECURITY;

CREATE POLICY project_dna_select_member ON platform.project_dna
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY project_dna_insert_scoped ON platform.project_dna
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY project_dna_version_select_member ON platform.project_dna_version
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY project_dna_version_insert_scoped ON platform.project_dna_version
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND idempotency_subject_id = platform.current_subject_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_select_member ON platform.asset
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_insert_scoped ON platform.asset
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_version_select_member ON platform.asset_version
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_version_insert_scoped ON platform.asset_version
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND idempotency_subject_id = platform.current_subject_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_version_lineage_select_member ON platform.asset_version_lineage
  FOR SELECT USING (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );
CREATE POLICY asset_version_lineage_insert_scoped ON platform.asset_version_lineage
  FOR INSERT WITH CHECK (
    tenant_id = platform.current_tenant_id() AND project_id = platform.current_project_id()
    AND created_by_subject_id = platform.current_subject_id()
    AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
  );

CREATE FUNCTION platform.prevent_asset_core_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_immutable';
END
$$;

CREATE TRIGGER project_dna_immutable
  BEFORE UPDATE OR DELETE ON platform.project_dna
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_core_mutation();
CREATE TRIGGER project_dna_version_immutable
  BEFORE UPDATE OR DELETE ON platform.project_dna_version
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_core_mutation();
CREATE TRIGGER asset_immutable
  BEFORE UPDATE OR DELETE ON platform.asset
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_core_mutation();
CREATE TRIGGER asset_version_immutable
  BEFORE UPDATE OR DELETE ON platform.asset_version
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_core_mutation();
CREATE TRIGGER asset_version_lineage_immutable
  BEFORE UPDATE OR DELETE ON platform.asset_version_lineage
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_asset_core_mutation();

CREATE FUNCTION platform.assert_asset_core_write_context()
RETURNS TABLE(subject_id uuid, tenant_id uuid, project_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_subject uuid := platform.current_subject_id();
  v_tenant uuid := platform.current_tenant_id();
  v_project uuid := platform.current_project_id();
BEGIN
  IF session_user <> 'spryxel_app' OR v_subject IS NULL OR v_tenant IS NULL OR v_project IS NULL
    OR NOT platform.is_active_tenant_member(v_subject, v_tenant)
    OR NOT EXISTS (SELECT 1 FROM platform.project p WHERE p.id = v_project AND p.tenant_id = v_tenant)
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_write_denied';
  END IF;
  RETURN QUERY SELECT v_subject, v_tenant, v_project;
END
$$;

CREATE FUNCTION platform.parse_asset_core_payload(
  p_canonical_payload text,
  p_payload_sha256 text,
  p_schema_version text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_payload jsonb;
BEGIN
  IF p_canonical_payload IS NULL OR p_payload_sha256 IS NULL OR p_payload_sha256 !~ '^[0-9a-f]{64}$'
    OR octet_length(convert_to(p_canonical_payload, 'UTF8')) > 65536
    OR encode(sha256(convert_to(p_canonical_payload, 'UTF8')), 'hex') <> p_payload_sha256
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  BEGIN
    v_payload := p_canonical_payload::jsonb;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END;
  IF jsonb_typeof(v_payload) IS DISTINCT FROM 'object'
    OR v_payload->>'schemaVersion' IS DISTINCT FROM p_schema_version
    OR NOT (v_payload ? 'status')
    OR coalesce(v_payload->>'status', '') NOT IN ('draft', 'published', 'archived')
    OR NOT platform.jsonb_envelope_within_bounds(v_payload)
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  RETURN v_payload;
END
$$;

CREATE FUNCTION platform.parse_asset_core_provenance(
  p_canonical_provenance text,
  p_subject_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_provenance jsonb;
  v_source_version_id uuid;
  v_actor_subject_id uuid;
  v_provenance_key_count integer;
BEGIN
  IF p_canonical_provenance IS NULL OR octet_length(convert_to(p_canonical_provenance, 'UTF8')) > 8192 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
  END IF;
  BEGIN
    v_provenance := p_canonical_provenance::jsonb;
    v_actor_subject_id := NULLIF(v_provenance->>'actorSubjectId', '')::uuid;
    v_source_version_id := NULLIF(v_provenance->>'sourceVersionId', '')::uuid;
    IF NOT platform.asset_core_iso_utc_timestamp(v_provenance->>'recordedAt') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
    END IF;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
  END;
  IF jsonb_typeof(v_provenance) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
  END IF;
  SELECT count(*) INTO v_provenance_key_count FROM jsonb_object_keys(v_provenance);
  IF v_provenance_key_count <> 4
    OR jsonb_typeof(v_provenance->'source') IS DISTINCT FROM 'string'
    OR v_provenance->>'source' NOT IN ('manual', 'import', 'generation', 'restore', 'system')
    OR jsonb_typeof(v_provenance->'recordedAt') IS DISTINCT FROM 'string'
    OR NOT (v_provenance ? 'source')
    OR NOT (v_provenance ? 'recordedAt')
    OR NOT (v_provenance ? 'actorSubjectId')
    OR NOT (v_provenance ? 'sourceVersionId')
    OR NOT platform.jsonb_envelope_within_bounds(v_provenance)
    OR (v_actor_subject_id IS NOT NULL AND v_actor_subject_id <> p_subject_id)
    OR ((v_provenance->>'source' = 'restore') <> (v_source_version_id IS NOT NULL))
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
  END IF;
  RETURN v_provenance;
END
$$;

CREATE FUNCTION platform.lock_asset_core_idempotency(
  p_kind text,
  p_idempotency_key_sha256 text,
  p_subject_id uuid,
  p_tenant_id uuid,
  p_project_id uuid
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT pg_advisory_xact_lock(hashtextextended(
    p_kind || ':' || p_subject_id::text || ':' || p_tenant_id::text || ':' || p_project_id::text || ':' || p_idempotency_key_sha256,
    0
  ))
$$;

CREATE FUNCTION platform.create_project_dna_version(
  p_project_dna_id uuid,
  p_version_id uuid,
  p_idempotency_key_sha256 text,
  p_canonical_payload text,
  p_payload_sha256 text,
  p_canonical_provenance text
) RETURNS TABLE(project_dna_id uuid, version_id uuid, version integer, payload_sha256 text, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_existing record;
BEGIN
  SELECT ctx.subject_id, ctx.tenant_id, ctx.project_id INTO v_subject, v_tenant, v_project
    FROM platform.assert_asset_core_write_context() ctx;
  IF p_project_dna_id IS NULL OR p_version_id IS NULL OR p_idempotency_key_sha256 IS NULL
    OR p_project_dna_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_version_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
  THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity'; END IF;
  v_payload := platform.parse_asset_core_payload(p_canonical_payload, p_payload_sha256, 'project-dna.v1');
  v_provenance := platform.parse_asset_core_provenance(p_canonical_provenance, v_subject);
  PERFORM platform.lock_asset_core_idempotency('project-dna', p_idempotency_key_sha256, v_subject, v_tenant, v_project);
  SELECT version_row.project_dna_id, version_row.version_id, version_row.version, version_row.payload_sha256
    INTO v_existing
    FROM platform.project_dna_version version_row
   WHERE version_row.idempotency_subject_id = v_subject AND version_row.tenant_id = v_tenant
     AND version_row.project_id = v_project AND version_row.idempotency_key_sha256 = p_idempotency_key_sha256;
  IF FOUND THEN
    IF v_existing.payload_sha256 <> p_payload_sha256 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'idempotency_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.project_dna_id, v_existing.version_id, v_existing.version, v_existing.payload_sha256, true;
    RETURN;
  END IF;
  INSERT INTO platform.project_dna(id, tenant_id, project_id, created_by_subject_id)
    VALUES (p_project_dna_id, v_tenant, v_project, v_subject);
  INSERT INTO platform.project_dna_version
    (project_dna_id, tenant_id, project_id, version, version_id, schema_version, payload, payload_sha256,
     idempotency_subject_id, idempotency_key_sha256, provenance, restored_from_version_id, created_by_subject_id)
    VALUES (p_project_dna_id, v_tenant, v_project, 1, p_version_id, 'project-dna.v1', v_payload, p_payload_sha256,
      v_subject, p_idempotency_key_sha256, v_provenance, NULLIF(v_provenance->>'sourceVersionId', '')::uuid, v_subject);
  RETURN QUERY SELECT p_project_dna_id, p_version_id, 1, p_payload_sha256, false;
END
$$;

CREATE FUNCTION platform.append_project_dna_version(
  p_project_dna_id uuid,
  p_version_id uuid,
  p_idempotency_key_sha256 text,
  p_canonical_payload text,
  p_payload_sha256 text,
  p_canonical_provenance text
) RETURNS TABLE(project_dna_id uuid, version_id uuid, version integer, payload_sha256 text, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_existing record;
  v_version integer;
  v_current_status text;
  v_restore_version_id uuid;
  v_restore_version integer;
BEGIN
  SELECT ctx.subject_id, ctx.tenant_id, ctx.project_id INTO v_subject, v_tenant, v_project
    FROM platform.assert_asset_core_write_context() ctx;
  IF p_project_dna_id IS NULL OR p_version_id IS NULL OR p_idempotency_key_sha256 IS NULL
    OR p_project_dna_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_version_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
  THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity'; END IF;
  v_payload := platform.parse_asset_core_payload(p_canonical_payload, p_payload_sha256, 'project-dna.v1');
  v_provenance := platform.parse_asset_core_provenance(p_canonical_provenance, v_subject);
  PERFORM platform.lock_asset_core_idempotency('project-dna', p_idempotency_key_sha256, v_subject, v_tenant, v_project);
  SELECT version_row.project_dna_id, version_row.version_id, version_row.version, version_row.payload_sha256
    INTO v_existing FROM platform.project_dna_version version_row
   WHERE version_row.idempotency_subject_id = v_subject AND version_row.tenant_id = v_tenant
     AND version_row.project_id = v_project AND version_row.idempotency_key_sha256 = p_idempotency_key_sha256;
  IF FOUND THEN
    IF v_existing.project_dna_id <> p_project_dna_id OR v_existing.payload_sha256 <> p_payload_sha256 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'idempotency_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.project_dna_id, v_existing.version_id, v_existing.version, v_existing.payload_sha256, true;
    RETURN;
  END IF;
  PERFORM 1 FROM platform.project_dna entity
   WHERE entity.id = p_project_dna_id AND entity.tenant_id = v_tenant AND entity.project_id = v_project FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_write_denied'; END IF;
  SELECT coalesce(max(version_row.version), 0) + 1 INTO v_version
    FROM platform.project_dna_version version_row
   WHERE version_row.project_dna_id = p_project_dna_id AND version_row.tenant_id = v_tenant AND version_row.project_id = v_project;
  SELECT version_row.payload->>'status' INTO v_current_status
    FROM platform.project_dna_version version_row
   WHERE version_row.project_dna_id = p_project_dna_id AND version_row.tenant_id = v_tenant AND version_row.project_id = v_project
   ORDER BY version_row.version DESC LIMIT 1;
  IF v_provenance->>'source' <> 'restore' AND NOT (
    (v_current_status = 'draft' AND v_payload->>'status' IN ('draft', 'published')) OR
    (v_current_status = 'published' AND v_payload->>'status' IN ('published', 'archived')) OR
    (v_current_status = 'archived' AND v_payload->>'status' = 'archived')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_status_transition';
  END IF;
  IF v_provenance->>'source' = 'restore' THEN
    v_restore_version_id := (v_provenance->>'sourceVersionId')::uuid;
    SELECT source.version INTO v_restore_version
      FROM platform.project_dna_version source
     WHERE source.project_dna_id = p_project_dna_id AND source.version_id = v_restore_version_id
       AND source.tenant_id = v_tenant AND source.project_id = v_project;
    IF v_restore_version IS NULL OR v_restore_version >= v_version THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_restore_source';
    END IF;
  END IF;
  INSERT INTO platform.project_dna_version
    (project_dna_id, tenant_id, project_id, version, version_id, schema_version, payload, payload_sha256,
     idempotency_subject_id, idempotency_key_sha256, provenance, restored_from_version_id, created_by_subject_id)
    VALUES (p_project_dna_id, v_tenant, v_project, v_version, p_version_id, 'project-dna.v1', v_payload, p_payload_sha256,
      v_subject, p_idempotency_key_sha256, v_provenance, v_restore_version_id, v_subject);
  RETURN QUERY SELECT p_project_dna_id, p_version_id, v_version, p_payload_sha256, false;
END
$$;

CREATE FUNCTION platform.create_asset_version(
  p_asset_id uuid,
  p_version_id uuid,
  p_idempotency_key_sha256 text,
  p_canonical_payload text,
  p_payload_sha256 text,
  p_canonical_provenance text
) RETURNS TABLE(asset_id uuid, version_id uuid, version integer, payload_sha256 text, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_existing record;
  v_contract_id uuid;
  v_contract_version integer;
  v_project_dna_id uuid;
  v_project_dna_version integer;
  v_lineage jsonb;
  v_lineage_item jsonb;
  v_source_asset_id uuid;
  v_source_version_id uuid;
  v_source_version integer;
  v_current_status text;
  v_lineage_item_key_count integer;
BEGIN
  SELECT ctx.subject_id, ctx.tenant_id, ctx.project_id INTO v_subject, v_tenant, v_project
    FROM platform.assert_asset_core_write_context() ctx;
  IF p_asset_id IS NULL OR p_version_id IS NULL OR p_idempotency_key_sha256 IS NULL
    OR p_asset_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_version_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
  THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity'; END IF;
  v_payload := platform.parse_asset_core_payload(p_canonical_payload, p_payload_sha256, 'asset-metadata.v1');
  v_provenance := platform.parse_asset_core_provenance(p_canonical_provenance, v_subject);
  PERFORM platform.lock_asset_core_idempotency('asset', p_idempotency_key_sha256, v_subject, v_tenant, v_project);
  SELECT version_row.asset_id, version_row.version_id, version_row.version, version_row.payload_sha256
    INTO v_existing FROM platform.asset_version version_row
   WHERE version_row.idempotency_subject_id = v_subject AND version_row.tenant_id = v_tenant
     AND version_row.project_id = v_project AND version_row.idempotency_key_sha256 = p_idempotency_key_sha256;
  IF FOUND THEN
    IF v_existing.payload_sha256 <> p_payload_sha256 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'idempotency_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.asset_id, v_existing.version_id, v_existing.version, v_existing.payload_sha256, true;
    RETURN;
  END IF;
  IF jsonb_typeof(v_payload->'assetContract') = 'object' THEN
    BEGIN
      v_contract_id := (v_payload->'assetContract'->>'id')::uuid;
      v_contract_version := (v_payload->'assetContract'->>'version')::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
    END;
  ELSIF v_payload->'assetContract' <> 'null'::jsonb OR NOT (v_payload ? 'assetContract') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  IF jsonb_typeof(v_payload->'projectDna') = 'object' THEN
    BEGIN
      v_project_dna_id := (v_payload->'projectDna'->>'id')::uuid;
      v_project_dna_version := (v_payload->'projectDna'->>'version')::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
    END;
  ELSIF v_payload->'projectDna' <> 'null'::jsonb OR NOT (v_payload ? 'projectDna') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  v_lineage := v_payload->'lineage';
  IF v_lineage IS NULL OR jsonb_typeof(v_lineage) <> 'array'
    OR (CASE WHEN jsonb_typeof(v_lineage) = 'array' THEN jsonb_array_length(v_lineage) ELSE 65 END) > 64 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  INSERT INTO platform.asset(id, tenant_id, project_id, asset_contract_id, asset_contract_version, created_by_subject_id)
    VALUES (p_asset_id, v_tenant, v_project, v_contract_id, v_contract_version, v_subject);
  INSERT INTO platform.asset_version
    (asset_id, tenant_id, project_id, version, version_id, schema_version, payload, payload_sha256,
     idempotency_subject_id, idempotency_key_sha256, provenance, project_dna_id, project_dna_version,
     restored_from_version_id, created_by_subject_id)
    VALUES (p_asset_id, v_tenant, v_project, 1, p_version_id, 'asset-metadata.v1', v_payload, p_payload_sha256,
      v_subject, p_idempotency_key_sha256, v_provenance, v_project_dna_id, v_project_dna_version,
      NULLIF(v_provenance->>'sourceVersionId', '')::uuid, v_subject);
  FOR v_lineage_item IN SELECT item FROM jsonb_array_elements(v_lineage) AS entry(item) LOOP
    BEGIN
      v_source_asset_id := (v_lineage_item->>'assetId')::uuid;
      v_source_version_id := NULLIF(v_lineage_item->>'assetVersionId', '')::uuid;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
    END;
    IF jsonb_typeof(v_lineage_item) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
    END IF;
    SELECT count(*) INTO v_lineage_item_key_count FROM jsonb_object_keys(v_lineage_item);
    IF v_lineage_item_key_count <> 3
      OR v_lineage_item->>'relation' NOT IN ('derived_from', 'variant_of', 'component_of', 'frame_of', 'source')
      OR v_source_asset_id IS NULL
    THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage'; END IF;
    IF v_source_asset_id = p_asset_id AND v_source_version_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
    END IF;
    IF v_source_asset_id = p_asset_id THEN
      SELECT source.version INTO v_source_version
        FROM platform.asset_version source
       WHERE source.asset_id = p_asset_id AND source.version_id = v_source_version_id;
      IF v_source_version IS NULL OR v_source_version >= 1 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
      END IF;
    END IF;
    INSERT INTO platform.asset_version_lineage
      (id, asset_id, asset_version_id, tenant_id, project_id, relation, source_asset_id,
       source_asset_version_id, created_by_subject_id)
    VALUES (uuidv7(), p_asset_id, p_version_id, v_tenant, v_project, v_lineage_item->>'relation', v_source_asset_id,
      v_source_version_id, v_subject);
  END LOOP;
  RETURN QUERY SELECT p_asset_id, p_version_id, 1, p_payload_sha256, false;
END
$$;

CREATE FUNCTION platform.append_asset_version(
  p_asset_id uuid,
  p_version_id uuid,
  p_idempotency_key_sha256 text,
  p_canonical_payload text,
  p_payload_sha256 text,
  p_canonical_provenance text
) RETURNS TABLE(asset_id uuid, version_id uuid, version integer, payload_sha256 text, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_existing record;
  v_asset record;
  v_version integer;
  v_contract_id uuid;
  v_contract_version integer;
  v_project_dna_id uuid;
  v_project_dna_version integer;
  v_restore_version_id uuid;
  v_restore_version integer;
  v_lineage jsonb;
  v_lineage_item jsonb;
  v_source_asset_id uuid;
  v_source_version_id uuid;
  v_source_version integer;
  v_current_status text;
  v_lineage_item_key_count integer;
BEGIN
  SELECT ctx.subject_id, ctx.tenant_id, ctx.project_id INTO v_subject, v_tenant, v_project
    FROM platform.assert_asset_core_write_context() ctx;
  IF p_asset_id IS NULL OR p_version_id IS NULL OR p_idempotency_key_sha256 IS NULL
    OR p_asset_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_version_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
  THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity'; END IF;
  v_payload := platform.parse_asset_core_payload(p_canonical_payload, p_payload_sha256, 'asset-metadata.v1');
  v_provenance := platform.parse_asset_core_provenance(p_canonical_provenance, v_subject);
  PERFORM platform.lock_asset_core_idempotency('asset', p_idempotency_key_sha256, v_subject, v_tenant, v_project);
  SELECT version_row.asset_id, version_row.version_id, version_row.version, version_row.payload_sha256
    INTO v_existing FROM platform.asset_version version_row
   WHERE version_row.idempotency_subject_id = v_subject AND version_row.tenant_id = v_tenant
     AND version_row.project_id = v_project AND version_row.idempotency_key_sha256 = p_idempotency_key_sha256;
  IF FOUND THEN
    IF v_existing.asset_id <> p_asset_id OR v_existing.payload_sha256 <> p_payload_sha256 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'idempotency_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.asset_id, v_existing.version_id, v_existing.version, v_existing.payload_sha256, true;
    RETURN;
  END IF;
  SELECT entity.id, entity.asset_contract_id, entity.asset_contract_version INTO v_asset
    FROM platform.asset entity
   WHERE entity.id = p_asset_id AND entity.tenant_id = v_tenant AND entity.project_id = v_project FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_write_denied'; END IF;
  IF jsonb_typeof(v_payload->'assetContract') = 'object' THEN
    BEGIN
      v_contract_id := (v_payload->'assetContract'->>'id')::uuid;
      v_contract_version := (v_payload->'assetContract'->>'version')::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
    END;
  ELSIF v_payload->'assetContract' <> 'null'::jsonb OR NOT (v_payload ? 'assetContract') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  IF v_contract_id IS DISTINCT FROM v_asset.asset_contract_id OR v_contract_version IS DISTINCT FROM v_asset.asset_contract_version THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'asset_contract_reference_immutable';
  END IF;
  IF jsonb_typeof(v_payload->'projectDna') = 'object' THEN
    BEGIN
      v_project_dna_id := (v_payload->'projectDna'->>'id')::uuid;
      v_project_dna_version := (v_payload->'projectDna'->>'version')::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
    END;
  ELSIF v_payload->'projectDna' <> 'null'::jsonb OR NOT (v_payload ? 'projectDna') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  v_lineage := v_payload->'lineage';
  IF v_lineage IS NULL OR jsonb_typeof(v_lineage) <> 'array'
    OR (CASE WHEN jsonb_typeof(v_lineage) = 'array' THEN jsonb_array_length(v_lineage) ELSE 65 END) > 64 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
  END IF;
  SELECT coalesce(max(version_row.version), 0) + 1 INTO v_version
    FROM platform.asset_version version_row
   WHERE version_row.asset_id = p_asset_id AND version_row.tenant_id = v_tenant AND version_row.project_id = v_project;
  SELECT version_row.payload->>'status' INTO v_current_status
    FROM platform.asset_version version_row
   WHERE version_row.asset_id = p_asset_id AND version_row.tenant_id = v_tenant AND version_row.project_id = v_project
   ORDER BY version_row.version DESC LIMIT 1;
  IF v_provenance->>'source' <> 'restore' AND NOT (
    (v_current_status = 'draft' AND v_payload->>'status' IN ('draft', 'published')) OR
    (v_current_status = 'published' AND v_payload->>'status' IN ('published', 'archived')) OR
    (v_current_status = 'archived' AND v_payload->>'status' = 'archived')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_status_transition';
  END IF;
  IF v_provenance->>'source' = 'restore' THEN
    v_restore_version_id := (v_provenance->>'sourceVersionId')::uuid;
    SELECT source.version INTO v_restore_version
      FROM platform.asset_version source
     WHERE source.asset_id = p_asset_id AND source.version_id = v_restore_version_id
       AND source.tenant_id = v_tenant AND source.project_id = v_project;
    IF v_restore_version IS NULL OR v_restore_version >= v_version THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_restore_source';
    END IF;
  END IF;
  INSERT INTO platform.asset_version
    (asset_id, tenant_id, project_id, version, version_id, schema_version, payload, payload_sha256,
     idempotency_subject_id, idempotency_key_sha256, provenance, project_dna_id, project_dna_version,
     restored_from_version_id, created_by_subject_id)
    VALUES (p_asset_id, v_tenant, v_project, v_version, p_version_id, 'asset-metadata.v1', v_payload, p_payload_sha256,
      v_subject, p_idempotency_key_sha256, v_provenance, v_project_dna_id, v_project_dna_version,
      v_restore_version_id, v_subject);
  FOR v_lineage_item IN SELECT item FROM jsonb_array_elements(v_lineage) AS entry(item) LOOP
    BEGIN
      v_source_asset_id := (v_lineage_item->>'assetId')::uuid;
      v_source_version_id := NULLIF(v_lineage_item->>'assetVersionId', '')::uuid;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
    END;
    IF jsonb_typeof(v_lineage_item) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
    END IF;
    SELECT count(*) INTO v_lineage_item_key_count FROM jsonb_object_keys(v_lineage_item);
    IF v_lineage_item_key_count <> 3
      OR v_lineage_item->>'relation' NOT IN ('derived_from', 'variant_of', 'component_of', 'frame_of', 'source')
      OR v_source_asset_id IS NULL
    THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage'; END IF;
    IF v_source_asset_id = p_asset_id AND v_source_version_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
    END IF;
    IF v_source_asset_id = p_asset_id THEN
      SELECT source.version INTO v_source_version
        FROM platform.asset_version source
       WHERE source.asset_id = p_asset_id AND source.version_id = v_source_version_id;
      IF v_source_version IS NULL OR v_source_version >= v_version THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
      END IF;
    END IF;
    INSERT INTO platform.asset_version_lineage
      (id, asset_id, asset_version_id, tenant_id, project_id, relation, source_asset_id,
       source_asset_version_id, created_by_subject_id)
    VALUES (uuidv7(), p_asset_id, p_version_id, v_tenant, v_project, v_lineage_item->>'relation', v_source_asset_id,
      v_source_version_id, v_subject);
  END LOOP;
  RETURN QUERY SELECT p_asset_id, p_version_id, v_version, p_payload_sha256, false;
END
$$;

REVOKE ALL ON platform.project_dna, platform.project_dna_version, platform.asset,
  platform.asset_version, platform.asset_version_lineage FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT SELECT ON platform.project_dna, platform.project_dna_version, platform.asset,
  platform.asset_version, platform.asset_version_lineage TO spryxel_app;

REVOKE ALL ON FUNCTION platform.prevent_asset_core_mutation() FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_iso_utc_timestamp(text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.assert_asset_core_write_context() FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.parse_asset_core_payload(text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.parse_asset_core_provenance(text, uuid) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.lock_asset_core_idempotency(text, text, uuid, uuid, uuid) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.create_project_dna_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.append_project_dna_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.create_asset_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.append_asset_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.create_project_dna_version(uuid, uuid, text, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.append_project_dna_version(uuid, uuid, text, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.create_asset_version(uuid, uuid, text, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.append_asset_version(uuid, uuid, text, text, text, text) TO spryxel_app;
