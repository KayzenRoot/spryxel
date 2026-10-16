CREATE TABLE platform.credit_wallet (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id uuid NOT NULL UNIQUE
    REFERENCES platform.tenant(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id)
);

CREATE TABLE platform.credit_lot (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id uuid NOT NULL,
  wallet_id uuid NOT NULL,
  origin text NOT NULL CHECK (origin IN (
    'TRIAL', 'PROMOTIONAL', 'REFERRAL', 'COMPENSATION', 'SUBSCRIPTION', 'PAID_PACK', 'TEST_FIXTURE'
  )),
  issued_credits bigint NOT NULL CHECK (issued_credits > 0),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, tenant_id, wallet_id),
  FOREIGN KEY (wallet_id, tenant_id)
    REFERENCES platform.credit_wallet(id, tenant_id) ON DELETE RESTRICT,
  CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE TABLE platform.credit_reservation (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id uuid NOT NULL,
  project_id uuid NOT NULL,
  wallet_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  job_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  contract_version integer NOT NULL CHECK (contract_version > 0),
  sku_id text NOT NULL CHECK (sku_id ~ '^[A-Z0-9][A-Z0-9_-]{0,63}$'),
  policy_id text NOT NULL CHECK (policy_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  policy_version text NOT NULL CHECK (policy_version ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$'),
  decision text NOT NULL CHECK (decision = 'allow_fixture'),
  cost_guard_reason_code text NOT NULL CHECK (cost_guard_reason_code = 'fixture_policy_passed'),
  estimated_internal_cost bigint NOT NULL CHECK (estimated_internal_cost > 0),
  max_internal_cost bigint NOT NULL CHECK (max_internal_cost > 0),
  status text NOT NULL CHECK (status IN ('reserved', 'partially_committed', 'settled')),
  reserved_credits bigint NOT NULL CHECK (reserved_credits > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, tenant_id, project_id),
  UNIQUE (id, tenant_id, wallet_id),
  UNIQUE (id, tenant_id, wallet_id, project_id),
  FOREIGN KEY (wallet_id, tenant_id)
    REFERENCES platform.credit_wallet(id, tenant_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (job_id, tenant_id, project_id)
    REFERENCES platform.durable_job(id, tenant_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (contract_id, contract_version, tenant_id, project_id)
    REFERENCES platform.asset_contract_version(contract_id, version, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK (estimated_internal_cost <= max_internal_cost)
);

CREATE TABLE platform.credit_event (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id uuid NOT NULL,
  wallet_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN (
    'fixture_grant', 'reserve', 'commit', 'release', 'compensate', 'terminal_release'
  )),
  idempotency_key_sha256 text NOT NULL CHECK (idempotency_key_sha256 ~ '^[0-9a-f]{64}$'),
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  reservation_id uuid,
  compensates_entry_id uuid,
  job_id uuid,
  project_id uuid,
  amount_credits bigint NOT NULL CHECK (amount_credits > 0),
  reason_code text CHECK (reason_code IS NULL OR reason_code ~ '^[A-Za-z][A-Za-z0-9_.:-]{0,63}$'),
  sku_id text CHECK (sku_id IS NULL OR sku_id ~ '^[A-Z0-9][A-Z0-9_-]{0,63}$'),
  policy_id text CHECK (policy_id IS NULL OR policy_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  policy_version text CHECK (policy_version IS NULL OR policy_version ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$'),
  decision text CHECK (decision IS NULL OR decision = 'allow_fixture'),
  cost_guard_reason_code text CHECK (
    cost_guard_reason_code IS NULL OR cost_guard_reason_code = 'fixture_policy_passed'
  ),
  estimated_internal_cost bigint CHECK (estimated_internal_cost IS NULL OR estimated_internal_cost > 0),
  max_internal_cost bigint CHECK (max_internal_cost IS NULL OR max_internal_cost > 0),
  result_status text CHECK (
    result_status IS NULL OR result_status IN ('reserved', 'partially_committed', 'settled')
  ),
  result_reserved_credits bigint CHECK (result_reserved_credits IS NULL OR result_reserved_credits > 0),
  result_committed_credits bigint CHECK (result_committed_credits IS NULL OR result_committed_credits >= 0),
  result_released_credits bigint CHECK (result_released_credits IS NULL OR result_released_credits >= 0),
  result_remaining_credits bigint CHECK (result_remaining_credits IS NULL OR result_remaining_credits >= 0),
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 128),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, subject_id, operation, idempotency_key_sha256),
  UNIQUE (id, tenant_id, wallet_id),
  FOREIGN KEY (wallet_id, tenant_id)
    REFERENCES platform.credit_wallet(id, tenant_id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, subject_id)
    REFERENCES platform.tenant_membership(tenant_id, subject_id) ON DELETE RESTRICT,
  FOREIGN KEY (reservation_id, tenant_id, wallet_id, project_id)
    REFERENCES platform.credit_reservation(id, tenant_id, wallet_id, project_id) ON DELETE RESTRICT,
  FOREIGN KEY (compensates_entry_id, tenant_id, wallet_id)
    REFERENCES platform.credit_event(id, tenant_id, wallet_id) ON DELETE RESTRICT,
  FOREIGN KEY (job_id, tenant_id, project_id)
    REFERENCES platform.durable_job(id, tenant_id, project_id) ON DELETE RESTRICT,
  CHECK ((reservation_id IS NULL) = (job_id IS NULL)),
  CHECK ((job_id IS NULL) = (project_id IS NULL)),
  CHECK ((operation = 'compensate') = (compensates_entry_id IS NOT NULL)),
  CHECK (operation <> 'compensate' OR reason_code IS NOT NULL),
  CHECK (
    (operation = 'fixture_grant' AND reservation_id IS NULL AND job_id IS NULL)
    OR (operation <> 'fixture_grant' AND reservation_id IS NOT NULL AND job_id IS NOT NULL)
  ),
  CHECK (
    (operation = 'fixture_grant'
      AND policy_id IS NULL AND policy_version IS NULL AND decision IS NULL
      AND sku_id IS NULL AND cost_guard_reason_code IS NULL
      AND estimated_internal_cost IS NULL AND max_internal_cost IS NULL
      AND result_status IS NULL AND result_reserved_credits IS NULL
      AND result_committed_credits IS NULL AND result_released_credits IS NULL
      AND result_remaining_credits IS NULL)
    OR (operation <> 'fixture_grant'
      AND sku_id IS NOT NULL AND policy_id IS NOT NULL AND policy_version IS NOT NULL
      AND decision = 'allow_fixture' AND cost_guard_reason_code = 'fixture_policy_passed'
      AND estimated_internal_cost > 0 AND max_internal_cost > 0
      AND estimated_internal_cost <= max_internal_cost
      AND result_status IS NOT NULL AND result_reserved_credits > 0
      AND result_committed_credits >= 0 AND result_released_credits >= 0
      AND result_remaining_credits >= 0 AND result_remaining_credits <= result_reserved_credits)
  )
);

COMMENT ON TABLE platform.credit_event IS
  'Durable idempotency identity is scoped by tenant, subject, operation, and key hash. It has no TTL and is retained with the immutable ledger event; this migration defines no expiry or cleanup.';

CREATE TABLE platform.credit_ledger_entry (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  event_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  wallet_id uuid NOT NULL,
  lot_id uuid NOT NULL,
  reservation_id uuid,
  account text NOT NULL CHECK (account IN ('available', 'reserved', 'consumed', 'issuance_source')),
  delta_credits bigint NOT NULL CHECK (
    delta_credits <> 0
    AND delta_credits BETWEEN -9223372036854775807 AND 9223372036854775807
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, lot_id, account),
  FOREIGN KEY (event_id, tenant_id, wallet_id)
    REFERENCES platform.credit_event(id, tenant_id, wallet_id) ON DELETE RESTRICT,
  FOREIGN KEY (lot_id, tenant_id, wallet_id)
    REFERENCES platform.credit_lot(id, tenant_id, wallet_id) ON DELETE RESTRICT,
  FOREIGN KEY (reservation_id, tenant_id, wallet_id)
    REFERENCES platform.credit_reservation(id, tenant_id, wallet_id) ON DELETE RESTRICT
);

CREATE TABLE platform.credit_integrity_incident (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  project_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN (
    'reserve', 'commit', 'release', 'compensate', 'job_cancel', 'job_finish'
  )),
  correlation_id text NOT NULL CHECK (
    length(correlation_id) BETWEEN 1 AND 128 AND correlation_id ~ '^[A-Za-z0-9._:-]+$'
  ),
  incident_code text NOT NULL CHECK (incident_code IN (
    'credit_ledger_unbalanced',
    'credit_balance_invariant_failed',
    'credit_lot_issuance_invariant_failed',
    'credit_cost_guard_metadata_mismatch',
    'credit_snapshot_invariant_failed'
  )),
  job_id uuid,
  attempt_id uuid,
  reservation_id uuid,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, operation, correlation_id, incident_code),
  CHECK ((operation = 'job_finish') = (attempt_id IS NOT NULL))
);

CREATE INDEX credit_lot_wallet_expiry_idx
  ON platform.credit_lot(tenant_id, wallet_id, expires_at, created_at, id);
CREATE INDEX credit_event_reservation_idx
  ON platform.credit_event(tenant_id, reservation_id, operation, created_at);
CREATE INDEX credit_event_compensates_entry_idx
  ON platform.credit_event(tenant_id, compensates_entry_id, operation)
  WHERE compensates_entry_id IS NOT NULL;
CREATE INDEX credit_entry_reservation_account_idx
  ON platform.credit_ledger_entry(tenant_id, reservation_id, account, lot_id);
CREATE INDEX credit_entry_wallet_lot_account_idx
  ON platform.credit_ledger_entry(tenant_id, wallet_id, lot_id, account);

INSERT INTO platform.credit_wallet (tenant_id)
SELECT DISTINCT membership.tenant_id
  FROM platform.tenant_membership membership
 WHERE membership.status = 'active'
ON CONFLICT (tenant_id) DO NOTHING;

CREATE FUNCTION platform.ensure_credit_wallet_for_active_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    INSERT INTO platform.credit_wallet (tenant_id)
    VALUES (NEW.tenant_id)
    ON CONFLICT (tenant_id) DO NOTHING;
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION platform.ensure_credit_wallet_for_active_membership() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE TRIGGER tenant_membership_credit_wallet_insert
  AFTER INSERT ON platform.tenant_membership
  FOR EACH ROW EXECUTE FUNCTION platform.ensure_credit_wallet_for_active_membership();
CREATE TRIGGER tenant_membership_credit_wallet_activate
  AFTER UPDATE OF status ON platform.tenant_membership
  FOR EACH ROW WHEN (NEW.status = 'active')
  EXECUTE FUNCTION platform.ensure_credit_wallet_for_active_membership();

CREATE FUNCTION platform.prevent_credit_append_only_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_ledger_immutable';
END
$$;

REVOKE ALL ON FUNCTION platform.prevent_credit_append_only_mutation() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE TRIGGER credit_lot_immutable
  BEFORE UPDATE OR DELETE ON platform.credit_lot
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_credit_append_only_mutation();
CREATE TRIGGER credit_event_immutable
  BEFORE UPDATE OR DELETE ON platform.credit_event
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_credit_append_only_mutation();
CREATE TRIGGER credit_ledger_entry_immutable
  BEFORE UPDATE OR DELETE ON platform.credit_ledger_entry
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_credit_append_only_mutation();

CREATE FUNCTION platform.guard_credit_wallet_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR NEW.id IS DISTINCT FROM OLD.id OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_wallet_immutable';
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION platform.guard_credit_wallet_mutation() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE TRIGGER credit_wallet_identity_immutable
  BEFORE UPDATE OR DELETE ON platform.credit_wallet
  FOR EACH ROW EXECUTE FUNCTION platform.guard_credit_wallet_mutation();

CREATE FUNCTION platform.guard_credit_reservation_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE'
    OR NEW.id IS DISTINCT FROM OLD.id
    OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
    OR NEW.project_id IS DISTINCT FROM OLD.project_id
    OR NEW.wallet_id IS DISTINCT FROM OLD.wallet_id
    OR NEW.subject_id IS DISTINCT FROM OLD.subject_id
    OR NEW.job_id IS DISTINCT FROM OLD.job_id
    OR NEW.contract_id IS DISTINCT FROM OLD.contract_id
    OR NEW.contract_version IS DISTINCT FROM OLD.contract_version
    OR NEW.sku_id IS DISTINCT FROM OLD.sku_id
    OR NEW.policy_id IS DISTINCT FROM OLD.policy_id
    OR NEW.policy_version IS DISTINCT FROM OLD.policy_version
    OR NEW.decision IS DISTINCT FROM OLD.decision
    OR NEW.cost_guard_reason_code IS DISTINCT FROM OLD.cost_guard_reason_code
    OR NEW.estimated_internal_cost IS DISTINCT FROM OLD.estimated_internal_cost
    OR NEW.max_internal_cost IS DISTINCT FROM OLD.max_internal_cost
    OR NEW.reserved_credits IS DISTINCT FROM OLD.reserved_credits
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_reservation_immutable';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
    (OLD.status = 'reserved' AND NEW.status IN ('partially_committed', 'settled'))
    OR (OLD.status = 'partially_committed' AND NEW.status = 'settled')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_reservation_transition_denied';
  END IF;
  IF NEW.status = OLD.status OR NEW.updated_at <= OLD.updated_at THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_reservation_transition_denied';
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION platform.guard_credit_reservation_mutation() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE TRIGGER credit_reservation_state_guard
  BEFORE UPDATE OR DELETE ON platform.credit_reservation
  FOR EACH ROW EXECUTE FUNCTION platform.guard_credit_reservation_mutation();

ALTER TABLE platform.credit_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_wallet FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_lot ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_lot FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_event FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_reservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_reservation FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_ledger_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_ledger_entry FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_integrity_incident ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.credit_integrity_incident FORCE ROW LEVEL SECURITY;

CREATE FUNCTION platform.credit_terminal_job_matches(
  p_tenant_id uuid,
  p_project_id uuid,
  p_subject_id uuid,
  p_job_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = pg_catalog, platform
AS $$
  SELECT session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
     AND current_user = 'spryxel'
     AND pg_catalog.pg_trigger_depth() > 0
     AND current_setting('spryxel.credit_terminal_release', true) = 'true'
     AND p_tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
     AND p_project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
     AND p_subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
     AND p_job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
     AND ((current_setting('spryxel.credit_terminal_old_status', true) = 'queued'
           AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled')
       OR (current_setting('spryxel.credit_terminal_old_status', true) = 'running'
           AND current_setting('spryxel.credit_terminal_status', true) IN ('succeeded', 'failed', 'cancelled'))
       OR (current_setting('spryxel.credit_terminal_old_status', true) = 'cancel_requested'
           AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled'))
     AND EXISTS (
       SELECT 1
         FROM platform.durable_job job
        WHERE job.id = p_job_id
          AND job.tenant_id = p_tenant_id
          AND job.project_id = p_project_id
          AND job.created_by_subject_id = p_subject_id
          AND job.operation_type = 'test_fixture.credit_ledger.v1'
          AND job.status = current_setting('spryxel.credit_terminal_status', true)
     );
$$;

REVOKE ALL ON FUNCTION platform.credit_terminal_job_matches(uuid, uuid, uuid, uuid)
  FROM PUBLIC, spryxel_app, spryxel_worker;

CREATE POLICY credit_wallet_tenant_scope ON platform.credit_wallet
  USING (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND current_setting('spryxel.credit_terminal_job_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND current_setting('spryxel.credit_terminal_subject_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND current_setting('spryxel.credit_terminal_project_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND current_setting('spryxel.credit_terminal_reservation_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND ((current_setting('spryxel.credit_terminal_old_status', true) = 'queued'
          AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled')
        OR (current_setting('spryxel.credit_terminal_old_status', true) = 'running'
          AND current_setting('spryxel.credit_terminal_status', true) IN ('succeeded', 'failed', 'cancelled'))
        OR (current_setting('spryxel.credit_terminal_old_status', true) = 'cancel_requested'
          AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled'))
      AND EXISTS (
        SELECT 1 FROM platform.credit_reservation reservation
         WHERE reservation.id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
           AND reservation.wallet_id = credit_wallet.id
           AND reservation.tenant_id = credit_wallet.tenant_id
           AND reservation.job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
           AND reservation.subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
           AND reservation.project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
           AND platform.credit_terminal_job_matches(
             reservation.tenant_id, reservation.project_id, reservation.subject_id, reservation.job_id
           )
      )
    )
  )
  WITH CHECK (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND current_setting('spryxel.credit_terminal_reservation_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND EXISTS (
        SELECT 1 FROM platform.credit_reservation reservation
         WHERE reservation.id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
           AND reservation.wallet_id = credit_wallet.id
           AND reservation.tenant_id = credit_wallet.tenant_id
           AND reservation.job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
           AND reservation.subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
           AND reservation.project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
           AND platform.credit_terminal_job_matches(
             reservation.tenant_id, reservation.project_id, reservation.subject_id, reservation.job_id
           )
      )
    )
  );

CREATE POLICY credit_lot_tenant_scope ON platform.credit_lot
  USING (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND current_setting('spryxel.credit_terminal_reservation_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND EXISTS (
        SELECT 1 FROM platform.credit_reservation reservation
        JOIN platform.credit_ledger_entry entry ON entry.reservation_id = reservation.id
         WHERE reservation.id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
           AND reservation.tenant_id = credit_lot.tenant_id
           AND reservation.wallet_id = credit_lot.wallet_id
           AND reservation.job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
           AND reservation.subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
           AND reservation.project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
           AND platform.credit_terminal_job_matches(
             reservation.tenant_id, reservation.project_id, reservation.subject_id, reservation.job_id
           )
           AND entry.lot_id = credit_lot.id
      )
    )
  )
  WITH CHECK (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND current_setting('spryxel.credit_terminal_reservation_id', true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND EXISTS (
        SELECT 1 FROM platform.credit_reservation reservation
        JOIN platform.credit_ledger_entry entry ON entry.reservation_id = reservation.id
         WHERE reservation.id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
           AND reservation.tenant_id = credit_lot.tenant_id
           AND reservation.wallet_id = credit_lot.wallet_id
           AND reservation.job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
           AND reservation.subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
           AND reservation.project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
           AND platform.credit_terminal_job_matches(
             reservation.tenant_id, reservation.project_id, reservation.subject_id, reservation.job_id
           )
           AND entry.lot_id = credit_lot.id
      )
    )
  );

CREATE POLICY credit_event_tenant_scope ON platform.credit_event
  USING (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
      AND job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
      AND project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
      AND reservation_id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
      AND platform.credit_terminal_job_matches(tenant_id, project_id, subject_id, job_id)
      AND ((current_setting('spryxel.credit_terminal_old_status', true) = 'queued'
          AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled')
        OR (current_setting('spryxel.credit_terminal_old_status', true) = 'running'
          AND current_setting('spryxel.credit_terminal_status', true) IN ('succeeded', 'failed', 'cancelled'))
        OR (current_setting('spryxel.credit_terminal_old_status', true) = 'cancel_requested'
          AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled'))
    )
  )
  WITH CHECK (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
      AND job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
      AND project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
      AND reservation_id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
      AND platform.credit_terminal_job_matches(tenant_id, project_id, subject_id, job_id)
    )
  );

CREATE POLICY credit_reservation_tenant_scope ON platform.credit_reservation
  USING (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
      AND subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
      AND job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
      AND platform.credit_terminal_job_matches(tenant_id, project_id, subject_id, job_id)
      AND ((current_setting('spryxel.credit_terminal_old_status', true) = 'queued'
          AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled')
        OR (current_setting('spryxel.credit_terminal_old_status', true) = 'running'
          AND current_setting('spryxel.credit_terminal_status', true) IN ('succeeded', 'failed', 'cancelled'))
        OR (current_setting('spryxel.credit_terminal_old_status', true) = 'cancel_requested'
          AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled'))
    )
  )
  WITH CHECK (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
      AND subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
      AND job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
      AND platform.credit_terminal_job_matches(tenant_id, project_id, subject_id, job_id)
    )
  );

CREATE POLICY credit_entry_tenant_scope ON platform.credit_ledger_entry
  USING (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND reservation_id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
      AND EXISTS (
        SELECT 1 FROM platform.credit_reservation reservation
         WHERE reservation.id = credit_ledger_entry.reservation_id
           AND reservation.job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
           AND reservation.tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
           AND reservation.project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
           AND reservation.subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
           AND platform.credit_terminal_job_matches(
             reservation.tenant_id, reservation.project_id, reservation.subject_id, reservation.job_id
           )
      )
    )
  )
  WITH CHECK (
    (tenant_id = platform.current_tenant_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id))
    OR (
      session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
      AND current_user = 'spryxel'
      AND pg_catalog.pg_trigger_depth() > 0
      AND current_setting('spryxel.credit_terminal_release', true) = 'true'
      AND tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
      AND reservation_id::text = current_setting('spryxel.credit_terminal_reservation_id', true)
      AND EXISTS (
        SELECT 1 FROM platform.credit_reservation reservation
         WHERE reservation.id = credit_ledger_entry.reservation_id
           AND reservation.job_id::text = current_setting('spryxel.credit_terminal_job_id', true)
           AND reservation.tenant_id::text = current_setting('spryxel.credit_terminal_tenant_id', true)
           AND reservation.project_id::text = current_setting('spryxel.credit_terminal_project_id', true)
           AND reservation.subject_id::text = current_setting('spryxel.credit_terminal_subject_id', true)
           AND platform.credit_terminal_job_matches(
             reservation.tenant_id, reservation.project_id, reservation.subject_id, reservation.job_id
           )
      )
    )
  );

CREATE POLICY credit_integrity_incident_definer_insert
  ON platform.credit_integrity_incident FOR INSERT TO spryxel
  WITH CHECK (
    current_user = 'spryxel'
    AND session_user IN ('spryxel_app', 'spryxel_worker')
  );

CREATE TRIGGER credit_integrity_incident_append_only
  BEFORE UPDATE OR DELETE ON platform.credit_integrity_incident
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_credit_append_only_mutation();

CREATE FUNCTION platform.assert_credit_event_balanced(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_event platform.credit_event%ROWTYPE;
  v_debit_account text;
  v_credit_account text;
  v_positive_total numeric;
  v_negative_total numeric;
BEGIN
  SELECT * INTO v_event FROM platform.credit_event WHERE id = p_event_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
      FROM platform.credit_ledger_entry entry
     WHERE entry.event_id = p_event_id
       AND (
         entry.tenant_id <> v_event.tenant_id
         OR entry.wallet_id <> v_event.wallet_id
         OR entry.reservation_id IS DISTINCT FROM v_event.reservation_id
       )
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_ledger_unbalanced';
  END IF;

  IF v_event.operation <> 'fixture_grant' AND NOT EXISTS (
    SELECT 1
      FROM platform.credit_reservation reservation
     WHERE reservation.id = v_event.reservation_id
       AND reservation.tenant_id = v_event.tenant_id
       AND reservation.wallet_id = v_event.wallet_id
       AND reservation.subject_id = v_event.subject_id
       AND reservation.job_id = v_event.job_id
       AND reservation.project_id = v_event.project_id
       AND reservation.sku_id = v_event.sku_id
       AND reservation.policy_id = v_event.policy_id
       AND reservation.policy_version = v_event.policy_version
       AND reservation.decision = v_event.decision
       AND reservation.cost_guard_reason_code = v_event.cost_guard_reason_code
       AND reservation.estimated_internal_cost = v_event.estimated_internal_cost
       AND reservation.max_internal_cost = v_event.max_internal_cost
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_cost_guard_metadata_mismatch';
  END IF;

  CASE v_event.operation
    WHEN 'fixture_grant' THEN v_debit_account := 'issuance_source'; v_credit_account := 'available';
    WHEN 'reserve' THEN v_debit_account := 'available'; v_credit_account := 'reserved';
    WHEN 'commit' THEN v_debit_account := 'reserved'; v_credit_account := 'consumed';
    WHEN 'release', 'terminal_release' THEN v_debit_account := 'reserved'; v_credit_account := 'available';
    WHEN 'compensate' THEN v_debit_account := 'consumed'; v_credit_account := 'available';
    ELSE RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_operation_denied';
  END CASE;

  IF v_event.operation = 'compensate' THEN
    IF NOT EXISTS (
      SELECT 1
        FROM platform.credit_event target
       WHERE target.id = v_event.compensates_entry_id
         AND target.operation = 'commit'
         AND target.tenant_id = v_event.tenant_id
         AND target.wallet_id = v_event.wallet_id
         AND target.subject_id = v_event.subject_id
         AND target.reservation_id = v_event.reservation_id
         AND target.job_id = v_event.job_id
         AND target.project_id = v_event.project_id
    ) THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_compensation_target_invalid';
    END IF;
    IF EXISTS (
      WITH target_lots AS (
        SELECT entry.lot_id, sum(entry.delta_credits)::numeric AS committed
          FROM platform.credit_ledger_entry entry
         WHERE entry.event_id = v_event.compensates_entry_id
           AND entry.account = 'consumed'
           AND entry.delta_credits > 0
         GROUP BY entry.lot_id
      ), compensated_lots AS (
        SELECT entry.lot_id, sum(entry.delta_credits)::numeric AS compensated
          FROM platform.credit_event compensation
          JOIN platform.credit_ledger_entry entry ON entry.event_id = compensation.id
         WHERE compensation.compensates_entry_id = v_event.compensates_entry_id
           AND compensation.operation = 'compensate'
           AND entry.account = 'available'
           AND entry.delta_credits > 0
         GROUP BY entry.lot_id
      )
      SELECT 1
        FROM compensated_lots compensated
        LEFT JOIN target_lots target USING (lot_id)
       WHERE target.lot_id IS NULL OR compensated.compensated > target.committed
    ) THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_compensation_exceeds_committed';
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM platform.credit_ledger_entry WHERE event_id = p_event_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_ledger_unbalanced';
  END IF;

  IF EXISTS (
    SELECT entry.lot_id
      FROM platform.credit_ledger_entry entry
     WHERE entry.event_id = p_event_id
     GROUP BY entry.lot_id
    HAVING count(*) <> 2
        OR sum(entry.delta_credits) <> 0
        OR count(*) FILTER (WHERE entry.account = v_debit_account AND entry.delta_credits < 0) <> 1
        OR count(*) FILTER (WHERE entry.account = v_credit_account AND entry.delta_credits > 0) <> 1
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_ledger_unbalanced';
  END IF;

  SELECT COALESCE(sum(entry.delta_credits) FILTER (
           WHERE entry.account = v_credit_account AND entry.delta_credits > 0
         ), 0),
         COALESCE(sum(entry.delta_credits) FILTER (
           WHERE entry.account = v_debit_account AND entry.delta_credits < 0
         ), 0)
    INTO v_positive_total, v_negative_total
    FROM platform.credit_ledger_entry entry
   WHERE entry.event_id = p_event_id;
  IF v_positive_total <> v_event.amount_credits OR v_negative_total <> -v_event.amount_credits THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_ledger_unbalanced';
  END IF;
END
$$;

REVOKE ALL ON FUNCTION platform.assert_credit_event_balanced(uuid) FROM PUBLIC, spryxel_app, spryxel_worker;

CREATE FUNCTION platform.check_credit_event_balance_from_event()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, platform
AS $$
BEGIN
  PERFORM platform.assert_credit_event_balanced(NEW.id);
  RETURN NULL;
END
$$;

CREATE FUNCTION platform.check_credit_event_balance_from_entry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, platform
AS $$
BEGIN
  PERFORM platform.assert_credit_event_balanced(NEW.event_id);
  RETURN NULL;
END
$$;

REVOKE ALL ON FUNCTION platform.check_credit_event_balance_from_event() FROM PUBLIC, spryxel_app, spryxel_worker;
REVOKE ALL ON FUNCTION platform.check_credit_event_balance_from_entry() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE CONSTRAINT TRIGGER credit_event_balanced_at_commit
  AFTER INSERT ON platform.credit_event
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION platform.check_credit_event_balance_from_event();
CREATE CONSTRAINT TRIGGER credit_entry_event_balanced_at_commit
  AFTER INSERT ON platform.credit_ledger_entry
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION platform.check_credit_event_balance_from_entry();

CREATE FUNCTION platform.check_credit_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_balance numeric;
  v_lot_balance numeric;
  v_issued bigint;
BEGIN
  SELECT COALESCE(sum(entry.delta_credits), 0)
    INTO v_balance
    FROM platform.credit_ledger_entry entry
   WHERE entry.tenant_id = NEW.tenant_id
     AND entry.wallet_id = NEW.wallet_id
     AND entry.lot_id = NEW.lot_id
     AND entry.account = NEW.account;

  IF v_balance < -9223372036854775807 OR v_balance > 9223372036854775807
    OR (NEW.account IN ('available', 'reserved', 'consumed') AND v_balance < 0)
    OR (NEW.account = 'issuance_source' AND v_balance > 0)
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_balance_invariant_failed';
  END IF;

  SELECT lot.issued_credits,
         COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account <> 'issuance_source'), 0),
         COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'issuance_source'), 0)
    INTO v_issued, v_lot_balance, v_balance
    FROM platform.credit_lot lot
    LEFT JOIN platform.credit_ledger_entry entry
      ON entry.lot_id = lot.id AND entry.tenant_id = lot.tenant_id AND entry.wallet_id = lot.wallet_id
   WHERE lot.id = NEW.lot_id AND lot.tenant_id = NEW.tenant_id AND lot.wallet_id = NEW.wallet_id
   GROUP BY lot.issued_credits;
  IF v_lot_balance <> v_issued OR v_balance <> -v_issued THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_lot_issuance_invariant_failed';
  END IF;
  RETURN NULL;
END
$$;

REVOKE ALL ON FUNCTION platform.check_credit_account_balance() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE CONSTRAINT TRIGGER credit_account_balance_at_commit
  AFTER INSERT ON platform.credit_ledger_entry
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION platform.check_credit_account_balance();

CREATE FUNCTION platform.check_credit_lot_issuance_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_issued bigint;
  v_lot_balance numeric;
  v_source_balance numeric;
BEGIN
  SELECT lot.issued_credits,
         COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account <> 'issuance_source'), 0),
         COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'issuance_source'), 0)
    INTO v_issued, v_lot_balance, v_source_balance
    FROM platform.credit_lot lot
    LEFT JOIN platform.credit_ledger_entry entry
      ON entry.lot_id = lot.id AND entry.tenant_id = lot.tenant_id AND entry.wallet_id = lot.wallet_id
   WHERE lot.id = NEW.id AND lot.tenant_id = NEW.tenant_id AND lot.wallet_id = NEW.wallet_id
   GROUP BY lot.issued_credits;
  IF v_lot_balance <> v_issued OR v_source_balance <> -v_issued THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_lot_issuance_invariant_failed';
  END IF;
  RETURN NULL;
END
$$;

REVOKE ALL ON FUNCTION platform.check_credit_lot_issuance_balance() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE CONSTRAINT TRIGGER credit_lot_issued_balance_at_commit
  AFTER INSERT ON platform.credit_lot
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION platform.check_credit_lot_issuance_balance();

CREATE FUNCTION platform.credit_reservation_snapshot(p_reservation_id uuid, p_replayed boolean)
RETURNS TABLE(
  reservation_id uuid,
  status text,
  reserved_credits bigint,
  committed_credits bigint,
  released_credits bigint,
  remaining_credits bigint,
  replayed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
  SELECT reservation.id,
         reservation.status,
         reservation.reserved_credits,
          COALESCE(sum(entry.delta_credits) FILTER (
            WHERE entry.account = 'consumed' AND event.operation = 'commit'
          ), 0)::bigint,
         COALESCE(sum(entry.delta_credits) FILTER (
           WHERE entry.account = 'available' AND event.operation IN ('release', 'terminal_release')
         ), 0)::bigint,
         COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'reserved'), 0)::bigint,
         p_replayed
    FROM platform.credit_reservation reservation
    LEFT JOIN platform.credit_ledger_entry entry ON entry.reservation_id = reservation.id
    LEFT JOIN platform.credit_event event ON event.id = entry.event_id
   WHERE reservation.id = p_reservation_id
   GROUP BY reservation.id;
$$;

REVOKE ALL ON FUNCTION platform.credit_reservation_snapshot(uuid, boolean) FROM PUBLIC, spryxel_app, spryxel_worker;

CREATE FUNCTION platform.apply_credit_reservation_transition(
  p_reservation_id uuid,
  p_operation text,
  p_amount bigint,
  p_reason_code text,
  p_target_entry_id uuid,
  p_idempotency_key_sha256 text,
  p_request_sha256 text,
  p_request_id text
)
RETURNS TABLE(
  reservation_id uuid,
  entry_id uuid,
  status text,
  reserved_credits bigint,
  committed_credits bigint,
  released_credits bigint,
  remaining_credits bigint,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_subject_id uuid := platform.current_subject_id();
  v_tenant_id uuid := platform.current_tenant_id();
  v_project_id uuid := platform.current_project_id();
  v_terminal_job_id text := current_setting('spryxel.credit_terminal_job_id', true);
  v_terminal_subject_id text := current_setting('spryxel.credit_terminal_subject_id', true);
  v_terminal_tenant_id text := current_setting('spryxel.credit_terminal_tenant_id', true);
  v_terminal_project_id text := current_setting('spryxel.credit_terminal_project_id', true);
  v_terminal_old_status text := current_setting('spryxel.credit_terminal_old_status', true);
  v_terminal_status text := current_setting('spryxel.credit_terminal_status', true);
  v_terminal_transition_valid boolean :=
    COALESCE((current_setting('spryxel.credit_terminal_old_status', true) = 'queued'
      AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled')
    OR (current_setting('spryxel.credit_terminal_old_status', true) = 'running'
      AND current_setting('spryxel.credit_terminal_status', true) IN ('succeeded', 'failed', 'cancelled'))
    OR (current_setting('spryxel.credit_terminal_old_status', true) = 'cancel_requested'
      AND current_setting('spryxel.credit_terminal_status', true) = 'cancelled'), false);
  v_internal_terminal boolean := COALESCE((p_operation = 'terminal_release'
    AND session_user IN ('spryxel', 'spryxel_app', 'spryxel_worker')
    AND current_user = 'spryxel'
    AND pg_catalog.pg_trigger_depth() > 0
    AND current_setting('spryxel.credit_terminal_release', true) = 'true'
    AND v_terminal_job_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND v_terminal_subject_id = v_subject_id::text
    AND v_terminal_tenant_id = v_tenant_id::text
    AND v_terminal_project_id = v_project_id::text
    AND current_setting('spryxel.credit_terminal_reservation_id', true) = p_reservation_id::text
    AND v_terminal_transition_valid), false);
  v_reservation platform.credit_reservation%ROWTYPE;
  v_existing platform.credit_event%ROWTYPE;
  v_target_event platform.credit_event%ROWTYPE;
  v_debit_account text;
  v_credit_account text;
  v_balance_account text;
  v_expected_request_sha256 text;
  v_remaining bigint;
  v_available numeric;
  v_target_compensated numeric;
  v_take bigint;
  v_held_after numeric;
  v_held_before numeric;
  v_committed_before numeric;
  v_released_before numeric;
  v_committed_after numeric;
  v_released_after numeric;
  v_new_status text;
  v_result record;
  v_lot record;
  v_event_id uuid;
BEGIN
  IF p_operation NOT IN ('commit', 'release', 'compensate', 'terminal_release') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_operation_denied';
  END IF;
  IF (NOT COALESCE(v_internal_terminal, false) AND session_user <> 'spryxel_app')
    OR (p_operation = 'terminal_release' AND COALESCE(v_internal_terminal, false) IS NOT TRUE)
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_operation_denied';
  END IF;
  IF p_reservation_id IS NULL
    OR p_amount IS NULL OR p_amount <= 0
    OR p_idempotency_key_sha256 IS NULL OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
    OR p_request_sha256 IS NULL OR p_request_sha256 !~ '^[0-9a-f]{64}$'
    OR p_request_id IS NULL OR length(p_request_id) NOT BETWEEN 1 AND 128
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_invalid_request';
  END IF;
  IF p_operation = 'compensate'
    AND (p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_.:-]{0,63}$')
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_invalid_request';
  END IF;
  IF (p_operation = 'compensate') IS DISTINCT FROM (p_target_entry_id IS NOT NULL) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_invalid_request';
  END IF;
  IF v_subject_id IS NULL OR v_tenant_id IS NULL OR v_project_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_context_required';
  END IF;
  IF p_operation = 'terminal_release' THEN
    IF COALESCE(v_internal_terminal, false) IS NOT TRUE
      OR p_request_id IS DISTINCT FROM v_terminal_job_id
      OR p_reason_code IS DISTINCT FROM ('terminal_job_' || v_terminal_status)
      OR NOT EXISTS (
        SELECT 1
          FROM platform.durable_job job
         WHERE job.id = v_terminal_job_id::uuid
           AND job.tenant_id = v_terminal_tenant_id::uuid
           AND job.project_id = v_terminal_project_id::uuid
           AND job.created_by_subject_id = v_terminal_subject_id::uuid
           AND job.operation_type = 'test_fixture.credit_ledger.v1'
           AND job.status = v_terminal_status
      )
    THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_operation_denied';
    END IF;
  END IF;
  IF NOT v_internal_terminal
    AND NOT platform.is_active_tenant_member(v_subject_id, v_tenant_id)
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_membership_required';
  END IF;

  CASE p_operation
    WHEN 'commit' THEN
      v_debit_account := 'reserved'; v_credit_account := 'consumed'; v_balance_account := 'reserved';
      v_expected_request_sha256 := encode(sha256(convert_to(
        'commit' || E'\n' || lower(p_reservation_id::text) || E'\n' || p_amount::text, 'UTF8'
      )), 'hex');
    WHEN 'release' THEN
      v_debit_account := 'reserved'; v_credit_account := 'available'; v_balance_account := 'reserved';
      v_expected_request_sha256 := encode(sha256(convert_to(
        'release' || E'\n' || lower(p_reservation_id::text) || E'\n' || p_amount::text, 'UTF8'
      )), 'hex');
    WHEN 'compensate' THEN
      v_debit_account := 'consumed'; v_credit_account := 'available'; v_balance_account := 'consumed';
      v_expected_request_sha256 := encode(sha256(convert_to(
        'compensate' || E'\n' || lower(p_target_entry_id::text) || E'\n' || p_amount::text || E'\n' || p_reason_code, 'UTF8'
      )), 'hex');
    ELSE
      v_debit_account := 'reserved'; v_credit_account := 'available'; v_balance_account := 'reserved';
      v_expected_request_sha256 := encode(sha256(convert_to(
        'terminal_release' || E'\n' || lower(p_reservation_id::text) || E'\n' || p_amount::text || E'\n' || COALESCE(p_reason_code, ''), 'UTF8'
      )), 'hex');
  END CASE;
  IF p_request_sha256 <> v_expected_request_sha256 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_payload_hash_invalid';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(
    v_tenant_id::text || ':' || v_subject_id::text || ':' || p_operation || ':' || p_idempotency_key_sha256,
    0
  ));

  SELECT * INTO v_reservation
    FROM platform.credit_reservation reservation
   WHERE reservation.id = p_reservation_id
     AND reservation.tenant_id = v_tenant_id
     AND reservation.project_id = v_project_id
     AND (
       (v_internal_terminal
         AND reservation.job_id = v_terminal_job_id::uuid
         AND reservation.subject_id = v_terminal_subject_id::uuid)
       OR (NOT v_internal_terminal AND reservation.subject_id = v_subject_id)
     )
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_reservation_not_found';
  END IF;
  IF p_operation = 'release'
    AND NOT EXISTS (
      SELECT 1
        FROM platform.durable_job job
       WHERE job.id = v_reservation.job_id
         AND job.tenant_id = v_reservation.tenant_id
         AND job.project_id = v_reservation.project_id
         AND job.created_by_subject_id = v_reservation.subject_id
         AND job.status IN ('succeeded', 'failed', 'cancelled')
    )
  THEN
    -- Keep this as an unlocked read: terminal release already holds the Job row before
    -- taking reservation and wallet locks, so locking the Job here would invert that order.
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_operation_denied';
  END IF;
  PERFORM 1 FROM platform.credit_wallet wallet
   WHERE wallet.id = v_reservation.wallet_id AND wallet.tenant_id = v_tenant_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_wallet_not_found';
  END IF;

  SELECT * INTO v_existing
    FROM platform.credit_event event
   WHERE event.tenant_id = v_tenant_id
     AND event.subject_id = v_subject_id
     AND event.operation = p_operation
     AND event.idempotency_key_sha256 = p_idempotency_key_sha256;
  IF FOUND THEN
    IF v_existing.request_sha256 <> p_request_sha256
      OR v_existing.reservation_id <> p_reservation_id
      OR v_existing.compensates_entry_id IS DISTINCT FROM p_target_entry_id
    THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_idempotency_conflict';
    END IF;
    RETURN QUERY SELECT p_reservation_id, v_existing.id, v_existing.result_status,
      v_existing.result_reserved_credits, v_existing.result_committed_credits,
      v_existing.result_released_credits, v_existing.result_remaining_credits, true;
    RETURN;
  END IF;

  IF p_operation = 'compensate' THEN
    SELECT * INTO v_target_event
      FROM platform.credit_event target
     WHERE target.id = p_target_entry_id
       AND target.tenant_id = v_tenant_id
       AND target.wallet_id = v_reservation.wallet_id
       AND target.subject_id = v_reservation.subject_id
       AND target.reservation_id = p_reservation_id
       AND target.job_id = v_reservation.job_id
       AND target.project_id = v_reservation.project_id
       AND target.operation = 'commit'
     FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_compensation_target_invalid';
    END IF;
    SELECT COALESCE(sum(event.amount_credits), 0)
      INTO v_target_compensated
      FROM platform.credit_event event
     WHERE event.operation = 'compensate'
       AND event.compensates_entry_id = p_target_entry_id
       AND event.tenant_id = v_tenant_id
       AND event.wallet_id = v_reservation.wallet_id
       AND event.reservation_id = p_reservation_id;
    v_available := v_target_event.amount_credits - v_target_compensated;
  ELSE
    SELECT COALESCE(sum(entry.delta_credits), 0)
      INTO v_available
      FROM platform.credit_ledger_entry entry
     WHERE entry.reservation_id = p_reservation_id
       AND entry.account = v_balance_account;
  END IF;
  IF v_available < p_amount THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = CASE
      WHEN p_operation = 'compensate' THEN 'credit_compensation_exceeds_committed'
      ELSE 'credit_reservation_amount_exceeded'
    END;
  END IF;

   SELECT COALESCE(sum(entry.delta_credits) FILTER (
            WHERE entry.account = 'consumed' AND event.operation = 'commit'
          ), 0),
         COALESCE(sum(entry.delta_credits) FILTER (
           WHERE entry.account = 'available' AND event.operation IN ('release', 'terminal_release')
         ), 0),
         COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'reserved'), 0)
    INTO v_committed_before, v_released_before, v_held_before
    FROM platform.credit_ledger_entry entry
    LEFT JOIN platform.credit_event event ON event.id = entry.event_id
   WHERE entry.reservation_id = p_reservation_id;

  v_held_after := CASE WHEN v_debit_account = 'reserved' THEN v_held_before - p_amount ELSE v_held_before END;
  v_committed_after := CASE
    WHEN p_operation = 'commit' THEN v_committed_before + p_amount
    ELSE v_committed_before
  END;
  v_released_after := CASE
    WHEN p_operation IN ('release', 'terminal_release') THEN v_released_before + p_amount
    ELSE v_released_before
  END;
  IF v_held_after < 0 OR v_committed_after < 0 OR v_released_after < 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_balance_invariant_failed';
  END IF;
  v_new_status := CASE
    WHEN v_held_after > 0 AND v_committed_after > 0 THEN 'partially_committed'
    WHEN v_held_after > 0 THEN 'reserved'
    ELSE 'settled'
  END;

  v_event_id := uuidv7();
  INSERT INTO platform.credit_event (
    id, tenant_id, wallet_id, subject_id, operation, idempotency_key_sha256, request_sha256,
    reservation_id, compensates_entry_id, job_id, project_id, amount_credits, reason_code, sku_id, policy_id,
    policy_version, decision, cost_guard_reason_code, estimated_internal_cost, max_internal_cost,
    result_status, result_reserved_credits, result_committed_credits,
    result_released_credits, result_remaining_credits, request_id
  ) VALUES (
    v_event_id, v_tenant_id, v_reservation.wallet_id, v_subject_id, p_operation,
    p_idempotency_key_sha256, p_request_sha256, p_reservation_id, p_target_entry_id, v_reservation.job_id,
    v_reservation.project_id, p_amount, p_reason_code, v_reservation.sku_id,
    v_reservation.policy_id, v_reservation.policy_version, v_reservation.decision,
    v_reservation.cost_guard_reason_code, v_reservation.estimated_internal_cost,
    v_reservation.max_internal_cost, v_new_status, v_reservation.reserved_credits,
    v_committed_after::bigint, v_released_after::bigint, v_held_after::bigint, p_request_id
  );

  v_remaining := p_amount;
  FOR v_lot IN
    SELECT candidate.id, candidate.available
      FROM (
        SELECT lot.id, lot.origin, lot.expires_at, lot.created_at,
               CASE WHEN p_operation = 'compensate' THEN
                 COALESCE((
                   SELECT sum(target_entry.delta_credits)::numeric
                     FROM platform.credit_ledger_entry target_entry
                    WHERE target_entry.event_id = p_target_entry_id
                      AND target_entry.tenant_id = v_tenant_id
                      AND target_entry.wallet_id = v_reservation.wallet_id
                      AND target_entry.reservation_id = p_reservation_id
                      AND target_entry.lot_id = lot.id
                      AND target_entry.account = 'consumed'
                      AND target_entry.delta_credits > 0
                 ), 0) - COALESCE((
                   SELECT sum(comp_entry.delta_credits)::numeric
                     FROM platform.credit_event compensation
                     JOIN platform.credit_ledger_entry comp_entry ON comp_entry.event_id = compensation.id
                    WHERE compensation.compensates_entry_id = p_target_entry_id
                      AND compensation.operation = 'compensate'
                       AND compensation.tenant_id = v_tenant_id
                       AND compensation.wallet_id = v_reservation.wallet_id
                       AND compensation.reservation_id = p_reservation_id
                      AND comp_entry.lot_id = lot.id
                      AND comp_entry.account = 'available'
                 ), 0)
               ELSE COALESCE((
                 SELECT sum(balance_entry.delta_credits)::numeric
                   FROM platform.credit_ledger_entry balance_entry
                  WHERE balance_entry.reservation_id = p_reservation_id
                    AND balance_entry.lot_id = lot.id
                    AND balance_entry.account = v_balance_account
               ), 0)
               END AS available
          FROM platform.credit_lot lot
         WHERE lot.tenant_id = v_tenant_id
           AND lot.wallet_id = v_reservation.wallet_id
      ) candidate
     WHERE candidate.available > 0
     ORDER BY CASE candidate.origin
       WHEN 'TRIAL' THEN 1
       WHEN 'PROMOTIONAL' THEN 2
       WHEN 'REFERRAL' THEN 3
       WHEN 'SUBSCRIPTION' THEN 4
       WHEN 'PAID_PACK' THEN 5
       WHEN 'TEST_FIXTURE' THEN 6
       ELSE 7
     END,
      CASE WHEN candidate.origin IN ('TRIAL', 'PROMOTIONAL', 'REFERRAL', 'SUBSCRIPTION')
        THEN candidate.expires_at END ASC NULLS LAST,
      CASE WHEN candidate.origin IN ('PAID_PACK', 'TEST_FIXTURE') THEN candidate.created_at END ASC,
      candidate.created_at, candidate.id
  LOOP
    EXIT WHEN v_remaining = 0;
    v_take := LEAST(v_lot.available::bigint, v_remaining);
    INSERT INTO platform.credit_ledger_entry (
      event_id, tenant_id, wallet_id, lot_id, reservation_id, account, delta_credits
    ) VALUES
      (v_event_id, v_tenant_id, v_reservation.wallet_id, v_lot.id, p_reservation_id, v_debit_account, -v_take),
      (v_event_id, v_tenant_id, v_reservation.wallet_id, v_lot.id, p_reservation_id, v_credit_account, v_take);
    v_remaining := v_remaining - v_take;
  END LOOP;
  IF v_remaining <> 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_reservation_amount_exceeded';
  END IF;

  UPDATE platform.credit_reservation AS reservation
     SET status = v_new_status, updated_at = clock_timestamp()
   WHERE reservation.id = p_reservation_id
     AND reservation.status IS DISTINCT FROM v_new_status;

  SELECT * INTO v_result FROM platform.credit_reservation_snapshot(p_reservation_id, false);
  IF v_result.status IS DISTINCT FROM v_new_status
    OR v_result.reserved_credits IS DISTINCT FROM v_reservation.reserved_credits
    OR v_result.committed_credits IS DISTINCT FROM v_committed_after::bigint
    OR v_result.released_credits IS DISTINCT FROM v_released_after::bigint
    OR v_result.remaining_credits IS DISTINCT FROM v_held_after::bigint
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_snapshot_invariant_failed';
  END IF;
  RETURN QUERY SELECT p_reservation_id, v_event_id, v_new_status, v_reservation.reserved_credits,
    v_committed_after::bigint, v_released_after::bigint, v_held_after::bigint, false;
END
$$;

REVOKE ALL ON FUNCTION platform.apply_credit_reservation_transition(uuid, text, bigint, text, uuid, text, text, text)
  FROM PUBLIC, spryxel_app, spryxel_worker;

CREATE FUNCTION platform.reserve_credit_ledger(
  p_job_id uuid,
  p_amount bigint,
  p_sku_id text,
  p_policy_id text,
  p_policy_version text,
  p_decision text,
  p_reason_code text,
  p_estimated_internal_cost bigint,
  p_max_internal_cost bigint,
  p_idempotency_key_sha256 text,
  p_request_sha256 text,
  p_request_id text
)
RETURNS TABLE(
  reservation_id uuid,
  entry_id uuid,
  status text,
  reserved_credits bigint,
  committed_credits bigint,
  released_credits bigint,
  remaining_credits bigint,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_subject_id uuid := platform.current_subject_id();
  v_tenant_id uuid := platform.current_tenant_id();
  v_project_id uuid := platform.current_project_id();
  v_job platform.durable_job%ROWTYPE;
  v_existing platform.credit_event%ROWTYPE;
  v_wallet platform.credit_wallet%ROWTYPE;
  v_expected_request_sha256 text;
  v_old_fixture_reserve_job text := current_setting('spryxel.credit_fixture_reserve_job_id', true);
  v_reservation_id uuid;
  v_event_id uuid;
  v_available_total numeric;
  v_job_found boolean;
  v_remaining bigint;
  v_take bigint;
  v_result record;
  v_lot record;
BEGIN
  IF session_user <> 'spryxel_app' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_operation_denied';
  END IF;
  IF p_job_id IS NULL OR p_amount IS NULL OR p_amount <= 0
    OR p_sku_id IS NULL OR p_sku_id !~ '^[A-Z0-9][A-Z0-9_-]{0,63}$'
    OR p_policy_id IS NULL OR p_policy_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'
    OR p_policy_version IS NULL OR p_policy_version !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$'
    OR p_decision IS DISTINCT FROM 'allow_fixture'
    OR p_reason_code IS DISTINCT FROM 'fixture_policy_passed'
    OR p_estimated_internal_cost IS NULL OR p_estimated_internal_cost <= 0
    OR p_max_internal_cost IS NULL OR p_max_internal_cost <= 0
    OR p_estimated_internal_cost > p_max_internal_cost
    OR p_idempotency_key_sha256 IS NULL OR p_idempotency_key_sha256 !~ '^[0-9a-f]{64}$'
    OR p_request_sha256 IS NULL OR p_request_sha256 !~ '^[0-9a-f]{64}$'
    OR p_request_id IS NULL OR length(p_request_id) NOT BETWEEN 1 AND 128
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_invalid_request';
  END IF;
  IF v_subject_id IS NULL OR v_tenant_id IS NULL OR v_project_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_context_required';
  END IF;
  IF NOT platform.is_active_tenant_member(v_subject_id, v_tenant_id) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_membership_required';
  END IF;
  v_expected_request_sha256 := encode(sha256(convert_to(
    'reserve' || E'\n' || lower(p_job_id::text) || E'\n' || p_amount::text
      || E'\n' || p_sku_id || E'\n' || p_policy_id || E'\n' || p_policy_version
      || E'\n' || p_decision || E'\n' || p_reason_code
      || E'\n' || p_estimated_internal_cost::text || E'\n' || p_max_internal_cost::text,
    'UTF8'
  )), 'hex');
  IF p_request_sha256 <> v_expected_request_sha256 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_payload_hash_invalid';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(
    v_tenant_id::text || ':' || v_subject_id::text || ':reserve:' || p_idempotency_key_sha256,
    0
  ));

  SELECT * INTO v_existing
    FROM platform.credit_event event
   WHERE event.tenant_id = v_tenant_id
     AND event.subject_id = v_subject_id
     AND event.operation = 'reserve'
     AND event.idempotency_key_sha256 = p_idempotency_key_sha256;
  IF FOUND THEN
    IF v_existing.request_sha256 <> p_request_sha256 OR v_existing.job_id <> p_job_id THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_idempotency_conflict';
    END IF;
    RETURN QUERY SELECT v_existing.reservation_id, v_existing.id, v_existing.result_status,
      v_existing.result_reserved_credits, v_existing.result_committed_credits,
      v_existing.result_released_credits, v_existing.result_remaining_credits, true;
    RETURN;
  END IF;

  PERFORM set_config('spryxel.credit_fixture_reserve_job_id', p_job_id::text, true);
  SELECT * INTO v_job
    FROM platform.durable_job job
   WHERE job.id = p_job_id AND job.tenant_id = v_tenant_id AND job.project_id = v_project_id
   FOR UPDATE;
  v_job_found := FOUND;
  PERFORM set_config(
    'spryxel.credit_fixture_reserve_job_id', COALESCE(v_old_fixture_reserve_job, ''), true
  );
  IF NOT v_job_found THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_job_not_found';
  END IF;
  IF v_job.operation_type = 'asset_contract.integrity_check.v1' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_cost_guard_denied';
  END IF;
  IF v_job.operation_type <> 'test_fixture.credit_ledger.v1' OR v_job.status <> 'queued' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_cost_guard_denied';
  END IF;
  IF v_job.created_by_subject_id <> v_subject_id
    OR NOT EXISTS (
      SELECT 1 FROM platform.asset_contract_version contract
       WHERE contract.contract_id = v_job.contract_id
         AND contract.version = v_job.contract_version
         AND contract.tenant_id = v_tenant_id
         AND contract.project_id = v_project_id
         AND contract.sku_id = p_sku_id
    )
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_cost_guard_denied';
  END IF;

  SELECT * INTO v_wallet
    FROM platform.credit_wallet wallet
   WHERE wallet.tenant_id = v_tenant_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_wallet_not_found';
  END IF;
  SELECT COALESCE(sum(available.balance), 0)
    INTO v_available_total
    FROM (
      SELECT lot.id, sum(entry.delta_credits) AS balance
        FROM platform.credit_lot lot
        JOIN platform.credit_ledger_entry entry
          ON entry.lot_id = lot.id AND entry.tenant_id = lot.tenant_id AND entry.wallet_id = lot.wallet_id
       WHERE lot.tenant_id = v_tenant_id AND lot.wallet_id = v_wallet.id
         AND (lot.expires_at IS NULL OR lot.expires_at > clock_timestamp())
         AND lot.origin = 'TEST_FIXTURE'
         AND entry.account = 'available'
       GROUP BY lot.id
      HAVING sum(entry.delta_credits) > 0
    ) available;
  IF v_available_total < p_amount THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_insufficient_credits';
  END IF;
  IF EXISTS (
    SELECT 1 FROM platform.credit_reservation reservation
     WHERE reservation.job_id = p_job_id AND reservation.tenant_id = v_tenant_id AND reservation.project_id = v_project_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_job_already_reserved';
  END IF;

  v_reservation_id := uuidv7();
  INSERT INTO platform.credit_reservation (
    id, tenant_id, project_id, wallet_id, subject_id, job_id, contract_id, contract_version, sku_id,
    policy_id, policy_version, decision, cost_guard_reason_code, estimated_internal_cost,
    max_internal_cost, status, reserved_credits
  ) VALUES (
    v_reservation_id, v_tenant_id, v_project_id, v_wallet.id, v_subject_id, v_job.id,
    v_job.contract_id, v_job.contract_version, p_sku_id, p_policy_id, p_policy_version,
    p_decision, p_reason_code, p_estimated_internal_cost, p_max_internal_cost, 'reserved', p_amount
  );
  v_event_id := uuidv7();
  INSERT INTO platform.credit_event (
    id, tenant_id, wallet_id, subject_id, operation, idempotency_key_sha256, request_sha256,
    reservation_id, job_id, project_id, amount_credits, sku_id, policy_id, policy_version,
    decision, cost_guard_reason_code, estimated_internal_cost, max_internal_cost,
    result_status, result_reserved_credits, result_committed_credits,
    result_released_credits, result_remaining_credits, request_id
  ) VALUES (
    v_event_id, v_tenant_id, v_wallet.id, v_subject_id, 'reserve', p_idempotency_key_sha256,
    p_request_sha256, v_reservation_id, v_job.id, v_project_id, p_amount, p_sku_id,
    p_policy_id, p_policy_version, p_decision, p_reason_code,
    p_estimated_internal_cost, p_max_internal_cost, 'reserved', p_amount, 0, 0, p_amount, p_request_id
  );

  v_remaining := p_amount;
  FOR v_lot IN
    SELECT lot.id, sum(entry.delta_credits)::numeric AS available
      FROM platform.credit_lot lot
      JOIN platform.credit_ledger_entry entry
        ON entry.lot_id = lot.id AND entry.tenant_id = lot.tenant_id AND entry.wallet_id = lot.wallet_id
     WHERE lot.tenant_id = v_tenant_id AND lot.wallet_id = v_wallet.id
       AND (lot.expires_at IS NULL OR lot.expires_at > clock_timestamp())
       AND lot.origin = 'TEST_FIXTURE' AND entry.account = 'available'
     GROUP BY lot.id, lot.origin, lot.expires_at, lot.created_at
    HAVING sum(entry.delta_credits) > 0
     ORDER BY CASE lot.origin
       WHEN 'TRIAL' THEN 1
       WHEN 'PROMOTIONAL' THEN 2
       WHEN 'REFERRAL' THEN 3
       WHEN 'SUBSCRIPTION' THEN 4
       WHEN 'PAID_PACK' THEN 5
       WHEN 'TEST_FIXTURE' THEN 6
       ELSE 7
     END,
     CASE WHEN lot.origin IN ('TRIAL', 'PROMOTIONAL', 'REFERRAL', 'SUBSCRIPTION')
       THEN lot.expires_at END ASC NULLS LAST,
     CASE WHEN lot.origin IN ('PAID_PACK', 'TEST_FIXTURE') THEN lot.created_at END ASC,
     lot.created_at, lot.id
  LOOP
    EXIT WHEN v_remaining = 0;
    v_take := LEAST(v_lot.available::bigint, v_remaining);
    INSERT INTO platform.credit_ledger_entry (
      event_id, tenant_id, wallet_id, lot_id, reservation_id, account, delta_credits
    ) VALUES
      (v_event_id, v_tenant_id, v_wallet.id, v_lot.id, v_reservation_id, 'available', -v_take),
      (v_event_id, v_tenant_id, v_wallet.id, v_lot.id, v_reservation_id, 'reserved', v_take);
    v_remaining := v_remaining - v_take;
  END LOOP;
  IF v_remaining <> 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_insufficient_credits';
  END IF;
  SELECT * INTO v_result FROM platform.credit_reservation_snapshot(v_reservation_id, false);
  IF v_result.status IS DISTINCT FROM 'reserved'
    OR v_result.reserved_credits IS DISTINCT FROM p_amount
    OR v_result.committed_credits IS DISTINCT FROM 0::bigint
    OR v_result.released_credits IS DISTINCT FROM 0::bigint
    OR v_result.remaining_credits IS DISTINCT FROM p_amount
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'credit_snapshot_invariant_failed';
  END IF;
  RETURN QUERY SELECT v_reservation_id, v_event_id, v_result.status, v_result.reserved_credits,
    v_result.committed_credits, v_result.released_credits, v_result.remaining_credits, false;
END
$$;

CREATE FUNCTION platform.commit_credit_ledger(
  p_reservation_id uuid, p_amount bigint, p_idempotency_key_sha256 text, p_request_sha256 text, p_request_id text
)
RETURNS TABLE(reservation_id uuid, entry_id uuid, status text, reserved_credits bigint, committed_credits bigint,
  released_credits bigint, remaining_credits bigint, replayed boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
  SELECT * FROM platform.apply_credit_reservation_transition(
    p_reservation_id, 'commit', p_amount, NULL, NULL,
    p_idempotency_key_sha256, p_request_sha256, p_request_id
  )
$$;

CREATE FUNCTION platform.release_credit_ledger(
  p_reservation_id uuid, p_amount bigint, p_idempotency_key_sha256 text, p_request_sha256 text, p_request_id text
)
RETURNS TABLE(reservation_id uuid, entry_id uuid, status text, reserved_credits bigint, committed_credits bigint,
  released_credits bigint, remaining_credits bigint, replayed boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
  SELECT * FROM platform.apply_credit_reservation_transition(
    p_reservation_id, 'release', p_amount, NULL, NULL,
    p_idempotency_key_sha256, p_request_sha256, p_request_id
  )
$$;

CREATE FUNCTION platform.compensate_credit_ledger(
  p_reservation_id uuid, p_target_entry_id uuid, p_amount bigint, p_reason_code text,
  p_idempotency_key_sha256 text, p_request_sha256 text, p_request_id text
)
RETURNS TABLE(reservation_id uuid, entry_id uuid, status text, reserved_credits bigint, committed_credits bigint,
  released_credits bigint, remaining_credits bigint, replayed boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
  SELECT * FROM platform.apply_credit_reservation_transition(
    p_reservation_id, 'compensate', p_amount, p_reason_code, p_target_entry_id,
    p_idempotency_key_sha256, p_request_sha256, p_request_id
  )
$$;

REVOKE ALL ON FUNCTION platform.reserve_credit_ledger(
  uuid, bigint, text, text, text, text, text, bigint, bigint, text, text, text
) FROM PUBLIC, spryxel_worker;
REVOKE ALL ON FUNCTION platform.commit_credit_ledger(uuid, bigint, text, text, text) FROM PUBLIC, spryxel_worker;
REVOKE ALL ON FUNCTION platform.release_credit_ledger(uuid, bigint, text, text, text) FROM PUBLIC, spryxel_worker;
REVOKE ALL ON FUNCTION platform.compensate_credit_ledger(uuid, uuid, bigint, text, text, text, text) FROM PUBLIC, spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.reserve_credit_ledger(
  uuid, bigint, text, text, text, text, text, bigint, bigint, text, text, text
) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.commit_credit_ledger(uuid, bigint, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.release_credit_ledger(uuid, bigint, text, text, text) TO spryxel_app;
GRANT EXECUTE ON FUNCTION platform.compensate_credit_ledger(uuid, uuid, bigint, text, text, text, text) TO spryxel_app;

CREATE FUNCTION platform.release_terminal_credit_reservations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_reservation record;
  v_old_subject text := current_setting('spryxel.subject_id', true);
  v_old_tenant text := current_setting('spryxel.tenant_id', true);
  v_old_project text := current_setting('spryxel.project_id', true);
  v_old_terminal_release text := current_setting('spryxel.credit_terminal_release', true);
  v_old_terminal_job text := current_setting('spryxel.credit_terminal_job_id', true);
  v_old_terminal_subject text := current_setting('spryxel.credit_terminal_subject_id', true);
  v_old_terminal_tenant text := current_setting('spryxel.credit_terminal_tenant_id', true);
  v_old_terminal_project text := current_setting('spryxel.credit_terminal_project_id', true);
  v_old_terminal_old_status text := current_setting('spryxel.credit_terminal_old_status', true);
  v_old_terminal_status text := current_setting('spryxel.credit_terminal_status', true);
  v_old_terminal_reservation text := current_setting('spryxel.credit_terminal_reservation_id', true);
  v_held_credits bigint;
  v_key_hash text;
  v_request_hash text;
BEGIN
  IF NEW.status NOT IN ('succeeded', 'failed', 'cancelled')
    OR OLD.status IS NOT DISTINCT FROM NEW.status
    OR NEW.operation_type <> 'test_fixture.credit_ledger.v1'
  THEN
    RETURN NEW;
  END IF;
  IF NOT ((OLD.status = 'queued' AND NEW.status = 'cancelled')
    OR (OLD.status = 'running' AND NEW.status IN ('succeeded', 'failed', 'cancelled'))
    OR (OLD.status = 'cancel_requested' AND NEW.status = 'cancelled')) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_terminal_transition_denied';
  END IF;

  PERFORM set_config('spryxel.subject_id', NEW.created_by_subject_id::text, true);
  PERFORM set_config('spryxel.tenant_id', NEW.tenant_id::text, true);
  PERFORM set_config('spryxel.project_id', NEW.project_id::text, true);
  PERFORM set_config('spryxel.credit_terminal_release', 'true', true);
  PERFORM set_config('spryxel.credit_terminal_job_id', NEW.id::text, true);
  PERFORM set_config('spryxel.credit_terminal_subject_id', NEW.created_by_subject_id::text, true);
  PERFORM set_config('spryxel.credit_terminal_tenant_id', NEW.tenant_id::text, true);
  PERFORM set_config('spryxel.credit_terminal_project_id', NEW.project_id::text, true);
  PERFORM set_config('spryxel.credit_terminal_old_status', OLD.status, true);
  PERFORM set_config('spryxel.credit_terminal_status', NEW.status, true);

  FOR v_reservation IN
    SELECT reservation.id
      FROM platform.credit_reservation reservation
     WHERE reservation.job_id = NEW.id
       AND reservation.tenant_id = NEW.tenant_id
       AND reservation.project_id = NEW.project_id
       AND reservation.subject_id = NEW.created_by_subject_id
     ORDER BY reservation.id
     FOR UPDATE OF reservation
  LOOP
    PERFORM set_config('spryxel.credit_terminal_reservation_id', v_reservation.id::text, true);
    SELECT COALESCE(sum(entry.delta_credits), 0)::bigint
      INTO v_held_credits
      FROM platform.credit_ledger_entry entry
     WHERE entry.reservation_id = v_reservation.id AND entry.account = 'reserved';
     IF v_held_credits <= 0 THEN
       CONTINUE;
     END IF;
    v_key_hash := encode(sha256(convert_to(
      'terminal_release:' || lower(v_reservation.id::text), 'UTF8'
    )), 'hex');
    v_request_hash := encode(sha256(convert_to(
      'terminal_release' || E'\n' || lower(v_reservation.id::text) || E'\n' || v_held_credits::text
        || E'\nterminal_job_' || NEW.status,
      'UTF8'
    )), 'hex');
    PERFORM * FROM platform.apply_credit_reservation_transition(
      v_reservation.id,
      'terminal_release',
      v_held_credits,
      'terminal_job_' || NEW.status,
      NULL,
      v_key_hash,
      v_request_hash,
      NEW.id::text
    );
  END LOOP;

  PERFORM set_config('spryxel.subject_id', COALESCE(v_old_subject, ''), true);
  PERFORM set_config('spryxel.tenant_id', COALESCE(v_old_tenant, ''), true);
  PERFORM set_config('spryxel.project_id', COALESCE(v_old_project, ''), true);
  PERFORM set_config('spryxel.credit_terminal_release', COALESCE(v_old_terminal_release, ''), true);
  PERFORM set_config('spryxel.credit_terminal_job_id', COALESCE(v_old_terminal_job, ''), true);
  PERFORM set_config('spryxel.credit_terminal_subject_id', COALESCE(v_old_terminal_subject, ''), true);
  PERFORM set_config('spryxel.credit_terminal_tenant_id', COALESCE(v_old_terminal_tenant, ''), true);
  PERFORM set_config('spryxel.credit_terminal_project_id', COALESCE(v_old_terminal_project, ''), true);
  PERFORM set_config('spryxel.credit_terminal_old_status', COALESCE(v_old_terminal_old_status, ''), true);
  PERFORM set_config('spryxel.credit_terminal_status', COALESCE(v_old_terminal_status, ''), true);
  PERFORM set_config('spryxel.credit_terminal_reservation_id', COALESCE(v_old_terminal_reservation, ''), true);
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION platform.release_terminal_credit_reservations() FROM PUBLIC, spryxel_app, spryxel_worker;
CREATE TRIGGER durable_job_release_terminal_credit_reservations
  AFTER UPDATE OF status ON platform.durable_job
  FOR EACH ROW EXECUTE FUNCTION platform.release_terminal_credit_reservations();

CREATE VIEW platform.credit_wallet_summary WITH (security_barrier = true) AS
SELECT wallet.tenant_id,
       statement_timestamp() AS as_of,
       COALESCE(balance.available_credits, 0)::numeric AS available_credits,
       COALESCE(balance.reserved_credits, 0)::numeric AS reserved_credits,
       COALESCE(balance.committed_credits, 0)::numeric AS committed_credits,
       COALESCE(reservations.open_reservations, 0)::bigint AS open_reservations,
       COALESCE(balance.ledger_entries, 0)::bigint AS ledger_entries
  FROM platform.credit_wallet wallet
  LEFT JOIN LATERAL (
    SELECT sum(entry.delta_credits) FILTER (
             WHERE entry.account = 'available' AND (lot.expires_at IS NULL OR lot.expires_at > clock_timestamp())
           ) AS available_credits,
           sum(entry.delta_credits) FILTER (WHERE entry.account = 'reserved') AS reserved_credits,
           sum(entry.delta_credits) FILTER (WHERE entry.account = 'consumed') AS committed_credits,
           count(entry.id) AS ledger_entries
      FROM platform.credit_ledger_entry entry
      JOIN platform.credit_lot lot
        ON lot.id = entry.lot_id AND lot.tenant_id = entry.tenant_id AND lot.wallet_id = entry.wallet_id
     WHERE entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id
  ) balance ON true
  LEFT JOIN LATERAL (
    SELECT count(*) FILTER (WHERE reservation.status IN ('reserved', 'partially_committed')) AS open_reservations
      FROM platform.credit_reservation reservation
     WHERE reservation.tenant_id = wallet.tenant_id AND reservation.wallet_id = wallet.id
  ) reservations ON true
 WHERE wallet.tenant_id = platform.current_tenant_id()
   AND platform.is_active_tenant_member(platform.current_subject_id(), wallet.tenant_id);

REVOKE ALL ON platform.credit_wallet, platform.credit_lot, platform.credit_event,
  platform.credit_reservation, platform.credit_ledger_entry, platform.credit_wallet_summary
  FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT SELECT ON platform.credit_wallet_summary TO spryxel_app;

ALTER TABLE platform.durable_job
  DROP CONSTRAINT durable_job_operation_type_check;

ALTER TABLE platform.durable_job
  ADD CONSTRAINT durable_job_operation_type_check CHECK (
    operation_type IN ('asset_contract.integrity_check.v1', 'test_fixture.credit_ledger.v1')
  );

CREATE POLICY durable_job_hide_credit_test_fixture_app
  ON platform.durable_job AS RESTRICTIVE FOR SELECT TO spryxel_app
  USING (
    operation_type <> 'test_fixture.credit_ledger.v1'
    OR (
      current_user = 'spryxel'
      AND session_user = 'spryxel_app'
      AND id::text = current_setting('spryxel.credit_fixture_reserve_job_id', true)
      AND tenant_id = platform.current_tenant_id()
      AND project_id = platform.current_project_id()
      AND platform.is_active_tenant_member(platform.current_subject_id(), tenant_id)
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
     AND j.operation_type = 'asset_contract.integrity_check.v1'
   FOR UPDATE OF j;
  IF NOT FOUND OR NOT platform.is_active_tenant_member(v_subject, v_tenant)
    OR (v_creator <> v_subject AND v_role NOT IN ('OWNER','ADMIN')) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'job_not_found';
  END IF;
  IF v_status = 'queued' THEN
    UPDATE platform.durable_job SET status = 'cancelled', updated_at = now()
     WHERE id = p_job_id AND operation_type = 'asset_contract.integrity_check.v1' AND status = 'queued';
    RETURN 'cancelled';
  ELSIF v_status = 'running' THEN
    UPDATE platform.durable_job
       SET status = 'cancel_requested', cancel_requested_at = now(), lease_expires_at = NULL, updated_at = now()
     WHERE id = p_job_id AND operation_type = 'asset_contract.integrity_check.v1' AND status = 'running';
    RETURN 'cancel_requested';
  END IF;
  RETURN v_status;
END
$$;

CREATE FUNCTION platform.record_credit_integrity_incident(
  p_tenant_id uuid,
  p_subject_id uuid,
  p_project_id uuid,
  p_operation text,
  p_correlation_id text,
  p_incident_code text,
  p_job_id uuid,
  p_reservation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
BEGIN
  -- The restricted API database role is a trusted service attestation boundary. This is
  -- intentionally not a user-facing endpoint; only the service calls it after matching an
  -- allowlisted invariant error and confirming rollback on its prior transaction.
  IF session_user <> 'spryxel_app' OR current_user <> 'spryxel'
    OR p_tenant_id IS NULL OR p_subject_id IS NULL OR p_project_id IS NULL
    OR p_operation IS NULL
    OR p_operation NOT IN ('reserve', 'commit', 'release', 'compensate', 'job_cancel')
    OR p_correlation_id IS NULL OR length(p_correlation_id) NOT BETWEEN 1 AND 128
    OR p_correlation_id !~ '^[A-Za-z0-9._:-]+$'
    OR p_incident_code IS NULL
    OR p_incident_code NOT IN (
      'credit_ledger_unbalanced',
      'credit_balance_invariant_failed',
      'credit_lot_issuance_invariant_failed',
      'credit_cost_guard_metadata_mismatch',
      'credit_snapshot_invariant_failed'
    )
    OR (p_operation = 'reserve' AND (p_job_id IS NULL OR p_reservation_id IS NOT NULL))
    OR (p_operation = 'job_cancel' AND (p_job_id IS NULL OR p_reservation_id IS NOT NULL))
    OR (p_operation IN ('commit', 'release', 'compensate')
      AND (p_reservation_id IS NULL OR p_job_id IS NOT NULL))
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;

  PERFORM set_config('spryxel.subject_id', p_subject_id::text, true),
          set_config('spryxel.tenant_id', p_tenant_id::text, true),
          set_config('spryxel.project_id', p_project_id::text, true);
  IF NOT EXISTS (
    SELECT 1
      FROM platform.project project
      JOIN platform.tenant_membership membership
        ON membership.tenant_id = project.tenant_id
     WHERE project.id = p_project_id
       AND project.tenant_id = p_tenant_id
       AND membership.subject_id = p_subject_id
       AND membership.status = 'active'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;

  IF p_operation = 'reserve' AND NOT EXISTS (
    SELECT 1 FROM platform.durable_job job
     WHERE job.id = p_job_id AND job.tenant_id = p_tenant_id
       AND job.project_id = p_project_id AND job.created_by_subject_id = p_subject_id
       AND job.operation_type = 'test_fixture.credit_ledger.v1'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;
  IF p_operation = 'job_cancel' AND NOT EXISTS (
    SELECT 1 FROM platform.durable_job job
     WHERE job.id = p_job_id AND job.tenant_id = p_tenant_id
       AND job.project_id = p_project_id
       AND job.operation_type = 'asset_contract.integrity_check.v1'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;
  IF p_operation IN ('commit', 'release', 'compensate') AND NOT EXISTS (
    SELECT 1 FROM platform.credit_reservation reservation
     WHERE reservation.id = p_reservation_id AND reservation.tenant_id = p_tenant_id
       AND reservation.project_id = p_project_id AND reservation.subject_id = p_subject_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;

  INSERT INTO platform.credit_integrity_incident (
    tenant_id, subject_id, project_id, operation, correlation_id, incident_code,
    job_id, reservation_id
  ) VALUES (
    p_tenant_id, p_subject_id, p_project_id, p_operation, p_correlation_id,
    p_incident_code, p_job_id, p_reservation_id
  ) ON CONFLICT (tenant_id, operation, correlation_id, incident_code) DO NOTHING;
END
$$;

REVOKE ALL ON FUNCTION platform.record_credit_integrity_incident(
  uuid, uuid, uuid, text, text, text, uuid, uuid
) FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.record_credit_integrity_incident(
  uuid, uuid, uuid, text, text, text, uuid, uuid
) TO spryxel_app;

CREATE FUNCTION platform.record_credit_terminal_integrity_incident(
  p_job_id uuid,
  p_attempt_id uuid,
  p_lease_token uuid,
  p_incident_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  v_tenant_id uuid;
  v_project_id uuid;
  v_subject_id uuid;
  v_reservation_id uuid;
BEGIN
  IF session_user <> 'spryxel_worker' OR current_user <> 'spryxel'
    OR p_job_id IS NULL OR p_attempt_id IS NULL OR p_lease_token IS NULL
    OR p_incident_code IS NULL
    OR p_incident_code NOT IN (
      'credit_ledger_unbalanced',
      'credit_balance_invariant_failed',
      'credit_lot_issuance_invariant_failed',
      'credit_cost_guard_metadata_mismatch',
      'credit_snapshot_invariant_failed'
    )
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;

  SELECT job.tenant_id, job.project_id, job.created_by_subject_id
    INTO v_tenant_id, v_project_id, v_subject_id
    FROM platform.durable_job job
    JOIN platform.job_attempt attempt
      ON attempt.job_id = job.id AND attempt.tenant_id = job.tenant_id
     AND attempt.project_id = job.project_id
   WHERE job.id = p_job_id AND attempt.id = p_attempt_id
     AND attempt.lease_token = p_lease_token AND attempt.status = 'running'
     AND job.status IN ('running', 'cancel_requested')
     AND job.operation_type = 'asset_contract.integrity_check.v1';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'credit_integrity_incident_denied';
  END IF;

  SELECT reservation.id INTO v_reservation_id
    FROM platform.credit_reservation reservation
   WHERE reservation.job_id = p_job_id AND reservation.tenant_id = v_tenant_id
     AND reservation.project_id = v_project_id;

  INSERT INTO platform.credit_integrity_incident (
    tenant_id, subject_id, project_id, operation, correlation_id, incident_code,
    job_id, attempt_id, reservation_id
  ) VALUES (
    v_tenant_id, v_subject_id, v_project_id, 'job_finish',
    'job-attempt:' || p_attempt_id::text, p_incident_code,
    p_job_id, p_attempt_id, v_reservation_id
  ) ON CONFLICT (tenant_id, operation, correlation_id, incident_code) DO NOTHING;
END
$$;

REVOKE ALL ON FUNCTION platform.record_credit_terminal_integrity_incident(uuid, uuid, uuid, text)
  FROM PUBLIC, spryxel_app, spryxel_worker;
GRANT EXECUTE ON FUNCTION platform.record_credit_terminal_integrity_incident(uuid, uuid, uuid, text)
  TO spryxel_worker;

DO $$
DECLARE
  v_table regclass;
  v_function text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'spryxel_worker')
    OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'spryxel_app') THEN
    RAISE EXCEPTION 'Required spryxel_app and spryxel_worker roles must exist before credit-ledger migration';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles
     WHERE rolname IN ('spryxel_app', 'spryxel_worker')
       AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole OR rolreplication)
  ) THEN
    RAISE EXCEPTION 'Runtime roles must remain unprivileged and NOBYPASSRLS';
  END IF;

  FOREACH v_table IN ARRAY ARRAY[
    'platform.credit_wallet'::regclass,
    'platform.credit_lot'::regclass,
    'platform.credit_event'::regclass,
    'platform.credit_reservation'::regclass,
    'platform.credit_ledger_entry'::regclass,
    'platform.credit_integrity_incident'::regclass
  ] LOOP
    IF has_table_privilege('spryxel_app', v_table, 'SELECT')
      OR pg_catalog.has_any_column_privilege('spryxel_app', v_table, 'SELECT')
      OR has_table_privilege('spryxel_app', v_table, 'INSERT')
      OR pg_catalog.has_any_column_privilege('spryxel_app', v_table, 'INSERT')
      OR has_table_privilege('spryxel_app', v_table, 'UPDATE')
      OR pg_catalog.has_any_column_privilege('spryxel_app', v_table, 'UPDATE')
      OR has_table_privilege('spryxel_app', v_table, 'DELETE')
      OR has_table_privilege('spryxel_app', v_table, 'TRUNCATE')
      OR has_table_privilege('spryxel_app', v_table, 'REFERENCES')
      OR pg_catalog.has_any_column_privilege('spryxel_app', v_table, 'REFERENCES')
      OR has_table_privilege('spryxel_app', v_table, 'TRIGGER')
      OR has_table_privilege('spryxel_worker', v_table, 'SELECT')
      OR pg_catalog.has_any_column_privilege('spryxel_worker', v_table, 'SELECT')
      OR has_table_privilege('spryxel_worker', v_table, 'INSERT')
      OR pg_catalog.has_any_column_privilege('spryxel_worker', v_table, 'INSERT')
      OR has_table_privilege('spryxel_worker', v_table, 'UPDATE')
      OR pg_catalog.has_any_column_privilege('spryxel_worker', v_table, 'UPDATE')
      OR has_table_privilege('spryxel_worker', v_table, 'DELETE')
      OR has_table_privilege('spryxel_worker', v_table, 'TRUNCATE')
      OR has_table_privilege('spryxel_worker', v_table, 'REFERENCES')
      OR pg_catalog.has_any_column_privilege('spryxel_worker', v_table, 'REFERENCES')
      OR has_table_privilege('spryxel_worker', v_table, 'TRIGGER')
    THEN
      RAISE EXCEPTION 'Credit ledger base-table grants exceed the approved app projection/function boundary';
    END IF;
  END LOOP;

  IF NOT has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'SELECT')
    OR has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'INSERT')
    OR pg_catalog.has_any_column_privilege('spryxel_app', 'platform.credit_wallet_summary', 'INSERT')
    OR has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'UPDATE')
    OR pg_catalog.has_any_column_privilege('spryxel_app', 'platform.credit_wallet_summary', 'UPDATE')
    OR has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'DELETE')
    OR has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'TRUNCATE')
    OR has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'REFERENCES')
    OR pg_catalog.has_any_column_privilege('spryxel_app', 'platform.credit_wallet_summary', 'REFERENCES')
    OR has_table_privilege('spryxel_app', 'platform.credit_wallet_summary', 'TRIGGER')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'SELECT')
    OR pg_catalog.has_any_column_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'SELECT')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'INSERT')
    OR pg_catalog.has_any_column_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'INSERT')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'UPDATE')
    OR pg_catalog.has_any_column_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'UPDATE')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'DELETE')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'TRUNCATE')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'REFERENCES')
    OR pg_catalog.has_any_column_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'REFERENCES')
    OR has_table_privilege('spryxel_worker', 'platform.credit_wallet_summary', 'TRIGGER')
  THEN
    RAISE EXCEPTION 'Credit summary view grants exceed the approved app-only SELECT boundary';
  END IF;

  IF NOT has_function_privilege(
       'spryxel_app',
       'platform.reserve_credit_ledger(uuid,bigint,text,text,text,text,text,bigint,bigint,text,text,text)',
       'EXECUTE'
     )
    OR NOT has_function_privilege('spryxel_app', 'platform.commit_credit_ledger(uuid,bigint,text,text,text)', 'EXECUTE')
    OR NOT has_function_privilege('spryxel_app', 'platform.release_credit_ledger(uuid,bigint,text,text,text)', 'EXECUTE')
    OR NOT has_function_privilege('spryxel_app', 'platform.compensate_credit_ledger(uuid,uuid,bigint,text,text,text,text)', 'EXECUTE')
    OR has_function_privilege(
       'spryxel_worker',
       'platform.reserve_credit_ledger(uuid,bigint,text,text,text,text,text,bigint,bigint,text,text,text)',
       'EXECUTE'
     )
    OR has_function_privilege('spryxel_worker', 'platform.commit_credit_ledger(uuid,bigint,text,text,text)', 'EXECUTE')
    OR has_function_privilege('spryxel_worker', 'platform.release_credit_ledger(uuid,bigint,text,text,text)', 'EXECUTE')
    OR has_function_privilege('spryxel_worker', 'platform.compensate_credit_ledger(uuid,uuid,bigint,text,text,text,text)', 'EXECUTE')
    OR NOT has_function_privilege(
       'spryxel_app',
       'platform.record_credit_integrity_incident(uuid,uuid,uuid,text,text,text,uuid,uuid)',
       'EXECUTE'
     )
    OR has_function_privilege(
       'spryxel_worker',
       'platform.record_credit_integrity_incident(uuid,uuid,uuid,text,text,text,uuid,uuid)',
       'EXECUTE'
     )
    OR NOT has_function_privilege(
       'spryxel_worker',
       'platform.record_credit_terminal_integrity_incident(uuid,uuid,uuid,text)',
       'EXECUTE'
     )
    OR has_function_privilege(
       'spryxel_app',
       'platform.record_credit_terminal_integrity_incident(uuid,uuid,uuid,text)',
       'EXECUTE'
     )
  THEN
    RAISE EXCEPTION 'Credit ledger wrapper grants exceed the approved app-only EXECUTE boundary';
  END IF;

  FOREACH v_function IN ARRAY ARRAY[
    'platform.ensure_credit_wallet_for_active_membership()',
    'platform.prevent_credit_append_only_mutation()',
    'platform.guard_credit_wallet_mutation()',
    'platform.guard_credit_reservation_mutation()',
    'platform.assert_credit_event_balanced(uuid)',
    'platform.check_credit_event_balance_from_event()',
    'platform.check_credit_event_balance_from_entry()',
    'platform.check_credit_account_balance()',
    'platform.check_credit_lot_issuance_balance()',
    'platform.credit_reservation_snapshot(uuid,boolean)',
    'platform.apply_credit_reservation_transition(uuid,text,bigint,text,uuid,text,text,text)',
    'platform.credit_terminal_job_matches(uuid,uuid,uuid,uuid)',
    'platform.release_terminal_credit_reservations()'
  ] LOOP
    IF has_function_privilege('spryxel_app', v_function, 'EXECUTE')
      OR has_function_privilege('spryxel_worker', v_function, 'EXECUTE')
    THEN
      RAISE EXCEPTION 'Private credit ledger helper grants must remain revoked';
    END IF;
  END LOOP;
END
$$;
