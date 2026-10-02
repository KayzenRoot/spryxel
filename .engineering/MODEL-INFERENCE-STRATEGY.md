# Model and Inference Strategy

Status: CANONICAL — approved by objective audit of SPRYXEL-WO-002.

## Hardware and local-first path

Planning baseline: local Docker development with RTX 5050 8 GB VRAM and 24 GB RAM. Use Docker profiles to avoid starting unnecessary services. The GPU supports serious development/benchmark work but not every high-quality model at full precision; quantization/offload and cloud fallback are architectural paths, not proof of a particular workload.

## Model Router and Inference Gateway

The user selects a game-production SKU/quality profile; Model Router chooses an eligible model/runtime behind that contract. Inference Gateway supports local worker and serverless adapters with shared durable job identity, bounded retries/time/cost, observability, and provenance. ComfyUI may be an adapter/R&D workflow, never the owner of billing or policy invariants.

The router considers asset type, contract, quality profile, license/production eligibility, resource fit, measured quality and cost, provider health, and bounded fallback. Provider/model names are adapter details; they do not define product navigation or a public guarantee.

Job processing separates durable job and attempt records from transient queue/provider state. Idempotency prevents duplicate execution charges/reservations. Failure/retry and cancellation are explicit; expensive fallback requires an approved bound.

## Candidate and license posture

- Z-Image, FLUX.1-schnell, and HiDream-O1-Image are the initial commercial-friendlier benchmarking shortlist recorded in the master, subject to final license review.
- Qwen-Image-2.1 is research/benchmark candidate only under its current Qwen Research License; it is not a commercial SPRYXEL production dependency at this stage.
- No model is selected for paid production until commercial eligibility, final license review, fixed benchmark evidence, quality, and economics are known.

All external licenses, model capability claims, provider rates, and terms must be revalidated before launch; this Work Order runs no AI/model benchmark.

## Qualification contract

Use fixed versioned benchmark prompts and Golden Asset suites by asset category; record model hash, runtime, quantization, scheduler, seed, resolution, resource usage, and pipeline version. Separate smoke, local candidate, and production qualification phases. Measure cold/warm latency, GPU/VRAM/RAM, failures/retries, QA and repair, acceptance, and full cost per accepted asset.

An eligible production route requires commercial license evidence, no known critical deterministic contract violation among approved results, technical completion target at least 97%, final acceptance target at least 90% after bounded repair, initial mature-SKU first-pass target at least 70% where practical, measured cost per accepted asset, bounded worst-case cost, and regression/rollback evidence. These are initial planning targets and are not current test results.

Quality rules are resolution-aware. Anatomy, dimensions, silhouette, frame identity, pixel geometry, and style consistency are SKU-contract checks. Integrity Gate always precedes Production Score; targeted repair is preferred only when expected quality and economics justify it.

## Open choices

Final model/pipeline runtime, quantization and offload policy, GPU vendor, model license findings, serverless configuration, provider failover and per-SKU quality/cost thresholds remain open pending actual benchmark and review evidence. SPR-PLAN-007 selects the TypeScript/Node.js 22-compatible product control-plane and worker runtime, plus Redis/BullMQ-compatible transient coordination; it does not select an inference runtime, model or GPU provider.
