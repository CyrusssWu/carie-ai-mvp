# Carie AI MVP acceptance — 2026-10-15

Result: PASS after accessibility fixes. Browser viewport: 390 × 844.

## Fresh-student scenario

The test origin's localStorage was cleared before starting. The reset fixture
displayed **0 entries**, and About You initially had an empty nickname and no
starting point. Temporary reset/observation fixtures were removed afterward.

- Nickname: **Alex**.
- Starting point: **完全不知道自己想做什麼**.
- Industries: **設計與創意**, **科技與數碼**.
- Exploration answers: **A, C, B, B, A**; each survived a refresh.
- Exactly three ideas appeared: UX Designer, Community Programme Coordinator,
  Service Designer. The two unavailable stories were explicitly disabled.
- Chose UX Designer and completed The Confusing Sign-up, decisions **A/A/A/A/A**.
  Each decision first used another draft, returned from confirmation, then changed
  to the final choice before reveal. Confirmation and consequence refreshes passed.
- At decision 3, Pause → Save and Leave → Home → refresh → Resume preserved the
  consequence and evidence. Player stages remained on the same story route.
- Recap showed all five actual choices and five corresponding evidence items once.
- Reflection: answered “理解別人的需要” and “做 Prototype”, left two questions
  unanswered, and added a short test note. Deselection and refresh both worked.
- Saved to Career Passport, refreshed and inspected the entry. Repeated saving
  still left exactly one entry, with matching evidence and reflection.
- Opened Share Preview and exercised all **16 combinations** of the four toggles.

## Acceptance results

| Check | Result |
| --- | --- |
| Welcome → profile → directions → 5 questions → 3 ideas | Pass |
| UX Setup → all 5 decisions → Recap / Behaviour Evidence | Pass |
| Optional partial Reflection → Next Steps → Passport → Share | Pass |
| Career Experience independently shown/hidden | Pass |
| Behaviour Evidence independently shown/hidden | Pass |
| Reflection independently shown/hidden; off by default | Pass |
| Next Steps independently shown/hidden | Pass |
| All toggles off disables generation | Pass |
| Toggle changes clear the previous generated-success state | Pass |
| Empty console warning/error log at completion | Pass |
| Invalid story/career IDs return to Ideas; unknown route returns to Welcome | Pass |
| Completed player returns to Recap | Pass |
| Actual localStorage profile, answers, choices, evidence and Passport match UI | Pass |
| No duplicate evidence or Passport records | Pass |
| No horizontal overflow at inspected 390px views/stages | Pass |
| Named controls, keyboard activation, visible selected states and 44px button height | Pass |
| Primary actions work; unavailable stories are disabled intentionally | Pass |
| No numerical career-fit or competency scoring | Pass |
| No automatic sharing or student-data transmission | Pass |

## Transmission verification

A temporary development-only fixture loaded the real application with observation
wrappers around fetch, XHR, sendBeacon, native share and WebSocket.send. It did not
block requests. A resource observer also recorded loaded resource origins.

During all 16 sharing configurations and summary generation, there were **zero
application transmission calls and zero non-local resources**. The final capture
contained only two local Vite heartbeat sends with the exact payload
`{"type":"ping"}`; these contained no student data. Application source inspection
also found no network submission, external endpoint or native-sharing call. The
Share Preview button only updates local React state. No data was uploaded or sent
to a mentor, service or external recipient.

The original browser observation API does not expose network traces, so this
temporary fixture supplied direct request-call observations. It was removed after
the audit, and the final browser page was reloaded without instrumentation.

## Fixes and changed files

- `src/views/AboutYou.tsx`: descriptive avatar labels and selected-state semantics
  for avatars and starting points.
- `src/views/Direction.tsx`: selected-state semantics for industries/fields; visibly
  disable unselected industries at the three-industry limit instead of silently
  accepting clicks with no effect.
- `src/views/Questions.tsx`: announce selected exploration answers.
- `src/views/Reflection.tsx`: announce selected answers and label each question group.
- `src/views/SharePreview.tsx`: larger toggle-label targets and live success status.
- `src/index.css`: minimum 44px button height.
- `MVP_ACCEPTANCE.md`: this report.
- `verification/acceptance/results.json`: scenario, layout, persistence and sharing results.
- `verification/acceptance/routes.json`: route and console results.
- `verification/acceptance/alex-share-preview.jpg`: screenshot.

No unrelated features, backend, auth, database, automatic sharing, competency
scores or suitable/unsuitable labels were added.

## Commands and limitations

Commands: `npm run build`, `npm test`, followed by final `npm run build`.
The workstation's local npm PATH setup from README was used.
Final results: **11 tests passed, 0 failed** (including all 243 story paths);
**production build passed with zero TypeScript errors**, 60 modules transformed.

Browser testing used the Chromium-based in-app browser at mobile dimensions,
not a physical phone or a full assistive-technology certification. Data remains
browser-local and sharing remains a preview, as required for this MVP.
