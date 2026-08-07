# Agent skills

Shared **Cursor** and **Claude Code** skills for multiple repositories. Each skill lives in a directory named by its id (e.g. `git-commit/SKILL.md`).

## Skills

| Skill id | When to use |
|----------|-------------|
| **`git-commit`** | Stage changes, write commit messages, create **local** commits |
| **`git-push`** | Push commits to `origin`, set upstream, sync a branch (no PR authoring) |
| **`git-pr`** | Create/list/view **pull requests** (e.g. `gh pr create`), title/body confirmation |
| **`log-adr`** | Capture major technical decisions from chat; interactive **APPROVE/ALTER/SKIP/OTHER**; write `docs/adr/NNNN-title.md` and update `docs/adr/index.md` |
| **`bmad-archive-history`** | Archive gitignored `_bmad-output/` into `docs/delivery/` at milestones; Option B routing (`docs/planning-artifacts/` = pre-epic spikes only); conflict-minimal workstream folders |
| **`manual-review`** | Paired human–AI walkthrough of AI-generated code in gated, bite-size chunks; complements automated review (e.g. `bmad-code-review`); writes a review record to `docs/reviews/` |

**Routing:** Point agents (or a Cursor rule) so “commit / stage / message” loads **`git-commit`**, “push / publish branch” loads **`git-push`**, “open a PR / review request” loads **`git-pr`**, “ADR / decision log / record architecture decision” loads **`log-adr`**, “archive BMAD history / snapshot epic / publish delivery history” loads **`bmad-archive-history`**, “manual review / walk me through the code / paired review” loads **`manual-review`**.

## Layout (this repository)

```text
README.md
git-commit/
  SKILL.md
git-push/
  SKILL.md
git-pr/
  SKILL.md
log-adr/
  SKILL.md
  templates/
    adr-template.md
bmad-archive-history/
  SKILL.md
  templates/
    delivery-readme.md
    epic-summary.md
    journal-entry.md
    workstream-readme.md
manual-review/
  SKILL.md
  templates/
    session-state.md
```

Add more skills by adding sibling folders with their own `SKILL.md` and YAML frontmatter (`name`, `description`).

```text
scripts/
  install-skills.mjs    # Interactive wizard + non-interactive flags
package.json            # pnpm run install-skills
```

## Install / update skills in a project

From **this repository**, run the interactive wizard:

```bash
cd /path/to/skills
pnpm run install-skills
# or: node scripts/install-skills.mjs
```

The wizard asks for:

1. **Target project path** (default: current directory)
2. **Agent(s)** — Cursor (`.cursor/skills/`), Claude Code (`.claude/skills/`), or both
3. **Skills** — all skills, or pick individually
4. **Confirmation** before copy

Existing skill folders in the target are **overwritten** (update in place).

### Non-interactive (CI / scripts)

```bash
node scripts/install-skills.mjs \
  --project /path/to/aquatic-app \
  --targets cursor,claude \
  --skills all \
  --yes
```

| Flag | Description |
|------|-------------|
| `-p, --project <path>` | Target project root |
| `-t, --targets <list>` | `cursor`, `claude`, or comma-separated both |
| `-s, --skills <list>` | `all` or comma-separated skill ids |
| `-y, --yes` | Skip confirmation |
| `--dry-run` | Print plan without copying |
| `--list` | List available skill ids |
| `-h, --help` | Usage |

List skill ids:

```bash
pnpm run list-skills
```

**Requirements:** Node.js 18+ (uses built-in `fs.cpSync` — no npm dependencies).

### Destination layout (target project)

| Agent | Path |
|-------|------|
| Cursor | `.cursor/skills/<skill-id>/` |
| Claude Code | `.claude/skills/<skill-id>/` |

Restart Cursor / Claude Code after install if skills do not appear immediately.

## How consuming projects install these skills

**Recommended:** run **`pnpm run install-skills`** from a clone of this repo (see above).

**Optional future integration:** the **`solution-template`** CLI may wrap the same script (clone/fetch this repo, then invoke `install-skills.mjs`).

1. **Install / update** — Copy skill folders into the project:
   - `git-commit/` → `.cursor/skills/git-commit/` and/or `.claude/skills/git-commit/`
   - Same for `git-push`, `git-pr`, `log-adr`, `bmad-archive-history`, …

   The project **does not** keep a submodule of this repo; what you commit (or generate locally) are the **copies** under `.cursor/skills/` and `.claude/skills/`.

2. **Tracking policy** (per project) — Either **commit** the copied `SKILL.md` files so everyone shares the same revision, or **gitignore** them and rely on each developer running install/update (document the choice in the app repo).

## Manual install (without the script)

Clone this repo, then copy each `<skillId>/` directory into `.cursor/skills/<skillId>/` and/or `.claude/skills/<skillId>/`. Prefer **`install-skills.mjs`** — it discovers skills automatically and supports both agents.

## Versioning

- Default source for the CLI is typically **`main`** on GitHub; tags or pinned SHAs may be added later for reproducible installs.
- Projects that **commit** copied skills can see upgrades as normal file diffs when someone runs **update skills** and commits.

## License

Add a license file to this repository when you publish it; consuming projects should respect its terms.
