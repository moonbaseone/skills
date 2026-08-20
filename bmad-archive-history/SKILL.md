---
name: bmad-archive-history
description: >-
  Archives BMAD planning and implementation artifacts from gitignored
  _bmad-output/ into committed docs/delivery/ at milestone boundaries (epic
  done, pause point, course correction) and for done non-epic change specs
  (bmad-build spec-*.md and bmad-spec folders). CHANGES also archives related
  planning run folders (UX DESIGN.md/EXPERIENCE.md, PRDs, architecture) while
  preserving project-wide files (epics.md, coding-standards, code-reviews).
  Unbuilt spikes stay in gitignored `_bmad-output/planning-artifacts/`;
  shipped spikes copy into `docs/delivery/planning-snapshots/`. Epic/story
  and changes/ content under docs/delivery/. Minimizes git
  merge conflicts via date-prefixed new files and append-only indexes. Use when the
  user asks to archive BMAD history, publish delivery history, archive a done
  change spec, migrate _bmad-output to docs, snapshot sprint status, or
  codify how we got here for other devs and agents.
---

# BMAD archive history (BMAD → docs)

You help the user **publish immutable delivery history** from local BMAD workspace into the **active project root** (not this skills repository unless that is the project open).

This skill targets **BMAD 6.11** artifact shapes. Keep scanning leftover 6.3 flat files so older work still archives.

## Two layers (never mix)

| Layer | Path | Git | Purpose |
|-------|------|-----|---------|
| **Live BMAD workspace** | `_bmad-output/` | **gitignored** | Per-developer active work; BMAD skills read/write here |
| **Published history** | `docs/delivery/` | **committed** | Milestone snapshots; agents and devs read for “how we got here” |
| **Deferred work (shipped)** | `docs/delivery/deferred-work.md` | **committed** | Append-only follow-ups from completed work — see **`references/deferred-work.md`** |
| **Technical decisions** | `docs/adr/` | committed | Durable architecture decisions — use **`log-adr`** skill, not delivery archive |
| **Unbuilt spikes** | `_bmad-output/planning-artifacts/` | **gitignored** | Cross-cutting work with no epic yet — do **not** commit under `docs/` |

**Rule:** Nothing under `docs/delivery/` is BMAD’s live source of truth. Publish **once at milestones** (or when a non-epic change ships); do not sync ongoing edits from `_bmad-output/`.

**After publish:** Detailed **done** story files, **done** change specs (files *and* spec folders), and other copied Tier A/B/Q artifacts must **not** remain in `_bmad-output/` — prune them so history lives only under `docs/delivery/` (see **Prune BMAD duplicates**).

## Live BMAD layout (6.11)

```text
_bmad-output/
  implementation-artifacts/          # bmad-build, sprint-planning, retros
    spec-{slug}.md                   # type + status frontmatter (one-shot / story impl)
    sprint-status.yaml               # living — never commit
    {story-key}.md                   # epic story files
  planning-artifacts/
    epics.md, coding-standards.md,   # KEEP living (never archive/delete)
      code-reviews.md, README.md
    briefs/brief-{project}-{date}/   # bmad-product-brief run folder
    prds/prd-{project}-{date}/       # bmad-prd run folder
    architecture/architecture-…/     # bmad-architecture run folder
    ux-designs/ux-{project}-{date}/  # bmad-ux: DESIGN.md + EXPERIENCE.md + mockups/ + wireframes/
    research/                        # bmad-deep-recon
    sprint-change-proposal-*.md
    spec-*.md, ux-design-specification.md, architecture.md, product-brief-*.md  # leftover 6.3 flats
  specs/spec-{slug}/                 # bmad-spec: SPEC.md + companions + .memlog.md [+ stories.yaml]
  brainstorming/
  forge/                             # bmad-forge-idea
  project-context.md                 # leftover; live deliverable is repo-root AGENTS.md
```

Do **not** treat presence of `SPEC.md` as “done”. Spec folders are living until ship (see **Tier Q**).

## Publish modes

| Mode | When | Scope |
|------|------|--------|
| **MILESTONE** (default) | Epic done, pause point, course correction | Epics, stories, sprint-status snapshot, planning Tier D (including run folders + related spec folders), journal |
| **CHANGES** | Done non-epic work after merge / ship | `changes/` copies + index + **related** planning (UX run folders, etc.); no epic/sprint-status snapshot unless user asks |

Ask which mode if ambiguous. **CHANGES** is the lightweight path — do not require a full epic publish plan.

## Routing

| Content | Destination |
|---------|-------------|
| Has **epic/story ID** (`6-3-…`, `epic-6`, sprint change tied to delivery) | `docs/delivery/epics/` |
| **Done `bmad-build` spec** (`implementation-artifacts/spec-*.md`, `status: done`) | `docs/delivery/changes/` (file) |
| **Done `bmad-spec` folder** (`specs/spec-{slug}/`, ship confirmed) | `docs/delivery/changes/` (folder) |
| **Cross-cutting spike** with no epic yet (feasibility study, unbuilt design) | `_bmad-output/planning-artifacts/` — **not** `docs/` |
| **Shipped spike** (the work landed) | Copy into `docs/delivery/planning-snapshots/` at publish |
| **Technical decision** with alternatives and consequences | `docs/adr/` via **`log-adr`** |
| **Living** `sprint-status.yaml`, `epics.md` in `_bmad-output/` | **Never commit** as updatable files |
| **`AGENTS.md`** (bmad-project-context) | **Never archive** — living repo-root agent instructions |

Do **not** create `docs/spikes/`. Unbuilt work stays gitignored until it ships.

## Target layout (consuming repo)

```text
docs/
  delivery/
    README.md
    index.md                        # epic table — the entry point
    deferred-work.md                # master follow-up list — append on every ship
    .published                      # optional prune ledger
    timeline/
      journal.md                    # append-only milestone log
      YYYY-MM-DD-<label>.yaml       # frozen sprint-status snapshot
    epics/
      epic-NN-<short-slug>/
        summary.md
        stories/
          N-N-story-slug.md         # immutable copies from _bmad-output
        reviews/
          epic-N-code-review.md
    changes/                        # non-epic shipped work
      README.md                     # index table
      YYYY-MM-DD-<type>-<slug>.md
      YYYY-MM-DD-<type>-<slug>/
    course-corrections/
      YYYY-MM-DD-<topic>.md
    retrospectives/
      epic-N-YYYY-MM-DD.md
    planning-snapshots/
      YYYY-MM-DD-<milestone>/
        epics-excerpt.md
        planning/                   # copies from _bmad-output/planning-artifacts/
        specs/
        brainstorming/
    ux-reference/
      *.html
      ux-{project}-{date}/
    deferred/                       # frozen pre-flatten snapshots only — do not append
    seed-provenance/                # gazetteer / CSVs that fed a frozen seed
  adr/
  reference/                        # current product notes — not an archive destination
```

**`changes/` naming (mandatory):**

| Live source | Archive name |
|-------------|--------------|
| `implementation-artifacts/spec-{slug}.md` | `YYYY-MM-DD-<type>-<slug>.md` |
| `specs/spec-{slug}/` | `YYYY-MM-DD-<type>-<slug>/` (copy the **whole folder**) |
| leftover `planning-artifacts/spec-{slug}.md` | same as the `.md` row |

- `<type>` is `feature` \| `bugfix` \| `refactor` \| `chore`
- `<slug>` is the live name without the `spec-` prefix (`spec-gh-76-no-pump-warning-noop.md` or `specs/spec-gh-152-sizing-mode/` → `gh-76-no-pump-warning-noop` / `gh-152-sizing-mode`)
- Date is archive day (or frontmatter `created` if the user prefers — ask once if unclear)

Example: `2026-08-10-bugfix-gh-76-no-pump-warning-noop.md`

**Type resolution:**

1. **`bmad-build` `spec-*.md`:** read frontmatter `type`. **HALT** that item if missing or not one of the four values — do not invent a default.
2. **`bmad-spec` folder:** no `type` on `SPEC.md`. Use the paired `implementation-artifacts/spec-{same-slug}.md` `type` when present. Otherwise **ask once**; do not invent. Other in-scope items may still proceed; only this item waits.

Same slug in both places: archive **both** (implementation file + spec folder); one index row can link both.

Do **not** name this folder after a BMAD skill (e.g. avoid `quick-dev/`, `build/`). `changes/` is delivery vocabulary: work that shipped outside the epic/story tree.

## When to apply this skill

- User says: “publish delivery history”, “archive BMAD”, “migrate _bmad-output to docs”, “snapshot epic N”, “pause point archive”.
- User says: “archive change spec”, “publish done spec”, “archive GH-76 / this bugfix”, or similar after a non-epic ship.
- An **epic is done**, a **pause point** is reached, or a **significant course correction** should be recorded.
- User wants agents to understand delivery context without reading gitignored files.

**Do not apply** for: active story or in-progress spec implementation (stay in `_bmad-output/`), ADR logging (**`log-adr`**), or routine commits of application code. Prefer archiving **CHANGES** after the fix is merged (or the user confirms ship), not mid-branch.

## Conflict-minimization rules (mandatory)

1. **New files at publish time** — no shared mutable `sprint-status.yaml` or `epics.md` in git.
2. **One folder per completed epic** — parallel devs on different epics rarely touch the same path.
3. **Append-only journal** — add entries at the **bottom** of `timeline/journal.md` (milestone mode). For **CHANGES**, default to updating `changes/README.md` only; journal one-liners only if the user asks or at a later pause-point batch. Same rule for **`docs/delivery/deferred-work.md`**: append dated sections at the bottom; never edit older sections.
4. **Date-prefixed filenames** for course corrections, snapshots, and change archives.
5. **Never re-archive in place** — if a copy was wrong, add `…-amended-YYYY-MM-DD.md` (or `…-amended-YYYY-MM-DD/` for a spec folder); do not edit archived copies.
6. Optional: write `docs/delivery/.published` with ISO date + git SHA of the code snapshot.

## Content tiers

### Tier A — always archive (high signal)

| Source in `_bmad-output/` | Destination |
|---------------------------|-------------|
| `implementation-artifacts/sprint-status.yaml` | `timeline/YYYY-MM-DD-<label>.yaml` (snapshot; fix statuses before copy) |
| `planning-artifacts/sprint-change-proposal-*.md` | `course-corrections/YYYY-MM-DD-<topic>.md` |
| `implementation-artifacts/epic-*-retro-*.md` | `retrospectives/` |
| `implementation-artifacts/deferred-work.md` | `docs/delivery/deferred-work.md` (append matching sections — **`references/deferred-work.md`**) |
| `implementation-artifacts/epic_*_CODE_REVIEW.md` | `epics/epic-NN/reviews/` |

### Tier B — per-epic snapshot

- Copy **done** story `*.md` files → `epics/epic-NN-<slug>/stories/`.
- Write **`summary.md`** per epic using **`templates/epic-summary.md`**.

### Tier C — distill, do not copy wholesale

| Source | Action |
|--------|--------|
| `planning-artifacts/epics.md` (living) | Extract FR/NFR + epic overview → `planning-snapshots/…/epics-excerpt.md`; then **trim or replace** live `epics.md` (see **Planning artifacts**) |
| ADR drafts already promoted | Pointer in epic `summary.md` → `docs/adr/NNNN-…`; replace live draft with stub → `docs/adr/` |
| `_bmad-output/project-context.md` | Leftover 6.3 file — **keep** if present; do not duplicate into delivery. Durable agent rules now live in repo-root **`AGENTS.md`** (`bmad-project-context`) — never archive or prune `AGENTS.md`. Merge durable rules into `CLAUDE.md` / ADRs only when the user asks. |

### Tier D — planning snapshot (then prune)

When a **milestone** completes (e.g. Epics 1–6 done), copy then **delete** in-scope planning from `_bmad-output/` so it exists only under `planning-snapshots/`. **Preserve run-folder trees** (do not flatten) so `SPEC.md` `companions:` / `sources:` relative paths stay meaningful inside the snapshot.

| Source | Action |
|--------|--------|
| `planning-artifacts/briefs/brief-*/` | Copy tree → `planning/briefs/…`; prune source |
| `planning-artifacts/prds/prd-*/` | Copy tree → `planning/prds/…`; prune source |
| `planning-artifacts/architecture/architecture-*/` | Copy tree → `planning/architecture/…`; prune source |
| `planning-artifacts/ux-designs/ux-*/` | Copy tree → `ux-reference/` (preferred) or `planning/ux-designs/…`; prune source |
| `planning-artifacts/research/` (in-scope) | Copy → `planning/research/`; prune those reports |
| `_bmad-output/specs/spec-*/` (in-scope, not already in `changes/`) | Copy tree → `planning-snapshots/…/specs/`; prune source |
| `_bmad-output/forge/` (in-scope) | Copy → `planning/forge/`; prune those runs |
| leftover flats: `product-brief-*.md`, `architecture.md`, `ux-design-specification.md` | Copy → `planning/`; prune source |
| `types-object-model.md`, `calculations-persistence-and-services.md` | Copy → `planning/`; prune source |
| `implementation-readiness-report-*.md` | Copy → `planning/`; prune source (readiness now lives in `bmad-sprint-planning`; leftover files still archive) |
| `sprint-change-proposal-*.md` | Already in `course-corrections/`; prune source |
| `*-adr.md` drafts (promoted) | Stub or delete after `docs/adr/` promotion |
| leftover `ux-mockups-*.html`, `ux-*.canvas.tsx` | Copy to `ux-reference/` or `planning/` if agents need them; prune source |
| `_bmad-output/brainstorming/*` (in-scope) | Copy → `planning-snapshots/…/brainstorming/`; prune source |

**Keep in `_bmad-output/planning-artifacts/` after prune** (project-wide, not issue-scoped — **never** archive or delete these in MILESTONE or CHANGES):

| File | Why |
|------|-----|
| `epics.md` | Living backlog for **next** epics — prepend pointer to delivery; optional **ALTER: trim-epics** removes delivered epic bodies from live file |
| `coding-standards.md` | Project-wide coding rules — not tied to one change |
| `code-reviews.md` | Project-wide review conventions — not tied to one change |
| `README.md` | Live folder index |
| other project-wide files | Same test: if it is not about the specific issue/change being published, leave it |
| empty parent dirs (`prds/`, `ux-designs/`, …) | Harmless; leave or recreate as empty |

**Unbuilt spikes stay in `_bmad-output/planning-artifacts/`.** When a spike ships, copy it into `docs/delivery/planning-snapshots/`. Do not create `docs/spikes/`.

### Tier Q — non-epic change specs (CHANGES mode)

Scan **three** live locations every CHANGES run. Planning skills write beside the spec, not only under `implementation-artifacts/`.

| Source in `_bmad-output/` | Destination |
|---------------------------|-------------|
| `implementation-artifacts/spec-*.md` with frontmatter `status: done` | `changes/YYYY-MM-DD-<type>-<slug>.md` |
| `specs/spec-{slug}/` when **ship-confirmed** (below) | `changes/YYYY-MM-DD-<type>-<slug>/` (whole folder) |
| leftover `planning-artifacts/spec-*.md` with `status: done` (if present) | `changes/YYYY-MM-DD-<type>-<slug>.md` |
| **Related** planning (files **or run folders**) | `ux-reference/`, `changes/`, `course-corrections/`, or `planning-snapshots/` per kind |

#### When a spec folder is “done”

`SPEC.md` has **no** `status` field. Include the folder in CHANGES when **any** of:

1. The user names that spec / issue / folder.
2. A paired `implementation-artifacts/spec-{same-slug}.md` has `status: done`.
3. The user confirms the change has shipped / merged.

Do **not** auto-archive every folder under `specs/`.

Do **not** rewrite `SPEC.md`, companions, or `.memlog.md` after copy (`sources:` / `companions:` paths are frozen). Note broken relative paths in the plan / index footnote instead.

#### Related planning files (mandatory scan)

**Preserve** — never copy-and-prune (same list as the MILESTONE keep table): `epics.md`, `coding-standards.md`, `code-reviews.md`, `README.md`, and any other **project-wide** file not tied to this issue/change.

**Related** — archive with this change when any apply:

1. Filename **or folder name** contains the change slug or issue id (`gh-104`, spec slug).
2. The spec’s `context`, `sources:`, `companions:`, or body links to the file/folder.
3. Canonical BMAD planning outputs produced for this ship:
   - **6.11:** `planning-artifacts/ux-designs/ux-*/` (`DESIGN.md`, `EXPERIENCE.md`, `mockups/`, `wireframes/`), adopted companions cited from `SPEC.md`, matching `prds/` / `architecture/` / `briefs/` / `forge/` / `research/` run folders
   - **6.3 leftover:** `ux-design-specification.md`, `ux-design-directions.html`, `ux-mockups-*.html`, `ux-*.canvas.tsx`
4. Same-stem companions of a file/folder already in scope (spec folder + UX run + build spec).

When unsure, list the file **or folder** as a **plan candidate** — do not silently skip. User **ALTER** drops extras.

| Kind | Destination |
|------|-------------|
| `ux-designs/ux-*` run folder | `ux-reference/<folder-basename>/` — copy the tree; do not flatten or rename `DESIGN.md` / `EXPERIENCE.md` |
| leftover generic UX flats (`ux-design-specification.md`, `ux-design-directions.html`) | `ux-reference/` — rename to `ux-design-specification-<slug>.md` / `ux-design-directions-<slug>.html` so the next 6.3-style one-shot can reuse the defaults |
| `sprint-change-proposal-*.md` related to this change | `course-corrections/YYYY-MM-DD-<topic>.md` |
| Other issue-scoped planning docs or small run folders | `changes/` next to the spec (keep basename, or date-prefix on collision) |

**Workflow (CHANGES mode only):**

1. Resolve **project root** and which items are in scope (user list, or all ship-confirmed items not yet archived). Scan `implementation-artifacts/`, `specs/`, and leftover `planning-artifacts/spec-*.md`.
2. For each **`spec-*.md`:** read frontmatter; validate `type` ∈ `{feature, bugfix, refactor, chore}`; derive archive filename.
3. For each **spec folder:** resolve type (paired build spec, else ask); derive archive folder name.
4. List `_bmad-output/planning-artifacts/` (skip the preserve list) **and** `ux-designs/`, `prds/`, `architecture/`, `briefs/`, `research/`, `_bmad-output/forge/`. Mark **related** files/folders per the rules above; include them in the plan.
5. Present the **CHANGES publish plan** (below); **HALT** for APPROVE / ALTER / SKIP.
6. On APPROVE:
   - Ensure `docs/delivery/changes/` exists.
   - Create `changes/README.md` from **`templates/changes-readme.md`** if missing.
   - Copy each build spec body to the typed archive name. Optionally enrich frontmatter with `archived: YYYY-MM-DD`, `issue`, `pr`, `commit` — **do not** rewrite content inside `<frozen-after-approval>`.
   - Copy each spec folder as a tree to the typed archive folder — **do not** rewrite `SPEC.md` / companions / `.memlog.md`.
   - Copy each approved related planning file or run folder to its destination.
   - Append/update a row in `changes/README.md` (date, type, title, links). Mention related UX / spec-folder paths in the row or a footnote when present.
   - Journal: **skip** unless user requested a one-liner.
   - Deferred work: follow **`references/deferred-work.md`** (append matching live sections to `docs/delivery/deferred-work.md`, then prune those sections from the scratchpad).
7. Prune copied `spec-*.md` from `implementation-artifacts/` (and leftover planning flats), copied `specs/spec-*/` folders, **and** copied related files/folders from `planning-artifacts/` / `forge/` unless **KEEP_BMAD**. Never prune the preserve list.
8. Record pruned paths on `docs/delivery/.published` when that file exists.

**Do not** run full Tier D planning prune or rewrite `sprint-status.yaml` in CHANGES mode unless the user explicitly expands scope to a milestone publish. Related planning above is **not** Tier D — it ships with the change.

### UX / HTML mockups

Copy referenced mockups (`ux-designs/…/mockups/`, leftover `*.html`) to `ux-reference/` when agents need them for context; skip unused `.working/` drafts.

## Review dialog (mandatory before writing)

### MILESTONE mode

Present a **publish plan**, then **stop and wait** for user input.

```
════════════════════════════════════════════════════════════
DELIVERY PUBLISH — Plan (MILESTONE)
════════════════════════════════════════════════════════════
Milestone:      [e.g. Epic 6 complete / pause point]
Snapshot date:  YYYY-MM-DD
Source:         _bmad-output/ (local, gitignored)

Will create/update:
  - docs/delivery/timeline/journal.md [append]
  - docs/delivery/timeline/[date]-[label].yaml
  - docs/delivery/epics/epic-[NN]/… ([N] stories, [N] summaries)
  - [list course-corrections, retros, ux run folders]
  - [optional] changes/ rows if bundling done specs / spec folders into this milestone
  - docs/delivery/deferred-work.md [append matching live sections | none]

Will snapshot + prune from _bmad-output/planning-artifacts/ (Tier D; reply KEEP_BMAD to skip):
  - briefs/, prds/, architecture/, ux-designs/ run folders (preserve tree) → planning/ or ux-reference/
  - leftover flats: product-brief, architecture.md, ux-design-specification, types-object-model,
    calculations-persistence-and-services, implementation-readiness-report → planning/
  - sprint-change-proposal-*, promoted *-adr.md drafts
  - _bmad-output/brainstorming/* when in-scope → planning-snapshots/…/brainstorming/
  - in-scope _bmad-output/specs/spec-*/ → planning-snapshots/…/specs/

Will prune from _bmad-output/implementation-artifacts/:
  - {story-key}.md, epic_*_CODE_REVIEW.md, epic-*-retro-*.md, *.html mockups (after delivery copy)
  - [optional] spec-*.md copied into changes/

Will keep in _bmad-output (living BMAD only):
  - implementation-artifacts/sprint-status.yaml, deferred-work.md (unmatched / still-open sections only)
  - planning-artifacts/epics.md, coding-standards.md, code-reviews.md, README.md
    (and any other project-wide, not-issue-scoped file)
  - project-context.md if present (leftover; AGENTS.md at repo root is never archived)

Will NOT commit:
  - Living sprint-status.yaml or epics.md as updatable paths
  - _bmad-output/ contents (stays gitignored)
  - AGENTS.md

Reply with one of:
  APPROVE      — Execute the plan
  ALTER        — Revise plan from my feedback; re-show until satisfied
  SKIP         — Do not write files
  PREVIEW      — Show epic summary draft for one epic before full run

════════════════════════════════════════════════════════════
```

### CHANGES mode

```
════════════════════════════════════════════════════════════
DELIVERY PUBLISH — Plan (CHANGES)
════════════════════════════════════════════════════════════
Snapshot date:  YYYY-MM-DD
Source:         _bmad-output/implementation-artifacts/ + specs/ + planning-artifacts/

Build specs to archive:
  - spec-[slug].md → changes/YYYY-MM-DD-[type]-[slug].md
    title: […]
    type:  [feature|bugfix|refactor|chore]
    issue/PR/commit: [if known]

Spec folders to archive (ship-confirmed; whole tree):
  - specs/spec-[slug]/ → changes/YYYY-MM-DD-[type]-[slug]/
    type from: [paired build spec | user]
    [or "none"]

Related planning (not coding-standards / code-reviews / epics.md / README.md):
  - planning-artifacts/ux-designs/ux-[…]/ → ux-reference/ux-[…]/
  - [other related files/folders or "none"]

Will create/update:
  - docs/delivery/changes/README.md
  - docs/delivery/changes/[dated-typed files and/or folders]
  - docs/delivery/ux-reference/[related UX] (when present)
  - journal: [skip | one-line — default skip]
  - docs/delivery/deferred-work.md: [append listed sections | none]

Will prune from _bmad-output/implementation-artifacts/:
  - matching spec-*.md (after delivery copy)

Will prune from _bmad-output/specs/:
  - matching spec-{slug}/ folders (after delivery copy)

Will prune from _bmad-output/planning-artifacts/:
  - related files/folders listed above (after delivery copy)

Will keep in planning-artifacts/:
  - epics.md, coding-standards.md, code-reviews.md, README.md
  - any other project-wide (not issue-scoped) file

Will NOT:
  - Run full Tier D prune, rewrite sprint-status.yaml, or snapshot epics/
  - Archive or delete project-wide living planning files
  - Rewrite SPEC.md / companions / .memlog.md
  - Commit living BMAD paths or AGENTS.md

Reply with one of:
  APPROVE      — Execute the plan
  ALTER        — Revise plan from my feedback; re-show until satisfied
  SKIP         — Do not write files
  KEEP_BMAD    — Archive to docs/delivery but leave live copies in _bmad-output/

════════════════════════════════════════════════════════════
```

On **APPROVE**, execute the matching checklist below.

## Publish workflow (MILESTONE)

### 1. Resolve context

- Confirm **project root** (workspace with `docs/` and `_bmad-output/`).
- Confirm **milestone label**.
- Read `_bmad-output/implementation-artifacts/sprint-status.yaml` and relevant story files.
- List epics/stories marked **done** for this publish scope.
- List in-scope `specs/spec-*/` and planning run folders.

### 2. Ensure delivery skeleton

Create if missing:

- `docs/delivery/README.md` — use **`templates/delivery-readme.md`**
- `docs/delivery/index.md` — epic table + links to ADRs

### 3. Per epic in scope

For each completed epic `N`:

1. Create `epics/epic-0N-<short-slug>/`.
2. Copy done story files from `_bmad-output/implementation-artifacts/` → `stories/`.
3. Write `summary.md` from template (outcome, FRs, ADR links, story index, key pivots).
4. Copy epic-level code review if present → `reviews/`.

### 4. Timeline and snapshots

1. Copy `sprint-status.yaml` → `timeline/YYYY-MM-DD-<label>.yaml`; set epic statuses accurately (e.g. `epic-6: done`).
2. Append **`templates/journal-entry.md`** block to `timeline/journal.md`.

### 5. Tier A artifacts

Copy retros, course corrections (rename with date prefix), ux-reference as listed in the plan. Deferred work: **`references/deferred-work.md`**.

### 6. Planning snapshot (excerpt + full planning copies)

1. Write `planning-snapshots/YYYY-MM-DD-<milestone>/epics-excerpt.md` from live `epics.md` — FR inventory and epic overviews for **published epics only** (not the full living file).
2. Create `planning-snapshots/YYYY-MM-DD-<milestone>/planning/README.md` — table of files **and folders** copied in this step with one-line purpose each.
3. **Copy** every **Tier D** item present (run-folder trees preserved; leftover flats by filename) into `planning/` or `ux-reference/` / `specs/` as the table specifies.
4. Copy related `_bmad-output/brainstorming/*` into `planning-snapshots/…/brainstorming/` when present.

### 7. Update indexes

- **`docs/delivery/index.md`** — add/update the epic row (status, date, link to `summary.md`).
- **`docs/index.md`** — add **Delivery history** section if missing:

```markdown
## Delivery history (how we got here)

- [Delivery index](./delivery/index.md) — epic table, FR map
- [Changes](./delivery/changes/)
- [Architecture Decision Records](./adr/index.md)
```

### 8. Verify

- [ ] No living BMAD paths committed under `docs/delivery/`.
- [ ] Archived story paths match sprint-status keys.
- [ ] Epic summaries link to existing ADRs (relative paths).
- [ ] No `docs/spikes/` created; unbuilt spikes stay in `_bmad-output/`.
- [ ] Spec folders copied as trees (SPEC.md + companions + .memlog.md).
- [ ] User **APPROVE** received (and did not request **KEEP_BMAD**).

### 9. Prune BMAD duplicates (mandatory unless KEEP_BMAD)

**Goal:** One canonical copy of immutable history — in `docs/delivery/`. `_bmad-output/` holds **living** sprint state and **forward-looking** planning only.

#### 9a. `implementation-artifacts/`

1. **Delete** each file copied in steps 3–5 (stories, reviews, retros, html mockups) and any Tier Q specs bundled into this milestone.
2. Update live `sprint-status.yaml`: published epics → `done`; optional removal of per-story keys for pruned stories.
3. Write `_bmad-output/implementation-artifacts/README.md` pointing to `docs/delivery/` (stories, reviews, changes, deferred-work.md).

#### 9b. `planning-artifacts/` (Tier D) and `specs/`

1. **Delete** every Tier D source file **or run folder** after its copy exists under `planning-snapshots/…/planning/`, `ux-reference/`, or `planning-snapshots/…/specs/`.
2. Replace promoted `*-adr.md` with a **stub** linking to `docs/adr/NNNN-…` (or delete if stub already exists).
3. Prepend live `epics.md` with a pointer block (do not delete `epics.md`):

```markdown
<!-- Living backlog only. Published history: docs/delivery/ -->
> **Published history:** [delivery index](../../../docs/delivery/index.md) · [planning snapshot](../../../docs/delivery/planning-snapshots/YYYY-MM-DD-<milestone>/)
```

4. If user requested **ALTER: trim-epics**, remove delivered epic sections from live `epics.md`, keeping backlog / future epics only.
5. Write `_bmad-output/planning-artifacts/README.md`:

```markdown
# BMAD planning artifacts (live)

Planning history for completed milestones is under **docs/delivery/planning-snapshots/**.

This folder keeps:

- **epics.md** — next-epic backlog
- **coding-standards.md** — project-wide (not archived)
- **code-reviews.md** — project-wide (not archived)

Re-run planning workflows (`bmad-create-epics-and-stories`, `bmad-prd`, `bmad-ux`, `bmad-architecture`) when starting a new program slice.
```

6. Prune `_bmad-output/brainstorming/` copies that were snapshotted.

#### 9c. Record and route

1. Append all deleted paths to `docs/delivery/.published` under `pruned_from_bmad_output:`.
2. **Stories / one-shots:** `bmad-build` → `docs/delivery/.../stories/` or `changes/` after archive. (`bmad-create-story` / `bmad-dev-story` are 6.11 shims; same destinations.)
3. **Non-epic change specs:** load from `docs/delivery/.../changes/` after archive (`.md` files **and** spec folders).
4. **Planning:** `bmad-create-epics-and-stories`, `bmad-sprint-planning` (readiness gate), `bmad-prd`, `bmad-ux`, `bmad-architecture` → `planning-snapshots/…/planning/` for prior published planning context, not `_bmad-output/planning-artifacts/`.
5. **Spec kernels:** `bmad-spec` / `bmad-build` load archived folders from `docs/delivery/.../changes/` or `planning-snapshots/…/specs/`, not live `_bmad-output/specs/` after prune.

**Do not prune:** `project-context.md`, `AGENTS.md`, `sprint-status.yaml`, in-progress story/spec files or spec folders outside scope, unbuilt spikes still in `_bmad-output/planning-artifacts/`, or project-wide living planning files (`epics.md`, `coding-standards.md`, `code-reviews.md`, `README.md`).

## After writing

### MILESTONE

```
✅ Delivery history published (MILESTONE)
   Destination: docs/delivery/
   Snapshot:   timeline/YYYY-MM-DD-[label].yaml
   Epics:      [list]
   Changes:    [N specs / spec folders → changes/] or none
   Updated:    docs/delivery/index.md, docs/index.md
   Pruned:     [N] files/folders from _bmad-output/ (or "skipped — KEEP_BMAD")
```

### CHANGES

```
✅ Delivery history published (CHANGES)
   Destination: docs/delivery/changes/
   Specs:      [list of YYYY-MM-DD-<type>-<slug>.md and/or folders]
   Related:    [ux-reference/… and other planning copies, or none]
   Index:      changes/README.md
   Pruned:     [N] files/folders from _bmad-output/ (or "skipped — KEEP_BMAD")
   Preserved:  planning-artifacts/epics.md, coding-standards.md, code-reviews.md
```

Remind: `_bmad-output/` remains gitignored — now trimmed to **living** artifacts; immutable history is in `docs/delivery/`.

## Agent routing (for readers)

When answering “how did we get here?” or planning adjacent work:

1. Start at **`docs/delivery/index.md`**
2. Read epic **`summary.md`** under `docs/delivery/epics/`
3. Drill into **`stories/`** only when detail needed
4. Check **`docs/delivery/changes/README.md`** for non-epic bugfixes and small features (type is in the filename **or folder name**; spec folders contain `SPEC.md`)
5. Cross-check **`docs/adr/`** for technical decisions
6. Open **`docs/delivery/deferred-work.md`** for shipped follow-ups (not the live scratchpad)
7. Planning snapshots: **`docs/delivery/planning-snapshots/`**
8. Unbuilt spikes: **`_bmad-output/planning-artifacts/`**. Shipped spikes: **`docs/delivery/planning-snapshots/`**.

When **`bmad-build`** needs prior story context for a **done** story, load from **`docs/delivery/.../stories/`**, not `_bmad-output/implementation-artifacts/`.

When prior **non-epic** ship context is needed, load from **`docs/delivery/.../changes/`**, not live `spec-*.md` or `specs/spec-*/` under `_bmad-output/`.

When planning skills need prior **product/architecture/UX** context for a **closed epic arc**, load from **`docs/delivery/.../planning-snapshots/…/planning/`** (and `ux-reference/`), not `_bmad-output/planning-artifacts/`.

## What this skill does not do

- Replace **`log-adr`** — promote technical decisions to ADRs separately.
- Modify `.gitignore` for `_bmad-output/` (stays ignored).
- Archive or edit **`AGENTS.md`**.
- Run full test suites — optional sanity check only.
- Sync ongoing BMAD edits into git — publish is **milestone- or ship-based**, not continuous.
- Auto-archive mid-branch — prefer after merge / explicit ship confirmation for CHANGES mode.
- Auto-archive every `_bmad-output/specs/` folder just because `SPEC.md` exists.

## Templates

- Epic summary: **`templates/epic-summary.md`**
- Delivery root README: **`templates/delivery-readme.md`**
- Journal entry: **`templates/journal-entry.md`**
- Changes index: **`templates/changes-readme.md`**
- Deferred master intro: **`templates/deferred-work-readme.md`**
- Deferred section: **`templates/deferred-section.md`**
- Deferred publish rules: **`references/deferred-work.md`**
