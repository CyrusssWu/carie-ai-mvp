# Privacy and data flow — Sprint 5

## Status and purpose

Carie supports exploration, experience, reflection and human discussion. It does
not assess fixed ability, diagnose mental health, or determine career suitability.
This version is prepared for **internal demonstration with fictional data**.
It is not authorization to enroll real students or declare legal compliance.

## What is saved and why

| Data | Purpose and association |
| --- | --- |
| Nickname and optional avatar/starting point | Friendly continuity in the existing onboarding. No real-name requirement. |
| Industry/field selections and exploration answers | Remember chosen directions; answers keyed by question/option IDs. Tags are descriptive, without points. |
| Browser-local profile ID | Random technical ID inside this browser, not a school/student identifier. No cross-site tracking. |
| Active story run | Stable run/story IDs, current internal stage, draft option and committed decisions. |
| Behaviour evidence | Describes choices. Saved evidence references a decision within its containing entry/run. |
| Reflection and next steps | Optional text/feelings and selected actions, contained in that run or saved entry. |
| Passport entries | Independent experience IDs and run IDs, five choice/consequence snapshots, evidence, reflection/actions, completion time. |
| Technical metadata | Schema version, write revision, and pending cleanup flag for safe migration/deletion. |

New completion timestamps use ISO 8601 UTC. Existing parseable timestamps are
normalized to that format. Optional target dates use a valid `YYYY-MM-DD` calendar
date, without timezone conversion. UI formats dates for local display.

No fields collect real name, school, address, ethnicity, gender, exact household
income or school student ID. Free text can still contain sensitive information
typed voluntarily; the privacy dialog asks students not to enter it. There is no
remote filtering or AI interpretation. We cannot promise that free text contains
no personal information.

## Where the data lives

`LocalStudentDataRepository` reads/writes one canonical document under
`carie_student_data_v3` in origin-scoped localStorage. The document schema is v3;
the reused, nested experience schema remains v2. These are distinct boundaries,
not competing student stores. Profile and experience are saved in one write.

React pages use the existing AppContext; it delegates storage to the repository.
Pure state helpers contain the story transitions and entry operations. Story
definitions remain outside UI, with a catalog lookup for future reviewed stories.
Sprint 6 extends this catalog to three fictional stories without adding a service.

Flow: profile → question answers → story run → committed decisions → descriptive
evidence → optional reflection → actions → saved entry → selected sharing fields.
Reflection and actions use containment instead of redundant foreign-key copies.
The current run draft and its saved entry are synchronized on edit.

Sprint 6 additionally stores the published story version on each new run and
saved entry. Other careers' recent drafts reside in `experience.suspendedRuns`,
in the same canonical document. Switching moves the run with its reflection and
actions rather than reusing another career's answers. Deleting an entry removes
any matching suspended run as well; clearing all removes every draft. Old entries
without version metadata keep their saved text and do not receive an invented
historical version. Published versions must remain bundled for active-run resume.

Share selection is ephemeral component state. Experience/evidence default on;
reflection/actions default off. Switching entries resets consent. Changing fields
invalidates the generated final card. No summary is automatically copied or sent.

## Who can access it

There is no account boundary, encryption, remote backup or sync. People using the
same browser profile, scripts on the same origin, sufficiently privileged browser
extensions, and local device administrators may access data. HTTPS does not
encrypt localStorage at rest. Private browsing or browser cleanup may erase it.
Use a dedicated internal demo origin and synthetic data, particularly on shared
devices. Do not place unrelated third-party scripts on this origin.

The production app has no analytics, email, NGO transmission, remote AI, database
or student-data API. Loading the app/assets still contacts its hosting server,
which may keep ordinary access logs; configure and review those separately.
Development Vite HMR traffic is development tooling, not student analytics.

## Migration, recovery and deletion

- Read v3 first. Otherwise migrate v2/v1, preserving usable content and stable IDs.
- Keep old keys until a user explicitly deletes data. Invalid v3 data is backed
  up before normalization; earlier recovery copies are not overwritten.
- Inform the user when recovery or migration occurs. Missing historical choices
  remain explicitly incomplete; never invent them.
- Unknown document versions are not overwritten. Backup/read failures block
  ordinary writes. Storage failure never produces a save-success navigation.
- Deleting one experience removes its canonical record and resets a matching
  active run/draft so it cannot be saved back accidentally. Other readable entries
  remain. Confirmation explains that legacy/recovery copies are also removed;
  these copies can contain data not recoverable into the current model.
- Clearing all removes profile, answers, runs, entries, reflections/actions and
  all `carie_` legacy/recovery keys. A new empty v3 envelope remains as a migration
  barrier so old data cannot be automatically re-imported. Unrelated origin keys
  are not removed.
- A pending cleanup marker survives interruption. If removing old keys fails,
  show that deletion is incomplete, then retry cleanup without resurrecting data.
- Browser deletion cannot erase downloaded JSON, clipboard contents, screenshots,
  OS backups or copies already made elsewhere. Close other Carie tabs before
  clearing; do not assume that process-memory erasure is guaranteed.

## Export and student-controlled disclosure

Export is an explicit local JSON preview and download. It contains the latest
successfully saved document content, including reflections. It does not include
unsaved drafts, recovery blobs, ephemeral consent or transport revision metadata.
Explain that a complete export is private, not a curated mentor summary. No upload
is triggered. An accessible text area provides a fallback. Import is not enabled.

Share Preview independently controls the four categories. Clipboard use occurs
only after pressing Copy. Clearing a toggle removes the prior final card. No
email, messaging, external API or partner dashboard is implemented.

## Reliability limits and future review gates

Revision/raw-document checks reject known stale writers, and storage events update
clean tabs. localStorage has no transaction spanning read/check/write across
processes; this is not a guarantee against exactly simultaneous writes. Keep the
internal demonstration to one editing tab. There is one active run at a time.
The render boundary handles React rendering failures; asynchronous/event errors
need their own explicit handlers (storage and clipboard/download have them).

Before any real-student pilot or cloud connection, complete and document:

1. Institution/NGO authorization, responsible data controller/processor roles,
   age-appropriate notices, retention/deletion policy and lawful processing basis.
2. Qualified Hong Kong privacy/legal review of actual processing and any student/
   guardian consent approach. This document makes no claim of compliance with all
   Hong Kong requirements or of a universally valid minor-consent mechanism.
3. Threat model, access control, secure hosting/headers, dependency review, incident
   handling, device/shared-browser risks, logging minimization and recovery tests.
4. If cloud is proposed: identity and authorization design, encryption/key handling,
   tenant isolation, processor agreements, hosting location/cross-border review,
   consent revocation, verified deletion/retention and operational ownership.
5. Physical mobile-device and accessibility testing; student comprehension tests
   for sharing, export and deletion; approved support and escalation processes.

Cloud, login, remote synchronization and real student enrollment remain disabled.
