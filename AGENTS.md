# Carie AI engineering instructions

## Product principle
Carie AI helps students explore; it does not decide their future.

The core loop is:
Explore → Experience → Reflect → Understand → Act → Human Support.

## Non-negotiable UX rules
- Never add career-fit percentages.
- Never add hidden or visible numerical competency scores.
- Never label a student suitable / unsuitable for a career.
- Use descriptive behaviour evidence tied to explicit user choices.
- Keep reflection optional.
- Sharing must require explicit student action and a preview.
- Do not automatically transmit student data.
- For the MVP, store data only in localStorage.
- Do not collect real name, ethnicity, gender, exact family income, address, school, or student ID.

## Engineering constraints for MVP
- React + TypeScript + Tailwind CSS.
- Mobile-first, target ~390px width but remain responsive.
- No backend, auth, database or paid API unless explicitly requested.
- Keep Career Story Player as one route with internal states (decision → confirmation → consequence).
- Vocabulary help is a bottom sheet, pause is a modal, save success is a toast/state — not separate routes.

## Required validation after code changes
Run:

```bash
npm run build
```

If you changed story logic, manually verify:
1. all five decisions can be completed;
2. back/confirmation states do not duplicate evidence;
3. progress is persisted in localStorage;
4. recap shows choices and behaviour evidence;
5. reflection is optional;
6. saving creates a PassportEntry;
7. Share Preview does not actually send data.
