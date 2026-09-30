---
name: story-estimates
description: >-
  Render an epic's or initiative's stories as one estimate table — number,
  short label and description, status, complexity with story points, files
  touched and lines added/deleted, recommended implementation model (Sonnet /
  Opus / Fable), and dependencies — for the full list or only what is left.
  A script does the bookkeeping and rendering; Sonnet subagents estimate only
  stories that are new or changed, and estimates are stored for reuse. Use when
  the user asks for a story table, the stories with estimates, what's left, the
  remaining stories, story points, or which model should build each story.
---

# Story estimates

One table that answers, per story: how big is it, how much of the codebase does it touch, and which model should build it. The user reads it to plan the order of work and to pick a model for each implementer session, and asks for it again after most merges.

**Time budget: at most 2 minutes on a first run, 30 seconds when every estimate is stored.** The flow is shaped by that budget:

- `stories.mjs` (in this skill's directory) does everything that needs no model — finding the story file and its status, fingerprinting each story, reusing stored estimates, rendering the table and totals — in one shell call.
- Estimating is the only model work, and it goes to **Sonnet subagents**, in parallel, which write their rows to files. Their replies are one word, so nothing is typed twice.
- You type the table exactly once, as your reply.

So: do not read the story file, the store, or `estimating.md` yourself, and do not rework the script's output.

## 1. Run the script

From the project root, with this skill's directory as `<dir>` (Claude Code shows it as the skill's base directory; installed copies live in `.claude/skills/story-estimates/` or `.cursor/skills/story-estimates/`):

```bash
node <dir>/stories.mjs [--view remaining|full] [--stories <file>] [--force <id,id,…>|all]
```

- `--view`: pass `remaining` for "what's left / remaining / still to do", `full` for "all / the complete list / the whole epic". When the user said neither, omit it: the script shows what is left once any story is done, otherwise all of them.
- `--stories`: only when the user named a file, or the script listed several candidates (ask the user which — one question).
- `--force`: the stories the user asked to have re-estimated (`all` for every one). Estimates are otherwise reused while the story text is unchanged, even if earlier merges moved the code; re-estimating is the user's call.

The script defaults to `_bmad-output/planning-artifacts/` for the story file and `_bmad-output/implementation-artifacts/sprint-status.yaml` for status. Outside a BMAD layout, find the story file and tracker first and pass `--stories` / `--status`.

## 2. If it printed a table, reply with it

When the output starts with `All`, `Remaining`, or `No stories left`, that output **is** your reply: send it verbatim, as your whole message. Done.

## 3. If it printed `ESTIMATE NEEDED`, estimate, then run it again

1. If it printed `STORE NOT IGNORED BY GIT`, ask the user before going on: estimates stored there can end up in a commit.
2. Split the listed stories into consecutive batches of **at most 8** (so 25 stories → 4 batches of 7, 6, 6, 6), part number `n` = 1, 2, ….
3. Launch **one Sonnet subagent per batch, all in a single message** (Agent tool, `model: "sonnet"`, `subagent_type: "general-purpose"`, in the foreground). Each prompt is only:

   ```text
   Read <dir>/estimating.md and follow it exactly.
   Story file: <story file from the output>
   Write your rows to: <the "Rows go to" path, with <n> replaced>
   Today: <YYYY-MM-DD>
   Stories (id, fingerprint, lines, title):
   <that batch's lines from the output, unchanged>
   ```

4. When they are all back, run the script again with the same flags **minus `--force`**. It folds the part files into the store (`<story file>.estimates.md`, beside the story file) and prints the table; reply with it verbatim.

A subagent that reports failure, or a story still listed as needing an estimate on the second run: say which stories and why, then show the table for the rest only if the user asks.

## Looking closer at one story

When the user asks for a closer look ("look closer at 1.5"), run the script with `--force 1.5` to get that story's line, then launch one Sonnet subagent with the same prompt for it, plus one line: `A closer look was asked for: you may open the story's files (at most 5) and read the parts of the spec it cites.` Then run the script again and reply with the table.
