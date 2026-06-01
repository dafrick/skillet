/**
 * Integration tests for collision message improvements.
 * Tasks 3.9–3.12: version-skew message and cross-package name collision message.
 */
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registry } from '../../src/adapters/index.js';
import { performInstall } from '../../src/install.js';
import { normalizeSkill } from '../../src/normalize.js';
import type { Scope } from '../../src/types.js';
import type { Sandbox } from './helpers/sandbox.js';
import { createSandbox } from './helpers/sandbox.js';

const ADAPTER_ID = 'claude';
const SCOPE: Scope = 'user';

/** Create a minimal skill dir in tmpDir with given content */
async function createTempSkill(
  tmpDir: string,
  name: string,
  description: string,
  body: string,
): Promise<string> {
  const dir = path.join(tmpDir, name);
  await fs.mkdir(dir, { recursive: true });
  const skillMd = `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}\n`;
  await fs.writeFile(path.join(dir, 'SKILL.md'), skillMd, 'utf8');
  return dir;
}

describe('collision messages', () => {
  let sandbox: Sandbox;
  let skillTmpDir: string;

  beforeEach(async () => {
    sandbox = await createSandbox();
    skillTmpDir = await fs.realpath(
      await fs.mkdtemp(path.join(os.tmpdir(), 'skillet-collision-test-')),
    );
  });

  afterEach(async () => {
    await sandbox[Symbol.asyncDispose]();
    await fs.rm(skillTmpDir, { recursive: true, force: true });
  });

  describe('3.11 / 3.9: version-skew collision message', () => {
    it('emits a warning naming both versions and both requestor roots when same source package installs different content', async () => {
      const adapter = registry.get(ADAPTER_ID)!;

      // Install v1 from superpowers-base@1.0.0 with requestorRoot travel-planner
      const skillV1Dir = await createTempSkill(
        skillTmpDir,
        'base-skill-v1',
        'Base Skill',
        'v1 content here',
      );
      const skillV1 = await normalizeSkill(skillV1Dir);

      await performInstall(skillV1, adapter, SCOPE, {
        pkg: { name: 'superpowers-base', version: '1.0.0' },
        requestorRoot: 'travel-planner',
      });

      // Create v2 content (simulating superpowers-base@2.0.0 with different content)
      const skillV2Dir = await createTempSkill(
        skillTmpDir,
        'base-skill-v2',
        'Base Skill',
        'v2 updated content different',
      );
      // Same skill name so it maps to same install path
      const skillV2Raw = await normalizeSkill(skillV2Dir);
      const skillV2 = { ...skillV2Raw, name: skillV1.name };

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await performInstall(skillV2, adapter, SCOPE, {
          pkg: { name: 'superpowers-base', version: '2.0.0' },
          requestorRoot: 'recipe-planner',
        });

        // Should have emitted a version-skew warning
        const warnCalls = warnSpy.mock.calls.map((c) => c.join(' '));
        const versionSkewWarning = warnCalls.find(
          (msg) => msg.includes('1.0.0') && msg.includes('2.0.0'),
        );
        expect(versionSkewWarning).toBeDefined();
        // Should name both requestor roots
        expect(versionSkewWarning).toContain('travel-planner');
        expect(versionSkewWarning).toContain('recipe-planner');
        // Should name the shared skill
        expect(versionSkewWarning).toContain(skillV1.name);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('does NOT emit version-skew warning when same version is installed again', async () => {
      const adapter = registry.get(ADAPTER_ID)!;

      const skillV1Dir = await createTempSkill(
        skillTmpDir,
        'stable-skill-v1',
        'Stable Skill',
        'stable content',
      );
      const skill = await normalizeSkill(skillV1Dir);

      await performInstall(skill, adapter, SCOPE, {
        pkg: { name: 'my-pkg', version: '1.0.0' },
        requestorRoot: 'app-one',
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        // Same content, same version → no version-skew warning
        await performInstall(skill, adapter, SCOPE, {
          pkg: { name: 'my-pkg', version: '1.0.0' },
          requestorRoot: 'app-two',
        });

        const versionSkewWarnings = warnSpy.mock.calls.filter((c) =>
          c.join(' ').toLowerCase().includes('version conflict'),
        );
        expect(versionSkewWarnings).toHaveLength(0);
      } finally {
        warnSpy.mockRestore();
      }
    });
  });

  describe('3.12 / 3.10: cross-package name collision message', () => {
    it('emits a warning identifying both source package names when different packages ship same-named skill', async () => {
      const adapter = registry.get(ADAPTER_ID)!;

      // Install skill from pkg-a@1.0.0
      const skillADir = await createTempSkill(
        skillTmpDir,
        'shared-skill-a',
        'Shared Skill',
        'content from package A',
      );
      const skillA = await normalizeSkill(skillADir);

      await performInstall(skillA, adapter, SCOPE, {
        pkg: { name: 'pkg-a', version: '1.0.0' },
        requestorRoot: 'root-app',
      });

      // Install skill from pkg-b@1.0.0 with the same skill name
      const skillBDir = await createTempSkill(
        skillTmpDir,
        'shared-skill-b',
        'Shared Skill',
        'content from package B — different source',
      );
      const skillBRaw = await normalizeSkill(skillBDir);
      const skillB = { ...skillBRaw, name: skillA.name }; // same install slot

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await performInstall(skillB, adapter, SCOPE, {
          pkg: { name: 'pkg-b', version: '1.0.0' },
          requestorRoot: 'root-app',
        });

        // Should have emitted a name-collision warning identifying both packages
        const warnCalls = warnSpy.mock.calls.map((c) => c.join(' '));
        const collisionWarning = warnCalls.find(
          (msg) => msg.includes('pkg-a') && msg.includes('pkg-b'),
        );
        expect(collisionWarning).toBeDefined();
        // Should mention the skill name
        expect(collisionWarning).toContain(skillA.name);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('does NOT emit cross-package collision warning for same-source installs', async () => {
      const adapter = registry.get(ADAPTER_ID)!;

      const skillDir = await createTempSkill(
        skillTmpDir,
        'own-skill',
        'Own Skill',
        'own content v1',
      );
      const skillV1 = await normalizeSkill(skillDir);

      await performInstall(skillV1, adapter, SCOPE, {
        pkg: { name: 'same-pkg', version: '1.0.0' },
        requestorRoot: 'app-one',
      });

      // Different content, same source package name → version-skew path, not cross-package collision
      const skillV2Dir = await createTempSkill(
        skillTmpDir,
        'own-skill-v2',
        'Own Skill',
        'own content v2',
      );
      const skillV2Raw = await normalizeSkill(skillV2Dir);
      const skillV2 = { ...skillV2Raw, name: skillV1.name };

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await performInstall(skillV2, adapter, SCOPE, {
          pkg: { name: 'same-pkg', version: '2.0.0' },
          requestorRoot: 'app-two',
        });

        // Should not emit cross-package collision warning (pkg-a vs pkg-b pattern)
        const crossPkgWarnings = warnSpy.mock.calls.filter((c) => {
          const msg = c.join(' ');
          return msg.includes('Name collision') || msg.includes('also ships');
        });
        expect(crossPkgWarnings).toHaveLength(0);
      } finally {
        warnSpy.mockRestore();
      }
    });
  });
});
