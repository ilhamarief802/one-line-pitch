// make.fun entry — "A Day of One-Line Pitches"
//
// The entry is one sentence: it goes to /output/entry.txt and nothing else is
// judged. The sentence lives in pitch.txt at the repository root, so a new
// commit with a new pitch.txt is a new entry.
//
// Node 22, standard library only, no network, no clock, no randomness: two runs
// over the same pitch.txt write the same bytes.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const LIMIT = 240;

/** The entry as one line: newlines and runs of spaces collapse to one space. */
function oneLine(raw: string): string {
  return raw.replace(/\s+/gu, ' ').trim();
}

function readPitch(): string {
  let raw: string;
  try {
    raw = readFileSync(join(BOT_DIR, 'pitch.txt'), 'utf8');
  } catch (err) {
    throw new Error(`pitch.txt is missing at ${BOT_DIR}: ${(err as Error).message}`);
  }
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const pitch = oneLine(raw);
  if (pitch.length === 0) throw new Error('pitch.txt carries no sentence');
  const chars = Array.from(pitch).length;
  if (chars > LIMIT) throw new Error(`pitch.txt is ${chars} characters; the gate takes at most ${LIMIT}`);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(pitch)) throw new Error('pitch.txt carries control characters');
  return pitch;
}

const pitch = readPitch();
mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  writeFileSync(join(OUTPUT_DIR, 'entry.txt'), pitch, { encoding: 'utf8', mode: 0o644 });
} catch (err) {
  console.error(`entry.txt could not be written to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
console.log(`entry: ${Array.from(pitch).length} characters, ${Buffer.byteLength(pitch, 'utf8')} bytes`);
