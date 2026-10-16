# Sprint 5 implementation plan

2026-10-15 — existing project inspected: AGENTS, handoff, README, package, routes,
Context, storage recovery, V10–V13, Node tests and CUA browser suite.
No Git metadata exists in this checkout; preserve files rather than reset.

## Actual gaps

- Context writes profile and experience separately, with no repository boundary.
- Save navigation can show success before a failed write is known.
- No record export/delete or complete cleanup of legacy/recovery copies.
- No render error boundary; no cross-tab stale-writer guard.
- Story IDs exist, but restore/save helpers assume one fixed story.
- Browser coverage exists through CUA; no hosted CI or deployment checklist.

## Sequence

1. Keep existing types and state-machine behavior; document containment/ID links.
   Add a versioned student document and local repository with input validation,
   migration, recovery backups, write failure handling and stale-writer checks.
2. Adapt Context to repository operations, preserving existing page APIs.
   Make save feedback depend on actual persistence; provide retry/reload paths.
3. Add Passport JSON export, confirmed record/all-data deletion and privacy dialog.
   Include legacy/recovery copies in explicit deletion; preserve unrelated origin keys.
4. Add a render boundary, privacy/data-flow and internal-demo deployment guidance.
5. Add repository tests and real-browser data-management scenarios; rerun Sprint 4,
   mobile/desktop checks, type checking, build and inspect production artifacts.

## Existing and intended data flow

StudentProfile (one browser-local owner) → Exploration Answers (question IDs)
→ Story Run (storyRunId + storyId) → Decisions (decisionId + optionId)
→ Behaviour Evidence (source decision) → Reflection → Next Steps (action IDs)
→ Passport Entry (entry ID + run ID) → Share Selection (entry ID + four flags).

Reflection/actions remain contained in their run or saved entry; do not introduce
parallel stores. Sharing consent remains transient and private by default.
No public deployment, login, network data transfer or new story is in scope.
