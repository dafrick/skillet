import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { hashSkill } from './hash.js';
import type { SkillManifest } from './types.js';

export type DriftStatus = 'pristine' | 'modified' | 'unknown';

/**
 * Detects whether the installed skill folder has been locally modified.
 *
 * Algorithm:
 * 1. Try to read .skill-manifest.json from installPath
 * 2. If missing → return 'unknown'
 * 3. Hash current folder (excluding .skill-manifest.json — that's the default ignore)
 * 4. Compare to manifest.postInstallHash
 * 5. Equal → 'pristine', different → 'modified'
 */
export async function detectDrift(installPath: string): Promise<DriftStatus> {
  const manifestPath = path.join(installPath, '.skill-manifest.json');

  let manifest: SkillManifest;
  try {
    const raw = await readFile(manifestPath, 'utf8');
    manifest = JSON.parse(raw) as SkillManifest;
  } catch {
    return 'unknown';
  }

  const currentHash = await hashSkill(installPath); // .skill-manifest.json is excluded by default
  return currentHash === manifest.postInstallHash ? 'pristine' : 'modified';
}

/**
 * Returns true if the stored manifest contentHash differs from the current source hash,
 * meaning the source skill has changed since this install was made.
 */
export async function isStale(installPath: string, currentContentHash: string): Promise<boolean> {
  const manifestPath = path.join(installPath, '.skill-manifest.json');
  try {
    const raw = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as SkillManifest;
    return manifest.contentHash !== currentContentHash;
  } catch {
    return true; // no manifest → treat as stale
  }
}
