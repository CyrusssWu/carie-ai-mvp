# V08 Figma implementation and validation

Date: 2026-10-15

## Design source

Read using Figma MCP `get_design_context`, including full code context and screenshots, from file `jD0Yg1muMjQse7OoX0C8Rn`:

| State | Source node |
| --- | --- |
| Decision | 4:41313 |
| Vocabulary Help | 4:41361 |
| Choice Confirmation | 4:41420 |
| Consequence | 4:41467 |
| Pause / Leave | 4:41513 |

The page root initially returned “nothing selected”; metadata identified the actual screen nodes and all five screen reads succeeded. The earlier file-access restriction no longer blocked these reads. The local .fig extraction was not used as a substitute for design context.

## Differences identified before implementation

- Purple gradients and raised cards → cream #FAF8F3, green #226A58, ink #233C38, muted #596C65, pale green #E8F2E9, border #D7E0D8.
- 20px page padding → 24px; 20px content gaps; 29px headings; 17px option labels; 16px body and buttons; 13px secondary copy.
- Continuous progress → five 4px segments with accessible current decision values.
- Letter badges → original 20px selection assets; 18px rounded options with selected green border and fill.
- Text-only confirmation/consequence → exact local Figma scene images, 22px corner radius, 260px/290px image slots and original 96px avatar.
- Floating vocabulary panel → full-width bottom sheet with 28px top corners, 24px padding, 30px original icon and return action.
- Minimal pause UI → centered 342px modal with original icon, resume/save actions and explanatory copy.

## Files changed

- `src/views/StoryPlayer.tsx`: composition of the five states, original assets, accessible stage heading focus, local presentation copy. Existing transition reducer and story records are reused.
- `src/views/StoryPlayer.css`: scoped Figma tokens and responsive layouts. Explicit specificity prevents the existing shared card shadow/border from overriding V08.
- `src/components/UI.tsx`: optional dialog className, headingIcon and eyebrow props. Existing consumers retain their default presentation and close button.
- `public/assets/story/`: seven exact downloaded resources (two PNGs, avatar SVG, selected/unselected SVGs, book SVG, pause SVG).
- This report and `verification/figma-v08/`: browser screenshots and validation records.

No other View, route, reducer, persistence schema, story choice, consequence or evidence data was changed. No runtime dependency was added.

## Browser validation

Isolated test origin: `http://localhost:5175`. Existing localhost:5173 student data was not reset.

- Completed all five decisions using A, B, C, A, B. Every decision exercised select → confirmation → change → different choice → confirmation → consequence/evidence → next.
- Refreshed confirmation drafts and committed consequences for all five decisions. Restored text and stage matched the user choice.
- Progress values advanced 1/5 through 5/5. Story states and overlays stayed at `/story/ux-community-signup`.
- Pause → save and leave → Home → existing setup/resume entry → original confirmation succeeded. Home showed zero passport entries after leaving.
- Decision 5 completion navigated to `/story/ux-community-signup/recap`; refresh retained all five actual choices.
- Inspected persisted state: exactly five choices, five evidence records and five unique evidence records, completed=true. See `persisted-story.json` and `state-machine-checks.json`.
- Vocabulary closes with its return action or Escape; focus returns to its trigger. Native modal dialog maintains background inertness and body scroll locking.
- Tested 390px-wide viewport at 844px height, plus 390×1068 reference captures and 1280px desktop. No horizontal overflow. Visible buttons meet the existing 44px minimum; primary/secondary actions are at least 54px.
- Exact reference captures have a 390px page and 342px content/illustration width; avatar is 96×96, selection icons 20×20 and overlay icons 30×30. Vocabulary sheet measured 390px wide and aligned with the viewport bottom; pause dialog measured 342px wide and centered.
- All referenced assets loaded, with no temporary Figma URLs or external fonts used at runtime.
- Final clean browser session: zero console errors or warnings. An earlier development tab recorded a transient HMR reload error while the source file was being replaced; the completed build and clean session had no such error.
- Source review found no new data transmission, scoring, hidden points, correct/incorrect option labels or automatic sharing. Sharing and other views were outside this visual change and were not altered.

## Commands and results

The workspace-local npm CLI was invoked via Node because npm is not globally available:

```text
node .tools/node_modules/npm/bin/npm-cli.js run dev -- --port 5175 --strictPort
node .tools/node_modules/npm/bin/npm-cli.js run build
node .tools/node_modules/npm/bin/npm-cli.js test
```

These execute the existing npm scripts. Final build passed with zero TypeScript errors. All 11 existing tests passed, including all 243 choice paths and invalid/repeated event guards. No new tests were needed for the presentation-only change.

## Deliberate adaptations / limitations

- Existing Traditional Chinese choices and vocabulary are retained. The original English prototype's third opening choice describes consulting the team; the existing story describes analytics. Replacing it would change business meaning, so it was not replaced. Local presentation notes follow the retained choices.
- Confirmation retains change-choice and pause actions; consequence retains descriptive behaviour evidence. These existing product requirements add content beyond the static prototype.
- Native device status and gesture bars, as well as Figma screen numbering, are not application controls and are omitted.
- The existing Inter/system font stack is reused; Chinese glyphs use the device fallback. Localized wrapping and page heights therefore differ from the English screenshots.
- The two original story scenes serve as ambient illustrations across the five decisions; no unprovided branch-specific art was invented.
- Desktop uses a centered mobile-width reading column. The reference provides mobile screens rather than a separate desktop layout.

## Screenshots

See `verification/figma-v08/` for Decision, Vocabulary, Confirmation, Consequence, Pause, desktop and Recap captures. The five main state files are `decision-390.jpg`, `vocabulary-390.jpg`, `confirmation-390.jpg`, `consequence-390.jpg` and `pause-390.jpg`.
