// Chromatic scale using sharps
export const CHROMATIC_SHARP = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

// Chromatic scale using flats
export const CHROMATIC_FLAT = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
] as const;

// Map any note name to semitone index (0-11)
export const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Keys that conventionally use flats
export const FLAT_KEYS = new Set([
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm',
]);

// ABC notation: lowercase = octave above middle, uppercase = middle octave
// ABC note letters in order: C D E F G A B (then c d e f g a b for higher octave)
export const ABC_NOTES_UPPER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const ABC_NOTES_LOWER = ['c', 'd', 'e', 'f', 'g', 'a', 'b'] as const;

// All 12 major keys for the selector
export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

// Display-friendly key names
export const KEY_DISPLAY: Record<string, string> = {
  'C': 'C Key',
  'C#': 'C# Key',
  'Db': 'Db Key',
  'D': 'D Key',
  'D#': 'D# Key',
  'Eb': 'Eb Key',
  'E': 'E Key',
  'F': 'F Key',
  'F#': 'F# Key',
  'Gb': 'Gb Key',
  'G': 'G Key',
  'G#': 'G# Key',
  'Ab': 'Ab Key',
  'A': 'A Key',
  'A#': 'A# Key',
  'Bb': 'Bb Key',
  'B': 'B Key',
};
