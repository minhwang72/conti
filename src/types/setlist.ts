export type SongStatus = 'idle' | 'processing' | 'done' | 'error';

export interface SongResult {
  abc?: string;        // ABC notation (abcjs로 렌더링)
  image?: string;      // base64 PNG (원본 유지 또는 변환 후 캡처)
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
  preview: string;      // data URL for thumbnail
  fileName: string;
  targetKey: string;
  status: SongStatus;
  result: SongResult | null;
  error: string | null;
  // cached extraction (so re-keying doesn't re-call API)
  extractedAbc?: string;
  extractedKey?: string;
  extractedTitle?: string;
}
