import { dim, ember500 } from './colors.js';
import { randomTagline } from './taglines.js';
import { renderWordmark } from './wordmark.js';

// Full header: wordmark + tagline — for install/update
export function renderFullHeader(): string {
  if (!process.stdout.isTTY || process.env.CI) return '';
  return `${renderWordmark()}\n\n  ${dim(randomTagline())}\n`;
}

// Light header: SKILLET vX.Y.Z · blurb + tagline — for list/uninstall
export function renderLightHeader(version: string): string {
  if (!process.stdout.isTTY || process.env.CI) return '';
  const title = ember500.bold('SKILLET');
  const meta = dim(`v${version}  ·  Install agent skills across your AI tools`);
  const tagline = dim(randomTagline());
  return `${title} ${meta}\n  ${tagline}\n`;
}
