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
    const link = document.createElement('a');
    link.href = `data:${song.result.mimeType};base64,${song.result.image}`;
    link.download = `${song.result.title || song.fileName}_${song.result.targetKey}.png`;
    link.click();
  }

  return (
    <div className="space-y-6">
      {doneSongs.map((song, index) => (
        <div key={song.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-sm font-medium">{song.result?.title || song.fileName}</span>
              {song.result?.targetKey !== '원본' && (
                <Badge variant="secondary" className="text-xs">{song.result?.targetKey}</Badge>
              )}
            </div>
            <button
              onClick={() => handleDownload(song)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              저장
            </button>
          </div>
          <img
            src={`data:${song.result!.mimeType};base64,${song.result!.image}`}
            alt={`${song.result?.targetKey}키 악보`}
            className="w-full rounded-lg border"
          />
        </div>
      ))}
    </div>
  );
}
