#!/usr/bin/env node
/**
 * Interactive wizard (and non-interactive flags) to copy skills from this repo
 * into a target project's `.cursor/skills/` and/or `.claude/skills/`.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_REPO_ROOT = path.resolve(__dirname, "..");

const EXCLUDED_DIR_NAMES = new Set([
  ".git",
  ".cursor",
  "scripts",
  "node_modules",
]);

const AGENT_TARGETS = {
  cursor: ".cursor/skills",
  claude: ".claude/skills",
};

/** @param {string} message */
function log(message) {
  process.stdout.write(`${message}\n`);
}

/** @param {string} message */
function warn(message) {
  process.stderr.write(`${message}\n`);
}

/**
 * @param {string} question
 * @returns {Promise<string>}
 */
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * @param {string} label
 * @param {string[]} options
 * @returns {Promise<number>}
 */
async function choose(label, options) {
  log("");
  log(label);
  options.forEach((option, index) => {
    log(`  ${index + 1}) ${option}`);
  });

  while (true) {
    const raw = await ask(`Choice [1-${options.length}]: `);
    const choice = Number.parseInt(raw, 10);
    if (Number.isInteger(choice) && choice >= 1 && choice <= options.length) {
      return choice;
    }
    warn(`Enter a number between 1 and ${options.length}.`);
  }
}

/**
 * @param {string} label
 * @param {string[]} options
 * @returns {Promise<number[]>}
 */
async function chooseMany(label, options) {
  log("");
  log(label);
  options.forEach((option, index) => {
    log(`  ${index + 1}) ${option}`);
  });
  log("  a) All listed skills");
  log("");
  log("Enter numbers separated by commas (e.g. 1,3) or 'a' for all:");

  while (true) {
    const raw = (await ask("> ")).toLowerCase();
    if (raw === "a" || raw === "all") {
      return options.map((_, index) => index);
    }

    const parts = raw.split(/[,\s]+/).filter(Boolean);
    const indices = [];
    let valid = parts.length > 0;

    for (const part of parts) {
      const choice = Number.parseInt(part, 10);
      if (!Number.isInteger(choice) || choice < 1 || choice > options.length) {
        valid = false;
        break;
      }
      indices.push(choice - 1);
    }

    if (valid) {
      return [...new Set(indices)].sort((a, b) => a - b);
    }

    warn("Invalid selection. Use comma-separated numbers or 'a'.");
  }
}

/** @returns {string[]} */
function listSkillIds() {
  const entries = fs.readdirSync(SKILLS_REPO_ROOT, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        !EXCLUDED_DIR_NAMES.has(entry.name),
    )
    .map((entry) => entry.name)
    .filter((name) =>
      fs.existsSync(path.join(SKILLS_REPO_ROOT, name, "SKILL.md")),
    )
    .sort();
}

/**
 * @param {string} dir
 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * @param {string} src
 * @param {string} dest
 */
function copySkillDir(src, dest) {
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true, force: true });
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {{
   *   project?: string;
   *   targets: ("cursor"|"claude")[];
   *   skills: string[];
   *   yes: boolean;
   *   dryRun: boolean;
   *   help: boolean;
   *   list: boolean;
   * }} */
  const parsed = {
    targets: [],
    skills: [],
    yes: false,
    dryRun: false,
    help: false,
    list: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--list") {
      parsed.list = true;
      continue;
    }

    if (arg === "--yes" || arg === "-y") {
      parsed.yes = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--project" || arg === "-p") {
      parsed.project = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--targets" || arg === "-t") {
      const value = (argv[i + 1] ?? "").toLowerCase();
      parsed.targets = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }

    if (arg === "--skills" || arg === "-s") {
      const value = (argv[i + 1] ?? "").toLowerCase();
      parsed.skills =
        value === "all"
          ? ["all"]
          : value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
      i += 1;
      continue;
    }

    warn(`Unknown argument: ${arg}`);
    parsed.help = true;
  }

  return parsed;
}

function printHelp() {
  log(`Usage: node scripts/install-skills.mjs [options]

Interactive wizard (default): run with no flags from this repository.

Options:
  -p, --project <path>     Target project root (default: current directory)
  -t, --targets <list>     cursor, claude, or both (comma-separated)
  -s, --skills <list>      all or comma-separated skill ids
  -y, --yes                Skip confirmation prompts
      --dry-run            Show actions without copying
      --list               List available skill ids and exit
  -h, --help               Show this help

Examples:
  node scripts/install-skills.mjs
  node scripts/install-skills.mjs -p ../aquatic-app -t cursor,claude -s all -y
  node scripts/install-skills.mjs -p . -t cursor -s git-commit,log-adr --dry-run
`);
}

/**
 * @param {string} projectRoot
 */
function looksLikeProjectRoot(projectRoot) {
  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    return false;
  }

  const markers = [".git", "package.json", "pnpm-workspace.yaml", "CLAUDE.md"];
  return markers.some((marker) =>
    fs.existsSync(path.join(projectRoot, marker)),
  );
}

/**
 * @param {string} projectRoot
 * @param {("cursor"|"claude")[]} targets
 * @param {string[]} skillIds
 * @param {boolean} dryRun
 */
function installSkills(projectRoot, targets, skillIds, dryRun) {
  /** @type {{ agent: string; skill: string; dest: string }[]} */
  const actions = [];

  for (const target of targets) {
    const baseRel = AGENT_TARGETS[target];
    for (const skillId of skillIds) {
      const src = path.join(SKILLS_REPO_ROOT, skillId);
      const dest = path.join(projectRoot, baseRel, skillId);
      actions.push({ agent: target, skill: skillId, dest });
      if (!dryRun) {
        copySkillDir(src, dest);
      }
    }
  }

  return actions;
}

/**
 * @param {{
 *   project?: string;
 *   targets: ("cursor"|"claude")[];
 *   skills: string[];
 *   yes: boolean;
 *   dryRun: boolean;
 * }} options
 * @param {string[]} availableSkills
 */
async function resolveOptions(options, availableSkills) {
  const resolved = { ...options };

  if (!resolved.project) {
    const defaultProject = process.cwd();
    const isSkillsRepo = path.resolve(defaultProject) === SKILLS_REPO_ROOT;

    if (isSkillsRepo) {
      log("");
      log(
        "Enter the path to your app repository (not this skills repo).",
      );
      resolved.project = await ask("Target project path: ");
      if (!resolved.project) {
        throw new Error("Target project path is required.");
      }
    } else {
      const answer = await ask(
        `Target project path [${defaultProject}]: `,
      );
      resolved.project = answer || defaultProject;
    }
  }

  resolved.project = path.resolve(resolved.project);

  if (!fs.existsSync(resolved.project)) {
    throw new Error(`Project path does not exist: ${resolved.project}`);
  }

  if (path.resolve(resolved.project) === SKILLS_REPO_ROOT) {
    throw new Error(
      "Target project cannot be this skills repository. Choose the app repo that should receive .cursor/skills/ or .claude/skills/.",
    );
  }

  if (!looksLikeProjectRoot(resolved.project)) {
    const confirm = (
      await ask(
        "Path does not look like a project root (.git / package.json / CLAUDE.md). Continue anyway? [y/N]: ",
      )
    ).toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      throw new Error("Aborted.");
    }
  }

  if (resolved.targets.length === 0) {
    const choice = await choose("Install skills for which agent(s)?", [
      "Cursor only (.cursor/skills/)",
      "Claude Code only (.claude/skills/)",
      "Both Cursor and Claude",
    ]);

    resolved.targets =
      choice === 1 ? ["cursor"] : choice === 2 ? ["claude"] : ["cursor", "claude"];
  } else {
    resolved.targets = resolved.targets.filter((target) => {
      if (target in AGENT_TARGETS) {
        return true;
      }
      warn(`Ignoring unknown target: ${target}`);
      return false;
    });
  }

  if (resolved.targets.length === 0) {
    throw new Error("No valid targets selected.");
  }

  /** @type {string[]} */
  let selectedSkills = [];

  if (resolved.skills.length === 0) {
    const choice = await choose("Which skills should be installed?", [
      `All skills (${availableSkills.length})`,
      "Pick skills individually",
    ]);

    if (choice === 1) {
      selectedSkills = [...availableSkills];
    } else {
      const indices = await chooseMany(
        "Select skills to install:",
        availableSkills,
      );
      selectedSkills = indices.map((index) => availableSkills[index]);
    }
  } else if (resolved.skills.includes("all")) {
    selectedSkills = [...availableSkills];
  } else {
    const unknown = resolved.skills.filter(
      (skill) => !availableSkills.includes(skill),
    );
    if (unknown.length > 0) {
      throw new Error(`Unknown skill id(s): ${unknown.join(", ")}`);
    }
    selectedSkills = resolved.skills;
  }

  if (selectedSkills.length === 0) {
    throw new Error("No skills selected.");
  }

  log("");
  log("Plan:");
  log(`  Source repo:  ${SKILLS_REPO_ROOT}`);
  log(`  Project:      ${resolved.project}`);
  log(`  Targets:      ${resolved.targets.join(", ")}`);
  log(`  Skills (${selectedSkills.length}): ${selectedSkills.join(", ")}`);

  for (const target of resolved.targets) {
    log(`  → ${path.join(resolved.project, AGENT_TARGETS[target])}/`);
  }

  if (!resolved.yes) {
    const confirm = (
      await ask("\nProceed with copy/update? [Y/n]: ")
    ).toLowerCase();
    if (confirm === "n" || confirm === "no") {
      throw new Error("Aborted.");
    }
  }

  return {
    project: resolved.project,
    targets: resolved.targets,
    skillIds: selectedSkills,
    dryRun: resolved.dryRun,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const availableSkills = listSkillIds();

  if (availableSkills.length === 0) {
    throw new Error(`No skills found under ${SKILLS_REPO_ROOT}`);
  }

  if (args.list) {
    log("Available skills:");
    for (const skillId of availableSkills) {
      log(`  - ${skillId}`);
    }
    return;
  }

  const isInteractive =
    !args.project &&
    args.targets.length === 0 &&
    args.skills.length === 0 &&
    !args.yes;

  if (isInteractive) {
    log("════════════════════════════════════════════════════════════");
    log("  Agent skills — install / update wizard");
    log("════════════════════════════════════════════════════════════");
    log(`Skills repository: ${SKILLS_REPO_ROOT}`);
    log(`Available skills:  ${availableSkills.length}`);
  }

  const plan = await resolveOptions(args, availableSkills);
  const actions = installSkills(
    plan.project,
    plan.targets,
    plan.skillIds,
    plan.dryRun,
  );

  log("");
  if (plan.dryRun) {
    log("Dry run — no files copied.");
  } else {
    log(`✅ Installed ${plan.skillIds.length} skill(s) to ${plan.project}`);
  }

  for (const action of actions) {
    const prefix = plan.dryRun ? "[dry-run] " : "";
    log(`  ${prefix}${action.agent}: ${action.skill} → ${action.dest}`);
  }

  log("");
  log("Restart Cursor / Claude Code if skills do not appear immediately.");
}

main().catch((error) => {
  warn(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
