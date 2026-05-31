#!/usr/bin/env node
import { createRequire } from 'node:module';
import { run } from '../dist/run.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

await run({ skillDir: new URL('../fixtures/hello-skill', import.meta.url).pathname, pkg });
