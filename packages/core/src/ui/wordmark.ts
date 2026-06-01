import { Chalk } from 'chalk';
import figlet from 'figlet';
import { ember500 } from './colors.js';

// Strips @scope/ prefix and uppercases the result
export function deriveDisplayName(pkgName: string): string {
  const slashIndex = pkgName.indexOf('/');
  const base = slashIndex !== -1 ? pkgName.slice(slashIndex + 1) : pkgName;
  return base.toUpperCase();
}

// Use level 3 (true color) when rendering — the TTY guard in renderWordmark()
// ensures we only call this on actual terminals. Forcing level avoids chalk
// detecting no-color in test/CI environments before the guard is checked.
const chalkTrueColor = new Chalk({ level: 3 });

const ART_LINES = [
  '███████╗██╗  ██╗██╗██╗     ██╗     ███████╗████████╗',
  '██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝╚══██╔══╝',
  '███████╗█████╔╝ ██║██║     ██║     █████╗     ██║   ',
  '╚════██║██╔═██╗ ██║██║     ██║     ██╔══╝     ██║   ',
  '███████║██║  ██╗██║███████╗███████╗███████╗   ██║   ',
  '╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   ',
];

// Heated-iron gradient — one color per row
const ROW_COLORS: Array<[number, number, number]> = [
  [251, 210, 160], // Row 0: #FBD2A0
  [240, 146, 90], //  Row 1: #F0925A
  [232, 116, 59], //  Row 2: #E8743B
  [199, 90, 40], //   Row 3: #C75A28
  [156, 68, 28], //   Row 4: #9C441C
  [156, 68, 28], //   Row 5: #9C441C (same as row 4)
];

// Shadow box-drawing characters used by ANSI Shadow figlet output.
// ╬, ╩, ╦, ╠, ╣ are valid box-drawing chars but ANSI Shadow never emits them.
const SHADOW_CHARS = new Set(['╗', '╔', '═', '╝', '╚', '║']);

function renderLine(line: string, rowColor: [number, number, number]): string {
  const [r, g, b] = rowColor;
  const shadowR = Math.round(r * 0.4);
  const shadowG = Math.round(g * 0.4);
  const shadowB = Math.round(b * 0.4);
  const mainColor = chalkTrueColor.rgb(r, g, b);
  const shadowColor = chalkTrueColor.rgb(shadowR, shadowG, shadowB);

  return [...line]
    .map((char) => (SHADOW_CHARS.has(char) ? shadowColor(char) : mainColor(char)))
    .join('');
}

// Generates an ASCII art wordmark for the given name using figlet ANSI Shadow.
// Applies the ember gradient unless NO_COLOR is set.
// Falls back to plain (bold) text if the figlet output exceeds terminal width.
export function generateWordmark(name: string): string {
  const noColor = process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== '';
  // 120 is a generous common wide-terminal default when columns is unavailable
  const DEFAULT_TERMINAL_WIDTH = 120;
  const maxWidth = process.stdout.columns ?? DEFAULT_TERMINAL_WIDTH;

  // Generate figlet art
  const art = figlet.textSync(name, { font: 'ANSI Shadow' });
  const artLines = art.split('\n');

  // Check if figlet output fits in terminal width.
  // ANSI Shadow box-drawing characters (█, ╗, ╚, etc.) each have display width 1
  // in standard terminals, so l.length is an accurate column count for this font.
  const maxLineWidth = Math.max(...artLines.map((l) => l.length));
  if (maxLineWidth > maxWidth) {
    // Overflow fallback — plain text
    if (noColor) return name;
    return ember500.bold(name);
  }

  // Apply gradient row-by-row (or return plain if NO_COLOR)
  if (noColor) return art;

  const lastColor = ROW_COLORS[ROW_COLORS.length - 1] as [number, number, number];
  return artLines.map((line, i) => renderLine(line, ROW_COLORS[i] ?? lastColor)).join('\n');
}

// Returns the rendered wordmark string, or empty string when no TTY
export function renderWordmark(): string {
  if (!process.stdout.isTTY || process.env.CI) return '';

  return ART_LINES.map((line, i) => renderLine(line, ROW_COLORS[i] ?? ROW_COLORS[0])).join('\n');
}
