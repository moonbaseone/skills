---
name: technical-writer
description: >-
  Keep docs/reference/ honest against the current app, and keep the root
  README.md a human getting-started guide that does not duplicate reference.
  Use when the user asks to update docs/reference, refresh the README,
  audit product notes against the codebase, or write a new-developer on-ramp.
---

# Technical writer

Two jobs only, in the **active project root** (not this skills repository unless that is the project open):

1. **`docs/reference/`** — what is true of the product *now*, verified against the app.
2. **Root `README.md`** — who/what it is, and how a **human** gets it running.

If the user does not name a mode, do **reference first**, then **readme**.

## Modes

| Mode | Writes | Job |
|------|--------|-----|
| **reference** | `docs/reference/**` | Every factual claim checked against `apps/`, `packages/`, config, and tests. Update, cut, or mark `TODO`. Inventory files vs the product. |
| **readme** | root `README.md` | Who/what, who it is for, human getting started, then a pointer to `docs/index.md`. |

Do **not** treat this skill as a general Diátaxis writer (API catalogs, release notes, tutorials, architecture spines). Those have other homes.

## Source of truth

Before drafting or editing:

1. Inspect the relevant implementation, tests, configuration, types, and recent Git history.
2. Repository evidence wins over prior docs and prior chat.
3. Do not invent endpoints, configuration keys, defaults, compatibility claims, workflows, or performance characteristics.
4. If a required fact cannot be verified, mark it `TODO`, state the assumption, or ask one targeted question.
5. Prefer runnable, minimal examples that you have checked against the current commands and env files.

Cite source paths in the **documentation** as evidence. Source code must stay self-documenting — do not add `docs/` or `CLAUDE.md` pointers in application comments.

## Boundaries (do not rewrite)

| File / tree | Owner | This skill |
|-------------|--------|------------|
| `CLAUDE.md` | Agent runbook (harness, `.only`, env merge, what not to start) | Do not turn it into a human getting-started guide |
| `coding-standards.md` | How to write code | Out of scope |
| `code-reviews.md` | Review methodology | Out of scope |
| `docs/adr/` | Why the code is this shape | New decisions go through **`log-adr`** |
| `docs/delivery/` | Shipped history | Immutable — do not “refresh” archived stories |
| `docs/index.md` | Map of the three docs trees | Update only if a folder or entry point you own changed |

A few command names may appear in both README and `CLAUDE.md`. That is intended: **human happy path** vs **agent harness**. Do not copy the test-safety / env-merge essay into the README.

If the project has no `docs/reference/`, ask where living product notes live before inventing a tree.

## Mode: reference

Audience: someone who already found the product and needs a current, accurate note (operator, designer, or developer looking up one topic).

1. List every file under `docs/reference/`.
2. For each file, extract factual claims (commands, flags, defaults, package names, coverage, UI labels, deploy targets).
3. Verify each claim in code or config. Record **path + evidence** for anything you change or flag.
4. Update the file, delete a file that no longer describes the product, or leave a `TODO` with the assumption.
5. Keep `docs/reference/README.md` as an index of **current** files only — not a second product overview.
6. Do not add generated scans, planning extracts, or delivery history.

`CLAUDE.md` and `docs/adr/` win if a reference note conflicts with how-to-run-for-agents or a recorded decision — unless the conflict is that the reference is simply stale; then fix the reference.

## Mode: readme

Audience: a **new developer** (human) who just cloned the repo.

Use this order. Skip a section only if it does not apply.

1. **What it is and who it is for** — one short paragraph. Not a feature catalog.
2. **Getting started (human)** — prerequisites, pick **one** local data stack, env file to copy, commands to boot backend + frontend, URL to open, how to sign in if that is required to see the app.
3. **Where to go next** — `docs/index.md` (reference / ADR / delivery). `CLAUDE.md` for agent/test-harness detail. `coding-standards.md` if they will write code.
4. **Optional one-liners** — license, support, or a single “this repo is a monorepo of X/Y/Z” if the first paragraph did not already say it.

Do **not**:

- Paste the `docs/reference/` file table (that index lives there).
- Write feature-depth essays (regs overlay, pipeline stages, seed playbooks) — those are reference files.
- Document agent-loop rules (no full-suite test runs, `.only` discipline, compose teardown).
- Duplicate ADR rationale.

Verify every getting-started command against `package.json` / `CLAUDE.md` before publishing it. If the happy path and the agent path disagree, show the human path in the README and ask; do not silently pick the harness path.

## Writing rules

- Start with the outcome or task — not generic background.
- Direct, active language. Short paragraphs. Descriptive headings.
- Define a domain term on first use. Use the same names as the UI, CLI, API, and code.
- State prerequisites, limitations, defaults, and failure modes that would block the reader.
- No hype, filler, or “comprehensive / seamless / robust / powerful.”
- Do not paraphrase source into prose. Explain purpose, interfaces, and operational consequences.

## Review-only output

When the user asks for an audit without edits, return:

1. Audience fit and correctness risks (short).
2. Prioritized gaps or inaccuracies, each with repository evidence.
3. Specific edits or a revised draft they can accept.
4. Claims that still need verification.

## Completion checklist

- [ ] Every factual claim traces to repo evidence or is explicitly qualified.
- [ ] Reference files describe the product *now*; stale flags, packages, and pilots are gone or `TODO`.
- [ ] README getting started is a human path with a success criterion (app open, signed in, or equivalent).
- [ ] README does not duplicate the reference index or `CLAUDE.md` harness essay.
- [ ] `docs/delivery/` and ADRs were not rewritten in place.
- [ ] Terminology matches the codebase.
