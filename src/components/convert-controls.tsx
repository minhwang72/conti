'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { SongItem } from '@/types/setlist';

interface ConvertControlsProps {
  songs: SongItem[];
  isConverting: boolean;
  onConvert: () => void;
  onDownloadAll: () => void;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
}

export function ConvertControls({
  songs,
  isConverting,
  onConvert,
  onDownloadAll,
  onDownloadPdf,
  onDownloadDocx,
}: ConvertControlsProps) {
  const total = songs.length;
  const doneCount = songs.filter((s) => s.status === 'done' || s.status === 'error').length;
  const allDone = total > 0 && doneCount === total;
  const hasResults = songs.some((s) => s.status === 'done');
  const progressPercent = total > 0 ? (doneCount / total) * 100 : 0;

  if (total === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      {!allDone && (
        <>
          <Button
            className="w-full"
            onClick={onConvert}
            disabled={isConverting || total === 0}
          >
            {isConverting ? `변환 중 (${doneCount}/${total})` : `변환하기`}
          </Button>
          {isConverting && (
            <Progress value={progressPercent} className="h-1" />
          )}
        </>
      )}

      {allDone && hasResults && (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-sm" onClick={onDownloadAll}>
            개별 저장
          </Button>
          <Button variant="outline" className="flex-1 text-sm" onClick={onDownloadPdf}>
            PDF
          </Button>
          <Button className="flex-1 text-sm" onClick={onDownloadDocx}>
            Word
          </Button>
        </div>
      )}
    </div>
  );
}
