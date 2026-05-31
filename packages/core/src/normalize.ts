import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { hashSkill } from './hash.js';

export interface NormalizedSkill {
  name: string;
  description: string;
  declaredVersion: string | undefined;
  frontmatter: Record<string, unknown>; // full parsed frontmatter including name/description/version
  body: string; // markdown body (after frontmatter)
  sourceDir: string; // absolute path to skill directory
  contentHash: string; // sha256:... hash of the skill tree
}

export async function normalizeSkill(skillDir: string): Promise<NormalizedSkill> {
  // 1. Resolve skillDir to absolute path
  const sourceDir = path.resolve(skillDir);

  // 2. Read SKILL.md — throw descriptive error if missing
  const skillMdPath = path.join(sourceDir, 'SKILL.md');
  let raw: string;
  try {
    raw = await readFile(skillMdPath, 'utf8');
  } catch {
    throw new Error(`SKILL.md not found in ${sourceDir}`);
  }

  // 3. Parse with gray-matter to get { data, content }
  const { data, content } = matter(raw);

  // 4. Validate required fields
  if (data.name == null || data.name === '') {
    throw new Error('SKILL.md is missing required field: name');
  }
  if (data.description == null || data.description === '') {
    throw new Error('SKILL.md is missing required field: description');
  }

  // 5. Compute content hash
  const contentHash = await hashSkill(sourceDir);

  // 6. Return NormalizedSkill
  return {
    name: String(data.name),
    description: String(data.description),
    declaredVersion: data.version != null ? String(data.version) : undefined,
    frontmatter: data,
    body: content,
    sourceDir,
    contentHash,
  };
}
