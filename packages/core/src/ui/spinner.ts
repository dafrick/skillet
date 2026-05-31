export interface Spinner {
  start(label: string): void;
  succeed(label: string): void;
  fail(label: string): void;
}

// ANSI escape sequences
const CLEAR_LINE = '\r\x1b[2K';
const SPINNER_CHAR = '⠙';

function createTTYSpinner(): Spinner {
  let _active = false;

  return {
    start(label: string): void {
      _active = true;
      process.stdout.write(`${SPINNER_CHAR} ${label}`);
    },
    succeed(label: string): void {
      if (_active) process.stdout.write(CLEAR_LINE);
      _active = false;
      process.stdout.write(`✓ ${label}\n`);
    },
    fail(label: string): void {
      if (_active) process.stdout.write(CLEAR_LINE);
      _active = false;
      process.stdout.write(`✗ ${label}\n`);
    },
  };
}

function createNoOpSpinner(): Spinner {
  return {
    start(_label: string): void {
      // no-op in non-TTY
    },
    succeed(label: string): void {
      process.stdout.write(`${label}\n`);
    },
    fail(label: string): void {
      process.stdout.write(`${label}\n`);
    },
  };
}

// Returns a no-op spinner in non-TTY environments (immediate done line)
export function createSpinner(isTTY: boolean = process.stdout.isTTY ?? false): Spinner {
  return isTTY ? createTTYSpinner() : createNoOpSpinner();
}
