## Why

When `npm create skillet` runs the wizard, the user selects MIT as the license (the presented default), but the generated `package.json` ends up with `"license": "ISC"` — npm's own built-in default from `npm init -y`. The wizard never actually overwrites it reliably. This breaks the promise shown in the NPM preview screen and violates user expectations set by the wizard prompts.

## What Changes

- Pass `--init-license=${config.license}` to the `npm init -y` call in `executeScaffold` so the user-selected license is written from the start, before any `npm pkg set` runs.
- Add an integration test assertion that verifies the final `package.json` contains `"license": "MIT"` after `executeScaffold` completes.

## Capabilities

### New Capabilities

_(none — this is a bug fix, no new user-facing capability is introduced)_

### Modified Capabilities

- `skilletize-wizard`: The "All required fields are set" scenario already mandates `license` in the final `package.json`. The requirement is not changing, but the implementation must actually honor the user-selected license value. A delta spec is needed to tighten the scenario wording so it explicitly requires the selected license value to appear in `package.json` — not any default.

## Impact

- `packages/create/src/scaffold.ts` — the `npm init` invocation gains `--init-license` flag
- `packages/create/test/integration/scaffold.test.ts` — new assertion on `package.json` `license` field
- `packages/create/test/unit/scaffold.test.ts` — unit test snapshot for the `npm init` command string must be updated to include `--init-license=MIT`
