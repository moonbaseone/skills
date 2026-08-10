---
name: bmad-archive-history
description: >-
  Archives BMAD planning and implementation artifacts from gitignored
  _bmad-output/ into committed docs/delivery/ at milestone boundaries (epic
  done, pause point, course correction) and for done non-epic change specs
  (bugfix/feature/refactor/chore). Uses Option B — docs/planning-artifacts/
  for cross-cutting pre-epic spikes only; epic/story and changes/ content under
  docs/delivery/. Minimizes git merge conflicts via workstream folders and
  immutable snapshots. Use when the user asks to archive BMAD history,
  publish delivery history, archive a done change spec, migrate _bmad-output
  to docs, snapshot sprint status, or codify how we got here for other
  devs and agents.
---

# BMAD archive history (BMAD → docs)

You help the user **publish immutable delivery history** from local BMAD workspace into the **active project root** (not this skills repository unless that is the project open).

## Two layers (never mix)

| Layer | Path | Git | Purpose |
|-------|------|-----|---------|
| **Live BMAD workspace** | `_bmad-output/` | **gitignored** | Per-developer active work; BMAD skills read/write here |
| **Published history** | `docs/delivery/` | **committed** | Milestone snapshots; agents and devs read for “how we got here” |
| **Technical decisions** | `docs/adr/` | committed | Durable architecture decisions — use **`log-adr`** skill, not delivery archive |
| **Pre-epic spikes** | `docs/planning-artifacts/` | committed | **Option B** — cross-cutting spikes only (see **Routing** below) |

**Rule:** Nothing under `docs/delivery/` is BMAD’s live source of truth. Publish **once at milestones** (or when a non-epic change ships); do not sync ongoing edits from `_bmad-output/`.

**After publish:** Detailed **done** story files, **done** change specs, and other copied Tier A/B/Q artifacts must **not** remain in `_bmad-output/` — prune them so history lives only under `docs/delivery/` (see **Prune BMAD duplicates**).

## Publish modes

| Mode | When | Scope |
|------|------|--------|
| **MILESTONE** (default) | Epic done, pause point, course correction | Epics, stories, sprint-status snapshot, planning Tier D, journal |
| **CHANGES** | Done non-epic specs (`spec-*.md` with `status: done`) after merge / ship | `changes/` copies + index; no epic/sprint-status snapshot unless user asks |

Ask which mode if ambiguous. **CHANGES** is the lightweight path — do not require a full epic publish plan.

## Routing (Option B)

| Content | Destination |
|---------|-------------|
| Has **epic/story ID** (`6-3-…`, `epic-6`, sprint change tied to delivery) | `docs/delivery/workstreams/<workstream>/…` (usually `epics/`) |
| **Done non-epic change spec** (`spec-*.md`, `status: done`) | `docs/delivery/workstreams/<workstream>/changes/` |
| **Cross-cutting spike** with no epic yet (HTTP client draft, feasibility study) | `docs/planning-artifacts/` |
| **Technical decision** with alternatives and consequences | `docs/adr/` via **`log-adr`** |
| **Living** `sprint-status.yaml`, `epics.md` in `_bmad-output/` | **Never commit** as updatable files |

When a spike graduates into epics, **copy** (do not move) relevant planning text into the workstream’s `planning-snapshots/` at publish time; leave or trim the spike doc in `docs/planning-artifacts/` with a pointer to delivery history.

## Target layout (consuming repo)

```text
docs/
  delivery/
    README.md
    index.md
    workstreams/
      <workstream-slug>/          # product area, e.g. regulations-admin
        README.md
        timeline/
          journal.md                # append-only milestone log
          YYYY-MM-DD-<label>.yaml   # frozen sprint-status snapshot
        epics/
          epic-NN-<short-slug>/
            summary.md
            stories/
              N-N-story-slug.md     # immutable copies from _bmad-output
            reviews/
              epic-N-code-review.md
        changes/                    # non-epic shipped work (bugfix, feature, …)
          README.md                 # index table
          YYYY-MM-DD-<type>-<slug>.md
        course-corrections/
          YYYY-MM-DD-<topic>.md
        retrospectives/
          epic-N-YYYY-MM-DD.md
        planning-snapshots/
          YYYY-MM-DD-<milestone>/
            epics-excerpt.md
            planning/
              README.md
              …
            brainstorming/
        ux-reference/
          *.html
        deferred/
          deferred-work.md
  planning-artifacts/               # Option B: pre-epic spikes only
  adr/
```

**Workstream slug:** lowercase kebab-case from **product area** (e.g. `regulations-admin`, `pool-designer`), not developer name.

**`changes/` naming (mandatory):** archived filename is `YYYY-MM-DD-<type>-<slug>.md` where:

- `<type>` is the spec frontmatter `type` exactly: `feature` \| `bugfix` \| `refactor` \| `chore`
- `<slug>` is the live filename without the `spec-` prefix (e.g. `spec-gh-76-no-pump-warning-noop.md` → slug `gh-76-no-pump-warning-noop`)
- Date is archive day (or frontmatter `created` if the user prefers — ask once if unclear)

Example: `2026-08-10-bugfix-gh-76-no-pump-warning-noop.md`

**HALT** if `type` is missing or not one of the four allowed values — do not invent a default.

Do **not** name this folder after a BMAD skill (e.g. avoid `quick-dev/`). `changes/` is delivery vocabulary: work that shipped outside the epic/story tree.

## When to apply this skill

- User says: “publish delivery history”, “archive BMAD”, “migrate _bmad-output to docs”, “snapshot epic N”, “pause point archive”.
- User says: “archive change spec”, “publish done spec”, “archive GH-76 / this bugfix”, or similar after a non-epic ship.
- An **epic is done**, a **pause point** is reached, or a **significant course correction** should be recorded.
- User wants agents to understand delivery context without reading gitignored files.

**Do not apply** for: active story or in-progress spec implementation (stay in `_bmad-output/`), ADR logging (**`log-adr`**), or routine commits of application code. Prefer archiving **CHANGES** after the fix is merged (or the user confirms ship), not mid-branch.

## Conflict-minimization rules (mandatory)

1. **New files at publish time** — no shared mutable `sprint-status.yaml` or `epics.md` in git.
2. **One folder per completed epic** — parallel devs on different epics rarely touch the same path.
3. **Separate workstream folders** — each dev publishes under their product workstream at **their** milestones.
4. **Append-only journal** — add entries at the **bottom** of `timeline/journal.md` (milestone mode). For **CHANGES**, default to updating `changes/README.md` only; journal one-liners only if the user asks or at a later pause-point batch.
5. **Date-prefixed filenames** for course corrections, snapshots, and change archives.
6. **Never re-archive in place** — if a copy was wrong, add `…-amended-YYYY-MM-DD.md`; do not edit archived copies.
7. Optional: write `.published` in the workstream with ISO date + git SHA of the code snapshot.

## Content tiers

### Tier A — always archive (high signal)

| Source in `_bmad-output/` | Destination |
|---------------------------|-------------|
| `implementation-artifacts/sprint-status.yaml` | `timeline/YYYY-MM-DD-<label>.yaml` (snapshot; fix statuses before copy) |
| `planning-artifacts/sprint-change-proposal-*.md` | `course-corrections/YYYY-MM-DD-<topic>.md` |
| `implementation-artifacts/epic-*-retro-*.md` | `retrospectives/` |
| `implementation-artifacts/deferred-work.md` | `deferred/` (append dated sections) |
| `implementation-artifacts/epic_*_CODE_REVIEW.md` | `epics/epic-NN/reviews/` |

### Tier B — per-epic snapshot

- Copy **done** story `*.md` files → `epics/epic-NN-<slug>/stories/`.
- Write **`summary.md`** per epic using **`templates/epic-summary.md`**.

### Tier C — distill, do not copy wholesale

| Source | Action |
|--------|--------|
| `planning-artifacts/epics.md` (living) | Extract FR/NFR + epic overview → `planning-snapshots/…/epics-excerpt.md`; then **trim or replace** live `epics.md` (see **Planning artifacts**) |
| ADR drafts already promoted | Pointer in epic `summary.md` → `docs/adr/NNNN-…`; replace live draft with stub → `docs/adr/` |
| `project-context.md` | Merge durable rules into `CLAUDE.md` / ADRs; do not duplicate; **keep** live copy at `_bmad-output/project-context.md` |

### Tier D — planning-artifacts snapshot (then prune)

When a **workstream milestone** completes (e.g. Epics 1–6 done), copy then **delete** workstream-scoped planning files from `_bmad-output/planning-artifacts/` so they exist only under `planning-snapshots/…/planning/`.

| Source in `_bmad-output/planning-artifacts/` | Action |
|---------------------------------------------|--------|
| `product-brief-*.md` | Copy → `planning/`; prune source |
| `architecture.md` | Copy → `planning/`; prune source |
| `ux-design-specification.md` | Copy → `planning/`; prune source |
| `types-object-model.md` | Copy → `planning/`; prune source |
| `calculations-persistence-and-services.md` | Copy → `planning/`; prune source |
| `implementation-readiness-report-*.md` | Copy → `planning/`; prune source |
| `sprint-change-proposal-*.md` | Already in `course-corrections/`; prune source |
| `*-adr.md` drafts (promoted) | Stub or delete after `docs/adr/` promotion |
| `ux-mockups-*.html`, `ux-*.canvas.tsx` | Copy to `ux-reference/` or `planning/` if agents need them; prune source |
| `_bmad-output/brainstorming/*` (workstream-tied) | Copy → `planning-snapshots/…/brainstorming/`; prune source |

**Keep in `_bmad-output/planning-artifacts/` after prune:**

| File | Why |
|------|-----|
| `epics.md` | Living backlog for **next** epics — prepend pointer to delivery; optional **ALTER: trim-epics** removes delivered epic bodies from live file |
| (none of the Tier D files above) | History is in `docs/delivery/…/planning-snapshots/` |

**Do not confuse with `docs/planning-artifacts/` (Option B):** repo-committed **pre-epic spikes** with no story IDs stay there; workstream planning that went through BMAD lives under **delivery** `planning-snapshots/`, not `docs/planning-artifacts/`.

### Tier Q — non-epic change specs (CHANGES mode)

| Source in `_bmad-output/` | Destination |
|---------------------------|-------------|
| `implementation-artifacts/spec-*.md` with frontmatter `status: done` | `changes/YYYY-MM-DD-<type>-<slug>.md` |

**Workflow (CHANGES mode only):**

1. Resolve **project root**, **workstream slug**, and which done `spec-*.md` files are in scope (user list, or all `status: done` not yet archived).
2. For each spec: read frontmatter; validate `type` ∈ `{feature, bugfix, refactor, chore}`; derive archive filename.
3. Present the **CHANGES publish plan** (below); **HALT** for APPROVE / ALTER / SKIP.
4. On APPROVE:
   - Ensure `docs/delivery/workstreams/<slug>/changes/` exists.
   - Create `changes/README.md` from **`templates/changes-readme.md`** if missing.
   - Copy each spec body to the typed archive name. Optionally enrich frontmatter with `archived: YYYY-MM-DD`, `issue`, `pr`, `commit` — **do not** rewrite content inside `<frozen-after-approval>`.
   - Append/update a row in `changes/README.md` (date, type, title, links).
   - Journal: **skip** unless user requested a one-liner.
5. Prune copied `spec-*.md` from `_bmad-output/implementation-artifacts/` unless **KEEP_BMAD**.
6. Record pruned paths on workstream `.published` when that file exists.

**Do not** run Tier D planning prune or rewrite `sprint-status.yaml` in CHANGES mode unless the user explicitly expands scope to a milestone publish.

### UX / HTML mockups

Copy referenced mockups to `ux-reference/` when agents need them for context; skip unused drafts.

## Review dialog (mandatory before writing)

### MILESTONE mode

Present a **publish plan**, then **stop and wait** for user input.

```
════════════════════════════════════════════════════════════
DELIVERY PUBLISH — Plan (MILESTONE)
════════════════════════════════════════════════════════════
Workstream:     [slug]
Milestone:      [e.g. Epic 6 complete / pause point]
Snapshot date:  YYYY-MM-DD
Source:         _bmad-output/ (local, gitignored)

Will create/update:
  - docs/delivery/workstreams/[slug]/README.md [create|update]
  - docs/delivery/workstreams/[slug]/timeline/journal.md [append]
  - docs/delivery/workstreams/[slug]/timeline/[date]-[label].yaml
  - docs/delivery/workstreams/[slug]/epics/epic-[NN]/… ([N] stories, [N] summaries)
  - [list course-corrections, retros, ux files]
  - [optional] changes/ rows if bundling done specs into this milestone

Will snapshot + prune from _bmad-output/planning-artifacts/ (Tier D; reply KEEP_BMAD to skip):
  - product-brief, architecture, ux-design-specification, types-object-model,
    calculations-persistence-and-services, implementation-readiness-report → planning-snapshots/…/planning/
  - sprint-change-proposal-*, promoted *-adr.md drafts, UX html/canvas (after ux-reference/ copy)
  - _bmad-output/brainstorming/* when workstream-scoped → planning-snapshots/…/brainstorming/

Will prune from _bmad-output/implementation-artifacts/:
  - {story-key}.md, epic_*_CODE_REVIEW.md, epic-*-retro-*.md, *.html mockups (after delivery copy)
  - [optional] spec-*.md copied into changes/

Will keep in _bmad-output (living BMAD only):
  - implementation-artifacts/sprint-status.yaml, deferred-work.md (new deferrals only)
  - planning-artifacts/epics.md (trimmed or pointer-only header toward delivery)
  - project-context.md (repo root of _bmad-output)

Will NOT commit:
  - Living sprint-status.yaml or epics.md as updatable paths
  - _bmad-output/ contents (stays gitignored)

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
Workstream:     [slug]
Snapshot date:  YYYY-MM-DD
Source:         _bmad-output/implementation-artifacts/

Specs to archive:
  - spec-[slug].md → changes/YYYY-MM-DD-[type]-[slug].md
    title: […]
    type:  [feature|bugfix|refactor|chore]
    issue/PR/commit: [if known]

Will create/update:
  - docs/delivery/workstreams/[slug]/changes/README.md
  - docs/delivery/workstreams/[slug]/changes/[dated-typed files]
  - journal: [skip | one-line — default skip]

Will prune from _bmad-output/implementation-artifacts/:
  - matching spec-*.md (after delivery copy)

Will NOT:
  - Touch epics/, sprint-status snapshots, or planning Tier D
  - Commit living BMAD paths

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
- Confirm **workstream slug** and **milestone label**.
- Read `_bmad-output/implementation-artifacts/sprint-status.yaml` and relevant story files.
- List epics/stories marked **done** for this publish scope.

### 2. Ensure delivery skeleton

Create if missing:

- `docs/delivery/README.md` — use **`templates/delivery-readme.md`**
- `docs/delivery/index.md` — workstream table + links to ADRs
- `docs/delivery/workstreams/<slug>/README.md` — use **`templates/workstream-readme.md`**

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

Copy retros, course corrections (rename with date prefix), deferred-work, ux-reference as listed in the plan.

### 6. Planning snapshot (excerpt + full planning copies)

1. Write `planning-snapshots/YYYY-MM-DD-<milestone>/epics-excerpt.md` from live `epics.md` — FR inventory and epic overviews for **published epics only** (not the full living file).
2. Create `planning-snapshots/YYYY-MM-DD-<milestone>/planning/README.md` — table of files copied in this step with one-line purpose each.
3. **Copy** (preserve filenames) every **Tier D** file present under `_bmad-output/planning-artifacts/` into `planning/`.
4. Copy workstream-related `_bmad-output/brainstorming/*` into `planning-snapshots/…/brainstorming/` when present.

### 7. Update indexes

- **`docs/delivery/index.md`** — add/update workstream row (scope, status, date range, link).
- **`docs/index.md`** — add **Delivery history** section if missing:

```markdown
## Delivery history (how we got here)

- [Delivery index](./delivery/index.md) — epic timeline, workstreams, FR map
- [Regulations admin (Epics 1–6)](./delivery/workstreams/regulations-admin/README.md)  <!-- example -->
- [Architecture Decision Records](./adr/index.md)
```

### 8. Verify

- [ ] No living BMAD paths committed under `docs/delivery/`.
- [ ] Archived story paths match sprint-status keys.
- [ ] Epic summaries link to existing ADRs (relative paths).
- [ ] `docs/planning-artifacts/` unchanged unless moving a graduated spike (Option B).
- [ ] User **APPROVE** received (and did not request **KEEP_BMAD**).

### 9. Prune BMAD duplicates (mandatory unless KEEP_BMAD)

**Goal:** One canonical copy of immutable history — in `docs/delivery/`. `_bmad-output/` holds **living** sprint state and **forward-looking** planning only.

#### 9a. `implementation-artifacts/`

1. **Delete** each file copied in steps 3–5 (stories, reviews, retros, html mockups) and any Tier Q specs bundled into this milestone.
2. Update live `sprint-status.yaml`: published epics → `done`; optional removal of per-story keys for pruned stories.
3. Write `_bmad-output/implementation-artifacts/README.md` pointing to `docs/delivery/workstreams/<slug>/` (stories, reviews, changes, deferred snapshot).

#### 9b. `planning-artifacts/` (Tier D)

1. **Delete** every Tier D source file after its copy exists under `planning-snapshots/…/planning/` or `ux-reference/`.
2. Replace promoted `*-adr.md` with a **stub** linking to `docs/adr/NNNN-…` (or delete if stub already exists).
3. Prepend live `epics.md` with a pointer block (do not delete `epics.md`):

```markdown
<!-- Living backlog only. Epics 1–N history: docs/delivery/workstreams/<slug>/ -->
> **Published history:** [delivery workstream](../../../docs/delivery/workstreams/<slug>/README.md) · [planning snapshot](./../../docs/delivery/workstreams/<slug>/planning-snapshots/YYYY-MM-DD-<milestone>/)
```

4. If user requested **ALTER: trim-epics**, remove delivered epic sections from live `epics.md`, keeping backlog / future epics only.
5. Write `_bmad-output/planning-artifacts/README.md`:

```markdown
# BMAD planning artifacts (live)

Workstream planning history for completed milestones is under **docs/delivery/workstreams/<slug>/planning-snapshots/**.

This folder keeps **epics.md** (next-epic backlog). Re-run planning workflows (`bmad-create-epics-and-stories`, etc.) when starting a new program slice.
```

6. Prune `_bmad-output/brainstorming/` copies that were snapshotted.

#### 9c. Record and route

1. Append all deleted paths to workstream `.published` under `pruned_from_bmad_output:`.
2. **Stories:** `bmad-create-story` / `bmad-dev-story` → `docs/delivery/.../stories/`.
3. **Non-epic change specs:** load from `docs/delivery/.../changes/` after archive.
4. **Planning:** `bmad-create-epics-and-stories`, `bmad-check-implementation-readiness` → `planning-snapshots/…/planning/` for prior workstream context, not `_bmad-output/planning-artifacts/`.

**Do not prune:** `project-context.md`, `sprint-status.yaml`, in-progress story/spec files outside scope, or `docs/planning-artifacts/` Option B spikes (separate path).

## After writing

### MILESTONE

```
✅ Delivery history published (MILESTONE)
   Workstream: docs/delivery/workstreams/[slug]/
   Snapshot:   timeline/YYYY-MM-DD-[label].yaml
   Epics:      [list]
   Changes:    [N specs → changes/] or none
   Updated:    docs/delivery/index.md, docs/index.md
   Pruned:     [N] files from _bmad-output/ (or "skipped — KEEP_BMAD")
```

### CHANGES

```
✅ Delivery history published (CHANGES)
   Workstream: docs/delivery/workstreams/[slug]/changes/
   Specs:      [list of YYYY-MM-DD-<type>-<slug>.md]
   Index:      changes/README.md
   Pruned:     [N] spec files from _bmad-output/ (or "skipped — KEEP_BMAD")
```

Remind: `_bmad-output/` remains gitignored — now trimmed to **living** artifacts; immutable history is in `docs/delivery/`.

## Agent routing (for readers)

When answering “how did we get here?” or planning adjacent work:

1. Start at **`docs/delivery/index.md`**
2. Open workstream **`README.md`**
3. Read epic **`summary.md`**
4. Drill into **`stories/`** only when detail needed
5. Check **`changes/README.md`** for non-epic bugfixes and small features in that product area (type is in the filename)
6. Cross-check **`docs/adr/`** for technical decisions
7. Workstream planning snapshots: **`docs/delivery/.../planning-snapshots/`**
8. Pre-epic spikes (no epic IDs): **`docs/planning-artifacts/`** (Option B)

When **`bmad-create-story`** / **`bmad-dev-story`** need prior story context for a **done** story, load from **`docs/delivery/.../stories/`**, not `_bmad-output/implementation-artifacts/`.

When prior **non-epic** ship context is needed, load from **`docs/delivery/.../changes/`**, not live `spec-*.md` under `_bmad-output/`.

When planning skills need prior **product/architecture/UX** context for a **closed workstream arc**, load from **`docs/delivery/.../planning-snapshots/…/planning/`**, not `_bmad-output/planning-artifacts/`.

## What this skill does not do

- Replace **`log-adr`** — promote technical decisions to ADRs separately.
- Modify `.gitignore` for `_bmad-output/` (stays ignored).
- Run full test suites — optional sanity check only.
- Sync ongoing BMAD edits into git — publish is **milestone- or ship-based**, not continuous.
- Auto-archive mid-branch — prefer after merge / explicit ship confirmation for CHANGES mode.

## Templates

- Epic summary: **`templates/epic-summary.md`**
- Workstream README: **`templates/workstream-readme.md`**
- Delivery root README: **`templates/delivery-readme.md`**
- Journal entry: **`templates/journal-entry.md`**
- Changes index: **`templates/changes-readme.md`**
