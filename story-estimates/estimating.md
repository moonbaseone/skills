# Estimating stories (for the story-estimates subagent)

You estimate a batch of stories and write one table row per story to the part file you were given. Nothing else: no reply beyond "done" (or what went wrong), no edits to stories, `sprint-status.yaml`, or code.

**Speed is part of the job.** The user expects the whole table within two minutes, and you are most of that. Use **at most three tool calls** in total:

1. **Read your stories** — one `sed -n` call printing every line range you were given (`sed -n '654,702p;703,747p' <story-file>`). Nothing else from the story file, and no specs, architecture, or design documents.
2. **Size the files** — one shell call for the whole batch (below).
3. **Write the part file** — one Write call.

## Files and lines: count, don't read

Only the Files and ±Lines figures need the codebase, and they need **which files and how big**, not what is in them. **Never open a source file.**

- If a story lists its files (a **Files:** field), use that list. Paths are often relative to a folder the story file names once in its intro; match them by suffix against `git ls-files` rather than working the prefix out.
- If it does not, add at most two `rg --files -g '…'` / `rg -l '…'` searches for that story to the same shell call.
- Size everything in that one call, for example:

  ```bash
  git ls-files | grep -F -e 'theme.css' -e 'App.tsx' -e 'HeaderUserMenu.tsx' | xargs wc -l
  ```

A file marked **(new)**, or not found, adds lines and deletes none. If a story's figures stay uncertain, prefix them with `~` and put the reason in its Note.

**+Lines** follows the new behaviour and its tests (tests usually add as much as the code). **−Lines** is bounded by what gets replaced: "rewrites the 420-line `ProjectTable.tsx`" means up to −420, and a story that deletes a file deletes its whole length.

## Complexity and points

Fibonacci bands; pick the value inside the band, so two Medium stories can still differ.

| Complexity | Points | Typical shape |
|------------|--------|---------------|
| Low | 1–2 | One module; an existing pattern to copy; no design decisions |
| Medium | 3–5 | Several files in one area; small design choices; new tests |
| High | 8 | Crosses modules or packages (frontend + backend, app + template); a new contract, migration, or tricky state |
| Very high | 13 | A new subsystem or an architecture decision without precedent; numerical or solver work |

Size informs complexity but does not decide it: a 30-file rename is still Low. **Every Very high story gets a Note** saying where it could be split.

## Recommended model

The **cheapest model that will get it right**, judged on risk and judgement — not on complexity alone.

| Model | When |
|-------|------|
| **Sonnet** | The story names the files and the pattern to follow; the work is mechanical even if large (renames, moving onto an existing primitive, repetitive wiring) |
| **Opus** | The story leaves design calls to the implementer; changes a contract across modules; involves async, concurrency, subtle state, auth, or a data migration |
| **Fable** | The hardest reasoning: physics or numerical solvers, novel algorithms, architecture with no precedent in the repo, or a bug whose cause is unknown |

## Depends on

From the story's own text (a **Runs:** or dependency line). Add one yourself only where a story plainly uses something another story creates; mark it `*` and say why in the Note. `—` when there are none.

## The part file

Exactly this header, one row per story in your batch, nothing else in the file:

```markdown
| # | Story | Description | Complexity | Files | +Lines | −Lines | Model | Depends on | Fingerprint | Estimated | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.3 | Themed page heroes | Adds dark and light hero plates to every section page | Medium (3) | 16 | +220 | −120 | Sonnet | 1.1 | aa1262c0 | 2026-09-30 | |
```

- **#** and **Fingerprint** are copied exactly from the list you were given.
- **Story**: a two-to-four-word label. **Description**: one plain sentence of at most about twelve words saying what the story changes — not the story's full title, not its acceptance criteria.
- **Complexity**: `Label (points)`. **Files**, **+Lines**, **−Lines**: bare numbers with their sign, `~` allowed.
- **Estimated**: today's date. **Note**: empty unless there is something to say (a `~`, an inferred dependency, a Very high split). No `|` characters in any cell.
