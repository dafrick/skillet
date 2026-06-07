# Test Run: netresearch/skill-repo-skill

```
repo: netresearch/skill-repo-skill
tier: T3
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

  Tier: T3 (updated from T2 in matrix — single SKILL.md at `skills/skill-repo/SKILL.md` with nested `references/`, `scripts/`, `templates/`, and `evals/` dirs; `templates/` contains a `.github/workflows/` subdir)
  Notes: Matrix should be corrected. This is at minimum T3; the templates subtree adds depth comparable to T5 but the single-skill constraint keeps it at T3.

- [ ] **Step 2 — Bootstrap**

  Grade whether the test user was able to set up their environment using only the npm README for `create-skillet`.

  npm README: https://www.npmjs.com/package/create-skillet

  > **Guide note:** The test user does not know the name of the tool — discovering `create-skillet` is part of what Step 2 measures. If they found the npm page via direct search, that is a clean pass. If they arrived via the GitHub repo and used GitHub documentation to complete bootstrap, apply the soft-fail classification only for information they obtained exclusively from GitHub.

  Note any point where the test user consulted the GitHub README or required outside information to proceed.

  Outcome: 🟡 Soft fail — docs gap. Skill repo README does not reference create-skillet. Discovery required npm search (same path as prior run on netresearch/agent-rules-skill). Pattern is consistent across netresearch repos.

- [x] **Step 3 — Run create-skillet**

  Grade how the test user navigated the wizard. Note the prompts shown, the defaults presented, and whether the defaults were sensible.

  Outcome: 🔶 Mid fail — functional issue. Same ISS-001 crash on launch (missing font file). Workaround applied. After workaround, wizard ran identically to prior run: package name, description, author, repo URL, and license all read correctly from existing `package.json`. Version defaulted to `0.0.0-source` again (UX issue). Skill content path defaulted to `skill/` — corrected to `skills/skill-repo`.

- [x] **Step 4 — Verify output**

  Observe what the test user does to verify the output. Note what they look for and whether the tool's own output gave them sufficient guidance — without prompting them.

  Notes: ✅ Pass. Same clear "Done in 69.0s — Your skill package is ready." message with `npx . install` / `npm publish` next steps. Output sufficient to drive the install step.

- [x] **Step 5 — Install skill**

  Grade the install step. Note whether the test user found the install path from the available documentation alone.

  Available documentation for this step includes the npm README at https://www.npmjs.com/package/@skillet-cli/core

  Notes: ✅ Pass. `npx . install` surfaced directly in wizard output. Same dependency warning (`Could not resolve @skillet-cli/core`). Install completed cleanly.

- [x] **Step 6 — Verify skill placement**

  Confirm skill files landed in the correct relative path **inside the container**. This step verifies structural correctness — that the packaging and install mechanics worked — not that the skill is active in a real agent environment.

  | Environment | Expected skill install path |
  |---|---|
  | Claude Code | `~/.claude/skills/<skill-name>/` |
  | GitHub Copilot CLI | `~/.config/gh-copilot/skills/<skill-name>/` |
  | Custom agent | Defined by the agent's configuration |

  Actual path observed: `/root/.claude/skills/skill-repo/`
  Match: yes
  
  Files present: `SKILL.md`, `checkpoints.yaml`, `evals/`, `references/`, `scripts/`, `templates/`. All content from `skills/skill-repo/` copied correctly including nested template subtree.

---

## Soft-Fail Log

| Step | Symbol | Notes |
|------|--------|-------|
| Step 2 — Bootstrap | 🟡 | Skill repo README gives no path to create-skillet; npm search required |
| Step 3 — Run create-skillet | 🔶 | Same ISS-001 font crash; workaround applied; wizard otherwise identical to prior run |

---

## Issues Filed

No new issues. ISS-001 from the prior run (`netresearch/agent-rules-skill`) is confirmed reproducible on a fresh container — same crash, same path, same workaround. No additional issue filed; already tracked.

---

## UX Quality Observations

**ISS-001 fully reproduced.** The font crash happens on every fresh container with every repo. This is not repo-specific.

**`templates/` subtree copied correctly.** The nested `templates/.github/workflows/` structure (3 levels deep) was packaged and installed without issue. Skillet handled it cleanly.

**No AGENTS.md / CLAUDE.md in this skill.** Unlike the prior run, there was no symlink created — the skill only has `SKILL.md`. Install completed without error, suggesting the tool handles the absence of AGENTS.md gracefully.
