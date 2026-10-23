---
name: spryxel-search-first
description: Research before adding dependencies, integrations or new abstractions in the Spryxel Node/TypeScript monorepo. Use for feature starts, tool choices and productivity improvements.
---

# Spryxel Search First

**Source:** ECC by Affaan Mustafa, MIT license, `affaan-m/ECC@90606c8315ee09cafc303515c5f33024db6b9882`. Adapted task playbooks, **not** the entire ECC agent/plugin/runtime. License: `docs/engineering/THIRD_PARTY_ECC_MIT_LICENSE.txt`.

Use the ECC research-before-coding pattern with a small token budget.

1. Locate an existing implementation in `apps/`, `packages/`, `scripts/` or `tools/`; prefer a reference to existing code over a new module.
2. Read `package.json`, lockfile, current `AGENTS.md` and relevant interfaces. Decide if existing Node, TypeScript, Zod, Turbo or Playwright capabilities already solve it.
3. Only if needed, compare 1-3 candidate free tools for license, security, maintenance, Node 22 compatibility and potential added CI/download time.
4. Prefer adapt/reuse > small internal implementation > new external dependency. Never invoke an unapproved installer, remote script, model service, paid API or broad package upgrade.
5. Output one decision table: **reuse | extend | adopt | build**, reason, file paths, measured/estimated time cost and risk. State unverified claims and stop if access is missing.

**STOP:** a concrete minimal implementation plan, not an endless research exercise. Apply standard package gates when code actually changes.
