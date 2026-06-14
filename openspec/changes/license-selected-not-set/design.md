## Context

`executeScaffold` in `packages/create/src/scaffold.ts` uses a two-step approach:

1. `npm init -y` — creates `package.json` with `"license": "ISC"` (npm's hardcoded default).
2. `npm pkg set license=MIT` (among other fields) — intended to overwrite ISC.

Step 2 should overwrite the license, but the wizard currently presents MIT as the default and runs the `npm pkg set` call unconditionally. In practice the field is overwritten in most environments, but the root issue is architectural: ISC is written first and then corrected. Any failure, truncation, or quoting issue in the `npm pkg set` call leaves ISC in place.

`npm init` supports `--init-license=<value>` (and its alias `--init-license`) which writes the license directly into the generated `package.json` at creation time, avoiding the ISC-then-overwrite race entirely.

The existing integration test (`test/integration/scaffold.test.ts`) skips `npm init` by pre-seeding a `package.json` and only verifies `bin/cli.js` content — it never checks what the `license` field in `package.json` ends up being after a full scaffold run.

## Goals / Non-Goals

**Goals:**
- Ensure the user-selected license is written to `package.json` at `npm init` time via `--init-license`, making the ISC default unreachable.
- Add a regression test that actually reads the `license` field from `package.json` after `executeScaffold` completes from a fresh state (no pre-existing `package.json`).
- Update the unit test that checks the `npm init` command string to expect `--init-license=MIT`.

**Non-Goals:**
- Removing the `license=${config.license}` entry from `pkgSetArgs` (belt-and-suspenders is fine).
- Changing the license prompt from `input` to a `select` dropdown.
- Fixing `runSync`'s shell quoting more broadly.
- Reading `license` from an existing `package.json` in `detect.ts`.
- Any changes to `packages/core/package.json`.
- Spec updates to `skilletize-wizard/spec.md` beyond a delta tightening the license field value requirement.

## Decisions

### Decision: Pass `--init-license` to `npm init -y` rather than relying solely on `npm pkg set`

`npm init -y` accepts `--init-license=<value>` as a CLI flag. Passing it means the generated `package.json` starts with `"license": "MIT"` (or whatever the user selected), so `npm pkg set license=MIT` becomes a no-op redundancy rather than the sole mechanism of correctness.

**Alternative considered:** Remove the `npm init -y` step and write `package.json` directly via `fs.writeFile` with all fields pre-populated. Rejected — the existing spec explicitly requires using `npm init -y` and `npm pkg set` as the mechanism; direct file writes are out of scope.

**Alternative considered:** Fix `runSync` shell quoting to guarantee the `npm pkg set` call always succeeds. Rejected — that's a broader change with more surface area, and the `--init-license` flag is a simpler, more targeted fix at the source.

### Decision: Regression test runs from a fresh directory (no pre-existing `package.json`)

The existing integration tests pre-seed a `package.json` to skip `npm init`. The regression test must NOT pre-seed one — it needs `npm init -y --init-license=MIT` to run and then verifies the resulting `package.json` has `"license": "MIT"`. This is the only way to catch a regression in the flag.

### Decision: Update unit test for npm init command string

The unit test `'runs npm init -y when no package.json exists'` asserts the presence of an `init` call but does not check for `--init-license`. After the fix, add an assertion that the command string includes `--init-license=MIT` (or the configured license value) to prevent future regressions at the command-construction level.

## Risks / Trade-offs

- `--init-license` flag availability: Supported since npm 6. All supported Node.js ≥24 environments ship npm ≥10, so this is safe.
- The regression test runs real `npm` commands and will be slow (~30–60 s). Mark with a 90 000 ms timeout, consistent with existing integration tests.
