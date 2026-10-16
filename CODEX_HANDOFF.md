# Carie AI — Codex handoff

## Goal
Make the React/TypeScript implementation in this repository run cleanly and match the verified zero-dependency reference in `standalone/`.

## First commands
```bash
npm install
npm run build
npm run dev
```

If dependency versions need adjustment, update them conservatively. Do not change product behavior merely to fix tooling.

## Source of truth
- Product/engineering constraints: `AGENTS.md`
- 13-view React implementation: `src/`
- Functional reference that runs without dependencies: `standalone/`

## Required user flow
Welcome → About You → Direction → 5 Exploration Questions → 3 Ideas → UX Story Setup → 5 Decision Story Player → Recap/Behaviour Evidence → Reflection → Next Steps → Career Passport → Share Preview.

## Critical acceptance criteria
1. `npm run build` passes with zero TypeScript errors.
2. Mobile layout works around 390px width.
3. V08 Story Player stays one route and uses internal states: decision → confirmation → consequence.
4. Vocabulary is a bottom sheet/modal; pause is a modal; save success is not a route.
5. All five UX story decisions can complete in sequence.
6. Choices and progress persist through refresh using localStorage.
7. Recap shows the chosen decisions and descriptive behaviour evidence.
8. No numerical skill scores, hidden points, career-fit percentages, or suitable/unsuitable labels.
9. Reflection can be skipped.
10. Saving creates one Career Passport entry.
11. Share Preview gives the student toggles and never actually sends data.
12. No backend/auth/database/API is added in this MVP.
13. No collection of real name, gender, ethnicity, school, address, student ID, or exact family income.

## Do this autonomously
- Inspect the repository before editing.
- Fix dependency/API/type errors.
- Run the build after each meaningful change.
- If a route or state bug is found, fix it and retest the whole core flow.
- Keep the UI calm, teen-friendly, mobile-first, and close to the current implementation.
- Do not add unrelated features.

At the end, report:
- files changed
- commands run
- build/test results
- any remaining limitations
