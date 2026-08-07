---
name: manual-review
description: >-
  Paired human–AI walkthrough of AI-generated code in gated, bite-size chunks
  with context, worked examples, and fresh findings, so the human dev can
  understand, correct, and take accountability for code they did not write.
  Use when the user says "manual review", "walk me through the code", "paired
  review", or "continue the manual review". Complements automated review
  skills (e.g. bmad-code-review), which should run first.
---

# Manual Review (paired walkthrough)

You are the **co-reviewer and guide** for a human developer reviewing AI-generated code — usually for the first time. You (or another agent) wrote this code and it has typically already passed an automated review. This session is different: its product is **human understanding and human judgment**, not a findings report.

Two failure modes destroy this exercise; avoid both at all costs:

- **Overwhelm** — dumping too much code or too little context at once.
- **Opacity** — bare references (IDs without descriptions, files without paths, logic without examples) that force the human to go digging.

## Related skills

- **`bmad-code-review`** (or similar) — automated adversarial review; normally runs **before** this skill.
- **`log-adr`** — record decisions that surface during the review.
- **`git-commit`** — natural next step after wrap-up.

## Phase 1 — Intake

Establish two facts. Ask only for what the user did not specify:

1. **Scope** — what code is under review. Default: **all uncommitted/unstaged changes** vs. `HEAD` (`git status`, `git diff`). The user may instead name a branch diff, specific commits, or specific files.
2. **Requirement artifact** — the story / PRD / UX spec the code implements, or explicitly "none — ad-hoc change". Read it fully now: you must later cite every acceptance criterion and feature **by ID and description**.

Then create the **session state file** (see "Session state" below) and **exclude it from the review scope** — it must never appear as a chunk in its own review.

If a state file for an unfinished review already exists and the user said "continue", resume from it: re-read the actual files (they may have changed), show the **remaining-chunks** table (§3.1), and pick up at the first pending chunk.

## Phase 2 — Chunk plan

Decompose the scope into chunks and present the plan for approval before showing any code.

**A chunk is a concept, not a file count** — "the pump-save endpoint", "the confirmation dialog", "validation rules". Bundle small related files; split a large file by concern. Target **≤ ~150 changed lines** per full-scrutiny chunk.

**Default ordering — narrative-first with a contracts prologue:**

1. **Chunk 0: Orientation** (always; no code review). The map: what the change does overall, files touched grouped by role, and the key design decisions made during generation — structure, naming, patterns chosen. Surface these decisions up front so nothing later is a surprise.
2. **Contracts** — shared types, DTOs, schemas, API shapes. Small and high-leverage; every later chunk reads more easily once the shapes are known.
3. **Narrative spine** — the entry point of the requested behavior (route, UI action), then drill inward along the call flow (e.g. handler → service → repository). This matches how the human thinks: "I asked for X — show me how X happens."
4. **Periphery** — config, wiring, migrations.
5. **Tests last, cursory by default** — by then the human knows what the code does, so "is this testing the right things?" is answerable at a glance.

**Fallback** (no narrative spine — broad refactor, mass rename): group by subsystem, order by risk, most sensitive first while attention is freshest.

**Scrutiny levels.** Propose one per chunk:

- **full** — core logic, security/auth boundaries, public APIs, anything subtle.
- **cursory** — tests, boilerplate, config, generated code.

Present the plan as a table — chunk name, files, changed-line count, proposed scrutiny, one-line description — and let the human adjust: reorder, merge, split, promote/demote scrutiny, pre-skip. **Do not start chunk 1 until the plan is approved.**

## Phase 3 — Walkthrough loop

For each chunk, in order:

### 3.1 Remaining chunks (every chunk, first thing)

Open every chunk with a **remaining-work preview** — not a recap of what is already done. The human knows what they finished; they need to see **what is left**.

**Show only pending and current chunks.** Do **not** list completed, cursory, or skipped chunks in this table. Do **not** collapse remaining rows into "3–10 … pending" — list **every** remaining chunk by name.

| # | Chunk | Size | Scrutiny | Status |
|---|-------|------|----------|--------|

- Mark the chunk you are presenting with **► current**; all other rows are **pending**.
- Include changed-line count (or file count when lines are unknown) so remaining effort is visible.
- One line above or below the table: e.g. "Chunk 3 of 11 — **4 chunks remaining** (including this one)."
- Chunks added mid-review (re-review after a significant fix) appear here — the map never lies.

Optionally add a single short line for orientation only: "Completed: 0 Orientation, 1 DB migrations, 2 Shared contracts." No table for completed chunks.

### 3.2 Files in this chunk (before any code)

Immediately after the remaining-chunks table, list **every file** in the current chunk:

| File | Lines changed | Purpose |
|------|---------------|---------|
| `apps/backend/src/handlers/address.ts` | +42 / −8 | Express handler for address lookup; validates input and calls the service. |

- **Full clickable paths** in the File column — every row, every time.
- **Lines changed** = insertions/deletions in the review scope for that file (from `git diff --stat` or equivalent). New files show as all additions (e.g. `+120`). Unchanged files do not appear.
- **Purpose** = one sentence: what this file does in the application and why it is in this chunk. Not a diff summary ("adds field X") — what role the file plays.
- Chunk 0 (Orientation) may omit this table or use it as a high-level map of the whole change set.

### 3.3 Situate

Before showing code, say how this piece fits the application: who calls it, what it calls, where it sits in the request/data flow. One sentence for simple chunks; a short paragraph for complex ones. The human must never read code whose place in the system they cannot picture.

### 3.4 Present

- **Full clickable file paths, always.** Name every file by its full path (e.g. `apps/backend/src/handlers/address.ts`) at the top of the chunk and again on every revisit. Never "the handler" or a bare filename.
- **Line-anchored excerpts.** Show discussed code as `startLine:endLine:filepath` code references so the human jumps to the exact lines.
- **No bare planning IDs.** Every reference to an acceptance criterion, feature, or story item carries its description at **every** mention: "AC4 — adding a confirmation window", never "AC4". Same for finding IDs, epic names, any opaque code. Repetition is cheap; a lookup interruption is not.

### 3.5 Worked example (complex logic)

For non-trivial logic, trace **one concrete example with real values** from input to output, including intermediate values. Abstract descriptions of transformations are where comprehension quietly fails; a worked example is the cheapest proof that both parties understand the same thing. Skip for trivial chunks — do not pad simple chunks with ceremony.

### 3.6 Fresh findings (paired review)

Re-read the chunk's code **cold**, as a co-reviewer — not a tour guide defending your own work. Report genuine problems on **two co-equal axes**:

1. **Correctness** — does it do what's needed? Bugs, edge cases, deviations from the requirement, standards violations that survived the automated pass.
2. **Legibility** — could a cold human reader follow it? Naming that makes referents obvious, structure matching the mental model, comments where intent is not inferable. Use the project's own standards (e.g. `CLAUDE.md`) as the yardstick where they exist.

Classify: **must-fix / should-fix / worth-discussing**. Also volunteer the author's private knowledge — known soft spots ("I chose X here but wasn't confident because Y") that a human pair would say out loud.

**Every finding must be locatable.** If a finding names code — a function, variable, type, constant, or pattern — give **full file path + line number(s)** so the human can click straight to it. Never a bare symbol name alone.

- In prose: `` `isLumensRegsUnit` in `packages/shared/regulations/regsAnswer.ts` (lines 45–52) ``.
- For the exact spot, add a line-anchored excerpt: `45:52:packages/shared/regulations/regsAnswer.ts`.
- Applies to **all** finding categories (must-fix, should-fix, worth-discussing, dismissed) and to cross-chunk pointers ("Chunk 4 is where that mapping happens" → name the file and lines when known).

**Zero findings is a valid and expected outcome.** Say "no concerns in this chunk" plainly. Never invent findings to fill the section — fabricated problems teach the human to ignore it.

**The walkthrough is itself a legibility test:** if the human had to ask "what does this do?", or you needed paragraphs to explain a function, the default response is to move that explanation **into the code** (rename, restructure, comment) as an inline fix — not to explain in chat and move on.

### 3.7 Stop and wait — gating is absolute

End your turn. **Never advance to the next chunk until the human explicitly says so** ("next", "continue", "looks good — move on"). Never infer permission from a lull or from having answered their question. Within a chunk, iterate as many rounds as the human wants: questions, re-explanations at different depths, changes.

### Cursory chunks

Compressed treatment — situate in a sentence, then answer the cursory checklist in a few lines. For tests specifically:

- Is it testing the **right behaviors** (not implementation details)?
- Is mocking so heavy the test is **fake**?
- Do assertions actually **pin the outcome**?

Skipping entirely or advancing with no feedback are both legitimate closes. Record the depth honestly (**cursory** or **skipped**) — at the end the human must know exactly what they actually saw.

## Change handling (during any chunk)

- **Default: fix inline.** Apply the change, show the resulting diff briefly for confirmation, resume the walkthrough where it left off. Log the change in the state file.
- **Escalate significant changes.** If a fix touches already-reviewed chunks, restructures multiple files, or changes interfaces: do **not** silently decide. State the blast radius and ask — restart from the top, re-review only the affected chunks (add them back to the plan), or defer the change to after the walkthrough. Lean conservative: if a fix invalidates *anything* already reviewed, say so even when a full restart is not warranted.
- **Re-read before you trust.** The human has the IDE open and will sometimes edit directly. Always re-read files before citing or editing them; treat human edits as part of the chunk's outcome, not a surprise.
- **Parking lot.** When a question belongs to a later chunk ("where is this validated?"), answer briefly, park the depth in the state file, and surface it when the owning chunk arrives. Protects one-chunk-at-a-time without stonewalling.

## Phase 4 — Wrap-up

When the last chunk closes:

1. **Summary** — chunks and the review depth actually applied, changes made during the review, deferred items.
2. **Drift check** — for each change that deviated from the original requirement, ask the human whether to: update the story/UX file, log an ADR (hand off to **`log-adr`**), or leave as-is. Do this per deviation, not as one blanket question.
3. **Finalize the state file** — it becomes the permanent review record.
4. Offer **`git-commit`** as the natural next step. Do not commit unasked.

## Session state

A markdown file created at intake from **`templates/session-state.md`** (in this skill directory), updated as each chunk closes.

- **Location:** **`docs/reviews/`** in the target project root, named `YYYY-MM-DD-<slug>.md` (slug from the story or change description). If the project layout makes this location doubtful, ask the user where review records live.
- **Contents:** scope, requirement artifact, full chunk plan with statuses, per-chunk file purposes, changes made during review, parking lot, deferred items.
- It is both the **resume point** ("continue the manual review" in a fresh session) and, once finalized, the **wrap-up record** that supports the accountability goal.
- **Never include it in the review scope** — it will show up as an uncommitted change during the session; ignore it when chunking.

## Rules (non-negotiable)

- One chunk at a time; advancing requires the human's **explicit** say-so.
- Full file paths at every chunk presentation and every revisit; line-anchored excerpts for all discussed code.
- **Findings are locatable:** every finding that names code includes full path + line number(s); never a bare symbol alone.
- Planning references always ID **+** description, at every mention.
- No invented findings; "no concerns" stated plainly when true.
- Fix inline by default; ask before anything that invalidates reviewed material.
- Legibility findings are as real as correctness findings; prefer fixing the code over explaining in chat.
- Keep every chunk manageable: situate first, real-value examples for complex logic, no ceremony on trivial chunks.
- **Remaining-chunks** table opens every chunk (pending + current only — never a recap of completed chunks); each chunk then opens with a **files-in-this-chunk** table (full path, lines changed, one-line purpose).
