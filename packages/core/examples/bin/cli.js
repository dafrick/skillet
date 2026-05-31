#!/usr/bin/env node
import { createRequire } from 'node:module';
import { run } from '@skillet/core';

const pkg = createRequire(import.meta.url)('../package.json');
await run({ skillDir: new URL('../skill', import.meta.url).pathname, pkg });
