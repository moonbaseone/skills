# Delivery history

Published **milestone snapshots** of BMAD planning and implementation work. Answers: *how did we get here?*

## Live vs archived

| | Path | Git |
|---|------|-----|
| **Active BMAD workspace** | `_bmad-output/` | gitignored — per developer |
| **Published history** | `docs/delivery/` | committed — immutable at publish time |
| **Technical decisions** | `docs/adr/` | committed |
| **Pre-epic spikes (Option B)** | `docs/planning-artifacts/` | committed — no epic/story IDs yet |

Do **not** expect `sprint-status.yaml` or living `epics.md` in git. Snapshots live under each workstream’s `timeline/`.

## Workstreams

Product-area folders under [`workstreams/`](./workstreams/). Each developer publishes their stream at epic boundaries without editing others’ folders.

See [`index.md`](./index.md) for the master list.

## Publishing

Use the **`bmad-archive-history`** skill at pause points or when an epic completes. After publish, prunes duplicate artifacts from `_bmad-output/` (stories, copied retros/reviews, course-correction sources, promoted ADR drafts, UX HTML in `ux-reference/`).

Rules: new files only, date-prefixed course corrections, append-only journal, never edit archived story copies in place.
