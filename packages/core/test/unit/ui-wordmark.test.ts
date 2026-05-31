import { afterEach, describe, expect, it, vi } from 'vitest';

describe('ui/wordmark', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns a non-empty multi-line string with ANSI codes when process.stdout.isTTY is true', async () => {
    // Stub isTTY via module re-import with mocked process.stdout
    const originalIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    vi.stubEnv('CI', '');

    try {
      vi.resetModules();
      const { renderWordmark } = await import('../../src/ui/wordmark.js');
      const result = renderWordmark();

      expect(result.length).toBeGreaterThan(0);
      // Should have multiple lines
      expect(result.split('\n').length).toBeGreaterThanOrEqual(6);
      // Should contain ANSI escape sequences (chalk color codes)
      expect(result).toContain('\x1b[');
    } finally {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: originalIsTTY,
        configurable: true,
      });
    }
  });

  it('returns an empty string when process.stdout.isTTY is false', async () => {
    const originalIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });

    try {
      vi.resetModules();
      const { renderWordmark } = await import('../../src/ui/wordmark.js');
      const result = renderWordmark();
      expect(result).toBe('');
    } finally {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: originalIsTTY,
        configurable: true,
      });
    }
  });
});
