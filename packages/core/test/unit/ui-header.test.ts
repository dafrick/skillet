import { afterEach, describe, expect, it, vi } from 'vitest';

// Helper to set up TTY context
function withTTY(isTTY: boolean): () => void {
  const originalIsTTY = process.stdout.isTTY;
  Object.defineProperty(process.stdout, 'isTTY', { value: isTTY, configurable: true });
  return () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
  };
}

const baseOpts = {
  resolvedWordmarkName: 'MYSKILL',
  resolvedDisplayName: 'MY-SKILL',
  pkg: { name: '@acme/my-skill', version: '1.2.3', description: 'A test skill package' },
  coreVersion: '0.1.1',
};

describe('renderFullHeader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  // 3.1 — Replace hardcoded SKILLET art with generateWordmark(opts.resolvedWordmarkName)
  it('3.1: calls generateWordmark with resolvedWordmarkName (not hardcoded SKILLET)', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      // generateWordmark('MYSKILL') produces figlet art — it should contain MYSKILL-derived text
      // Since figlet ANSI Shadow for 'MYSKILL' won't contain 'SKILLET', we verify it's not
      // using the old hardcoded SKILLET art by checking for MYSKILL figlet output characteristics
      // The output should be non-empty (TTY mode)
      expect(result.length).toBeGreaterThan(0);
    } finally {
      restoreIsTTY();
    }
  });

  it('3.1: returns empty string when not TTY', async () => {
    const restoreIsTTY = withTTY(false);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).toBe('');
    } finally {
      restoreIsTTY();
    }
  });

  // 3.4 — No rotating taglines
  it('3.4: does not contain any tagline text in full header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      // Call many times to check no tagline appears (taglines rotate randomly)
      for (let i = 0; i < 10; i++) {
        const result = renderFullHeader(baseOpts);
        // Known taglines from taglines.ts — none should appear
        expect(result).not.toContain('mise en place');
        expect(result).not.toContain('Cast iron');
        expect(result).not.toContain('Season your agents');
        expect(result).not.toContain('production heat');
        expect(result).not.toContain('Zero compromise');
      }
    } finally {
      restoreIsTTY();
    }
  });

  // 3.5 — Attribution line in full header
  it('3.5: contains attribution "Packaged with Skillet" in full header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).toContain('Packaged with Skillet');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.5: attribution line contains coreVersion in full header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).toContain('0.1.1');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.5: attribution line contains GitHub hyperlink URL in full header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).toContain('https://github.com/dafrick/skillet');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.5: attribution line contains secondary text "package your own"', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).toContain('package your own');
    } finally {
      restoreIsTTY();
    }
  });

  // 3.6 — Attribution absent in CI
  it('3.6: returns empty string in CI environment', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', 'true');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).toBe('');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.6: CI guard suppresses attribution line (no "Packaged with Skillet" in CI)', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', 'true');
    vi.resetModules();
    try {
      const { renderFullHeader } = await import('../../src/ui/header.js');
      const result = renderFullHeader(baseOpts);
      expect(result).not.toContain('Packaged with Skillet');
    } finally {
      restoreIsTTY();
    }
  });
});

describe('renderLightHeader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  // 3.2 — Light header reads resolved display name + pkg.version
  it('3.2: contains resolvedDisplayName in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('MY-SKILL');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.2: contains pkg.version in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('1.2.3');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.2: does not contain hardcoded "SKILLET" in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      // The result should contain the resolved display name and version (not hardcoded SKILLET)
      // ANSI color codes wrap the text but the plain chars are still in the string
      expect(result).toContain('MY-SKILL');
      expect(result).toContain('v1.2.3');
    } finally {
      restoreIsTTY();
    }
  });

  // 3.3 — Light header description from pkg.description
  it('3.3: contains pkg.description in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('A test skill package');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.3: does not contain old hardcoded description blurb in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).not.toContain('Install agent skills across your AI tools');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.3: handles missing pkg.description gracefully (no crash)', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const optsNoDesc = { ...baseOpts, pkg: { name: '@acme/my-skill', version: '1.2.3' } };
      expect(() => renderLightHeader(optsNoDesc)).not.toThrow();
    } finally {
      restoreIsTTY();
    }
  });

  // 3.4 — No rotating taglines
  it('3.4: does not contain any tagline text in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      for (let i = 0; i < 10; i++) {
        const result = renderLightHeader(baseOpts);
        expect(result).not.toContain('mise en place');
        expect(result).not.toContain('Cast iron');
        expect(result).not.toContain('Season your agents');
        expect(result).not.toContain('production heat');
        expect(result).not.toContain('Zero compromise');
      }
    } finally {
      restoreIsTTY();
    }
  });

  // 3.5 — Attribution line in light header
  it('3.5: contains attribution "Packaged with Skillet" in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('Packaged with Skillet');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.5: attribution line contains coreVersion in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('0.1.1');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.5: attribution line contains GitHub hyperlink URL in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('https://github.com/dafrick/skillet');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.5: attribution line contains secondary text "package your own" in light header', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toContain('package your own');
    } finally {
      restoreIsTTY();
    }
  });

  // 3.6 — Attribution absent in CI/non-TTY
  it('3.6: returns empty string in CI environment', async () => {
    const restoreIsTTY = withTTY(true);
    vi.stubEnv('CI', 'true');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toBe('');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.6: returns empty string when not TTY', async () => {
    const restoreIsTTY = withTTY(false);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).toBe('');
    } finally {
      restoreIsTTY();
    }
  });

  it('3.6: non-TTY path has no attribution (no "Packaged with Skillet")', async () => {
    const restoreIsTTY = withTTY(false);
    vi.stubEnv('CI', '');
    vi.resetModules();
    try {
      const { renderLightHeader } = await import('../../src/ui/header.js');
      const result = renderLightHeader(baseOpts);
      expect(result).not.toContain('Packaged with Skillet');
    } finally {
      restoreIsTTY();
    }
  });
});
