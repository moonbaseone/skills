---
name: archive-and-ship
description: >-
  One-shot milestone ship: archive BMAD delivery history (bmad-archive-history),
  commit, push, and open a pull request — with a single approval gate. Skips PR
  creation when a PR is already open for the current branch (push only). Requires
  an explicit base branch for new PRs unless provided at invoke time. Optional
  assignee and optional link to an existing GitHub issue (Fixes #N in PR body).
  Use when the user says archive and ship, ship my change, publish and open a PR, or run the full archive-commit-push-PR pipeline.
---

# Archive and ship (one approval)

You orchestrate a **fixed four-step pipeline** on the **active project root** (not this skills repository unless that is the project open):

1. **Archive** — **`bmad-archive-history`** (MILESTONE or CHANGES, as applicable)
2. **Commit** — **`git-commit`** (stage + local commit)
3. **Push** — **`git-push`** (publish branch to `origin`)
4. **PR** — **`git-pr`** (open PR **only if none exists** for the current head branch)

**One approval gate** covers the whole run. Do **not** stop for separate COMMIT / SUBMIT / archive APPROVE dialogs mid-pipeline unless the user **ALTER**s the unified plan.

## Related skills (load for step detail)

| Step | Skill | You inherit |
|------|-------|-------------|
| 1 | **`bmad-archive-history`** | Publish modes, routing, tiers, safety, templates under that skill's folder |
| 2 | **`git-commit`** | Staging rules, message style, sensitive-file scan, logical cohesion |
| 3 | **`git-push`** | Protected-branch policy, upstream setup, no force-push |
| 4 | **`git-pr`** | Title/body style, `gh` prerequisites |

This skill **coordinates** those flows; it does not replace their safety rules.

## Invoke parameters

Parse from the user's message when present; otherwise collect **before** building the plan.

| Parameter | Required | Notes |
|-----------|----------|-------|
| **`base`** | **Yes** when opening a **new** PR | Target branch (e.g. `main`, `staging`). **Ask** if missing and no open PR exists for `HEAD`. |
| **`assignee`** | No | GitHub login for `--assignee` on `gh pr create`. Omit if not provided. |
| **`issue`** | No | Existing GitHub issue to link (`#92`, `92`, `GH-92`, `issue 92`). Verify with `gh issue view`; include `Fixes #N` in PR body unless user chose link-only wording. **Required when user asks to link the PR to an issue.** |
| **`mode`** | No | Archive mode: `MILESTONE` (default) or `CHANGES`. Ask if `_bmad-output/` scope is ambiguous. |
| **`workstream`** | No | Workstream slug for archive; infer or ask if archive step has material to publish. |
| **`draft`** | No | Open new PR as draft (`--draft`). Default: ready for review unless user says draft. |

**Do not** proceed to the unified plan without **`base`** when the PR step will create a new PR.

## Preconditions (inspect before planning)

Run in parallel where possible:

```bash
git status
git diff --stat
git branch --show-current
git branch -vv
gh auth status          # if gh available; note if PR step will fail without it
gh pr list --head "$(git branch --show-current)" --state open --json number,url,baseRefName
# when issue link requested:
gh issue view <number> --json number,title,state,url
```

Also inspect `_bmad-output/` when present to decide archive mode and scope (see **`bmad-archive-history`**).

Record:

- **Current branch** (`HEAD`)
- **Uncommitted / untracked** changes (commit step)
- **Commits ahead of upstream** (push step)
- **Open PR for this head?** — if **yes**, set **`pr_action: skip`** (push updates existing PR; do **not** create another)
- **Issue to link?** — resolved number, title, URL from `gh issue view` when **`issue`** was provided
- **Archive in scope?** — done specs, milestone boundary, or user explicitly requested archive; else **`archive_action: skip`**

## PR branch rule (mandatory)

| Open PR for `HEAD`? | After push |
|---------------------|------------|
| **Yes** | Report existing PR number + URL. **Stop.** Do not run `gh pr create`. |
| **No** | **`base` must be set** (from invoke or user answer). Include PR title/body in the unified plan; create on **APPROVE**. |

If **`gh`** is missing or unauthenticated and a new PR would be needed, say so in the plan and **HALT** — do not push on the assumption a PR can be opened later unless the user explicitly opts to push-only.

## Unified plan (mandatory — single gate)

Build **one** proposal that merges archive plan (if any), commit message, push summary, and PR proposal (if `pr_action: create`).

```
════════════════════════════════════════════════════════════
ARCHIVE AND SHIP — Unified plan
════════════════════════════════════════════════════════════
Branch:         [current]
Archive:        [SKIP | MILESTONE | CHANGES — brief scope]
Commit:         [SKIP (clean) | proposed message + file list]
Push:           [SKIP (up to date) | N commits to origin]
Pull request:   [SKIP — PR #N already open → url]
                [CREATE → base: <base> | assignee: <login>|none | issue: #N|none | draft: yes|no]
                [title + body preview — body includes Fixes #N when issue set]

Safety notes:   [sensitive paths, protected branch, lint suggestion, etc.]

Reply with one of:
  APPROVE   — Run all steps top to bottom as shown
  ALTER     — Revise from my feedback; re-show plan until satisfied
  CANCEL    — Abort; no writes, no commit, no push, no PR

════════════════════════════════════════════════════════════
```

**STOP.** Do not execute any step until the user replies **APPROVE**.

On **ALTER**, revise any section (archive scope, commit message, base branch, assignee, issue link, PR text) and re-show the full plan.

On **CANCEL**, confirm nothing ran (or report partial state only if a prior APPROVE already executed in a resumed session — avoid partial runs in one session).

## Execution order (after APPROVE only)

Execute strictly in order. If a step is **SKIP** in the approved plan, continue to the next.

### Step 1 — Archive

Follow **`bmad-archive-history`** for the approved mode and scope:

- Write under `docs/delivery/` (and Option B paths only when that skill routes there).
- Use templates from **`bmad-archive-history/templates/`** when creating skeleton files.
- Prune `_bmad-output/` per approved plan unless user chose **KEEP_BMAD** in an ALTER.

If archive was **SKIP**, do nothing.

### Step 2 — Commit

Follow **`git-commit`**:

- Re-run `git status` / `git diff` if archive step changed the tree.
- Stage per approved plan (usually all intended ship files, including new `docs/delivery/` paths).
- Run pre-commit lint only if the approved plan or **`git-commit`** rules already called for it.
- `git commit` with the **approved message** — no second confirmation.

If working tree is clean after archive (or archive skipped and already clean), **SKIP** with note.

### Step 3 — Push

Follow **`git-push`**:

- Refuse push from `main` / `staging` / default branch — same as **`git-push`**.
- `git push` or `git push -u origin <branch>` when upstream missing.
- No separate YES/NO push confirmation — **APPROVE** already covered push.

If already up to date with remote, **SKIP** with note.

### Step 4 — Pull request

Check again (race-safe):

```bash
gh pr list --head "$(git branch --show-current)" --state open --json number,url,baseRefName
```

| Result | Action |
|--------|--------|
| Open PR exists | Report **PR #N** and URL. **Done.** |
| No open PR | Create with approved title, body, base, and flags |

Follow **`git-pr`** issue linking when **`issue`** is set: verify with `gh issue view`, include `Fixes #<n>` in the approved body (or link-only wording if user **ALTER**ed).

Create:

```bash
gh pr create \
  --base "<approved-base>" \
  --title "<approved-title>" \
  --body "<approved-body>" \
  [--draft] \
  [--assignee "<login>"]
```

The approved body **must** contain the issue linking line when **`issue`** was part of the plan.

Use **network** / **git_write** permissions as the environment requires.

## Commit message and PR content

- **Commit message:** derive from full diff (archive docs + app code). Prefer conventional commits; one cohesive commit unless the user **ALTER**ed to split ( splitting is rare in this skill — prefer single ship commit).
- **PR title/body:** summarize the **entire** branch intent, not only the last commit. Include archive/publish note when step 1 ran. Adapt checklist to project (`CONTRIBUTING.md`, `CLAUDE.md`).

When archive publishes a **CHANGES** spec, mention the archived path in the PR body.

## Rules

- **Single gate:** one **APPROVE** for archive + commit + push + PR create. Never nest COMMIT/SUBMIT/APPROVE dialogs inside the same run.
- **Existing PR:** never `gh pr create` when an open PR already targets this head branch.
- **Base branch:** never guess for a new PR — require explicit **`base`** from invoke or user answer before showing the final plan.
- **Assignee:** optional; only pass `--assignee` when provided.
- **Issue link:** when **`issue`** is set, verify the issue exists and include `Fixes #N` (or approved link-only variant) in the PR body — same rules as **`git-pr`**. Never skip linking when the user requested it.
- **Never** force-push, amend, or rewrite history unless the user explicitly requests outside this skill's scope.
- **Never** commit secrets — same scan as **`git-commit`**; **HALT** on APPROVE if user insists without resolving.
- If any step **fails**, stop the pipeline, report which step failed, and do not continue silently.

## Report format (success)

```
✅ ARCHIVE AND SHIP complete

Archive:  [skipped | MILESTONE/CHANGES — paths]
Commit:   [skipped | <short hash> — message subject]
Push:     [skipped | pushed to origin/<branch>]
PR:       [skipped — existing PR #N: url]
          [created: url — head → base | issue #N linked]
```

## When to use vs component skills

| User intent | Skill |
|-------------|-------|
| Full pipeline: archive + commit + push + PR | **`archive-and-ship`** |
| Archive only | **`bmad-archive-history`** |
| Commit only | **`git-commit`** |
| Push only | **`git-push`** |
| PR only (branch already pushed) | **`git-pr`** |

## What this skill does not do

- Merge PRs or deploy to production.
- Replace **`log-adr`** — log ADRs separately if decisions surfaced during ship.
- Run full test suites by default (mention in PR checklist; run only if user or project policy requires before APPROVE).
