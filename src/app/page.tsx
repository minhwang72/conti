'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SetlistUploader } from '@/components/setlist-uploader';
import { SortableSongList } from '@/components/sortable-song-list';
import { ConvertControls } from '@/components/convert-controls';
import { ResultGallery } from '@/components/result-gallery';
import { LoadingOverlay } from '@/components/loading-overlay';
import { generateSetlistPdf } from '@/lib/pdf-export';
import { generateSetlistDocx } from '@/lib/docx-export';
import type { SongItem } from '@/types/setlist';

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [convertProgress, setConvertProgress] = useState({ done: 0, total: 0 });

  // Upload multiple files
  const handleFilesSelect = useCallback(async (files: File[]) => {
    setError(null);
    const newSongs: SongItem[] = [];
    for (const file of files) {
      const preview = await readFileAsDataURL(file);
      newSongs.push({
        id: crypto.randomUUID(),
        file,
        preview,
        fileName: file.name,
        targetKey: '__original__',
        status: 'idle',
        result: null,
        error: null,
      });
    }
    setSongs((prev) => [...prev, ...newSongs]);
  }, []);

  // Reorder
  const handleReorder = useCallback((reordered: SongItem[]) => {
    setSongs(reordered);
  }, []);

  // Per-song key change
  const handleKeyChange = useCallback((id: string, key: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, targetKey: key, status: 'idle', result: null, error: null } : s))
    );
  }, []);

  // Remove song
  const handleRemove = useCallback((id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Cancel conversion
  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsConverting(false);
    setSongs((prev) =>
      prev.map((s) =>
        s.status === 'processing' ? { ...s, status: 'idle' as const, result: null, error: null } : s
      )
    );
  }, []);

  // Batch convert - parallel
  const handleConvert = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsConverting(true);
    setError(null);

    const total = songs.filter((s) => s.targetKey !== '__original__').length;
    setConvertProgress({ done: 0, total });

    // Reset all statuses to processing
    setSongs((prev) =>
      prev.map((s) => ({ ...s, status: 'processing' as const, result: null, error: null }))
    );

    const currentSongs = songs;
    let doneCount = 0;

    const promises = currentSongs.map(async (song) => {
      if (controller.signal.aborted) return;
      try {
        if (song.targetKey === '__original__') {
          const base64 = song.preview.split(',')[1];
          const result = {
            image: base64,
            mimeType: song.file.type,
            originalKey: '원본',
            targetKey: '원본',
            semitoneShift: 0,
            title: song.fileName.replace(/\.[^/.]+$/, ''),
          };
          setSongs((prev) =>
            prev.map((s) =>
              s.id === song.id ? { ...s, status: 'done' as const, result, error: null } : s
            )
          );
        } else {
          const formData = new FormData();
          formData.append('image', song.file);
          formData.append('targetKey', song.targetKey);

          const response = await fetch('/api/transpose', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          const data = await response.json();

          if (controller.signal.aborted) return;

          if (!data.success) {
            throw new Error(data.error || '변환 실패');
          }

          setSongs((prev) =>
            prev.map((s) =>
              s.id === song.id ? { ...s, status: 'done' as const, result: data.data, error: null } : s
            )
          );
          doneCount++;
          setConvertProgress({ done: doneCount, total });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        setSongs((prev) =>
          prev.map((s) =>
            s.id === song.id ? { ...s, status: 'error' as const, error: message } : s
          )
        );
        doneCount++;
        setConvertProgress({ done: doneCount, total });
      }
    });

    await Promise.all(promises);
    if (!controller.signal.aborted) {
      // Show 100% briefly before closing overlay
      setConvertProgress({ done: total, total });
      await new Promise((r) => setTimeout(r, 600));
      setIsConverting(false);
    }
    abortRef.current = null;
  }, [songs]);

  // Download all images individually
  const handleDownloadAll = useCallback(() => {
    for (const song of songs) {
      if (song.status !== 'done' || !song.result) continue;
      const link = document.createElement('a');
      link.href = `data:${song.result.mimeType};base64,${song.result.image}`;
      link.download = `${song.result.title || song.fileName}_${song.result.targetKey}.png`;
      link.click();
    }
  }, [songs]);

  // Export song data helper
  const getExportSongs = useCallback(() => {
    return songs
      .filter((s) => s.status === 'done' && s.result)
      .map((s) => ({
        imageBase64: s.result!.image,
        mimeType: s.result!.mimeType,
        title: s.result?.title || s.fileName,
      }));
  }, [songs]);

  const handleDownloadPdf = useCallback(async () => {
    const data = getExportSongs();
    if (data.length > 0) await generateSetlistPdf(data);
  }, [getExportSongs]);

  const handleDownloadDocx = useCallback(async () => {
    const data = getExportSongs();
    if (data.length > 0) await generateSetlistDocx(data);
  }, [getExportSongs]);

  const hasErrors = songs.some((s) => s.status === 'error');
  const allDone = songs.length > 0 && songs.every((s) => s.status === 'done' || s.status === 'error');

  return (
    <div className="min-h-screen bg-background">
      {isConverting && (
        <LoadingOverlay
          done={convertProgress.done}
          total={convertProgress.total}
          onCancel={handleCancel}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">CONTI</h1>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-widest uppercase">
            Sheet &middot; Key &middot; Setlist
          </p>
        </div>

        <div className="space-y-4">
          {songs.length > 0 && (
            <SortableSongList
              songs={songs}
              onReorder={handleReorder}
              onKeyChange={handleKeyChange}
              onRemove={handleRemove}
              disabled={isConverting}
            />
          )}

          <SetlistUploader
            onFilesSelect={handleFilesSelect}
            hasExistingSongs={songs.length > 0}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasErrors && (
            <Alert variant="destructive">
              <AlertDescription>
                일부 곡의 변환에 실패했습니다. 해당 곡의 키를 다시 설정하고 변환해보세요.
              </AlertDescription>
            </Alert>
          )}

          <ConvertControls
            songs={songs}
            isConverting={isConverting}
            onConvert={handleConvert}
            onDownloadAll={handleDownloadAll}
            onDownloadPdf={handleDownloadPdf}
            onDownloadDocx={handleDownloadDocx}
          />

          {allDone && songs.some((s) => s.status === 'done') && (
            <>
              <Separator />
              <ResultGallery songs={songs} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
