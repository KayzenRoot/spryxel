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
  IF NOT platform.asset_core_payload_matches_schema(v_payload, p_schema_version) THEN
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
  v_actor_subject_id uuid;
BEGIN
  IF p_canonical_provenance IS NULL OR octet_length(convert_to(p_canonical_provenance, 'UTF8')) > 8192 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
  END IF;
  BEGIN
    v_provenance := p_canonical_provenance::jsonb;
    v_actor_subject_id := NULLIF(v_provenance->>'actorSubjectId', '')::uuid;
    IF NOT platform.asset_core_iso_utc_timestamp(v_provenance->>'recordedAt') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
    END IF;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_provenance';
  END;
  IF NOT platform.asset_core_provenance_matches_schema(v_provenance)
    OR (v_actor_subject_id IS NOT NULL AND v_actor_subject_id <> p_subject_id)
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

CREATE FUNCTION platform.asset_core_has_exact_keys(p_value jsonb, p_expected_keys text[])
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
DECLARE
  v_key_count integer;
BEGIN
  IF jsonb_typeof(p_value) IS DISTINCT FROM 'object' OR cardinality(p_expected_keys) = 0 THEN
    RETURN false;
  END IF;
  SELECT count(*) INTO v_key_count FROM jsonb_object_keys(p_value);
  RETURN v_key_count = cardinality(p_expected_keys) AND p_value ?& p_expected_keys;
END
$$;

CREATE FUNCTION platform.asset_core_jsonb_is_uuid_v7(p_value jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT jsonb_typeof(p_value) = 'string'
    AND (p_value #>> '{}') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
$$;

CREATE FUNCTION platform.asset_core_jsonb_is_nullable_uuid_v7(p_value jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog, platform
AS $$
  SELECT p_value = 'null'::jsonb OR platform.asset_core_jsonb_is_uuid_v7(p_value)
$$;

CREATE FUNCTION platform.asset_core_utf16_length(p_value text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT char_length(p_value) + count(*) FILTER (WHERE ascii(substr(p_value, codepoint.position, 1)) > 65535)::integer
    FROM generate_series(1, char_length(p_value)) AS codepoint(position)
$$;

CREATE FUNCTION platform.asset_core_jsonb_is_bounded_text(
  p_value jsonb,
  p_min_chars integer,
  p_max_chars integer
) RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog, platform
AS $$
  SELECT jsonb_typeof(p_value) = 'string'
    AND platform.asset_core_utf16_length(p_value #>> '{}') BETWEEN p_min_chars AND p_max_chars
$$;

CREATE FUNCTION platform.asset_core_jsonb_is_integer_in_range(
  p_value jsonb,
  p_min numeric,
  p_max numeric
) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
DECLARE
  v_number numeric;
BEGIN
  IF jsonb_typeof(p_value) IS DISTINCT FROM 'number' THEN RETURN false; END IF;
  v_number := (p_value #>> '{}')::numeric;
  RETURN v_number = trunc(v_number) AND v_number BETWEEN p_min AND p_max;
EXCEPTION WHEN others THEN
  RETURN false;
END
$$;

CREATE FUNCTION platform.asset_core_jsonb_is_number_in_range(
  p_value jsonb,
  p_min numeric,
  p_max numeric
) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
DECLARE
  v_number numeric;
BEGIN
  IF jsonb_typeof(p_value) IS DISTINCT FROM 'number' THEN RETURN false; END IF;
  v_number := (p_value #>> '{}')::numeric;
  RETURN v_number BETWEEN p_min AND p_max;
EXCEPTION WHEN others THEN
  RETURN false;
END
$$;

CREATE FUNCTION platform.asset_core_jsonb_is_finite_number(p_value jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
DECLARE
  v_number double precision;
BEGIN
  IF jsonb_typeof(p_value) IS DISTINCT FROM 'number' THEN RETURN false; END IF;
  v_number := (p_value #>> '{}')::double precision;
  RETURN v_number NOT IN ('Infinity'::double precision, '-Infinity'::double precision, 'NaN'::double precision);
EXCEPTION WHEN others THEN
  RETURN false;
END
$$;

CREATE FUNCTION platform.asset_core_jsonb_array_within_size(
  p_value jsonb,
  p_min_size integer,
  p_max_size integer
) RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog
AS $$
BEGIN
  IF jsonb_typeof(p_value) IS DISTINCT FROM 'array' THEN RETURN false; END IF;
  RETURN jsonb_array_length(p_value) BETWEEN p_min_size AND p_max_size;
END
$$;

CREATE FUNCTION platform.asset_core_bounded_json_object(p_value jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog, platform
AS $$
  WITH RECURSIVE nodes(value, depth, path) AS (
    SELECT p_value, 0, ARRAY[]::text[]
    UNION ALL
    SELECT child.value, parent.depth + 1, parent.path || child.segment
      FROM nodes parent
      CROSS JOIN LATERAL (
        SELECT entry.value, entry.key AS segment
          FROM jsonb_each(CASE WHEN jsonb_typeof(parent.value) = 'object' THEN parent.value ELSE '{}'::jsonb END) entry
        UNION ALL
        SELECT item.value, item.ordinality::text AS segment
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(parent.value) = 'array' THEN parent.value ELSE '[]'::jsonb END)
            WITH ORDINALITY AS item(value, ordinality)
      ) child
  ), object_keys(parent_path, normalized_key) AS (
    SELECT node.path, normalize(keys.key, NFC)
      FROM nodes node
      CROSS JOIN LATERAL jsonb_object_keys(
        CASE WHEN jsonb_typeof(node.value) = 'object' THEN node.value ELSE '{}'::jsonb END
      ) AS keys(key)
  )
  SELECT jsonb_typeof(p_value) = 'object'
    AND (SELECT count(*) <= 4096 FROM nodes)
    AND NOT EXISTS (SELECT 1 FROM nodes WHERE depth > 16)
    AND NOT EXISTS (
      SELECT 1 FROM nodes
       WHERE jsonb_typeof(value) = 'array'
         AND NOT platform.asset_core_jsonb_array_within_size(value, 0, 512)
    )
    AND NOT EXISTS (
      SELECT 1 FROM nodes
       WHERE jsonb_typeof(value) = 'string'
         AND octet_length(convert_to(value #>> '{}', 'UTF8')) > 4096
    )
    AND NOT EXISTS (
      SELECT 1 FROM nodes
       WHERE jsonb_typeof(value) = 'number' AND NOT platform.asset_core_jsonb_is_finite_number(value)
    )
    AND NOT EXISTS (
      SELECT 1
        FROM nodes node
        CROSS JOIN LATERAL jsonb_object_keys(
          CASE WHEN jsonb_typeof(node.value) = 'object' THEN node.value ELSE '{}'::jsonb END
        ) AS keys(key)
       WHERE octet_length(convert_to(normalize(keys.key, NFC), 'UTF8')) > 256
    )
    AND NOT EXISTS (
      SELECT 1 FROM object_keys GROUP BY parent_path, normalized_key HAVING count(*) > 1
    )
$$;

CREATE FUNCTION platform.asset_core_payload_matches_schema(p_payload jsonb, p_schema_version text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_item jsonb;
  v_nested jsonb;
  v_text jsonb;
  v_count integer;
  v_distinct_count integer;
  v_keys text[];
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object'
    OR NOT platform.asset_core_bounded_json_object(p_payload)
  THEN RETURN false; END IF;

  IF p_schema_version = 'project-dna.v1' THEN
    v_keys := ARRAY['schemaVersion', 'status', 'styleIdentity', 'palette', 'visualReferenceIds', 'constraints', 'rules'];
    IF NOT platform.asset_core_has_exact_keys(p_payload, v_keys)
      OR jsonb_typeof(p_payload->'schemaVersion') IS DISTINCT FROM 'string'
      OR p_payload->>'schemaVersion' <> p_schema_version
      OR jsonb_typeof(p_payload->'status') IS DISTINCT FROM 'string'
      OR p_payload->>'status' NOT IN ('draft', 'published', 'archived')
      OR NOT platform.asset_core_jsonb_is_bounded_text(p_payload->'styleIdentity', 1, 256)
      OR NOT platform.asset_core_jsonb_array_within_size(p_payload->'palette', 0, 32)
      OR NOT platform.asset_core_jsonb_array_within_size(p_payload->'visualReferenceIds', 0, 64)
      OR NOT platform.asset_core_bounded_json_object(p_payload->'constraints')
      OR NOT platform.asset_core_jsonb_array_within_size(p_payload->'rules', 0, 100)
    THEN RETURN false; END IF;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_payload->'palette') LOOP
      IF NOT platform.asset_core_has_exact_keys(v_item, ARRAY['name', 'colors'])
        OR NOT platform.asset_core_jsonb_is_bounded_text(v_item->'name', 1, 80)
        OR NOT platform.asset_core_jsonb_array_within_size(v_item->'colors', 1, 32)
      THEN RETURN false; END IF;
      FOR v_text IN SELECT value FROM jsonb_array_elements(v_item->'colors') LOOP
        IF jsonb_typeof(v_text) IS DISTINCT FROM 'string'
          OR (v_text #>> '{}') !~ '^#[0-9a-fA-F]{3}([0-9a-fA-F]{3}){0,2}$'
        THEN RETURN false; END IF;
      END LOOP;
    END LOOP;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_payload->'visualReferenceIds') LOOP
      IF NOT platform.asset_core_jsonb_is_uuid_v7(v_item) THEN RETURN false; END IF;
    END LOOP;
    SELECT count(*), count(DISTINCT lower(value #>> '{}')) INTO v_count, v_distinct_count
      FROM jsonb_array_elements(p_payload->'visualReferenceIds') AS entry(value);
    IF v_count <> v_distinct_count THEN RETURN false; END IF;

    FOR v_text IN SELECT value FROM jsonb_array_elements(p_payload->'rules') LOOP
      IF NOT platform.asset_core_jsonb_is_bounded_text(v_text, 1, 1024) THEN RETURN false; END IF;
    END LOOP;
    RETURN true;
  END IF;

  IF p_schema_version = 'asset-metadata.v1' THEN
    v_keys := ARRAY[
      'schemaVersion', 'assetType', 'assetSubtype', 'name', 'description', 'tags', 'status',
      'lineage', 'assetContract', 'projectDna', 'dimensions', 'paletteId', 'attributes'
    ];
    IF NOT platform.asset_core_has_exact_keys(p_payload, v_keys)
      OR jsonb_typeof(p_payload->'schemaVersion') IS DISTINCT FROM 'string'
      OR p_payload->>'schemaVersion' <> p_schema_version
      OR jsonb_typeof(p_payload->'assetType') IS DISTINCT FROM 'string'
      OR p_payload->>'assetType' !~ '^[a-z][a-z0-9-]{0,63}$'
      OR NOT (
        p_payload->'assetSubtype' = 'null'::jsonb
        OR (jsonb_typeof(p_payload->'assetSubtype') = 'string' AND p_payload->>'assetSubtype' ~ '^[a-z][a-z0-9-]{0,63}$')
      )
      OR NOT platform.asset_core_jsonb_is_bounded_text(p_payload->'name', 1, 160)
      OR NOT (
        p_payload->'description' = 'null'::jsonb
        OR platform.asset_core_jsonb_is_bounded_text(p_payload->'description', 0, 2000)
      )
      OR NOT platform.asset_core_jsonb_array_within_size(p_payload->'tags', 0, 64)
      OR jsonb_typeof(p_payload->'status') IS DISTINCT FROM 'string'
      OR p_payload->>'status' NOT IN ('draft', 'published', 'archived')
      OR NOT platform.asset_core_jsonb_array_within_size(p_payload->'lineage', 0, 64)
      OR NOT platform.asset_core_jsonb_is_nullable_uuid_v7(p_payload->'paletteId')
      OR NOT platform.asset_core_bounded_json_object(p_payload->'attributes')
    THEN RETURN false; END IF;

    FOR v_text IN SELECT value FROM jsonb_array_elements(p_payload->'tags') LOOP
      IF NOT platform.asset_core_jsonb_is_bounded_text(v_text, 1, 64) THEN RETURN false; END IF;
    END LOOP;
    SELECT count(*), count(DISTINCT lower(normalize(value #>> '{}', NFC))) INTO v_count, v_distinct_count
      FROM jsonb_array_elements(p_payload->'tags') AS entry(value);
    IF v_count <> v_distinct_count THEN RETURN false; END IF;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_payload->'lineage') LOOP
      IF NOT platform.asset_core_has_exact_keys(v_item, ARRAY['relation', 'assetId', 'assetVersionId'])
        OR jsonb_typeof(v_item->'relation') IS DISTINCT FROM 'string'
        OR v_item->>'relation' NOT IN ('derived_from', 'variant_of', 'component_of', 'frame_of', 'source')
        OR NOT platform.asset_core_jsonb_is_uuid_v7(v_item->'assetId')
        OR NOT platform.asset_core_jsonb_is_nullable_uuid_v7(v_item->'assetVersionId')
      THEN RETURN false; END IF;
    END LOOP;
    SELECT count(*), count(DISTINCT (
      value->>'relation' || ':' || lower(value->>'assetId') || ':' || coalesce(lower(value->>'assetVersionId'), '')
    )) INTO v_count, v_distinct_count
      FROM jsonb_array_elements(p_payload->'lineage') AS entry(value);
    IF v_count <> v_distinct_count THEN RETURN false; END IF;

    FOREACH v_nested IN ARRAY ARRAY[p_payload->'assetContract', p_payload->'projectDna'] LOOP
      IF v_nested <> 'null'::jsonb AND (
        NOT platform.asset_core_has_exact_keys(v_nested, ARRAY['id', 'version'])
        OR NOT platform.asset_core_jsonb_is_uuid_v7(v_nested->'id')
        OR NOT platform.asset_core_jsonb_is_integer_in_range(v_nested->'version', 1, 2147483647)
      ) THEN RETURN false; END IF;
    END LOOP;

    v_nested := p_payload->'dimensions';
    IF v_nested <> 'null'::jsonb AND (
      NOT platform.asset_core_has_exact_keys(v_nested, ARRAY['width', 'height', 'frameCount', 'fps'])
      OR NOT platform.asset_core_jsonb_is_integer_in_range(v_nested->'width', 1, 16384)
      OR NOT platform.asset_core_jsonb_is_integer_in_range(v_nested->'height', 1, 16384)
      OR NOT platform.asset_core_jsonb_is_integer_in_range(v_nested->'frameCount', 1, 10000)
      OR NOT (
        v_nested->'fps' = 'null'::jsonb
        OR platform.asset_core_jsonb_is_number_in_range(v_nested->'fps', 0.1, 240)
      )
    ) THEN RETURN false; END IF;
    RETURN true;
  END IF;

  RETURN false;
EXCEPTION WHEN others THEN
  RETURN false;
END
$$;

CREATE FUNCTION platform.asset_core_provenance_matches_schema(p_provenance jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_source text;
  v_source_version jsonb;
BEGIN
  IF NOT platform.asset_core_has_exact_keys(
    p_provenance,
    ARRAY['source', 'actorSubjectId', 'recordedAt', 'sourceVersionId']
  )
    OR octet_length(convert_to(p_provenance::text, 'UTF8')) > 8192
    OR NOT platform.jsonb_envelope_within_bounds(p_provenance)
    OR jsonb_typeof(p_provenance->'source') IS DISTINCT FROM 'string'
    OR p_provenance->>'source' NOT IN ('manual', 'import', 'generation', 'restore', 'system')
    OR jsonb_typeof(p_provenance->'recordedAt') IS DISTINCT FROM 'string'
    OR NOT platform.asset_core_iso_utc_timestamp(p_provenance->>'recordedAt')
    OR NOT platform.asset_core_jsonb_is_nullable_uuid_v7(p_provenance->'actorSubjectId')
    OR NOT platform.asset_core_jsonb_is_nullable_uuid_v7(p_provenance->'sourceVersionId')
  THEN RETURN false; END IF;
  v_source := p_provenance->>'source';
  v_source_version := p_provenance->'sourceVersionId';
  RETURN (v_source = 'restore') = (v_source_version <> 'null'::jsonb);
EXCEPTION WHEN others THEN
  RETURN false;
END
$$;

ALTER TABLE platform.project_dna_version
  ADD CONSTRAINT project_dna_version_strict_payload
  CHECK (platform.asset_core_payload_matches_schema(payload, schema_version));
ALTER TABLE platform.asset_version
  ADD CONSTRAINT asset_version_strict_payload
  CHECK (platform.asset_core_payload_matches_schema(payload, schema_version));
ALTER TABLE platform.project_dna_version
  ADD CONSTRAINT project_dna_version_strict_provenance
  CHECK (platform.asset_core_provenance_matches_schema(provenance));
ALTER TABLE platform.asset_version
  ADD CONSTRAINT asset_version_strict_provenance
  CHECK (platform.asset_core_provenance_matches_schema(provenance));

CREATE FUNCTION platform.prepare_asset_core_write(
  p_entity_kind text,
  p_entity_id uuid,
  p_version_id uuid,
  p_idempotency_key_sha256 text,
  p_canonical_payload text,
  p_payload_sha256 text,
  p_canonical_provenance text
) RETURNS TABLE(subject_id uuid, tenant_id uuid, project_id uuid, payload jsonb, provenance jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_prepared record;
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_schema_version text;
BEGIN
  SELECT ctx.subject_id, ctx.tenant_id, ctx.project_id INTO v_subject, v_tenant, v_project
    FROM platform.assert_asset_core_write_context() ctx;
  IF p_entity_kind = 'project-dna' THEN
    v_schema_version := 'project-dna.v1';
  ELSIF p_entity_kind = 'asset' THEN
    v_schema_version := 'asset-metadata.v1';
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity';
  END IF;
  IF p_entity_id IS NULL OR p_version_id IS NULL OR p_idempotency_key_sha256 IS NULL
    OR p_entity_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_version_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
  THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity'; END IF;
  subject_id := v_subject;
  tenant_id := v_tenant;
  project_id := v_project;
  payload := platform.parse_asset_core_payload(p_canonical_payload, p_payload_sha256, v_schema_version);
  provenance := platform.parse_asset_core_provenance(p_canonical_provenance, v_subject);
  RETURN NEXT;
END
$$;

CREATE FUNCTION platform.resolve_asset_core_replay(
  p_entity_kind text,
  p_subject_id uuid,
  p_tenant_id uuid,
  p_project_id uuid,
  p_entity_id uuid,
  p_idempotency_key_sha256 text,
  p_payload_sha256 text,
  p_entity_id_must_match boolean
) RETURNS TABLE(entity_id uuid, version_id uuid, version integer, payload_sha256 text, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_existing record;
BEGIN
  IF p_entity_kind NOT IN ('project-dna', 'asset') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity';
  END IF;
  PERFORM platform.lock_asset_core_idempotency(
    p_entity_kind, p_idempotency_key_sha256, p_subject_id, p_tenant_id, p_project_id
  );
  IF p_entity_kind = 'project-dna' THEN
    SELECT row_value.project_dna_id AS entity_id, row_value.version_id, row_value.version, row_value.payload_sha256
      INTO v_existing FROM platform.project_dna_version row_value
     WHERE row_value.idempotency_subject_id = p_subject_id AND row_value.tenant_id = p_tenant_id
       AND row_value.project_id = p_project_id AND row_value.idempotency_key_sha256 = p_idempotency_key_sha256;
  ELSE
    SELECT row_value.asset_id AS entity_id, row_value.version_id, row_value.version, row_value.payload_sha256
      INTO v_existing FROM platform.asset_version row_value
     WHERE row_value.idempotency_subject_id = p_subject_id AND row_value.tenant_id = p_tenant_id
       AND row_value.project_id = p_project_id AND row_value.idempotency_key_sha256 = p_idempotency_key_sha256;
  END IF;
  IF FOUND THEN
    IF v_existing.payload_sha256 <> p_payload_sha256
      OR (p_entity_id_must_match AND v_existing.entity_id <> p_entity_id)
    THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'idempotency_conflict'; END IF;
    RETURN QUERY SELECT v_existing.entity_id, v_existing.version_id, v_existing.version, v_existing.payload_sha256, true;
  END IF;
END
$$;

CREATE FUNCTION platform.assert_asset_core_version_transition(
  p_entity_kind text,
  p_entity_id uuid,
  p_tenant_id uuid,
  p_project_id uuid,
  p_next_version integer,
  p_next_status text,
  p_provenance_source text,
  p_restore_source_version_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_current_status text;
  v_restore_version integer;
BEGIN
  IF p_entity_kind = 'project-dna' THEN
    SELECT row_value.payload->>'status' INTO v_current_status
      FROM platform.project_dna_version row_value
     WHERE row_value.project_dna_id = p_entity_id AND row_value.tenant_id = p_tenant_id
       AND row_value.project_id = p_project_id ORDER BY row_value.version DESC LIMIT 1;
  ELSIF p_entity_kind = 'asset' THEN
    SELECT row_value.payload->>'status' INTO v_current_status
      FROM platform.asset_version row_value
     WHERE row_value.asset_id = p_entity_id AND row_value.tenant_id = p_tenant_id
       AND row_value.project_id = p_project_id ORDER BY row_value.version DESC LIMIT 1;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_identity';
  END IF;
  IF v_current_status IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_write_denied'; END IF;
  IF p_provenance_source <> 'restore' AND NOT (
    (v_current_status = 'draft' AND p_next_status IN ('draft', 'published')) OR
    (v_current_status = 'published' AND p_next_status IN ('published', 'archived')) OR
    (v_current_status = 'archived' AND p_next_status = 'archived')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_status_transition';
  END IF;
  IF p_provenance_source = 'restore' THEN
    IF p_entity_kind = 'project-dna' THEN
      SELECT row_value.version INTO v_restore_version
        FROM platform.project_dna_version row_value
       WHERE row_value.project_dna_id = p_entity_id AND row_value.version_id = p_restore_source_version_id
         AND row_value.tenant_id = p_tenant_id AND row_value.project_id = p_project_id;
    ELSE
      SELECT row_value.version INTO v_restore_version
        FROM platform.asset_version row_value
       WHERE row_value.asset_id = p_entity_id AND row_value.version_id = p_restore_source_version_id
         AND row_value.tenant_id = p_tenant_id AND row_value.project_id = p_project_id;
    END IF;
    IF v_restore_version IS NULL OR v_restore_version >= p_next_version THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_restore_source';
    END IF;
  END IF;
END
$$;

CREATE FUNCTION platform.parse_asset_core_references(p_payload jsonb)
RETURNS TABLE(asset_contract_id uuid, asset_contract_version integer, project_dna_id uuid,
  project_dna_version integer, lineage jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
BEGIN
  asset_contract_id := CASE WHEN p_payload->'assetContract' = 'null'::jsonb THEN NULL
    ELSE (p_payload->'assetContract'->>'id')::uuid END;
  asset_contract_version := CASE WHEN p_payload->'assetContract' = 'null'::jsonb THEN NULL
    ELSE (p_payload->'assetContract'->>'version')::integer END;
  project_dna_id := CASE WHEN p_payload->'projectDna' = 'null'::jsonb THEN NULL
    ELSE (p_payload->'projectDna'->>'id')::uuid END;
  project_dna_version := CASE WHEN p_payload->'projectDna' = 'null'::jsonb THEN NULL
    ELSE (p_payload->'projectDna'->>'version')::integer END;
  lineage := p_payload->'lineage';
  RETURN NEXT;
EXCEPTION WHEN others THEN
  RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_payload';
END
$$;

CREATE FUNCTION platform.insert_asset_core_lineage(
  p_asset_id uuid,
  p_version_id uuid,
  p_version integer,
  p_tenant_id uuid,
  p_project_id uuid,
  p_subject_id uuid,
  p_lineage jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
SET row_security = on
AS $$
DECLARE
  v_item jsonb;
  v_source_asset_id uuid;
  v_source_version_id uuid;
  v_source_version integer;
BEGIN
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_lineage) LOOP
    v_source_asset_id := (v_item->>'assetId')::uuid;
    v_source_version_id := NULLIF(v_item->>'assetVersionId', '')::uuid;
    IF v_source_asset_id = p_asset_id THEN
      IF v_source_version_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
      END IF;
      SELECT row_value.version INTO v_source_version FROM platform.asset_version row_value
       WHERE row_value.asset_id = p_asset_id AND row_value.version_id = v_source_version_id
         AND row_value.tenant_id = p_tenant_id AND row_value.project_id = p_project_id;
      IF v_source_version IS NULL OR v_source_version >= p_version THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_asset_core_lineage';
      END IF;
    END IF;
    INSERT INTO platform.asset_version_lineage
      (id, asset_id, asset_version_id, tenant_id, project_id, relation, source_asset_id,
       source_asset_version_id, created_by_subject_id)
    VALUES (uuidv7(), p_asset_id, p_version_id, p_tenant_id, p_project_id, v_item->>'relation',
      v_source_asset_id, v_source_version_id, p_subject_id);
  END LOOP;
END
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
  v_prepared record;
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_replay record;
BEGIN
  SELECT * INTO v_prepared FROM platform.prepare_asset_core_write(
    'project-dna', p_project_dna_id, p_version_id, p_idempotency_key_sha256,
    p_canonical_payload, p_payload_sha256, p_canonical_provenance
  );
  v_subject := v_prepared.subject_id;
  v_tenant := v_prepared.tenant_id;
  v_project := v_prepared.project_id;
  v_payload := v_prepared.payload;
  v_provenance := v_prepared.provenance;
  SELECT * INTO v_replay FROM platform.resolve_asset_core_replay(
    'project-dna', v_subject, v_tenant, v_project, p_project_dna_id,
    p_idempotency_key_sha256, p_payload_sha256, false
  );
  IF FOUND THEN
    RETURN QUERY SELECT v_replay.entity_id, v_replay.version_id, v_replay.version, v_replay.payload_sha256, true;
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
  v_prepared record;
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_replay record;
  v_version integer;
  v_restore_version_id uuid;
BEGIN
  SELECT * INTO v_prepared FROM platform.prepare_asset_core_write(
    'project-dna', p_project_dna_id, p_version_id, p_idempotency_key_sha256,
    p_canonical_payload, p_payload_sha256, p_canonical_provenance
  );
  v_subject := v_prepared.subject_id;
  v_tenant := v_prepared.tenant_id;
  v_project := v_prepared.project_id;
  v_payload := v_prepared.payload;
  v_provenance := v_prepared.provenance;
  SELECT * INTO v_replay FROM platform.resolve_asset_core_replay(
    'project-dna', v_subject, v_tenant, v_project, p_project_dna_id,
    p_idempotency_key_sha256, p_payload_sha256, true
  );
  IF FOUND THEN
    RETURN QUERY SELECT v_replay.entity_id, v_replay.version_id, v_replay.version, v_replay.payload_sha256, true;
    RETURN;
  END IF;
  PERFORM 1 FROM platform.project_dna entity
   WHERE entity.id = p_project_dna_id AND entity.tenant_id = v_tenant AND entity.project_id = v_project FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_write_denied'; END IF;
  SELECT coalesce(max(version_row.version), 0) + 1 INTO v_version
    FROM platform.project_dna_version version_row
   WHERE version_row.project_dna_id = p_project_dna_id AND version_row.tenant_id = v_tenant AND version_row.project_id = v_project;
  v_restore_version_id := NULLIF(v_provenance->>'sourceVersionId', '')::uuid;
  PERFORM platform.assert_asset_core_version_transition(
    'project-dna', p_project_dna_id, v_tenant, v_project, v_version,
    v_payload->>'status', v_provenance->>'source', v_restore_version_id
  );
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
  v_prepared record;
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_replay record;
  v_references record;
  v_lineage jsonb;
BEGIN
  SELECT * INTO v_prepared FROM platform.prepare_asset_core_write(
    'asset', p_asset_id, p_version_id, p_idempotency_key_sha256,
    p_canonical_payload, p_payload_sha256, p_canonical_provenance
  );
  v_subject := v_prepared.subject_id;
  v_tenant := v_prepared.tenant_id;
  v_project := v_prepared.project_id;
  v_payload := v_prepared.payload;
  v_provenance := v_prepared.provenance;
  SELECT * INTO v_replay FROM platform.resolve_asset_core_replay(
    'asset', v_subject, v_tenant, v_project, p_asset_id,
    p_idempotency_key_sha256, p_payload_sha256, false
  );
  IF FOUND THEN
    RETURN QUERY SELECT v_replay.entity_id, v_replay.version_id, v_replay.version, v_replay.payload_sha256, true;
    RETURN;
  END IF;
  SELECT * INTO v_references FROM platform.parse_asset_core_references(v_payload);
  v_lineage := v_references.lineage;
  INSERT INTO platform.asset(id, tenant_id, project_id, asset_contract_id, asset_contract_version, created_by_subject_id)
    VALUES (p_asset_id, v_tenant, v_project, v_references.asset_contract_id,
      v_references.asset_contract_version, v_subject);
  INSERT INTO platform.asset_version
    (asset_id, tenant_id, project_id, version, version_id, schema_version, payload, payload_sha256,
     idempotency_subject_id, idempotency_key_sha256, provenance, project_dna_id, project_dna_version,
     restored_from_version_id, created_by_subject_id)
    VALUES (p_asset_id, v_tenant, v_project, 1, p_version_id, 'asset-metadata.v1', v_payload, p_payload_sha256,
      v_subject, p_idempotency_key_sha256, v_provenance, v_references.project_dna_id,
      v_references.project_dna_version,
      NULLIF(v_provenance->>'sourceVersionId', '')::uuid, v_subject);
  PERFORM platform.insert_asset_core_lineage(
    p_asset_id, p_version_id, 1, v_tenant, v_project, v_subject, v_lineage
  );
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
  v_prepared record;
  v_subject uuid;
  v_tenant uuid;
  v_project uuid;
  v_payload jsonb;
  v_provenance jsonb;
  v_replay record;
  v_asset record;
  v_references record;
  v_version integer;
  v_restore_version_id uuid;
  v_lineage jsonb;
BEGIN
  SELECT * INTO v_prepared FROM platform.prepare_asset_core_write(
    'asset', p_asset_id, p_version_id, p_idempotency_key_sha256,
    p_canonical_payload, p_payload_sha256, p_canonical_provenance
  );
  v_subject := v_prepared.subject_id;
  v_tenant := v_prepared.tenant_id;
  v_project := v_prepared.project_id;
  v_payload := v_prepared.payload;
  v_provenance := v_prepared.provenance;
  SELECT * INTO v_replay FROM platform.resolve_asset_core_replay(
    'asset', v_subject, v_tenant, v_project, p_asset_id,
    p_idempotency_key_sha256, p_payload_sha256, true
  );
  IF FOUND THEN
    RETURN QUERY SELECT v_replay.entity_id, v_replay.version_id, v_replay.version, v_replay.payload_sha256, true;
    RETURN;
  END IF;
  SELECT entity.id, entity.asset_contract_id, entity.asset_contract_version INTO v_asset
    FROM platform.asset entity
   WHERE entity.id = p_asset_id AND entity.tenant_id = v_tenant AND entity.project_id = v_project FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'asset_core_write_denied'; END IF;
  SELECT * INTO v_references FROM platform.parse_asset_core_references(v_payload);
  IF v_references.asset_contract_id IS DISTINCT FROM v_asset.asset_contract_id
    OR v_references.asset_contract_version IS DISTINCT FROM v_asset.asset_contract_version
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'asset_contract_reference_immutable';
  END IF;
  v_lineage := v_references.lineage;
  SELECT coalesce(max(version_row.version), 0) + 1 INTO v_version
    FROM platform.asset_version version_row
   WHERE version_row.asset_id = p_asset_id AND version_row.tenant_id = v_tenant AND version_row.project_id = v_project;
  v_restore_version_id := NULLIF(v_provenance->>'sourceVersionId', '')::uuid;
  PERFORM platform.assert_asset_core_version_transition(
    'asset', p_asset_id, v_tenant, v_project, v_version, v_payload->>'status',
    v_provenance->>'source', v_restore_version_id
  );
  INSERT INTO platform.asset_version
    (asset_id, tenant_id, project_id, version, version_id, schema_version, payload, payload_sha256,
     idempotency_subject_id, idempotency_key_sha256, provenance, project_dna_id, project_dna_version,
     restored_from_version_id, created_by_subject_id)
    VALUES (p_asset_id, v_tenant, v_project, v_version, p_version_id, 'asset-metadata.v1', v_payload, p_payload_sha256,
      v_subject, p_idempotency_key_sha256, v_provenance, v_references.project_dna_id,
      v_references.project_dna_version,
      v_restore_version_id, v_subject);
  PERFORM platform.insert_asset_core_lineage(
    p_asset_id, p_version_id, v_version, v_tenant, v_project, v_subject, v_lineage
  );
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
REVOKE ALL ON FUNCTION platform.asset_core_has_exact_keys(jsonb, text[]) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_is_uuid_v7(jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_is_nullable_uuid_v7(jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_utf16_length(text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_is_bounded_text(jsonb, integer, integer) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_is_integer_in_range(jsonb, numeric, numeric) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_is_number_in_range(jsonb, numeric, numeric) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_is_finite_number(jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_jsonb_array_within_size(jsonb, integer, integer) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_bounded_json_object(jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_payload_matches_schema(jsonb, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.asset_core_provenance_matches_schema(jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.prepare_asset_core_write(text, uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.resolve_asset_core_replay(text, uuid, uuid, uuid, uuid, text, text, boolean) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.assert_asset_core_version_transition(text, uuid, uuid, uuid, integer, text, text, uuid) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.parse_asset_core_references(jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.insert_asset_core_lineage(uuid, uuid, integer, uuid, uuid, uuid, jsonb) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.create_project_dna_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.append_project_dna_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.create_asset_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.append_asset_version(uuid, uuid, text, text, text, text) FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.create_project_dna_version(uuid, uuid, text, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.append_project_dna_version(uuid, uuid, text, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.create_asset_version(uuid, uuid, text, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.append_asset_version(uuid, uuid, text, text, text, text) TO spryxel_app;
