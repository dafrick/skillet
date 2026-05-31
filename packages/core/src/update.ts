import { rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { detectDrift } from './drift.js';
import type { InstallRecord } from './install.js';
import { computeRenderHash, LIB_VERSION, performInstall } from './install.js';
import type { NormalizedSkill } from './normalize.js';

export type UpdateDecision = 'skip' | 'overwrite' | 'backup_and_overwrite' | 'prompt';

export interface UpdateResult {
  record: InstallRecord;
  action: 'skipped' | 'updated' | 'backed_up_and_updated' | 'drifted_skipped';
  backupPath?: string;
}

export interface UpdateOptions {
  pkg: { name: string; version: string };
  force?: boolean;
  isTTY?: boolean;
  // Prompt function — called when drift is detected and not --force and is TTY
  // Returns: 'backup_and_overwrite' | 'overwrite' | 'skip'
  onDrift?: (record: InstallRecord) => Promise<'backup_and_overwrite' | 'overwrite' | 'skip'>;
}

/**
 * Determine what to do with an existing install.
 *
 * Decision table:
 * - renderHash unchanged AND pristine → 'skip'
 * - renderHash unchanged AND not pristine, not --force → 'prompt' (or drifted_skip in non-TTY)
 * - pristine AND stale → 'overwrite' (silent)
 * - drifted AND --force → 'overwrite'
 * - drifted AND not --force AND TTY → 'prompt'
 * - drifted AND not --force AND not TTY → 'skip' (safe non-interactive behavior)
 * - unknown state → treat as drifted
 */
export async function decideUpdate(
  record: InstallRecord,
  skill: NormalizedSkill,
  opts: UpdateOptions,
): Promise<'skip' | 'overwrite' | 'prompt' | 'drifted_skip'> {
  const newRenderHash = computeRenderHash(skill.contentHash, record.adapter.id, LIB_VERSION);
  const isStale = newRenderHash !== record.manifest.renderHash;
  const driftStatus = await detectDrift(record.installPath);
  const isPristine = driftStatus === 'pristine';
  const _isDrifted = driftStatus === 'modified' || driftStatus === 'unknown';

  if (!isStale) {
    // renderHash unchanged — source and render haven't changed
    if (isPristine) {
      return 'skip';
    }
    // drifted or unknown
    if (opts.force) {
      return 'overwrite';
    }
    if (opts.isTTY) {
      return 'prompt';
    }
    return 'drifted_skip';
  }

  // renderHash changed — stale
  if (isPristine) {
    return 'overwrite'; // silent refresh
  }
  // drifted or unknown
  if (opts.force) {
    return 'overwrite';
  }
  if (opts.isTTY) {
    return 'prompt';
  }
  return 'drifted_skip';
}

/**
 * Create a timestamped backup of the install directory.
 * Naming: <parent>/<skill-name>.bak.<ISO8601Z>/
 * Example: ~/.claude/skills/my-skill.bak.20260530T120000Z/
 */
export async function backupInstall(installPath: string): Promise<string> {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const dirName = path.basename(installPath);
  const backupPath = path.join(path.dirname(installPath), `${dirName}.bak.${timestamp}`);
  await rename(installPath, backupPath);
  return backupPath;
}

/**
 * Apply the update decision. May call onDrift prompt when needed.
 */
export async function applyUpdate(
  record: InstallRecord,
  skill: NormalizedSkill,
  opts: UpdateOptions,
): Promise<UpdateResult> {
  const decision = await decideUpdate(record, skill, opts);

  if (decision === 'skip') {
    return { record, action: 'skipped' };
  }

  if (decision === 'drifted_skip') {
    return { record, action: 'drifted_skipped' };
  }

  if (decision === 'prompt') {
    const promptResult = opts.onDrift ? await opts.onDrift(record) : 'skip';

    if (promptResult === 'skip') {
      return { record, action: 'skipped' };
    }

    if (promptResult === 'backup_and_overwrite') {
      const backupPath = await backupInstall(record.installPath);
      const newInstallPath = await performInstall(skill, record.adapter, record.scope, {
        pkg: opts.pkg,
      });
      const newRecord: InstallRecord = { ...record, installPath: newInstallPath };
      return { record: newRecord, action: 'backed_up_and_updated', backupPath };
    }

    // 'overwrite'
    await rm(record.installPath, { recursive: true, force: true });
    const newInstallPath = await performInstall(skill, record.adapter, record.scope, {
      pkg: opts.pkg,
    });
    const newRecord: InstallRecord = { ...record, installPath: newInstallPath };
    return { record: newRecord, action: 'updated' };
  }

  // decision === 'overwrite'
  await rm(record.installPath, { recursive: true, force: true });
  const newInstallPath = await performInstall(skill, record.adapter, record.scope, {
    pkg: opts.pkg,
  });
  const newRecord: InstallRecord = { ...record, installPath: newInstallPath };
  return { record: newRecord, action: 'updated' };
}

/**
 * Remove the install directory.
 */
export async function removeInstall(installPath: string): Promise<void> {
  await rm(installPath, { recursive: true, force: true });
}
