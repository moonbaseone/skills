# Manual review — {change title}

- **Date started:** {YYYY-MM-DD}
- **Reviewer:** {human dev name}
- **Status:** in progress | complete
- **Scope:** {e.g. all uncommitted/unstaged changes vs. HEAD on branch `x`}
- **Requirement artifact:** {path to story/PRD/UX file, or "none — ad-hoc change"}
- **Prior automated review:** {e.g. bmad-code-review run YYYY-MM-DD, findings resolved | not run}

## Chunk plan

Full plan (all chunks). During walkthrough, the chat shows **only remaining** chunks — not this completed list.

| # | Chunk | Files | Size (changed lines) | Scrutiny | Status |
|---|-------|-------|----------------------|----------|--------|
| 0 | Orientation | — | — | — | pending |
| 1 | {name} | {full paths} | {n} | full | pending |
| 2 | {name} | {full paths} | {n} | cursory | pending |

Status values: pending · done · cursory · skipped

### Per-chunk file purposes

Used when presenting each chunk's files table. One sentence per file — role in the app, not diff summary.

| Chunk # | File | Lines changed | Purpose |
|---------|------|---------------|---------|
| 1 | `{full/path.ts}` | +{n} / −{m} | {one-line purpose} |

## Changes made during review

| Chunk | Change | Significance | Outcome |
|-------|--------|--------------|---------|
| {#} | {what was changed and why} | minor / significant | {applied inline / re-reviewed chunks N,M / deferred} |

## Parking lot

Questions raised early that belong to a later chunk. Resolve each when its chunk arrives.

- [ ] {question} → belongs to chunk {#}

## Deferred items

Improvements agreed during review but intentionally not blocking it.

- [ ] {item}

## Requirement drift

Changes made during review that deviate from the original requirement, and how each was captured.

| Deviation | Capture decision |
|-----------|------------------|
| {what deviated} | story updated / ADR {NNNN} / left as-is |

## Wrap-up summary

_Filled in when the review completes._

- Chunks reviewed at full depth: {…}
- Chunks reviewed cursorily: {…}
- Chunks skipped: {…}
- Overall verdict / notes: {…}
