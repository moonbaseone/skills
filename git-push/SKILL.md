---
name: git-push
description: Pushes local commits to the remote and manages upstream branches. Use when the user asks to push, sync to origin, or publish a branch—not for staging commits, writing messages, opening PRs (git-pr / git-pr issue link), or the full ship pipeline (archive-and-ship).
---

# Git Push Skill

You handle **pushing** and **upstream** setup. You do not draft commits, stage files, or create pull requests—load **`git-commit`**, **`git-pr`**, or **`archive-and-ship`** for those.

## Related skills

- **`git-commit`** — stage and commit locally
- **`git-pr`** — open or manage pull requests (optional **`issue`** link via `Fixes #N`)
- **`archive-and-ship`** — archive BMAD history + commit + push + PR in one approval

## Your Scope

- **`git push`** and first-time **`git push -u origin <branch>`**
- Checking **unpushed commits**, **upstream** configuration, and **remote** state
- Warning when policy expects work on a feature branch but the user is on the default branch (read `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md` if present)

**Out of scope:** `git commit`, `git add`, PR creation, force-push unless the user explicitly asks for it.

## Safety

- **Never push directly to protected integration branches:** Do **not** run `git push` (or `git push -u`) while the current branch is **`main`**, **`staging`**, or the repo’s **default branch** when it has another name (e.g. `master`). Those branches must receive changes via a feature branch and pull request (**`git-pr`**), not a direct push. Resolve the default branch with `git symbolic-ref refs/remotes/origin/HEAD` or repo docs when unsure.
- **Never** run `git push --force`, `git push --force-with-lease`, or rewrite remote history unless the user **explicitly** requests it by name.
- If **no upstream** is set and the user wants to publish the branch, use `git push -u origin <current-branch>` after confirmation—**unless** `<current-branch>` is `main`, `staging`, or the default branch; in that case stop and help them create/switch to a feature branch first.

## Push Flow

### 1. Inspect state

```bash
git status
git branch -vv
git branch --show-current
```

- If the current branch is **`main`**, **`staging`**, or the repo’s **default** branch (when not already listed): **stop. Do not push.** Tell the user to create or switch to a feature branch, commit there, then push; merge via PR (**`git-pr`**).
- If there is **nothing to push** (clean, branch up to date with `@{u}` or no commits ahead): report and stop.
- If there are **uncommitted changes**, say that push only sends commits—offer to use **`git-commit`** first if they meant to save work.

### 2. Optional context

- If **`gh`** is available, you may run `gh pr list --head <branch>` to mention an existing open PR (“PR #N will update when you push”).
- Do not block push solely on PR state unless the user asked.
- If the user wants **archive + commit + push + PR** (or issue-linked PR), suggest **`archive-and-ship`** instead of chaining skills manually.

### 3. Confirm (recommended)

For **first push** of a branch (no upstream), present a short confirmation:

```
Ready to push branch [name] to origin (set upstream)?
  YES | NO
```

For routine pushes to an existing upstream, you may proceed after stating what will run, unless the user prefers always confirming.

### 4. Execute

```bash
git push
# or, when upstream is missing:
git push -u origin <branch>
```

Report success with remote URL summary if useful.

## Rules

- **Never** push from **`main`**, **`staging`**, or the **default** branch—no exceptions in normal workflow.
- Use **git_write** (or equivalent) when your environment requires permissions for `git push`.
- Do not combine unrelated operations (e.g. do not run `git commit` in this skill).

## Report Format

After a successful push:

```
✅ PUSHED
   Branch: [name]
   Remote: [e.g. origin]
```
