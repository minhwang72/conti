export type SongStatus = 'idle' | 'processing' | 'done' | 'error';

export interface SongResult {
  image: string;
  mimeType: string;
  originalKey: string;
  targetKey: string;
  semitoneShift: number;
  title?: string;
  chordMap?: Record<string, string>;
}

export interface SongItem {
  id: string;
  file: File;
  preview: string;
  fileName: string;
  targetKey: string;
  status: SongStatus;
  result: SongResult | null;
  error: string | null;
}
