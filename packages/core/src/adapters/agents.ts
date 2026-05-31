import * as path from 'node:path';
import type { Scope } from '../types.js';
import type { Adapter, Context, NormalizedSkillBase } from './types.js';

export const agentsAdapter: Adapter = {
  id: 'agents',
  label: 'Agents (.agents/)',

  detect(_ctx: Omit<Context, 'scope'>) {
    return { scopes: ['user', 'project'] as Scope[] };
  },

  supportsScope(_scope: Scope): boolean {
    return true;
  },

  resolveInstallPath(skill: NormalizedSkillBase, ctx: Context): string {
    if (ctx.scope === 'user') {
      return path.join(ctx.home, '.agents', 'skills', skill.name);
    }
    return path.join(ctx.cwd, '.agents', 'skills', skill.name);
  },

  render(skill: NormalizedSkillBase, _ctx: Context): string {
    return skill.sourceDir;
  },
};
