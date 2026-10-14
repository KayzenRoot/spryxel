# Spryxel Codex dispatch bridge v1

**STATUS: STAGED / DISABLED, NO CODEX TASK STARTED.** Branch `automation/spryxel-codex-dispatch-v1` is an isolated setup PR. It does not touch ongoing frontend #76, assets/jobs #30, or planning #75.

## Objective
Allow the owner to ask ChatGPT `Envie a próxima Work Order do Spryxel ao Codex`. ChatGPT writes an approved task into a GitHub issue and posts an explicit Codex delegation comment through its **connected GitHub app**. The task goes to an enabled **GitHub native Codex coding agent** (if available), which can produce its own cloud session and PR. ChatGPT then reviews and fixes low-risk scoped PR issues directly. This removes manual downloading/pasting while keeping approvals.

**Important distinction:** This is GitHub-initiated **new Codex agent work**, not injection into the previously open ChatGPT/Codex Cloud conversation **Spryxel - Código**. No tool in this ChatGPT session exposes an API to append a message to that existing conversation. Do NOT claim the direct old-thread route exists.

## Two official transport options
1. **Preferred, low-ops (not automatically free): GitHub Agents / OpenAI Codex.** GitHub documents the third-party OpenAI Codex agent for **paid GitHub Copilot plans**, enabled in personal/org policies. With access, users can assign an issue to the agent and request changes in PR comments using `@codex`. GitHub Copilot premium requests / Actions budgets may apply. GitHub Docs: https://docs.github.com/en/copilot/concepts/agents/openai-codex and https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents .
2. **Alternative, API-billed separate Codex harness:** Official `openai/codex-action` accepts prompts or prompt files in GitHub Actions, **requires an OpenAI Platform API key** in a GitHub secret and is billed at API rates. https://github.com/openai/codex-action . This is **not** Codex Cloud under the ChatGPT Plus usage allowance and does not attach to existing chat. It is deliberately NOT enabled here because the owner wants to minimize paid usage.

Do not substitute the Agents API for ChatGPT Codex Cloud without explaining separate API/sandbox charges and session identity. The GitHub Action alternative can be developed in a later scoped WO with explicit budget/secret configuration.

## One-time setup still requiring owner's action
- In GitHub `Settings > Copilot` / coding agents policies, check whether **OpenAI Codex coding agent** is offered and turn it on. This might require a paid GitHub Copilot plan distinct from ChatGPT Plus.
- Ensure the `KayzenRoot/spryxel` repository and Codex identity are allowed. Confirm source read and PR write permissions, and verify GitHub Actions / premium-request billing limits. Do **not** paste any API token in an issue or ChatGPT.
- Send ChatGPT confirmation that GitHub Codex delegation is enabled or a screenshot of the agent option (no secrets). ChatGPT can then dispatch a **fresh approved WO** by posting the allowed issue comment or using assignee flow if enabled. Verify actual agent response/task link before claiming success.
- Existing authenticated conversation `Spryxel - Código` still requires direct UI interaction to continue that exact context; a new issue delegation starts a separate session.

## Dispatch workflow: manual approval remains mandatory per Work Order
1. ChatGPT creates/updates a WO issue with the exact prompt, current base SHA, allowed file paths, check list, mandatory stop and reviewed Context Lock, and asks owner confirmation for THAT task if not already expressly granted.
2. Re-check live state, source hierarchy and `dispatch.config.json`. Existing `enabled:false` is a **hard prohibition** until owner and auditor approve activation. Do not silently edit config to true.
3. With enabled native agent and valid approval, ChatGPT posts the `@codex` instruction directly in the issue (from the real connected GitHub account). Inspect for task URL/session/PR confirmation; no reply/permissions/quota = BLOCKED, not dispatched.
4. Codex returns a branch/PR. ChatGPT reviews exact HEAD, corrects safe GitHub changes first, and routes only complex local corrections back. No auto-merge, security waiver, payment or Blender execution.
5. To stop, turn dispatch off again and revoke agent permissions in GitHub if necessary.

## Safety
- Config `enabled:false`, `maxConcurrentTasks:0`, `maxAutomaticRetries:0` are intentionally fail-closed. No previous prompt, including the current PR #76 Sonar correction, is queued or executed here.
- **No secrets**, callbacks, webhook endpoints, workflow triggers, GH Actions API charges, write-token permissions or model runtime were installed.
- This PR is governance/automation setup only; merge or enactment needs existing repository approval rules. Native Codex/third-party integration enablement cannot be performed through the available GitHub connector, so account action is still required.

## Verification checklist
- [ ] GitHub Codex coding agent appears in the agent selector and is enabled for this repository.
- [ ] Pricing and permissions accepted by owner.
- [ ] A separately admitted test WO (read-only, with explicit owner consent) produces a visible Codex task link.
- [ ] Task completes as a separate PR, no protected branch mutation.
- [ ] Owner explicitly activates dispatch config and defines a max concurrency/budget.
- [ ] ChatGPT observes the actual run result; no automatic merge.

**STOP:** `SPRYXEL_CODEX_NATIVE_DISPATCH_BRIDGE_STAGED_REQUIRES_EXTERNAL_ACTIVATION`.
