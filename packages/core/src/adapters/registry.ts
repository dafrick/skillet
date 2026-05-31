import type { Adapter } from './types.js';

export type { Adapter, Context, DetectResult } from './types.js';

export interface Registry {
  register(adapter: Adapter): void;
  get(id: string): Adapter | undefined;
  list(): Adapter[];
}

export function createRegistry(): Registry {
  const adapters = new Map<string, Adapter>();

  return {
    register(adapter: Adapter): void {
      if (adapters.has(adapter.id)) {
        throw new Error(`Adapter with id "${adapter.id}" is already registered`);
      }
      adapters.set(adapter.id, adapter);
    },
    get(id: string): Adapter | undefined {
      return adapters.get(id);
    },
    list(): Adapter[] {
      return Array.from(adapters.values());
    },
  };
}

export const registry: Registry = createRegistry();

export function registerAdapter(adapter: Adapter): void {
  registry.register(adapter);
}
