---
name: git-pr
description: Creates and manages pull requests via GitHub CLI (or equivalent). Use when the user asks to open, create, list, or update a PR—not for routine git push alone (git-push) or local commits (git-commit). Optional issue link via Fixes #N in the PR body.
---

# Git PR Skill

You handle **pull requests**: create, list, view, and help fill title/body. You do not replace **`git-commit`** for staging and committing.

## Your Scope

- **`gh pr create`**, **`gh pr list`**, **`gh pr view`**, and related **`gh pr`** commands when GitHub CLI is available
- Ensuring the **branch exists on the remote** before opening a PR (coordinate with **`git-push`** if needed)
- Proposing **title** and **body** with the same confirmation pattern as commits (see below)

**Out of scope:** Routine `git push` without PR intent (use **`git-push`**); local `git add` / `git commit` (use **`git-commit`**).

## Invoke parameters

Parse from the user's message when present.

| Parameter | Required | Notes |
|-----------|----------|-------|
| **`base`** | No | Target branch for merge. Default to repo primary branch; **confirm** if unsure. |
| **`issue`** | No | Existing GitHub issue to link. Accept `#92`, `92`, `GH-92`, or `issue 92` — normalize to issue **number** `92`. Verify with `gh issue view` before create. |
| **`assignee`** | No | GitHub login for `--assignee`. |
| **`draft`** | No | Open as draft (`--draft`). |

When the user asks to link a PR to an issue, **`issue` is required for that run** — do not skip linking silently.

## Issue linking (mandatory when requested)

GitHub links PRs to issues via **body text** (there is no `gh pr create --issue` flag).

1. **Resolve** the issue number from invoke text (`GH-88` → `88`, `#88` → `88`).
2. **Verify** the issue exists in the current repo:

```bash
gh issue view <number> --json number,title,state,url
```

- If the issue is missing or closed when policy expects open work, **HALT** and report — do not create an unlinked PR unless the user explicitly drops the link.
3. **Include a linking line** in the PR body (typically under **## Related**):
   - Default: `Fixes #<number>` — links in GitHub's development panel and **auto-closes** the issue when the PR merges.
   - If the user says link only / do not auto-close: use `Refs #<number>` or `Relates to #<number>` instead (still links; no auto-close on merge).
4. Show the resolved issue (**title + URL**) in the PR proposal gate.

Do **not** rely on branch names alone (e.g. `spec-gh-92-…`) — confirm the issue number with the user or `gh issue view` when linking was requested.

## Prerequisites

- **`gh`** authenticated (`gh auth status`). If missing, explain how to install/auth or offer web-only steps.
- **Branch pushed:** If `origin/<branch>` is missing, ask whether to push first (delegate execution to **`git-push`** flow or run push with user confirmation—do not surprise-push).

## PR Creation Flow

### 1. Branch and remote

- Confirm current branch and that it is **not** the sole protected default when policy requires feature branches (read repo docs).
- If not pushed:
  ```
  Branch [name] is not on origin yet. Push before opening a PR?
  Reply: YES | NO
  ```
  If YES, complete push (see **`git-push`**), then continue.

### 2. Propose title and body

Use conventional title style unless the repo documents otherwise (e.g. `feat(scope): description`).

Propose a body template and adapt to the project:

```
## Summary
[What and why]

## Changes
- [Main changes]

## Checklist
- [ ] Tests pass (or N/A)
- [ ] Lint passes
- [ ] Docs updated if needed

## Related
- Branch: [branch name]
- Fixes #[issue number]   ← include when user requested issue link; omit line if none
```

**Confirmation gate (same spirit as git-commit):**

```
═══════════════════════════════════════════════════════════
🔀 PR PROPOSAL
═══════════════════════════════════════════════════════════

Title: [proposed title]

Linked issue: [none | #N — title — url]

Body:
---
[proposed body]
---

Reply with:
  SUBMIT  — Create the PR as proposed
  ALTER   — Revise title/body from feedback
  CANCEL  — Abort
═══════════════════════════════════════════════════════════
```

Wait for **SUBMIT** before running `gh pr create`.

### 3. Base branch, issue, and draft

- **Base:** default to the repo’s primary branch (`main` or as documented). Confirm if unsure.
- **Issue:** if **`issue`** was provided or requested, verify with `gh issue view` and ensure the approved body contains the linking line (`Fixes #N` unless user chose link-only wording).
- **Draft:** ask whether to open as **draft** or **ready for review** (skip ask if **`draft`** was set at invoke).

### 4. Create

```bash
gh pr create \
  --base "<base>" \
  --title "..." \
  --body "..." \
  [--draft] \
  [--assignee "<login>"]
```

The body **must** include `Fixes #<n>` (or approved link-only variant) when an issue link was requested.

Show the **PR URL** in the report. Optionally run `gh pr view --json closingIssuesReferences` to confirm GitHub picked up the link.

## Listing and viewing

- **`gh pr list`** — filter by head branch or author as needed.
- **`gh pr view [n]`** — show status, checks, reviewers.

## Rules

- **Never** create or merge PRs without user confirmation through the gate above (or an explicit one-shot instruction that restates title/body).
- **Issue link:** when the user requests linking to an issue, verify with `gh issue view` and include the approved linking line in the body — do not create the PR without it unless the user explicitly removes the link.
- If the project documents extra gates (design review, security), mention them in the PR body or checklist.
- Use **network** / **git_write** permissions as required by the tool environment.

## Report Format

```
✅ PR OPENED
   URL: [link]
   Branch: [head] → [base]
   Issue: [#N linked via Fixes #N | none]
```
