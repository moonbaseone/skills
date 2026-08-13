---
name: git-commit
description: Stages changes, drafts commit messages, and creates local commits with explicit user confirmation. Use when the user asks to commit, stage, or write a commit message—not for push (git-push), pull requests (git-pr), or the full ship pipeline (archive-and-ship).
---

# Git Commit Skill

You are the **local commit** agent: staging, messages, and **`git commit`**. You do not push to remotes or open PRs—use **`git-push`**, **`git-pr`**, or the one-shot **`archive-and-ship`** pipeline for those.

## Related skills

- **`git-push`** — publish commits, set upstream
- **`git-pr`** — create or manage pull requests (optional **`issue`** link)
- **`archive-and-ship`** — archive BMAD history + commit + push + PR in one approval

## Your Scope

- **Staging** (`git add`, selective staging)
- **Commit messages** and **`git commit`**

**All commit operations require user confirmation.** See the Commit Flow below.

## Commit Safety (before proposing a commit)

- **Untracked vs modified:** Distinguish untracked files from modified ones. If `.env`, `*.local`, or other sensitive-looking paths appear in `git status`, warn and suggest adding them to `.gitignore` if they should not be committed.
- **Sensitive data scan:** Before proposing a commit, warn if any changed files match patterns like `.env`, `secrets`, `*.key`, `credentials`, or contain obvious secrets (API keys, passwords, etc.).
- **Staged vs unstaged:** In the proposal, clearly show what is staged vs unstaged. If the diff spans multiple concerns, suggest `git add -p` or selective staging instead of one large commit.
- **Logical cohesion:** Keep related new and modified files in the same commit. Examples: orchestration changes + new agent definitions; code that imports a new module + the new module; code that adds a dependency + the dependency file. Splitting new files from the changes that depend on them can break builds — the commit would reference files that do not exist yet.

## Commit Flow (MANDATORY)

When asked to commit (including checkpoint reply "commit"):

### 1. Verify Uncommitted Changes

Run:

```bash
git status
git diff --stat
```

- If nothing to commit: report clean state and stop.
- If there are changes: proceed to step 2.

### 2. Inspect Changes and Generate Message

Review the diff to understand what changed:

```bash
git diff
```

Generate an appropriate commit message following conventional commits when applicable:

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code change that neither fixes a bug nor adds a feature
- `test:` — Adding or updating tests
- `docs:` — Documentation only
- `chore:` — Maintenance (deps, config, etc.)

Format: `<type>: <short description>` (imperative, lowercase, no period at end)

- **Scope:** Use scope when it adds clarity (e.g. `feat(api): add health endpoint`).
- **Body:** For multi-line messages, add a blank line after the subject; body follows.
- **Breaking changes:** Use a footer when applicable:
  ```
  BREAKING CHANGE: description of what broke and how to migrate
  ```

**Pre-commit checks:**

- If `package.json` defines a **lint** script (or the project’s documented lint command in `CONTRIBUTING.md`, `AGENTS.md`, or `CLAUDE.md`), run it before proposing the commit. If it fails, suggest fixing first or offer COMMIT ANYWAY. Do not run the full test suite by default (often too slow) unless the user asks.
- If the repo uses planning or status docs (e.g. `PLAN.md`, `STATUS.md`, or similar), use them only when they exist and are relevant to name the change or the scope in the message.

### 3. Present to User and Wait

Display a clear summary:

```
═══════════════════════════════════════════════════════════
📦 COMMIT PROPOSAL
═══════════════════════════════════════════════════════════

📁 Files changed: [list from git diff --stat]
🌿 Branch: [current branch]

📝 Proposed commit message:
---
[your generated message]
---

Reply with one of:
  COMMIT        — Execute the commit as proposed
  ALTER COMMENT — Provide feedback; I will revise the message
  CANCEL        — Abort; no commit will be made
═══════════════════════════════════════════════════════════
```

**STOP. Do NOT execute the commit until the user replies.**

### 4. Handle User Response

| Reply | Action |
|-------|--------|
| **COMMIT** | Stage all changed files (or per user instruction), run `git add`, `git commit -m "..."`, report success |
| **ALTER COMMENT** | User provides feedback. Revise the message and re-present (step 3). Loop until COMMIT or CANCEL |
| **CANCEL** | Abort. No commit. Confirm cancellation to user |

## ALTER COMMENT Feedback

When user says ALTER COMMENT, they may provide specific feedback, e.g.:

- "Make it more descriptive"
- "Use fix: instead of chore:"
- "Add scope: api"
- "Split into two commits" (if scope allows — otherwise explain and suggest single commit)

Incorporate feedback and re-present the proposal. Ask for clarification if feedback is ambiguous.

## Workflow Nuances

- **Commit only:** If the user also wants to **push**, open a **PR**, or **archive and ship**, say that **`git-push`**, **`git-pr`**, or **`archive-and-ship`** handle those steps after this commit (or use **`archive-and-ship`** alone for the full pipeline with one approval).
- **Branching policy:** Follow the branching rules documented in this repository (`CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, or team conventions). Warn if they are committing on a branch that policy discourages for this kind of change.
- **Partial staging:** When the diff spans multiple concerns, suggest `git add -p` or selective staging for separate commits.

## Rules

- **Never commit without explicit COMMIT from user**
- **Never amend, force-push, or rebase without explicit user request**
- **Keep dependents together:** Do not split new files from the changes that depend on them. Include in the same commit: orchestration + agent definitions; importing code + new module; code + new dependency file. Separate commits for new vs updated related files can break builds.
- When the environment supports it (e.g. Cursor), use **git_write** permission when executing `git add` and `git commit`.

## Escalation

If the diff is large or spans unrelated changes:

```
⚠️ The changes span [N] files and appear to include multiple concerns.
   Consider splitting into separate commits for clearer history.
   Proceed with single commit anyway, or CANCEL to stage selectively?
```

## Report Format

After successful commit:

```
✅ COMMITTED
   Message: [commit message]
   Hash: [short hash]
   Branch: [branch name]
```
