# Internal demo build and deployment

## Readiness distinction

**Internal Demo Ready** means the local synthetic workflow, storage, data controls,
tests and build have been verified as described in the Sprint 5 report.

**Real Student Pilot Ready** is **not established**. Institutional authorization,
privacy/legal review, approved notices/consent, security/operations ownership,
retention and real-device/accessibility validation are outstanding gates. See
`privacy-and-data-flow.md`. Do not invite students based on a successful build.

## Reproduce locally

Use Node 22.12+ (or a supported Node 24 release) and npm. From this project root:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Use the committed `package-lock.json`; do not replace it with floating versions.
In the supplied Windows workspace without global npm, use
`node .tools/node_modules/npm/bin/npm-cli.js` in place of `npm`.
No environment variables or API keys are required. `VITE_*` variables are public
client configuration and must never contain secrets.

Development: `npm run dev`. Isolated browser acceptance:
`npm run dev -- --config tests/e2e/vite.config.ts` on localhost:5177.
The test server injects synthetic probes/faults; never deploy it or use it with
real personal information. Production builds use the root Vite config only.

## Deployable contents and routing

Only serve the generated `dist/` directory. Do not expose the project root,
`verification/`, test fixtures, `.tools/`, package caches, attachments or logs.
The build contains app code and local story images, not browser localStorage or
test snapshots. BrowserRouter needs all application paths, including direct
`/story/ux-community-signup`, `/passport` and `/share`, to fall back to index.html.
Existing static assets must be served as files, not as HTML fallbacks.

Use an internal, access-restricted HTTPS origin for a hosted demonstration; hosting
access controls are a deployment responsibility, not implemented in this app.
Never expose Vite dev/preview as a production service. Configure appropriate MIME
types, HTTPS, caching and reviewed security headers; validate that the chosen
policy allows the app's local assets and layout. Avoid third-party scripts.
No public deployment was performed by this Sprint.

Each origin/port has separate browser data. Moving to another origin will not
move records. Export before a planned origin change; JSON import is not currently
available. Back up a user's export before deleting data, if they request it.

## Demonstration checklist

1. Use a fresh dedicated browser profile/origin and synthetic nickname Alex.
2. Complete onboarding, both chosen directions, five questions, UX story and five
   decisions; try pause/resume and refresh.
3. Fill or skip reflection, select actions, save; repeat the same story as a new run.
4. Edit only one entry; confirm unchanged other entry and private share defaults.
5. Preview/download JSON; cancel then confirm deletion; clear all and refresh.
6. Confirm no console errors or network uploads and no real data left on a shared
   demo device. Remove any separately downloaded synthetic files as appropriate.

## CI and release checks

`.github/workflows/validate.yml` uses the existing Node test framework, type check
and Vite build after `npm ci`; no deployment, secrets or paid services are used.
It has not been run on hosted GitHub in this checkout (no Git repository/remote).
CUA browser suites are separate, not falsely represented as CI Playwright tests.

For a release candidate, record test results, dependency/secret inspection, asset
checks and a direct-route smoke test against `npm run preview`. Rebuild from the
lockfile on the intended host before approving any hosted rollout. Rollback by
serving a previously validated compatible build; do not use an older app that
writes old schema keys against current student data without a migration review.
