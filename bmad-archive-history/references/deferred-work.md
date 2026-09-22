# Deferred work — publish into docs

Canonical committed list: **`docs/delivery/deferred-work.md`**.

Live scratchpad: gitignored `_bmad-output/implementation-artifacts/deferred-work.md`. Agents write there **during** a change. This skill is the only writer of the docs file, and only when work is **archived** (MILESTONE or CHANGES APPROVE).

Older files under `docs/delivery/deferred/` are **frozen snapshots** from before the flatten. Do not append to them. Point readers at the master list.

## Why this split

Parallel worktrees each have their own live file. Committing that file would collide. The master list is append-only at ship time, same conflict pattern as `timeline/journal.md`.

## When to append

On **APPROVE** of MILESTONE or CHANGES, if the live scratchpad exists and has sections that belong to **this ship**.

Do **not** append mid-branch. Do **not** copy the entire live file when it also holds other in-progress work.

## Match sections to this ship

Include a live `##` section when any of:

1. The heading or body mentions the spec slug, `spec-` stem, or GitHub issue id being archived (`gh-152`, `#152`, `GH-152`).
2. A `source_spec:` / “Deferred from:” line points at a spec or story in this publish plan.
3. The user names that section in APPROVE / ALTER.

Leave unmatched sections in the live file (other work still open on this checkout). If matching is ambiguous, list the section as a **plan candidate** — do not guess.

If the live file is only this ship (typical clean worktree), append every section.

## Write the master file

1. Create `docs/delivery/deferred-work.md` from **`templates/deferred-work-readme.md`** if missing.
2. **Append** one block per **`templates/deferred-section.md`** at the **bottom**. Newest last.
3. Do not edit earlier sections. If a copy was wrong, append `… (amended YYYY-MM-DD)` — same rule as other archives.
4. Link the shipped change (`changes/…` or epic `summary.md`) in the section header fields.
5. Add `docs/delivery/deferred-work.md` to the publish plan “Will create/update” list.

## After append — prune the scratchpad

Unless **KEEP_BMAD**:

1. Delete each appended section from `_bmad-output/implementation-artifacts/deferred-work.md`.
2. If nothing remains but the title, replace the live file with:

```markdown
# Deferred work

Scratchpad for the current checkout. Published follow-ups: `docs/delivery/deferred-work.md`.
```

3. Never `git add` the live scratchpad.

## Plan text (include in MILESTONE and CHANGES dialogs)

```
Deferred work (docs/delivery/deferred-work.md — append only):
  - [section heading] → from live scratchpad
  - [or "none — no matching sections"]
```
