# Session Log: netresearch/agent-rules-skill

<!-- Guide pre-fills this block before handing LOG.md to the test user. Test user fills in `tester:` only. -->
```
repo: netresearch/agent-rules-skill
tier: T3
env: Claude Code
create-skillet-version: 0.1.1
date: 2026-06-06
tester: Claude Sonnet 4.6 (coding agent)
docker-image: ubuntu:24.04
```

---

**This is your running log.** Record what you do and observe as you work, prefixed with `HH:MM`. This file is append-only — never edit or delete prior entries. If you need to correct something, add a new entry noting the correction.

---

<!-- Append entries below.

23:30 Read repo README at https://github.com/netresearch/agent-rules-skill. Mentions `npx skills add`, marketplace install, download, git clone, composer, and npm install methods — no mention of create-skillet or a packaging workflow. Searched npm: `npm search create-skillet` returned `@skillet-cli/core` as top result. Ran `npm info create-skillet` and found the create-skillet package (v0.1.1, "Interactive wizard to package a skill for any AI agent"). Confirmed this is the packaging tool for Task 1.

23:31 Attempted to clone repo: `git clone https://github.com/netresearch/agent-rules-skill.git /tmp/agent-rules-skill`. Failed — git not installed in container. Installed with `apt-get install -y git`. Clone succeeded.

23:33 Ran `npx create-skillet` from `/tmp/agent-rules-skill`. Confirmed install prompt. Crashed immediately with ENOENT: `fonts/ANSI Shadow.flf` not found inside the npx-installed package. Package directory contains only `LICENSE`, `README.md`, `bin`, `dist`, `package.json` — no `fonts/` directory. → ISS-001

23:34 Workaround: `mkdir -p <npx-cache>/create-skillet/fonts && curl -sL '<figlet-font-url>' -o '<npx-cache>/create-skillet/fonts/ANSI Shadow.flf'`. Font placed. Retried `npx create-skillet`. → ISS-001 (workaround applied)

23:35 Wizard launched after workaround. Banner rendered correctly. Pre-flight summary showed: `SKILL.md: not found`, `package.json: found`, `Git user: (not detected)`. Proceeded.

23:36 Wizard prompts and accepted defaults: package name `@netresearch/agent-rules-skill` (from existing package.json), version `0.0.0-source` (unusual default — not read from package.json), description and author from package.json, repository URL from package.json, license MIT. For skill content path, default was `skill/` — incorrect for this repo. Corrected to `skills/agent-rules`.

23:37 Wizard summary shown. Confirmed. Wizard ran `npm pkg set` and `npm install @skillet-cli/core`. Completed in ~145s. Output: "Your skill package is ready. Next steps: npx . install / npm publish". Clear guidance.

23:38 Verified output: `bin/`, `node_modules/`, updated `package.json` all present in repo dir.

23:38 Ran `npx . install`. Warning appeared: `[skillet] Could not resolve dependency "@skillet-cli/core" from /tmp/agent-rules-skill. Skipping.` Install wizard launched anyway (using npx-cached version of @skillet-cli/core v0.2.1). Selected "user" scope. Selected "Claude Code" as target.

23:39 Install succeeded: `✓ Baked claude /root/.claude/skills/agent-rules`. Tip shown: `publish your own skill — npm create skillet`.

23:39 Verified placement: `ls -la /root/.claude/skills/agent-rules/`. All files present: SKILL.md, AGENTS.md, CLAUDE.md (symlink), assets/, scripts/, references/, checkpoints.yaml, evals/, .skill-manifest.json. Correct path.

Format examples:

14:32 Ran `npx create-skillet`. Wizard launched. Selected all defaults.
14:35 Output directory present. Inspected contents — structure looked reasonable.
14:38 npm pack failed — "missing main field" error. Tried running from parent directory, same result. → ISS-001
14:42 Added "main" field manually to package.json as a workaround. Continued. → ISS-001 (workaround noted)
14:47 Skill files appeared at ~/.claude/skills/my-skill/. Install seemed to succeed.
14:50 Could not determine where skills should land from the available docs. Stuck on Task 2.

-->
