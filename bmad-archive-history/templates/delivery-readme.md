# Delivery history

Published **milestone snapshots** of BMAD planning and implementation work. Answers: *how did we get here?*

## Live vs archived

| | Path | Git |
|---|------|-----|
| **Active BMAD workspace** | `_bmad-output/` | gitignored — per developer |
| **Published history** | `docs/delivery/` | committed — immutable at publish time |
| **Technical decisions** | `docs/adr/` | committed |
| **Current product notes** | `docs/reference/` | committed — maintained |
| **Unbuilt spikes** | `_bmad-output/planning-artifacts/` | gitignored until the work ships |

Do **not** expect `sprint-status.yaml` or living `epics.md` in git. Snapshots live under [`timeline/`](./timeline/).

See [`index.md`](./index.md) for the epic list.

## Publishing

Use the **`bmad-archive-history`** skill:

- **MILESTONE** — pause points or when an epic completes (epics, sprint-status snapshot, planning).
- **CHANGES** — after a non-epic bugfix/feature/refactor/chore ships (`spec-*.md` and/or `specs/spec-{slug}/` → `docs/delivery/changes/`).

After publish, prunes duplicate artifacts from `_bmad-output/` (stories, change specs and spec folders, retros/reviews, course-correction sources, promoted ADR drafts, UX run folders in `ux-reference/`).

Rules: new files only, date-prefixed course corrections and change archives (`YYYY-MM-DD-<type>-<slug>.md` or a same-named folder for a spec kernel), append-only journal for milestones, never edit archived copies in place.
