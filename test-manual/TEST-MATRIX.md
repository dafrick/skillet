# Test Matrix

> **Before starting a run:** Consult this matrix to identify coverage gaps. Prioritize untested tiers and environments — the Status column and Test Run Log show where coverage is thin.
>
> **After completing a run:** Update the Status column with the date and brief outcome, e.g. `2026-06-06 pass` or `2026-06-06 fail — hard fail step 3`. The Test Run Log below is the authoritative record; the Status column is a quick-scan view.

## Candidate Repos

| Tier | Repo | Complexity Notes | Status |
|------|------|-----------------|--------|
| T3 | `netresearch/agent-rules-skill` | Single SKILL.md + nested assets/scripts/references (reclassified from T1) | 2026-06-06 mid-fail step 3 (missing font in npm package; workaround applied; install succeeded) |
| T3 | `netresearch/skill-repo-skill` | Single SKILL.md + nested references/scripts/templates (reclassified from T2) | 2026-06-06 mid-fail step 3 (same font crash as prior run; workaround applied; install succeeded) |
| T5 | `harness/harness-skills` | 53 skills under skills/*/, no root package.json, shared root resources/scripts/templates (reclassified from T3) | 2026-06-06 mid-fail step 3 (ISS-001 font crash, workaround applied) + soft-fail step 5 (wrong default target); ISS-002 filed (no multi-skill workflow); step 6 passed for single skill |
| T4 | `addyosmani/agent-skills` | Multiple SKILL.md files in subdirs | Untested |
| T5 | `obra/superpowers` | Multi-skill with scripts, templates, deep nesting | Untested |

## Test Run Log

| Date | Repo | Tier | Env | Outcome | Run Folder |
|------|------|------|-----|---------|------------|
| 2026-06-06 | `netresearch/agent-rules-skill` | T3 | Claude Code | mid-fail step 3 — missing font in npm package; workaround applied; steps 4–6 passed | `tmp/2026-06-06-netresearch-agent-rules-skill` |
| 2026-06-06 | `netresearch/skill-repo-skill` | T3 | Claude Code | mid-fail step 3 — same font crash (ISS-001 reproduced); workaround applied; steps 4–6 passed | `tmp/2026-06-06-netresearch-skill-repo-skill` |
| 2026-06-06 | `harness/harness-skills` | T5 | Claude Code | mid-fail step 3 (ISS-001 third occurrence); soft-fail step 5 (wrong default install target); ISS-002 filed (no multi-skill workflow); step 6 passed for one skill | `tmp/2026-06-06-harness-harness-skills` |
