import { Chalk } from 'chalk';

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

// Shadow box-drawing characters
const SHADOW_CHARS = new Set(['╗', '╔', '═', '╝', '╚', '║', '╬', '╩', '╦', '╠', '╣']);

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

// Returns the rendered wordmark string, or empty string when no TTY
export function renderWordmark(): string {
  if (!process.stdout.isTTY || process.env.CI) return '';

  return ART_LINES.map((line, i) => renderLine(line, ROW_COLORS[i] ?? ROW_COLORS[0])).join('\n');
}
