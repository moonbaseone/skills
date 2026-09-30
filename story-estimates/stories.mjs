#!/usr/bin/env node
// Everything in the story-estimates skill that does not need a model: find the stories, read their
// status, fingerprint them, merge the rows estimating subagents wrote, and either render the table
// or list the stories that still need an estimate. Zero dependencies; run from the project root.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const USAGE = `usage: node stories.mjs [--stories <file>] [--status <sprint-status.yaml>] [--view remaining|full] [--force <id,id,…>|all]

  --stories  story file; default: the one file in _bmad-output/planning-artifacts/ holding story headings
  --status   status tracker; default: _bmad-output/implementation-artifacts/sprint-status.yaml when present
  --view     remaining = every story not done; full = every story.
             Default: remaining once any story is done, otherwise full
  --force    list these stories as needing an estimate even when their stored row is current`;

const PLANNING_DIR = "_bmad-output/planning-artifacts";
const DEFAULT_STATUS = "_bmad-output/implementation-artifacts/sprint-status.yaml";

/** `### Story 1.3: Title` or `### gh225-03: Title`. Requirement lines such as `FR1:` do not match. */
const STORY_HEADING =
  /^(#{2,6})\s+(?:Story\s+)?(\d+(?:\.\d+)+|[A-Za-z][A-Za-z0-9]*-\d+[A-Za-z0-9-]*)\s*:\s*(.+?)\s*$/;
const ANY_HEADING = /^(#{1,6})\s/;

const COLUMNS = ["#", "Story", "Description", "Complexity", "Files", "+Lines", "−Lines", "Model", "Depends on", "Fingerprint", "Estimated", "Note"];

main();

function main() {
  const args = parseArgs(process.argv.slice(2));
  const storyFile = args.stories ?? findStoryFile();
  const statusFile = args.status ?? (fs.existsSync(DEFAULT_STATUS) ? DEFAULT_STATUS : undefined);

  const stories = readStories(storyFile);
  if (stories.length === 0) fail(`No story headings (\`### Story 1.2: …\` or \`### key-01: …\`) in ${storyFile}.`);

  const status = statusFile ? readStatus(statusFile) : new Map();
  for (const story of stories) story.status = statusOf(story.id, status);

  const storePath = storePathFor(storyFile);
  const rows = mergeParts(storePath, stories);

  const anyDone = stories.some((story) => story.status === "done");
  const view = args.view ?? (anyDone ? "remaining" : "full");
  if (view !== "remaining" && view !== "full") fail(USAGE);
  const shown = view === "full" ? stories : stories.filter((story) => story.status !== "done");

  const forced = new Set((args.force ?? "").split(",").map((id) => id.trim()).filter(Boolean));
  const needed = shown.filter(
    (story) => forced.has("all") || forced.has(story.id) || rows.get(story.id)?.Fingerprint !== story.fingerprint,
  );

  if (needed.length > 0) printNeeded(needed, shown, storyFile, storePath);
  else printTable({ view, shown, stories, rows, storyFile, hasStatus: Boolean(statusFile) });
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === "--help" || !flag.startsWith("--") || value === undefined) fail(USAGE);
    args[flag.slice(2)] = value;
  }
  return args;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

function findStoryFile() {
  if (!fs.existsSync(PLANNING_DIR)) fail(`No ${PLANNING_DIR}/ here; pass --stories <file>.\n\n${USAGE}`);
  const candidates = fs
    .readdirSync(PLANNING_DIR)
    .filter((name) => name.endsWith(".md") && !name.endsWith(".estimates.md") && !name.includes(".estimates.part-"))
    .map((name) => path.join(PLANNING_DIR, name))
    .filter((file) => readStories(file).length > 0);
  if (candidates.length === 1) return candidates[0];
  if (candidates.length === 0) fail(`No story file in ${PLANNING_DIR}/; pass --stories <file>.`);
  fail(`More than one story file; ask the user which, then pass --stories:\n${candidates.map((c) => `- ${c}`).join("\n")}`);
}

/** Each story runs from its heading to the line before the next heading of the same or a higher level. */
function readStories(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const stories = [];
  let current = null;
  const close = (lastLine) => {
    if (!current) return;
    current.end = lastLine;
    const text = lines.slice(current.start - 1, lastLine).join("\n");
    current.fingerprint = createHash("sha256").update(text).digest("hex").slice(0, 8);
    stories.push(current);
    current = null;
  };
  lines.forEach((line, index) => {
    const heading = ANY_HEADING.exec(line);
    if (!heading) return;
    const level = heading[1].length;
    if (current && level <= current.level) close(index);
    const story = STORY_HEADING.exec(line);
    if (story && !current) current = { id: story[2], title: story[3], level, start: index + 1 };
  });
  close(lines.length);
  return stories;
}

/** The `development_status:` block of a BMAD sprint-status.yaml, as key → status. */
function readStatus(file) {
  const status = new Map();
  let inBlock = false;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (/^development_status:\s*$/.test(line)) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^\S/.test(line)) inBlock = false;
    const entry = inBlock && /^\s+([\w.-]+):\s*([\w-]+)/.exec(line);
    if (entry) status.set(entry[1].toLowerCase(), entry[2]);
  }
  return status;
}

/** Story `1.3` is tracked as `1-3-<slug>`; story `gh225-03` as `gh225-03` or `gh225-03-<slug>`. */
function statusOf(id, status) {
  const key = id.toLowerCase().replace(/\./g, "-");
  for (const [trackerKey, value] of status) {
    if (trackerKey === key || trackerKey.startsWith(`${key}-`)) return value;
  }
  return undefined;
}

function storePathFor(storyFile) {
  const base = path.basename(storyFile, ".md");
  return path.join(path.dirname(storyFile), `${base}.estimates.md`);
}

function partPrefixFor(storePath) {
  return path.basename(storePath, ".md") + ".part-";
}

/** Rows keyed by story id, from a markdown table whose header row starts with `#`. */
function readTable(file) {
  const rows = new Map();
  if (!fs.existsSync(file)) return rows;
  const normalize = (cell) => cell.trim().toLowerCase().replace(/[−–]/g, "-");
  let header = null;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    if (!header) {
      if (normalize(cells[0]) === "#") header = cells.map(normalize);
      continue;
    }
    if (/^[\s|:-]+$/.test(line)) continue;
    const row = Object.fromEntries(COLUMNS.map((column) => [column, cells[header.indexOf(normalize(column))] ?? ""]));
    if (row["#"]) rows.set(row["#"], row);
  }
  return rows;
}

/**
 * Folds the part files estimating subagents wrote into the store (a part row replaces the stored row
 * for its story), drops rows for stories that no longer exist, and deletes the parts.
 */
function mergeParts(storePath, stories) {
  const rows = readTable(storePath);
  const dir = path.dirname(storePath);
  const prefix = partPrefixFor(storePath);
  const parts = fs.readdirSync(dir).filter((name) => name.startsWith(prefix) && name.endsWith(".md"));
  if (parts.length === 0) return rows;

  for (const part of parts) {
    for (const [id, row] of readTable(path.join(dir, part))) rows.set(id, row);
  }
  const kept = new Map(stories.filter((story) => rows.has(story.id)).map((story) => [story.id, rows.get(story.id)]));
  writeStore(storePath, kept);
  for (const part of parts) fs.unlinkSync(path.join(dir, part));
  return kept;
}

function writeStore(storePath, rows) {
  const source = path.basename(storePath).replace(/\.estimates\.md$/, ".md");
  const lines = [
    `# Story estimates — ${source}`,
    "",
    "Written by the story-estimates skill; its `stories.mjs` reads and rewrites this file. A row is reused",
    `while its Fingerprint matches the story's section in \`${source}\`; delete a row to have it estimated again.`,
    "",
    `| ${COLUMNS.join(" | ")} |`,
    `|${COLUMNS.map(() => "---").join("|")}|`,
    ...[...rows.values()].map((row) => `| ${COLUMNS.map((column) => cell(row[column])).join(" | ")} |`),
    "",
  ];
  fs.writeFileSync(storePath, lines.join("\n"));
}

function cell(value) {
  return String(value ?? "").replace(/\|/g, "/");
}

function isIgnoredByGit(file) {
  try {
    execFileSync("git", ["check-ignore", "-q", path.basename(file)], { cwd: path.dirname(file), stdio: "ignore" });
    return true;
  } catch (error) {
    // Exit 1 means "not ignored"; anything else (not a repository, no git) means there is nothing to commit it into.
    return error.status !== 1;
  }
}

function printNeeded(needed, shown, storyFile, storePath) {
  const partPath = path.join(path.dirname(storePath), `${partPrefixFor(storePath)}<n>.md`);
  const out = [
    `ESTIMATE NEEDED: ${needed.length} of the ${shown.length} stories in this view.`,
    `Story file: ${storyFile}`,
    `Rows go to: ${partPath} (one file per subagent, n = 1, 2, …)`,
  ];
  if (!isIgnoredByGit(storePath)) {
    out.push(`STORE NOT IGNORED BY GIT: ${storePath} would be committable. Ask the user before estimating.`);
  }
  out.push("", "id\tfingerprint\tlines\ttitle");
  for (const story of needed) out.push(`${story.id}\t${story.fingerprint}\t${story.start}-${story.end}\t${story.title}`);
  process.stdout.write(`${out.join("\n")}\n`);
}

function figure(value) {
  const text = String(value ?? "");
  const digits = text.replace(/[^\d]/g, "");
  return { known: digits.length > 0, n: digits.length > 0 ? Number(digits) : 0, approx: text.includes("~") };
}

function formatFigure({ known, n, approx }, sign) {
  if (!known) return "?";
  return `${approx ? "~" : ""}${sign}${n.toLocaleString("en-US")}`;
}

function points(complexity) {
  const match = /\((\d+)\)/.exec(complexity ?? "");
  return match ? Number(match[1]) : 0;
}

function printTable({ view, shown, stories, rows, storyFile, hasStatus }) {
  const name = path.basename(storyFile);
  if (shown.length === 0) {
    process.stdout.write(`No stories left in \`${name}\` — all ${stories.length} are done.\n`);
    return;
  }

  const intro =
    view === "full"
      ? `All ${stories.length} stories in \`${name}\`.`
      : `Remaining stories in \`${name}\` — ${shown.length} of ${stories.length}.`;
  const out = [hasStatus ? intro : `${intro} No status tracker found, so Status shows —.`, ""];

  out.push(
    "| # | Story | Description | Status | Complexity | Files | +Lines | −Lines | Model | Depends on |",
    "|---|-------|-------------|:------:|:----------:|------:|-------:|-------:|:-----:|------------|",
  );
  const total = { points: 0, files: { known: true, n: 0, approx: false }, added: { known: true, n: 0, approx: false }, deleted: { known: true, n: 0, approx: false } };
  const notes = [];
  for (const story of shown) {
    const row = rows.get(story.id);
    const files = figure(row.Files);
    const added = figure(row["+Lines"]);
    const deleted = figure(row["−Lines"]);
    for (const [key, value] of [["files", files], ["added", added], ["deleted", deleted]]) {
      total[key].n += value.n;
      total[key].approx ||= value.approx || !value.known;
    }
    total.points += points(row.Complexity);
    out.push(
      `| ${[story.id, row.Story, row.Description, story.status ?? "—", row.Complexity, formatFigure(files, ""), formatFigure(added, "+"), formatFigure(deleted, "−"), row.Model, row["Depends on"] || "—"].map(cell).join(" | ")} |`,
    );
    if (row.Note) notes.push(`- ${story.id}: ${row.Note}`);
  }
  out.push(
    `| | **Total** | | | **${total.points}** | **${formatFigure(total.files, "")}** | **${formatFigure(total.added, "+")}** | **${formatFigure(total.deleted, "−")}** | | |`,
  );
  if (notes.length > 0) out.push("", ...notes);
  process.stdout.write(`${out.join("\n")}\n`);
}
