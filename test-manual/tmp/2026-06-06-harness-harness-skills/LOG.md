# Session Log: harness/harness-skills

<!-- Guide pre-fills this block before handing LOG.md to the test user. Test user fills in `tester:` only. -->
```
repo: harness/harness-skills
tier: T5
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

Format examples:

14:32 Ran `npx create-skillet`. Wizard launched. Selected all defaults.
14:35 Output directory present. Inspected contents — structure looked reasonable.
14:38 npm pack failed — "missing main field" error. Tried running from parent directory, same result. → ISS-001
14:42 Added "main" field manually to package.json as a workaround. Continued. → ISS-001 (workaround noted)
14:47 Skill files appeared at ~/.claude/skills/my-skill/. Install seemed to succeed.
14:50 Could not determine where skills should land from the available docs. Stuck on Task 2.

-->

00:02 Started session. Cloned `https://github.com/harness/harness-skills.git`. Inspected structure: 53 skills under `skills/*/`, no root `package.json`, has `AGENTS.md`, `CLAUDE.md`, `README.md`, `examples/`, `references/`, `scripts/`, `templates/` at root. This is a multi-skill repo — reclassifying from T3 to T5.

00:04 Searched npm for a tool to package and publish agent skills. Found `create-skillet` (same discovery path as prior runs — skill repo README gives no pointer to the tool).

00:05 Ran `npx create-skillet`. Crashed immediately with `ENOENT: .../create-skillet/fonts/ANSI Shadow.flf`. Same ISS-001 crash as prior runs. → ISS-001

00:06 Applied ISS-001 workaround: `mkdir -p .../create-skillet/fonts && curl -sL '<figlet-font-url>' -o '.../fonts/ANSI Shadow.flf'`. Workaround confirmed.

00:07 Re-ran `npx create-skillet`. Wizard launched successfully. Header showed `SKILL.md: not found` and `package.json: not found` (expected for a multi-skill repo with no root SKILL.md and no package.json). Accepted "Proceed with setup? Yes".

00:08 Wizard prompted for all fields from scratch (no existing package.json to pre-fill from). Entered: package name `harness-skills` (accepted default), version `0.1.0` (accepted default — cleaner default than the `0.0.0-source` seen when a package.json exists), description `Harness AI agent skills`, author `Harness`. Repository URL pre-filled from git remote as `git+https://github.com/harness/harness-skills` — accepted. License `MIT` — accepted.

00:09 Wizard prompted `Skill content path (relative to package root): (skill/)`. Default `skill/` is wrong — no such directory in this repo, and there is no single skill to point to (53 skills). Multi-skill repos have no valid single-path default. Entered `skills/ai-operations` (first skill alphabetically) to test one skill. **UX issue: wizard offers no multi-skill workflow; a user with 53 skills would need 53 separate runs.**

00:10 Wizard showed summary and ran: `npm init -y` (created package.json; description seeded from README.md by npm init, then overridden by wizard's `npm pkg set`), then `npm install @skillet-cli/core`. Completed in 97.2s. Output: "Done in 97.2s — Your skill package is ready. Next steps: npx . install / npm publish". ✔ Output message clear and actionable.

00:11 Verified `package.json`: all wizard-supplied fields applied correctly (name, version, description, author, license, repository URL, `skillet.skillDir: skills/ai-operations`). `npm init -y` intermediate output was visible during run but final state reflects wizard inputs.

00:12 Ran `npx . install`. Same `Could not resolve dependency "@skillet-cli/core"` warning as prior runs (non-blocking). Install scope prompt: selected `user`. Target selection: wizard showed `Claude Code (not detected)`, `GitHub Copilot (not detected)`, and `Agents (.agents/)` — only `Agents` was pre-selected. Manually selected `Claude Code` and deselected `Agents`.

00:13 Install completed: `✓ Grilled claude /root/.claude/skills/ai-operations`. Verified: `ls ~/.claude/skills/ai-operations/` shows `SKILL.md`. Source `skills/ai-operations/` contains only `SKILL.md` — full match. ✔
