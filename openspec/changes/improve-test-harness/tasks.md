## 1. Makefile — container setup

- [ ] 1.1 Add `git` to the `apt-get install` block in the `test-start` target alongside Node 24
- [ ] 1.2 Add `prep-run` target: derive slug from `REPO_URL` last path component, run `docker exec $(CONTAINER) git clone $(REPO_URL) /repo/<slug>`, error with usage message if `REPO_URL` is unset

## 2. TASK.md template — pre-cloned repo

- [ ] 2.1 Add a "What You Have Access To" note in `TASK.md.template` stating that the repository has been pre-cloned and giving the path inside the container (`/repo/<slug>`, where `<slug>` matches the repo name)
- [ ] 2.2 Remove any implication that the test user needs to clone the repo themselves

## 3. LOG.md template — comment structure

- [ ] 3.1 Restructure `LOG.md.template` so the format-examples block is in a self-contained `<!-- ... -->` comment that is fully closed before the append region (`<!-- Append entries below. -->` marker)
- [ ] 3.2 Verify that the append region is outside any HTML comment by checking that a line appended immediately after the marker renders as visible Markdown

## 4. AGENT-SUPPLEMENT.md — script path

- [ ] 4.1 Replace `./scripts/wait-for-text.sh` with the absolute-path resolution pattern: `$(git rev-parse --show-toplevel)/test-manual/scripts/wait-for-text.sh`
- [ ] 4.2 Add a brief explanation: the relative path fails when the agent's working directory is not `test-manual/`; agents should always resolve from the repo root

## 5. README — checklist and role separation

- [ ] 5.1 Update "Before You Start" step 3 (tier inspection) to use mandatory language: "Re-inspect the repo and confirm the tier matches the matrix entry. Correct the matrix entry if it is wrong before proceeding."
- [ ] 5.2 Add a new "Before You Start" step after `make test-start`: "Run `make prep-run REPO_URL=<url>` to clone the repository into the container."
- [ ] 5.3 Add a section in the session flow for coding-agent test users explaining that the test user must be dispatched as an isolated sub-agent (fresh invocation, only TASK.md + LOG.md + AGENT-SUPPLEMENT.md in context), with the reason: prior-run context leaks workaround knowledge and softens failure grades

## 6. Spec update

- [ ] 6.1 Run `openspec apply` to merge the delta spec (`specs/manual-test-harness/spec.md`) into `openspec/specs/manual-test-harness/spec.md`
- [ ] 6.2 Run `openspec apply` to add the new capability spec (`specs/harness-prep-run/spec.md`) to `openspec/specs/harness-prep-run/spec.md`
