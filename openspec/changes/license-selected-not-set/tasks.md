## 1. Fix the npm init call

- [ ] 1.1 In `packages/create/src/scaffold.ts`, update the `npm init -y` call to pass `--init-license=${config.license}` as an additional argument so the user-selected license is written directly at init time

## 2. Update unit tests

- [ ] 2.1 In `packages/create/test/unit/scaffold.test.ts`, update the `'runs npm init -y when no package.json exists'` test to assert that the `npm init` command string includes `--init-license=MIT` (matching `baseConfig.license`)

## 3. Add regression integration test

- [ ] 3.1 In `packages/create/test/integration/scaffold.test.ts`, add a new test case that calls `executeScaffold` from a fresh directory (no pre-existing `package.json`), then reads the resulting `package.json` and asserts `"license"` equals `"MIT"` — mark with 90 000 ms timeout

## 4. Verify

- [ ] 4.1 Run `pnpm test --filter create` and confirm all unit and integration tests pass, including the new regression test
