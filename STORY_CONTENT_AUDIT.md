# UX Designer story content audit

Date: 2026-10-15

## Findings and changes

The previous five decisions shared a setting but omitted the work connecting them. In particular, an analytics-first choice did not explain how the team subsequently learned about confusing terminology, and different delivery choices all jumped to a successful launch without a release checkpoint. Opening option descriptions also lived inside the React player.

The story now follows one team over a working week and a post-launch review:

1. Understand the sign-up problem with the community centre's reception, programme and development colleagues.
2. Try a change to the family-information field in a test environment.
3. Allocate limited implementation time across three concrete issues.
4. Discuss a feature request and agree on the release scope.
5. Review actual use and decide what to hand over or explore next.

Every chapter has a phase, workplace context, decision prompt and exactly three options. Every option has a description, consequence, descriptive behaviour evidence and a handoff containing the next decision ID (null for the ending) and narrative. The branches rejoin at explicit team checkpoints, with subsequent team actions distinguished from the student's own choice. All 15 branches describe a plausible benefit and a limitation or resource trade-off.

## Structure and changed files

- `src/data/stories/uxCommunitySignup.ts`: the complete career story and scene asset references, independent of React.
- `src/data/careers.ts`: retains exploration data and re-exports uxStory to preserve existing imports.
- `src/types/index.ts`: requires workplace context, exactly three options, descriptions and handoffs.
- `src/data/stories/storyRecords.ts`: pure selectors resolve committed choices and incoming narrative; invalid/missing IDs never default to an option.
- `src/views/StoryPlayer.tsx`: renders source data, including the incoming choice-specific narrative and next-stage handoff. Removes embedded opening descriptions and career-specific scene references.
- `src/views/Recap.tsx`: uses committed decision/option IDs for the five actual choices, consequences and handoffs. Its evidence is derived from those same selected options rather than a separate possibly stale array.
- `tests/storage.test.mjs`: loads the extracted module and checks the chapter contract, handoff targets, absence of score fields, missing/invalid/draft choices and all 243 combinations in Recap and incoming context.

Stable story, decision and option IDs, and all 15 existing option labels, were retained. There are no scores, correct-answer flags, fit judgements, hidden points or new external services. The existing route and transition reducer are unchanged.

## Validation

- `npm run build`: passed, zero TypeScript errors.
- `npm test`: 13 passed, 0 failed. Includes all 243 paths, repeated-event guards, reload restoration, evidence deduplication and new narrative/Recap checks.
- Browser at isolated localhost:5176, 390px viewport: completed C → B → C → B → A. Each chapter changed an initial draft, reloaded confirmation and consequence, and showed exactly one evidence item.
- Each next chapter's incoming narrative exactly matched the prior committed option's handoff. No horizontal overflow was observed.
- Decision 5 opened Recap; after reload all five rendered labels and option IDs matched the actual choices.
- Reflection was skipped; one Passport entry was saved and remained after reload, with the expected five behaviour labels.
- Share Preview generated the existing local summary only. Source inspection confirms the action only sets local component state; no send/upload operation was added.
- Browser console: zero errors or warnings.

Commands were run through the existing local npm CLI:

```text
node .tools/node_modules/npm/bin/npm-cli.js run dev -- --port 5176 --strictPort
node .tools/node_modules/npm/bin/npm-cli.js run build
node .tools/node_modules/npm/bin/npm-cli.js test
```

Browser records and screenshots: `verification/story-content/`.

## Boundaries

This is a guided story with three local branches per decision, reconverging into five shared work stages. It is not a simulation with hidden cumulative effects. Saved choices retain their original meaning and IDs; existing Recap records use the revised story wording because the current MVP does not version narrative text. Previously saved Passport entries remain snapshots of the evidence at save time.
