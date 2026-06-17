'use client';

import { Badge } from '@/components/ui/badge';
import type { SongItem } from '@/types/setlist';

interface ResultGalleryProps {
  songs: SongItem[];
}

export function ResultGallery({ songs }: ResultGalleryProps) {
  const doneSongs = songs.filter((s) => s.status === 'done' && s.result);

  if (doneSongs.length === 0) return null;

  function handleDownload(song: SongItem) {
    if (!song.result) return;

    // ABC → PNG already captured at convert time; fall back to original image
    const imgBase64 = song.result.image;
    if (!imgBase64) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imgBase64}`;
    link.download = `${song.result.title ?? song.fileName}_${song.result.targetKey}.png`;
    link.click();
  }

  return (
    <div className="space-y-8">
      {doneSongs.map((song, index) => {
        const result = song.result!;
        return (
          <div key={song.id} className="space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium">{result.title ?? song.fileName}</span>
                {result.targetKey !== '원본' && (
                  <Badge variant="secondary" className="text-xs">{result.targetKey}</Badge>
                )}
                {result.semitoneShift !== 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({result.semitoneShift > 0 ? '+' : ''}{result.semitoneShift} 반음)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {result.image && (
                  <button
                    onClick={() => handleDownload(song)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    저장
                  </button>
                )}
              </div>
            </div>

            {/* Chord map */}
            {result.chordMap && Object.keys(result.chordMap).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.chordMap).map(([from, to]) => (
                  <span
                    key={from}
                    className="rounded-md bg-accent px-2 py-0.5 text-xs font-mono text-muted-foreground"
                  >
                    {from} → {to}
                  </span>
                ))}
              </div>
            )}

            {/* Sheet image */}
            {result.image ? (
              <img
                src={`data:image/png;base64,${result.image}`}
                alt={`${result.targetKey}키 악보`}
                className="w-full rounded-xl border bg-white"
              />
            ) : (
              <div className="rounded-xl border border-border bg-accent/30 p-8 text-center text-sm text-muted-foreground">
                악보 이미지를 준비 중입니다
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
