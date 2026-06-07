# Test Run: netresearch/agent-rules-skill

```
repo: netresearch/agent-rules-skill
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

  Tier: T3 (updated from T1 in matrix — single SKILL.md at `skills/agent-rules/SKILL.md` with nested `assets/`, `scripts/`, `references/`, `evals/` dirs)
  Notes: TEST-MATRIX listed this repo as T1. Actual inspection revealed significant nesting — many shell scripts and reference docs inside the skill dir. Matrix should be corrected.

- [x] **Step 2 — Bootstrap**

  Grade whether the test user was able to set up their environment using only the npm README for `create-skillet`.

  npm README: https://www.npmjs.com/package/create-skillet

  > **Guide note:** The test user does not know the name of the tool — discovering `create-skillet` is part of what Step 2 measures. If they found the npm page via direct search, that is a clean pass. If they arrived via the GitHub repo and used GitHub documentation to complete bootstrap, apply the soft-fail classification only for information they obtained exclusively from GitHub.

  Note any point where the test user consulted the GitHub README or required outside information to proceed.

  Outcome: 🟡 Soft fail — docs gap. Test user read the skill repo's README first (GitHub) but it did not mention `create-skillet`. Discovery happened via `npm search create-skillet` → `npm info create-skillet`, which returned the package cleanly. The repo README advertises several alternative install methods (`npx skills add`, marketplace, composer, etc.) but does not link to the skillet packaging workflow. A user starting from the skill repo alone has no hint that `create-skillet` is the right tool.

- [x] **Step 3 — Run create-skillet**

  Grade how the test user navigated the wizard. Note the prompts shown, the defaults presented, and whether the defaults were sensible.

  Outcome: 🔶 Mid fail — functional issue. `npx create-skillet` crashed immediately on launch with ENOENT: `fonts/ANSI Shadow.flf` not found. The `fonts/` directory was not included in the published npm package. Test user found and applied a workaround (manually download the font into the npx cache dir). After the workaround, the wizard ran to completion. Defaults were mostly sensible: package name, description, author, and repository URL all read from the existing `package.json`. Version defaulted to `0.0.0-source` (not read from package.json — UX issue). Skill content path defaulted to `skill/` which is wrong for this repo (actual path is `skills/agent-rules`); test user had to correct it manually. → ISS-001

- [x] **Step 4 — Verify output**

  Observe what the test user does to verify the output. Note what they look for and whether the tool's own output gave them sufficient guidance — without prompting them.

  Notes: ✅ Pass. The wizard's final output was clear: "Done in 144.7s — Your skill package is ready." with two actionable next steps (`npx . install` and `npm publish`). Test user verified the directory after the wizard, noting `bin/`, `node_modules/`, and updated `package.json` were present. Guidance was sufficient to prompt the install step without additional documentation.

- [x] **Step 5 — Install skill**

  Grade the install step. Note whether the test user found the install path from the available documentation alone.

  Available documentation for this step includes the npm README at https://www.npmjs.com/package/@skillet-cli/core

  Notes: ✅ Pass (with minor noise). `npx . install` was surfaced directly in the wizard's "Next steps" output — no need to consult additional documentation. The install wizard ran correctly and presented clear scope and target selections. One warning appeared: `[skillet] Could not resolve dependency "@skillet-cli/core" from /tmp/agent-rules-skill. Skipping.` — the locally-installed @skillet-cli/core in node_modules was not used; the npx-cached version (0.2.1, newer than the locally installed 0.2.1) ran instead. This is confusing but did not break the flow. Claude Code showed as "(not detected)" in the target list, which is correct for a bare container environment.

- [x] **Step 6 — Verify skill placement**

  Confirm skill files landed in the correct relative path **inside the container**. This step verifies structural correctness — that the packaging and install mechanics worked — not that the skill is active in a real agent environment.

  | Environment | Expected skill install path |
  |---|---|
  | Claude Code | `~/.claude/skills/<skill-name>/` |
  | GitHub Copilot CLI | `~/.config/gh-copilot/skills/<skill-name>/` |
  | Custom agent | Defined by the agent's configuration |

  Actual path observed: `/root/.claude/skills/agent-rules/`
  Match: yes
  
  Files present: `SKILL.md`, `AGENTS.md`, `CLAUDE.md` (symlink to source), `.skill-manifest.json`, `assets/`, `scripts/`, `references/`, `checkpoints.yaml`, `evals/`. All skill content copied correctly from the `skills/agent-rules/` source path.

---

## Soft-Fail Log
<!-- Summarize steps that didn't pass cleanly. Per-step Outcome fields above hold the full notes; this table is a quick-scan overview. -->

| Step | Symbol | Notes |
|------|--------|-------|
| Step 2 — Bootstrap | 🟡 | Skill repo README gives no path to create-skillet; discovery required npm search |
| Step 3 — Run create-skillet | 🔶 | Hard crash (missing font) required manual workaround; wizard otherwise functional after fix |

---

## Issues Filed

- [ISS-001](./issues/ISS-001.md) — create-skillet crashes on launch — missing font file in npm package

---

## UX Quality Observations

**Version default is confusing.** The wizard showed `0.0.0-source` as the version default rather than reading the existing version from `package.json`. For a repo that already has a versioned `package.json`, this is misleading — the user must know to correct it.

**Skill content path default is wrong for non-root layouts.** The default `skill/` doesn't match any real skill in this repo. Since SKILL.md was not found at root, the wizard should either scan recursively or prompt with a clearer explanation. A user unfamiliar with the repo structure would need to explore it to answer this prompt.

**Dependency warning during install is noise.** `[skillet] Could not resolve dependency "@skillet-cli/core" from /tmp/agent-rules-skill. Skipping.` appeared during `npx . install` even though @skillet-cli/core was installed locally. The message is not actionable and could cause confusion about whether the install will succeed.

**Post-wizard guidance is excellent.** "Your skill package is ready. Next steps: npx . install — test locally / npm publish — publish to npm" gave the test user clear, complete, and correct next steps without needing to consult additional documentation.

**Install tip at end is a nice touch.** "Tip: publish your own skill — npm create skillet" was friendly and discoverable.
