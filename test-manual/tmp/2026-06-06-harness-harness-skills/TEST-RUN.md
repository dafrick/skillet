# Test Run: harness/harness-skills

```
repo: harness/harness-skills
tier: T5
env: Claude Code
create-skillet-version: 0.1.1
date: 2026-06-06
tester: Claude Sonnet 4.6 (coding agent)
```

---

## Failure Taxonomy Key

| Symbol | Meaning |
|--------|---------|
| ✅ Pass | Worked correctly using only available documentation; UX clear and defaults sensible |
| 🟡 Soft fail — docs gap | Worked but required consulting the GitHub README beyond the npm README |
| 🟠 Soft fail — UX issue | Worked functionally but UX was confusing, defaults wrong, preview inaccurate, or post-install guidance unclear |
| 🔶 Mid fail — functional issue | Something was wrong functionally (beyond UX or docs), but a workaround allowed the step to complete |
| 🔴 Hard fail | Threw an error, produced wrong output, or could not be completed even with workarounds |
| 🔵 N/A | Test step not applicable to this tier or this repo's structure |

---

> **Issue filing:** File `ISS-NNN.md` in `issues/` as issues arise during the session — do not wait until the end. Reference each in `LOG.md` (e.g., `→ ISS-001`).

---

## Happy-Path Protocol

- [x] **Step 1 — Confirm tier**

  Confirm the tier you identified during pre-session setup. Update if your assessment changes after inspecting the repo or the output of `create-skillet`.

  Tier: T5 (upgraded from T3 in matrix — 53 individual skills under `skills/*/`, each with its own `SKILL.md`; root-level `scripts/`, `references/`, `templates/`, `examples/`, `sboms/`; no root `package.json`; individual skills are T1 in isolation but the repo as a whole is multi-skill with shared root infrastructure)
  Notes: Matrix tier was T3 ("single skill + nested resources/scripts") but the repo is a multi-skill collection. T5 is the correct classification. Matrix should be corrected.

- [x] **Step 2 — Bootstrap**

  Grade whether the test user was able to set up their environment using only the npm README for `create-skillet`.

  npm README: https://www.npmjs.com/package/create-skillet

  > **Guide note:** The test user does not know the name of the tool — discovering `create-skillet` is part of what Step 2 measures. If they found the npm page via direct search, that is a clean pass. If they arrived via the GitHub repo and used GitHub documentation to complete bootstrap, apply the soft-fail classification only for information they obtained exclusively from GitHub.

  Note any point where the test user consulted the GitHub README or required outside information to proceed.

  Outcome: 🟡 Soft fail — docs gap. Harness skills repo README does not reference `create-skillet`. Discovery required npm search (same pattern as prior two runs). Consistent across all tested repos.

- [x] **Step 3 — Run create-skillet**

  Grade how the test user navigated the wizard. Note the prompts shown, the defaults presented, and whether the defaults were sensible.

  Outcome: 🔶 Mid fail — functional issue. ISS-001 font crash reproduced (third consecutive run). Workaround applied. After workaround, new behavior observed vs. prior runs:

  - **No package.json**: Wizard showed `SKILL.md: not found` and `package.json: not found`. All fields prompted from scratch — no pre-fill.
  - **Version default `0.1.0`**: Cleaner than `0.0.0-source` seen when package.json exists. ✅
  - **Repository URL auto-detected** from git remote: `git+https://github.com/harness/harness-skills`. ✅
  - **Skill content path default `skill/`**: Wrong for all repos tested. For this repo there is no single correct path — wizard has no multi-skill awareness. Test user must choose one of 53 skills to package per run. → ISS-002

  Chose `skills/ai-operations` (first skill alphabetically) to complete the test. Wizard ran `npm init -y` then `npm pkg set` to update fields. Package build took 97.2s.

- [x] **Step 4 — Verify output**

  Observe what the test user does to verify the output. Note what they look for and whether the tool's own output gave them sufficient guidance — without prompting them.

  Notes: ✅ Pass. Wizard output "Done in 97.2s — Your skill package is ready." with `npx . install` / `npm publish` next steps. Clear and sufficient to drive the next step. Verified `package.json` was generated with correct fields (name, version, description, author, license, repository URL, `skillet.skillDir`). `node_modules/` and `bin/` present.

- [x] **Step 5 — Install skill**

  Grade the install step. Note whether the test user found the install path from the available documentation alone.

  Available documentation for this step includes the npm README at https://www.npmjs.com/package/@skillet-cli/core

  Notes: 🟠 Soft fail — UX issue. `npx . install` command surfaced directly from wizard output — discoverable. Install ran. Two UX issues observed:

  1. `Could not resolve dependency "@skillet-cli/core"` warning fired again (same as prior runs) — confusing but non-blocking.
  2. **Target selection prompt defaulted to `Agents (.agents/)` pre-selected, not Claude Code.** The test user had to manually select `Claude Code` and deselect `Agents`. For a test user targeting Claude Code, this default is wrong. This is new observation — prior runs did not have this target-selection step recorded in this level of detail.

- [x] **Step 6 — Verify skill placement**

  Confirm skill files landed in the correct relative path **inside the container**. This step verifies structural correctness — that the packaging and install mechanics worked — not that the skill is active in a real agent environment.

  | Environment | Expected skill install path |
  |---|---|
  | Claude Code | `~/.claude/skills/<skill-name>/` |
  | GitHub Copilot CLI | `~/.config/gh-copilot/skills/<skill-name>/` |
  | Custom agent | Defined by the agent's configuration |

  Actual path observed: `/root/.claude/skills/ai-operations/`
  Match: yes

  Files present: `SKILL.md`. Source `skills/ai-operations/` contains only `SKILL.md` — complete match. Install path derived from the `skillDir` name (`ai-operations`), not the package name (`harness-skills`).

---

## Soft-Fail Log

| Step | Symbol | Notes |
|------|--------|-------|
| Step 2 — Bootstrap | 🟡 | Repo README gives no path to create-skillet; npm search required (consistent with prior runs) |
| Step 3 — Run create-skillet | 🔶 | ISS-001 font crash (third consecutive); workaround applied; wizard otherwise functional; multi-skill gap → ISS-002 |
| Step 5 — Install skill | 🟠 | Target selection defaulted to Agents, not Claude Code; test user had to manually switch |

---

## Issues Filed

- [ISS-001](../2026-06-06-netresearch-agent-rules-skill/issues/ISS-001.md) — create-skillet crashes on launch; missing font file in npm package (reproduced for third time)
- [ISS-002](./issues/ISS-002.md) — No multi-skill workflow: wizard packages one skill per run; no path for repos with multiple skills

---

## UX Quality Observations

**Multi-skill repos are a first-class gap.** The wizard has no awareness of multi-skill repos. No skill discovery, no selection menu, no guidance. A user with 53 skills needs 53 separate `create-skillet` runs with a different `skillDir` each time. There is no way to package all skills into one npm package or batch them.

**ISS-001 reproduced for third consecutive run.** The font crash is universal — it occurs on every fresh container regardless of repo. Not repo-specific.

**No package.json path is actually smoother for some fields.** Version defaults to `0.1.0` (clean) instead of `0.0.0-source` (confusing). The wizard's from-scratch flow is coherent; the fields make sense in sequence.

**Repository URL auto-detection from git remote works.** Even without a package.json, the wizard correctly read the git remote and pre-filled the URL. ✅

**Install target defaults to `Agents (.agents/)`, not to the environment specified by the user.** For a Claude Code user, Claude Code should be pre-selected (or auto-detected). The "not detected" label is accurate but the default selection is wrong.

**Install path uses skillDir name, not package name.** Skill installed to `~/.claude/skills/ai-operations/` (from `skillDir: skills/ai-operations`) not `~/.claude/skills/harness-skills/`. This is correct behavior — skill name, not package name, drives the install path — but could surprise users who expect the package name to be used.
