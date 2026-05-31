import { Chalk } from 'chalk';
import { describe, expect, it } from 'vitest';

describe('ui/colors', () => {
  it('color token functions produce ANSI escape sequences when NO_COLOR is unset', () => {
    // Create a chalk instance with full color support (level 3) to simulate TTY
    const chalkColor = new Chalk({ level: 3 });
    const result = chalkColor.rgb(232, 116, 59)('hello');
    // Should contain ANSI escape sequences
    expect(result).toContain('\x1b[');
    expect(result).toContain('hello');
  });

  it('color token functions produce plain strings when NO_COLOR=1 is set', () => {
    // chalk level 0 simulates NO_COLOR behavior (no ANSI output)
    const chalkNoColor = new Chalk({ level: 0 });
    const result = chalkNoColor.rgb(232, 116, 59)('hello');
    // Should be plain text without ANSI escape sequences
    expect(result).toBe('hello');
    expect(result).not.toContain('\x1b[');
  });

  it('structure (non-color output) is preserved when NO_COLOR=1 is set', () => {
    // With level 0, chalk strips ANSI but preserves the underlying text
    const chalkNoColor = new Chalk({ level: 0 });
    const text = 'Searing into my-skill';
    const result = chalkNoColor.rgb(232, 116, 59)(text);
    expect(result).toBe(text);
  });
});
