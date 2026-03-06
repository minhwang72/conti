import { NOTE_TO_SEMITONE, CHROMATIC_SHARP, CHROMATIC_FLAT, FLAT_KEYS } from './constants';

/**
 * Calculate semitone shift from one key to another.
 */
export function getSemitoneShift(fromKey: string, toKey: string): number {
  const fromRoot = fromKey.replace('m', '');
  const toRoot = toKey.replace('m', '');
  const from = NOTE_TO_SEMITONE[fromRoot];
  const to = NOTE_TO_SEMITONE[toRoot];
  if (from === undefined || to === undefined) {
    throw new Error(`Invalid key: ${fromKey} or ${toKey}`);
  }
  return ((to - from) + 12) % 12;
}

/**
 * Whether to use flats for the target key.
 */
function useFlats(targetKey: string): boolean {
  return FLAT_KEYS.has(targetKey);
}

/**
 * Transpose a note name (e.g., "C#", "Bb", "E") by semitones.
 */
export function transposeNoteName(note: string, semitones: number, targetKey: string): string {
  const semitone = NOTE_TO_SEMITONE[note];
  if (semitone === undefined) return note;
  const newSemitone = (semitone + semitones + 12) % 12;
  const scale = useFlats(targetKey) ? CHROMATIC_FLAT : CHROMATIC_SHARP;
  return scale[newSemitone];
}

/**
 * Transpose a chord symbol like "C#m7", "Bb/F", "Gsus4".
 */
export function transposeChordSymbol(chord: string, semitones: number, targetKey: string): string {
  // Match: root note (with # or b), then quality, then optional /bass
  const match = chord.match(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/);
  if (!match) return chord;

  const root = transposeNoteName(match[1], semitones, targetKey);
  const quality = match[2] || '';
  const bass = match[3] ? transposeNoteName(match[3], semitones, targetKey) : '';

  return `${root}${quality}${bass ? '/' + bass : ''}`;
}

/**
 * Convert an ABC note letter to a semitone value.
 * In ABC: C=0, D=2, E=4, F=5, G=7, A=9, B=11
 */
const ABC_LETTER_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'c': 0,
  'D': 2, 'd': 2,
  'E': 4, 'e': 4,
  'F': 5, 'f': 5,
  'G': 7, 'g': 7,
  'A': 9, 'a': 9,
  'B': 11, 'b': 11,
};

/**
 * Given a semitone (0-11), return the ABC note letter and any accidental needed.
 * Returns [letter, accidental] where accidental is '', '^', or '_'
 */
function semitoneToAbcNote(semitone: number, preferFlats: boolean): [string, string] {
  // Natural notes: C=0, D=2, E=4, F=5, G=7, A=9, B=11
  const naturalMap: [number, string][] = [
    [0, 'C'], [2, 'D'], [4, 'E'], [5, 'F'], [7, 'G'], [9, 'A'], [11, 'B'],
  ];

  for (const [s, letter] of naturalMap) {
    if (s === semitone) return [letter, ''];
  }

  // It's an accidental note
  if (preferFlats) {
    // Use flat: semitone 1=Db, 3=Eb, 6=Gb, 8=Ab, 10=Bb
    const flatMap: Record<number, string> = { 1: 'D', 3: 'E', 6: 'G', 8: 'A', 10: 'B' };
    return [flatMap[semitone], '_'];
  } else {
    // Use sharp: semitone 1=C#, 3=D#, 6=F#, 8=G#, 10=A#
    const sharpMap: Record<number, string> = { 1: 'C', 3: 'D', 6: 'F', 8: 'G', 10: 'A' };
    return [sharpMap[semitone], '^'];
  }
}

/**
 * Transpose a full ABC notation string.
 * - Changes K: (key) line
 * - Transposes all melody notes
 * - Transposes all chord symbols in "quotes"
 * - Preserves lyrics (w:), title (T:), and other headers
 */
export function transposeAbc(abc: string, fromKey: string, toKey: string): string {
  const semitones = getSemitoneShift(fromKey, toKey);
  if (semitones === 0) return abc;

  const preferFlats = useFlats(toKey);
  const lines = abc.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    // Key line: change K: value
    if (line.match(/^K:/)) {
      result.push(`K:${toKey}`);
      continue;
    }

    // Header lines (T:, M:, L:, X:, w:, W:, etc.): keep as-is
    if (line.match(/^[A-Za-z]:/)) {
      result.push(line);
      continue;
    }

    // Comment lines
    if (line.startsWith('%')) {
      result.push(line);
      continue;
    }

    // Music line: transpose notes and chords
    result.push(transposeMusicLine(line, semitones, preferFlats, toKey));
  }

  return result.join('\n');
}

/**
 * Transpose a single music line of ABC notation.
 * Handles notes (with accidentals, octave markers) and inline chords.
 */
function transposeMusicLine(
  line: string,
  semitones: number,
  preferFlats: boolean,
  targetKey: string
): string {
  let output = '';
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    // Inline chord in quotes: "Am7" → transpose the chord symbol
    if (ch === '"') {
      const endQuote = line.indexOf('"', i + 1);
      if (endQuote === -1) {
        output += ch;
        i++;
        continue;
      }
      const chordStr = line.substring(i + 1, endQuote);
      const transposed = transposeChordSymbol(chordStr, semitones, targetKey);
      output += `"${transposed}"`;
      i = endQuote + 1;
      continue;
    }

    // Accidental: ^ (sharp), _ (flat), = (natural)
    if (ch === '^' || ch === '_' || ch === '=') {
      // Could be ^^ (double sharp) or __ (double flat)
      let accidental = ch;
      let j = i + 1;
      while (j < line.length && (line[j] === '^' || line[j] === '_')) {
        accidental += line[j];
        j++;
      }

      // Next should be a note letter
      if (j < line.length && /[A-Ga-g]/.test(line[j])) {
        const noteLetter = line[j];
        const isLower = noteLetter === noteLetter.toLowerCase();
        const baseSemitone = ABC_LETTER_TO_SEMITONE[noteLetter];

        if (baseSemitone !== undefined) {
          // Calculate accidental offset
          let accOffset = 0;
          for (const c of accidental) {
            if (c === '^') accOffset++;
            else if (c === '_') accOffset--;
            // '=' means natural, offset = 0
          }

          const originalSemitone = ((baseSemitone + accOffset) + 12) % 12;
          const newSemitone = (originalSemitone + semitones + 12) % 12;
          const [newLetter, newAcc] = semitoneToAbcNote(newSemitone, preferFlats);

          // Preserve octave (lowercase/uppercase + commas/apostrophes)
          const finalLetter = isLower ? newLetter.toLowerCase() : newLetter;
          output += newAcc + finalLetter;
          i = j + 1;
          continue;
        }
      }

      // Not followed by a note, keep as-is
      output += accidental;
      i = i + accidental.length;
      continue;
    }

    // Regular note letter
    if (/[A-Ga-g]/.test(ch)) {
      const isLower = ch === ch.toLowerCase();
      const baseSemitone = ABC_LETTER_TO_SEMITONE[ch];

      if (baseSemitone !== undefined) {
        // Note in current key - transpose it
        const newSemitone = (baseSemitone + semitones + 12) % 12;
        const [newLetter, newAcc] = semitoneToAbcNote(newSemitone, preferFlats);
        const finalLetter = isLower ? newLetter.toLowerCase() : newLetter;
        output += newAcc + finalLetter;
        i++;
        continue;
      }
    }

    // Everything else (bar lines, numbers, spaces, etc.): keep as-is
    output += ch;
    i++;
  }

  return output;
}
