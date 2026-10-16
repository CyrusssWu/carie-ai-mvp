# Carie AI MVP

A mobile-first React + TypeScript prototype for gamified career exploration for Hong Kong senior-secondary students.

## What is included

13 main views:

1. Welcome
2. About You
3. Explore Direction
4. Exploration Questions
5. Ideas to Explore
6. Home
7. Story Setup
8. Career Story Player
9. Story Recap + Behaviour Evidence
10. Reflection
11. Next Steps
12. Career Passport
13. Share Preview

The MVP intentionally uses:
- localStorage only
- mock career data
- three complete, versioned stories: UX Designer, Logistics Coordinator and Community Programme Coordinator
- descriptive behaviour evidence instead of numerical skill scores
- student-controlled sharing

No backend, login, cloud database, paid API, or automatic NGO sharing is included.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

Use a supported Node.js version (22.12+ or 24+) with npm. Install creates
`package-lock.json`; subsequent clean installs can use `npm ci`.

In this Codex workspace, Node was already bundled but npm was missing. A local
npm copy is available in the ignored `.tools` directory. If npm is not on your
PowerShell path, run from this project directory:

```powershell
$env:Path = "$PWD\.tools\node_modules\.bin;$env:Path"
npm install
npm run build
npm run dev
```

The `.tools` directory is environment support, not an application dependency.
A normal Node.js installation with npm does not need it.

## Build

```bash
npm run build
```

## Vercel test deployment

See [the deployment guide](docs/vercel-deployment.md) for private GitHub setup,
Vercel access protection, fictional-user acceptance testing and rollback.
Use the Vite preset, `npm ci`, `npm run build`, and output directory `dist`.
The root `vercel.json` provides BrowserRouter fallback and test-site headers.
No API keys or environment variables are required. The test notice is always
visible, including when the hosting environment is named Production.

## Validation

```bash
npm test
```

The tests cover all 729 choice combinations across three stories, refresh recovery, evidence
replacement, damaged or unavailable local storage, optional reflection, and
Passport record deduplication. See `VALIDATION.md` for the browser walkthrough.

### Sprint 4

Reflection and next steps are tied to a stable story run. A repeated save updates
the same Passport entry; starting another experience creates a new run. Entries
retain the five actual choices and source-linked evidence. Reflections and actions
can be edited per entry. Share Preview defaults to experience/evidence only and
never sends data. Clipboard access happens only after an explicit copy click.

The Sprint 4 experience envelope used `carie_experiences_v2`. Legacy keys remain
available for recovery; malformed v2 data is backed up before normalization.
No cloud storage, scoring, or extra dependency was added.

Sprint 4 added Node tests for migration, multi-run isolation and all
16 share-setting combinations. The real-browser Sprint 4 scenarios are in
`tests/e2e/sprint4.cua.mjs`; they use the Codex CUA browser API, not an installed
Playwright test runner. To repeat them, start the isolated test server:

```bash
npm run dev -- --config tests/e2e/vite.config.ts
```

Through CUA, create a tab at `http://localhost:5177/tests/e2e/fixtures.html`, set
the viewport to 390 × 844, import `sprint4Suite` from the local module and pass
the tab. Run `regression()`, `firstSave()`, `secondSave()`, `editing()`, `sharing()`
and `faults()` sequentially. Each throws on a failed assertion; `results` holds
the passed checks. An optional screenshot callback receives artifact names.
Only this test origin is reset. The opt-in test server instruments transmission
attempts and clipboard failure; its monitor is not included in production builds.
The fixture restores its synthetic experiences after corruption tests.

See `SPRINT4_COMPLETION_REPORT.md` and `verification/sprint4/` for the executed
acceptance report, browser results and screenshots. Browser tests are separate
from `npm test` and require CUA; physical-device and clipboard-success tests
have not been run.

### Sprint 5 — internal demonstration foundation

The canonical browser document is now `carie_student_data_v3`. A typed
`StudentDataRepository` boundary and local adapter validate/migrate the data;
React pages continue to use the existing Context. Profile and experience save in
one write. Old/recovery copies are preserved until explicit data deletion.

Passport now supports full JSON preview/download, confirmed single-entry deletion,
and confirmed clearing of all local Carie data (including old/recovery copies).
An empty document remains to prevent migration from resurrecting cleared data.
Privacy information is accessible before onboarding and from Passport. Nothing is
uploaded, no login/cloud service is enabled, and reflection stays private by default.

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The Node test suite now includes repository failure, deletion and export tests.
After the existing Sprint 4 browser suite, run the methods in
`tests/e2e/sprint5.cua.mjs` against the same isolated synthetic test tab. These
browser scenarios are executed through CUA, separately from `npm test`.
The root production build does not include the test probes or injected errors.

See `docs/sprint5-plan.md`, `docs/privacy-and-data-flow.md`, `docs/deployment.md`
and `SPRINT5_COMPLETION_REPORT.md`. **Internal Demo Ready does not mean Real
Student Pilot Ready.** No public deployment or real student enrollment is included.

When deploying the built `dist/` folder to static hosting, configure an SPA
fallback to `index.html` so direct links and refreshes work with BrowserRouter.
Vite's development server already provides this fallback.

## Recommended Codex task

Ask Codex to preserve the product principles in `AGENTS.md`, run `npm run build` after changes, and avoid adding numerical career-fit scoring or automatic sharing.

### Sprint 6 — structured career simulation content

All three careers share the existing Player at `/story/:storyId`. Career metadata,
five-decision stories, source-linked evidence, vocabulary, handoffs and action
suggestions are data. Home/Ideas use these definitions; Service Designer remains
Coming Soon. Content validation is part of every build:

```bash
npm run validate:content
npm run typecheck
npm test
npm run build
```

Published content has a semantic version. Runs retain that version; Passport
retains actual choice/consequence snapshots. The existing local repository also
retains one recent draft per story, including reflection/actions, when switching
careers. No backend, AI content generation, scoring or automatic sharing is added.

Read `docs/career-story-authoring-guide.md` and copy
`docs/career-story-template.md` to prepare the next career. These stories are
fictional product simulations, not certified Hong Kong training materials.

The Node suite has 47 tests. Real-browser acceptance still runs separately through
CUA. Start the isolated test server described above; it now disables HMR so file
edit notifications do not pollute transmission monitoring. In a test tab at
localhost:5177, set and verify the viewport at 390 × 844 **after creating the tab**.
Run the Sprint 4 and 5 suites, then import `sprint6Suite` from
`tests/e2e/sprint6.cua.mjs` and run `draftAll()`, `completeCareer(0)`,
`completeCareer(1)`, `completeCareer(2)`, `integration()` in order. Only isolated
synthetic data is reset. A screenshot callback is optional; layout assertions
explicitly check the real viewport width. See `SPRINT6_COMPLETION_REPORT.md` and
`verification/sprint6/` for actual results, including a separate production smoke.

## Sprint 7 — Hong Kong education pathway planning

Each saved experience now opens `/pathways/:careerId?entry=<entryId>`. The three
careers expose five pathway categories, official lookup links, a source-labelled
programme sheet, optional academic support preferences, editable three-state
actions stored in the same Passport Next Steps, and a student-confirmed mentor
discussion summary. Nothing is sent to mentors. Academic preferences and
reflection are excluded unless explicitly selected in that summary.

The curated initial collection contains one reviewed 2027/28 PolyU design
programme and nine source records. Logistics/community programme requirements
remain unverified and are not invented. VTC/iPASS/E-APP access limitations are
shown. Requirements expire by review date or intake cycle, using Hong Kong dates.

Read `docs/education-pathway-data-guide.md` for the schema, source and programme
files, and `docs/education-source-review-policy.md` before updating admissions
content. `npm run validate:education` runs automatically in the build. The Node
suite now has 55 tests. The separate real-browser `sprint7Suite` in
`tests/e2e/sprint7.cua.mjs` runs `careerRoutes()`, `plan()`,
`academicAndMentor()`, `invalidRoutes()` after Sprint 6's three completed careers
and before its `integration()` replay. Run without concurrent source edits;
the fixture's “Reset test counters only” button starts a clean monitoring window
without deleting experiences. The monitor now records request kinds/URLs to
diagnose unexpected traffic. No test fixtures or monitor are shipped in `dist`.
