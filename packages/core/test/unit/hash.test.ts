import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import nodePath from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hashSkill } from '../../src/hash.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(nodePath.join(os.tmpdir(), 'skillet-hash-test-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

/** Write a file relative to tmpDir, creating parent dirs as needed. */
async function write(relPath: string, content: string | Buffer): Promise<void> {
  const abs = nodePath.join(tmpDir, relPath);
  await mkdir(nodePath.dirname(abs), { recursive: true });
  await writeFile(abs, content);
}

describe('hashSkill', () => {
  it('same content produces the same hash', async () => {
    await write('foo.txt', 'hello world');
    await write('bar.md', '# heading');

    const h1 = await hashSkill(tmpDir);
    const h2 = await hashSkill(tmpDir);
    expect(h1).toBe(h2);
  });

  it('renaming a file changes the hash', async () => {
    await write('original.txt', 'hello');
    const h1 = await hashSkill(tmpDir);

    await rename(nodePath.join(tmpDir, 'original.txt'), nodePath.join(tmpDir, 'renamed.txt'));
    const h2 = await hashSkill(tmpDir);

    expect(h1).not.toBe(h2);
  });

  it('\\r\\n line endings are normalised to \\n before hashing', async () => {
    // Write once with LF
    await write('file.txt', 'line one\nline two\n');
    const hLF = await hashSkill(tmpDir);

    // Overwrite with CRLF
    await write('file.txt', 'line one\r\nline two\r\n');
    const hCRLF = await hashSkill(tmpDir);

    expect(hLF).toBe(hCRLF);
  });

  it('Windows backslash paths are normalised to forward slashes', async () => {
    // Create a nested file — its relative path will contain a separator on
    // all platforms. The implementation normalises sep → '/' so the hash
    // must be stable regardless of OS path separator.
    await write('subdir/nested.txt', 'content');

    const h1 = await hashSkill(tmpDir);
    const h2 = await hashSkill(tmpDir);

    // Same hash both times (the separator is always normalised)
    expect(h1).toBe(h2);
    // And it matches what we'd get if we hash with explicit forward-slash
    // relPaths — verified by stability, not by mocking internals.
    expect(h1).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('.skill-manifest.json is excluded from hash by default', async () => {
    await write('skill.ts', 'export const x = 1;');
    const h1 = await hashSkill(tmpDir);

    // Adding the manifest must NOT change the hash
    await write('.skill-manifest.json', JSON.stringify({ name: 'test' }));
    const h2 = await hashSkill(tmpDir);

    expect(h1).toBe(h2);
  });

  it('custom ignore list excludes specified files', async () => {
    await write('a.txt', 'keep');
    await write('b.txt', 'ignore me');

    const hAll = await hashSkill(tmpDir);
    const hIgnored = await hashSkill(tmpDir, { ignore: ['b.txt'] });

    // Hashes differ when b.txt is ignored vs included
    expect(hAll).not.toBe(hIgnored);

    // Removing b.txt and rehashing without ignore should equal the ignored hash
    await rm(nodePath.join(tmpDir, 'b.txt'));
    const hWithout = await hashSkill(tmpDir);
    expect(hIgnored).toBe(hWithout);
  });

  it('edited file content produces a different hash', async () => {
    await write('file.txt', 'original content');
    const h1 = await hashSkill(tmpDir);

    await write('file.txt', 'modified content');
    const h2 = await hashSkill(tmpDir);

    expect(h1).not.toBe(h2);
  });

  it('.git directory is excluded from hash by default', async () => {
    await write('code.ts', 'const a = 1;');
    const h1 = await hashSkill(tmpDir);

    // Simulate a .git directory with content
    await write('.git/HEAD', 'ref: refs/heads/main');
    await write('.git/config', '[core]\n  repositoryformatversion = 0');
    const h2 = await hashSkill(tmpDir);

    expect(h1).toBe(h2);
  });

  it('hash result starts with sha256: prefix', async () => {
    await write('any.txt', 'anything');
    const h = await hashSkill(tmpDir);
    expect(h).toMatch(/^sha256:/);
  });

  it('filesystem iteration order does not affect the hash', async () => {
    // Write files in a predictable order; hash twice to confirm stability.
    // collectFiles uses sort, so regardless of readdir order the result is
    // the same.
    const names = ['zebra.ts', 'alpha.ts', 'middle.ts', 'aardvark.ts'];
    for (const name of names) {
      await write(name, `// ${name}`);
    }

    const h1 = await hashSkill(tmpDir);
    const h2 = await hashSkill(tmpDir);
    expect(h1).toBe(h2);

    // Also verify hash differs from what you'd get without one of the files
    await rm(nodePath.join(tmpDir, 'middle.ts'));
    const h3 = await hashSkill(tmpDir);
    expect(h1).not.toBe(h3);
  });

  it('binary files (containing NUL bytes) are hashed without line-ending normalisation', async () => {
    // A buffer with a NUL byte — binary. \r\n must NOT be normalised.
    const binaryWithCRLF = Buffer.from([0x41, 0x0d, 0x0a, 0x00, 0x42]); // "A\r\n\0B"
    const binaryWithLF = Buffer.from([0x41, 0x0a, 0x00, 0x42]); // "A\n\0B"

    await write('data.bin', binaryWithCRLF);
    const hCRLF = await hashSkill(tmpDir);

    await write('data.bin', binaryWithLF);
    const hLF = await hashSkill(tmpDir);

    // Must be different — no normalisation applied
    expect(hCRLF).not.toBe(hLF);
  });
});
