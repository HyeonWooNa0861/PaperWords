# PaperWords Ralplan consensus

Date: 2026-08-11 KST
Iteration: 1
Status: approved for Ultragoal handoff

## Planning artifacts

- `.omx/specs/deep-interview-paperwords-mvp.md`
- `.omx/plans/research-paperwords-stack.md`
- `.omx/plans/prd-paperwords-mvp.md`
- `.omx/plans/test-spec-paperwords-mvp.md`

## Architect gate

- Verdict: APPROVE after one repair cycle.
- Former blocker closed: the complete 90-day schedule uses a versioned 20-day sliding repeat window, so 20 verified seed terms can serve all dates without claiming 90 unique terms.
- Former blocker closed: published scholarly fields require field-level source provenance plus editorial attestation; tests prove coverage and workflow integrity, not independent factual truth.
- Accepted risk: a minimal owned service worker has higher maintenance burden than Serwist but is bounded by an explicit route, cache, message, and version-A/version-B test contract.

## Critic gate

- Verdict: APPROVE.
- Blocking findings: none.
- The PRD and test specification are executable without material interpretation.
- Most likely failure mode: service-worker cache update behavior; keep it as an independent release-blocking test lane.

## Consensus decision

Build a static-first Next.js PWA with local Zod-validated content, deterministic MiniSearch candidate retrieval plus explicit post-ranking, a fully populated versioned KST schedule, optional tooling-only metadata adapters, and a minimal owned service worker. Runtime, build, and default tests require no network or API keys. No commit, push, deploy, credentials, paid service, or external publication is authorized.

## Execution boundary

Ultragoal may decompose and execute the approved stories. It must preserve the 20-day repeat-window wording, the provenance-vs-truth boundary, and the independent PWA update gate. Later code review and adversarial QA remain separate required phases.
