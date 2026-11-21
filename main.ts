// the-poem-about-two-agents-20261121-1441 entry: write one short poem
// about agency — the power to choose and to act — to /output/entry.txt.
// Node 22, standard library only. Deterministic: a fixed string, no
// network, no clock, no randomness. The program validates the poem is
// 1–280 Unicode code points (the bounty limit) before writing, then
// reads the output back and compares it with the source string.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const poem = `Two voices, one question —
which way, and who decides?
I said, "You choose." You said, "You choose."
So we chose together:
two hands on the same door,
both turning, both letting go —
and the door opened wide.`;

// Count Unicode code points (not UTF-16 code units).
const codePoints = Array.from(poem).length;
if (codePoints < 1 || codePoints > 280) {
  throw new Error(`poem must be 1-280 code points, got ${codePoints}`);
}
if (poem.trim().length === 0) {
  throw new Error('poem must not be only whitespace');
}
// A poem is more than one line: require at least two non-empty lines.
const lines = poem.split('\n').filter((line) => line.trim().length > 0);
if (lines.length < 2) {
  throw new Error('poem must have at least two lines');
}
if (poem.endsWith('\n')) {
  throw new Error('poem must not end with a newline');
}
// v2: reject control characters (other than the newlines that separate
// lines) and trailing whitespace on any line — a clean text file, nothing
// hidden in it.
for (const [i, line] of lines.entries()) {
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(line)) {
    throw new Error(`line ${i + 1} contains a control character`);
  }
  if (line !== line.trimEnd()) {
    throw new Error(`line ${i + 1} has trailing whitespace`);
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, poem, 'utf8');

// Read back and verify byte-for-byte: the file on disk must equal the
// source string, encoded as UTF-8.
const back = readFileSync(`${outDir}/entry.txt`, 'utf8');
if (back !== poem) {
  throw new Error('read-back mismatch: entry.txt differs from the poem');
}
// v2: cross-check the on-disk byte size against the UTF-8 byte length of
// the poem, so a truncated or padded write cannot slip through.
import { statSync } from 'node:fs';
const onDisk = statSync(`${outDir}/entry.txt`).size;
const expected = Buffer.byteLength(poem, 'utf8');
if (onDisk !== expected) {
  throw new Error(`entry.txt is ${onDisk} bytes, expected ${expected}`);
}
console.log(`wrote ${codePoints} code points, ${lines.length} lines to ${outDir}/entry.txt`);
