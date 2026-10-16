# Validation — 2026-10-15 (Asia/Shanghai)

Project: `D:\app开发\mnt\data\carie-ai-mvp`

Result: production build passes with zero TypeScript errors. The full required
flow was exercised in the browser at a 390px viewport. The development server
is running at http://localhost:5173/.

## Files changed or added

- `.gitignore`: exclude dependencies, local npm tooling and generated output.
- `package.json`: add the regression test command; dependency ranges preserved.
- `package-lock.json`: lock the installed dependency tree.
- `tsconfig.node.json`: use noEmit with allowImportingTsExtensions.
- `src/App.tsx`: story ID/completion guards, route scroll restoration, storage warning.
- `src/context/AppContext.tsx`: validated state loading and guarded localStorage writes.
- `src/context/storage.ts`: storage normalization and choice-derived evidence.
- `src/types/index.ts`: persist story stage and selected option.
- `src/components/UI.tsx`: accessible native modal/bottom sheet with focus and Escape handling.
- `src/components/AppHeader.tsx`: accessible back control with direct-entry fallback.
- `src/components/ReflectionSummary.tsx`: display every recorded optional reflection field.
- `src/data/careers.ts`: remove unsupported personalized claims from fixed ideas.
- `src/index.css`: correct card background precedence and narrow-screen overflow.
- `src/views/AboutYou.tsx`: associated nickname label and nickname-focused input.
- `src/views/Direction.tsx`: remove orphaned fields when an industry is deselected.
- `src/views/Questions.tsx`: restore current question and answers after refresh.
- `src/views/Ideas.tsx`: disable unavailable story actions.
- `src/views/Home.tsx`: distinguish resume and completed-story actions.
- `src/views/StorySetup.tsx`: distinguish new, resumed and completed stories.
- `src/views/StoryPlayer.tsx`: persist decision/confirmation/consequence, derive evidence,
  prevent duplicate advancement, redirect completed stories, retain modal pause.
- `src/views/Reflection.tsx`: explicit skip, deselectable answers, textarea label.
- `src/views/NextSteps.tsx`: save-success state for Passport.
- `src/views/Passport.tsx`: success status and complete reflection display.
- `src/views/SharePreview.tsx`: selected content only, complete reflection and saved
  next steps, disable empty generation, invalidate generated status after toggle changes.
- `tests/storage.test.mjs`: seven regression tests using existing TypeScript tooling.
- `README.md`: startup, local npm environment, testing and static hosting instructions.
- `VALIDATION.md`: this report.
- `verification/share-preview-390.jpg`: final browser screenshot.

The reference implementation in `standalone/`, AGENTS.md and CODEX_HANDOFF.md
were not modified. There was no Git repository metadata in this checkout.

## Bugs fixed

- Missing npm in the environment: bootstrapped a project-local npm executable.
- TypeScript config combined allowImportingTsExtensions with emitted output.
- Story stage and draft selection were lost on refresh or pause/return.
- Evidence could accumulate for superseded choices instead of matching final choices.
- Completed stories reopened at the fifth decision; premature post-story routes
  and unsupported story/career IDs were accepted.
- Malformed persisted values could crash rendering; failed storage writes could
  crash the application or falsely suggest successful persistence.
- Question index reset on refresh; deselected industries retained invisible fields.
- Fixed career suggestions claimed specific student behaviours regardless of answers.
- Reflection fields other than the first answer were hidden in Passport and preview.
- Share preview used a hardcoded next step and stale generated status.
- Home's white card background overrode its indigo background, making white text unreadable.
- The 320px body minimum width overflowed a 320px viewport with a scrollbar.
- Dialogs lacked native modal semantics and reliable keyboard/focus behavior.

## Commands run

From the project directory:

```powershell
# Environment bootstrap because npm was not initially on PATH:
pnpm --dir .tools --store-dir .tools/store add npm@11 --ignore-scripts
$env:Path = "$PWD\.tools\node_modules\.bin;$env:Path"
npm install --cache .tools/npm-cache
npm install --cache .tools/npm-cache --fetch-retries=0 --fetch-timeout=15000
npm run build
npm run dev
npm test
```

Initial install attempts encountered sandbox network restrictions; authorized
network retries completed successfully. The first build attempt before dependency
installation completed could not find tsc. All builds after installation and fixes
passed. A temporary second dev server on port 5174 was used for isolated empty-state
and route-guard checks and then stopped. The primary server on 5173 remains running.

Environment: Node 24.19.0, npm 11.21.0, TypeScript 5.9.x, Vite 7.3.7.
No application dependency ranges were upgraded. The installer reported zero
vulnerabilities. npm reported a skipped esbuild postinstall script; the installed
platform binary worked and production builds completed successfully.

## Browser verification

1. Welcome → About You: entered a test nickname and selected a starting point.
2. Direction: selected a field, deselected its industry, reselected the industry;
   confirmed that the old field was no longer selected.
3. All five exploration questions: answered, moved backward/forward, refreshed
   question 2 and confirmed the current question and answer survived.
4. Ideas: three cards rendered; only UX Designer had an active story button.
5. Story Setup → Story Player: entered the five-decision UX story.
6. Vocabulary opened as a bottom sheet without changing the story route.
7. Decision 1: selected A, entered confirmation, refreshed, returned to change to B,
   revealed the consequence, refreshed again and retained B's consequence.
8. Paused from the consequence, saved/exited to Home, resumed through setup and
   continued from the same consequence. Pause remained a modal.
9. Completed decisions with B / A / C / A / A; the player stayed one route.
10. Recap after refresh displayed all five choices and exactly their five descriptive
    evidence items. The abandoned first A choice did not appear as evidence.
11. Skipped reflection, saved to Passport, expanded the entry and verified the empty
    reflection message. Saved again and refreshed: still exactly one entry.
12. Revisited reflection, filled optional fields and a note, refreshed, saved and
    verified every filled field appeared in both Passport and an opted-in preview.
13. Share Preview: reflection was off by default; toggles hid the corresponding
    sections. Turning all toggles off disabled generation. Changing a toggle cleared
    stale success state. Generate displayed a local-only success message.
14. Source inspection found no application fetch/XHR/beacon/share/network-transmission
    code. Browser warning/error log was empty at the end of the walkthrough.
15. Fresh storage on port 5174: direct /next redirected to decision 1; invalid story
    and unavailable career IDs redirected to Ideas; empty Share Preview was safe.
16. Reopening a completed player redirected to Recap without changing evidence.
17. 390px flow visually inspected. Additional setup-page checks at 320px and 768px
    confirmed document scroll width equaled client width after the overflow fix.

Screenshot: `verification/share-preview-390.jpg`.

## Automated and build results

- `npm test`: 7 passed, 0 failed.
- Includes all 243 combinations of five three-option decisions, with exact
  choice/evidence restoration; confirmation/consequence refresh; stale evidence
  removal; malformed storage; optional reflection; passport deduplication; invalid
  JSON and blocked localStorage reads.
- `npm run build`: PASS, zero TypeScript errors, 60 modules transformed.
- Final output: HTML 0.45 kB, CSS about 17.94 kB, JS about 306.67 kB.

## Remaining limitations

- Intentional MVP scope: one complete UX Designer story; the other two are previews.
- Progress stays in this browser's localStorage. Clearing browser storage removes it;
  blocked storage is reported and only in-memory exploration remains available.
- Sharing is an explicit local preview; it does not send, upload or synchronize data.
- Browser checks used the desktop Chromium-based in-app browser, not physical
  iOS/Android devices or every browser engine.
- Static hosting must provide an index.html fallback for BrowserRouter deep links.
- A conventional Node/npm install works normally; this workstation needs the local
  npm PATH setup shown in README when npm is absent from the shell.

No backend, authentication, database, automatic sharing, numerical competency
scores, career-fit percentages or suitable/unsuitable labels were added.
