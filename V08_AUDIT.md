# V08 Career Story Player state-machine audit

Date: 2026-10-15 (Asia/Shanghai)

Result: all ten requested checks passed after fixes. Player states remain on
`/story/ux-community-signup`. Vocabulary is a bottom sheet and Pause is a modal.
Neither changes the URL. Save and Leave explicitly navigates to Home; completion
navigates to `/story/ux-community-signup/recap`.

## Reproduced and fixed

Two new regression tests failed before the fixes:

1. A saved consequence with committed choice A and stale draft B restored B as the
   displayed option, while evidence and Recap remained tied to A. Restoration now
   treats the committed choice as authoritative. The consequence UI also reads the
   committed choice directly.
2. A legacy save with a committed choice but no stage reopened the editable decision.
   It now resumes the committed consequence without adding evidence again.

Transition handling is now centralized in `transitionStory`. Every action carries
the originating decision ID. Invalid options, actions from another decision,
repeated reveal/advance, premature reveal/advance, and edits after reveal are ignored.
Completion is committed before the player redirects to Recap. The progress bar now
exposes its current decision and total to assistive technology.

## State transitions and invariants

| Current state | Action | Result |
| --- | --- | --- |
| Decision, no option | Confirm / Reveal / Next | No change |
| Decision | Select valid option | Persist draft; no evidence added |
| Decision, selected | Confirm | Confirmation; draft persisted |
| Confirmation | Return to change | Decision; choice remains editable |
| Confirmation | Reveal | Commit choice, derive evidence, show Consequence |
| Consequence, decisions 1–4 | Next | Next Decision; draft cleared |
| Consequence, decision 5 | Complete | Completed state, then Recap |
| Any active stage | Pause / Vocabulary | Overlay only; story state retained |
| Pause | Save and Leave → Home → Resume | Restore prior stage and choice |
| Completed | Any story action | No change; player redirects to Recap |

Only committed choices contribute evidence. Evidence is reconstructed from those
choices rather than appended. Confirmations and abandoned drafts add no evidence.
Refresh validates the saved state and normalizes legacy/inconsistent records.
No option has a correctness label; no numerical competency scoring exists.
Decision counters and progress bar values represent story position only.

## Browser audit at 390 × 844

An isolated local origin (`localhost:5174`) preserved the earlier demo on port 5173.
The complete onboarding → exploration questions → Ideas → Setup flow was rerun
before entering V08. Each row below includes:

- Unselected confirmation disabled.
- Draft selected and preserved through refresh.
- Confirmation preserved through refresh.
- Pause → Save and Leave → Home → refresh Home → Resume restored confirmation.
- Returned to change and selected a different final option before reveal.
- Consequence and its exact evidence preserved through refresh.
- Pause → Save and Leave → Home → refresh Home → Resume restored consequence.
- Correct decision indicator and no horizontal overflow throughout.
- Same player URL at every decision, confirmation and consequence checkpoint.

| Decision | Initial → final | Final user choice | Evidence label | Result |
| --- | --- | --- | --- | --- |
| 1/5 | A → C | 先查看分析數據，找出哪一步流失最多 | Problem framing | Pass |
| 2/5 | C → B | 刪除整個欄位 | Simplifying | Pass |
| 3/5 | B → A | 先修復令最多人無法完成報名的問題 | Prioritising | Pass |
| 4/5 | A → C | 直接拒絕新功能 | Focus protecting | Pass |
| 5/5 | C → B | 既然整體完成率提升，就先結束項目 | Delivery focus | Pass |

Decision 1 vocabulary opened and closed with Escape on the same route. All ten
pause/resume cycles used a modal. Decision 5 completion navigated to Recap. After
refresh, assertions matched each of the five actual final choice labels and each
exact descriptive evidence text once. Browser warning/error logs were empty.

Post-story regression also passed: skip Reflection → Next Steps → save one
Passport entry → refresh → Share Preview → local-only summary. Reopening the
completed player returned to Recap with unchanged evidence.

## Automated checks and build

- `npm test`: **11 passed, 0 failed**.
- New tests reproduced the two recovery bugs before fixing them.
- All 243 possible five-decision choice sequences now traverse the real transition
  function, including abandoned drafts, change-before-reveal, JSON round trips in
  every stage, exact evidence checks, duplicate actions and completion.
- Additional checks reject invalid options, wrong-decision actions and attempts
  to skip confirmation or consequence. Completed state is immutable to player actions.
- `npm run build`: **PASS**, zero TypeScript errors.
- `npm run dev`: audit server on port 5174; existing server on port 5173 retained.

## Files changed for this audit

- `src/context/storage.ts` — canonical recovery and guarded story transitions.
- `src/views/StoryPlayer.tsx` — use transitions, committed consequence rendering,
  completion-driven navigation, accessible dynamic progress.
- `tests/storage.test.mjs` — recovery regressions and all-path transition tests.
- `V08_AUDIT.md` — this report.
- `verification/v08/browser-results.json` — per-decision browser audit results.
- `verification/v08/decision-1.jpg`, `confirmation-1.jpg`, `consequence-1.jpg`,
  `consequence-5.jpg`, `recap.jpg` — browser screenshots.

## Limits

Browser checks used the Chromium-based in-app browser at 390px, not physical
phones or every browser engine. Refresh recovery requires available localStorage;
the existing warning remains if storage is unavailable. No V08 failure remains
in the tested flow. No routes, scoring, backend or automatic sharing were added.
