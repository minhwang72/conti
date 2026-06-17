'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { SetlistUploader } from '@/components/setlist-uploader';
import { SortableSongList } from '@/components/sortable-song-list';
import { ConvertControls } from '@/components/convert-controls';
import { ResultGallery } from '@/components/result-gallery';
import { LoadingOverlay } from '@/components/loading-overlay';
import { generateSetlistPdf } from '@/lib/pdf-export';
import { generateSetlistDocx } from '@/lib/docx-export';
import { transposeAbc } from '@/lib/music/transpose-abc';
import { abcToPng } from '@/lib/abc-to-png';
import { getSemitoneShift, transposeChordSymbol } from '@/lib/music/transpose-abc';
import type { SongItem, SongResult } from '@/types/setlist';

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function LoginGate() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
      <div className="text-3xl">🎵</div>
      <h2 className="text-base font-semibold">로그인 후 이용 가능합니다</h2>
      <p className="text-sm text-muted-foreground">
        Google 계정으로 로그인하면 <strong>1회 무료</strong> 악보 변환을 체험할 수 있습니다.
      </p>
      <button
        onClick={() => signIn('google')}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 시작하기
      </button>
    </div>
  );
}

function UpgradeGate() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
      <div className="text-3xl">⭐</div>
      <h2 className="text-base font-semibold">무료 체험이 종료되었습니다</h2>
      <p className="text-sm text-muted-foreground">
        계속 사용하려면 프리미엄으로 업그레이드하세요.<br />
        월 <strong>₩6,900</strong>으로 Claude AI 고품질 변환, 무제한 사용.
      </p>
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
      >
        업그레이드 준비 중
      </button>
      <p className="text-xs text-muted-foreground">결제 기능은 곧 오픈 예정입니다.</p>
    </div>
  );
}

export default function AppPage() {
  const { data: session, status } = useSession();
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [convertProgress, setConvertProgress] = useState({ done: 0, total: 0 });

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

  const handleReorder = useCallback((reordered: SongItem[]) => setSongs(reordered), []);

  const handleKeyChange = useCallback((id: string, key: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, targetKey: key, status: 'idle', result: null, error: null } : s))
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsConverting(false);
    setSongs((prev) =>
      prev.map((s) => (s.status === 'processing' ? { ...s, status: 'idle', result: null, error: null } : s))
    );
  }, []);

  const handleConvert = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsConverting(true);
    setError(null);
    setShowUpgradeGate(false);

    const toProcess = songs.filter((s) => s.targetKey !== '__original__');
    setConvertProgress({ done: 0, total: toProcess.length });

    setSongs((prev) => prev.map((s) => ({ ...s, status: 'processing' as const, result: null, error: null })));

    const currentSongs = songs;
    let doneCount = 0;

    const promises = currentSongs.map(async (song) => {
      if (controller.signal.aborted) return;

      try {
        if (song.targetKey === '__original__') {
          const base64 = song.preview.split(',')[1];
          const result: SongResult = {
            image: base64,
            mimeType: song.file.type,
            originalKey: song.extractedKey ?? '원본',
            targetKey: '원본',
            semitoneShift: 0,
            title: song.extractedTitle ?? song.fileName.replace(/\.[^/.]+$/, ''),
          };
          setSongs((prev) =>
            prev.map((s) => (s.id === song.id ? { ...s, status: 'done', result, error: null } : s))
          );
          return;
        }

        let abc = song.extractedAbc ?? '';
        let originalKey = song.extractedKey ?? '';
        let title = song.extractedTitle ?? '';

        if (!abc) {
          const formData = new FormData();
          formData.append('image', song.file);

          const res = await fetch('/api/extract', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          const data = await res.json();

          if (controller.signal.aborted) return;

          if (!data.success) {
            if (data.error === 'LOGIN_REQUIRED') {
              throw new Error('LOGIN_REQUIRED');
            }
            if (data.error === 'UPGRADE_REQUIRED') {
              throw new Error('UPGRADE_REQUIRED');
            }
            throw new Error(data.message ?? data.error ?? '추출 실패');
          }

          abc = data.data.abc as string;
          originalKey = data.data.originalKey as string;
          title = data.data.title as string;

          setSongs((prev) =>
            prev.map((s) =>
              s.id === song.id
                ? { ...s, extractedAbc: abc, extractedKey: originalKey, extractedTitle: title }
                : s
            )
          );
        }

        if (controller.signal.aborted) return;

        const transposedAbc =
          originalKey === song.targetKey ? abc : transposeAbc(abc, originalKey, song.targetKey);

        const { base64, mimeType } = await abcToPng(transposedAbc);

        if (controller.signal.aborted) return;

        const semitones = getSemitoneShift(originalKey, song.targetKey);
        const chordMap: Record<string, string> = {};
        const chordMatches = abc.matchAll(/"([^"]+)"/g);
        for (const m of chordMatches) {
          const orig = m[1];
          if (!chordMap[orig]) {
            chordMap[orig] = transposeChordSymbol(orig, semitones, song.targetKey);
          }
        }

        const result: SongResult = {
          abc: transposedAbc,
          image: base64,
          mimeType,
          originalKey,
          targetKey: song.targetKey,
          semitoneShift: semitones,
          title: title || song.fileName.replace(/\.[^/.]+$/, ''),
          chordMap: Object.keys(chordMap).length > 0 ? chordMap : undefined,
        };

        setSongs((prev) =>
          prev.map((s) => (s.id === song.id ? { ...s, status: 'done', result, error: null } : s))
        );

        doneCount++;
        setConvertProgress({ done: doneCount, total: toProcess.length });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : '알 수 없는 오류';

        if (message === 'UPGRADE_REQUIRED') {
          setShowUpgradeGate(true);
          setSongs((prev) =>
            prev.map((s) => (s.id === song.id ? { ...s, status: 'idle', error: null } : s))
          );
        } else {
          setSongs((prev) =>
            prev.map((s) => (s.id === song.id ? { ...s, status: 'error', error: message } : s))
          );
        }

        doneCount++;
        setConvertProgress({ done: doneCount, total: toProcess.length });
      }
    });

    await Promise.all(promises);

    if (!controller.signal.aborted) {
      setConvertProgress({ done: toProcess.length, total: toProcess.length });
      await new Promise((r) => setTimeout(r, 500));
      setIsConverting(false);
    }
    abortRef.current = null;
  }, [songs]);

  const handleDownloadAll = useCallback(() => {
    for (const song of songs) {
      if (song.status !== 'done' || !song.result?.image) continue;
      const link = document.createElement('a');
      link.href = `data:${song.result.mimeType};base64,${song.result.image}`;
      link.download = `${song.result.title ?? song.fileName}_${song.result.targetKey}.png`;
      link.click();
    }
  }, [songs]);

  const getExportSongs = useCallback(() => {
    return songs
      .filter((s) => s.status === 'done' && s.result?.image)
      .map((s) => ({
        imageBase64: s.result!.image!,
        mimeType: s.result!.mimeType,
        title: s.result?.title ?? s.fileName,
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

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isConverting && (
        <LoadingOverlay
          done={convertProgress.done}
          total={convertProgress.total}
          onCancel={handleCancel}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold tracking-tight">악보 키 변환</h1>
          <p className="text-xs text-muted-foreground mt-1">
            악보를 업로드하고 키를 선택하면 AI가 자동으로 변환합니다
          </p>
          {session?.user && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              {session.user.isPremium ? (
                <span className="text-amber-600 font-medium">⭐ 프리미엄 · Claude AI</span>
              ) : session.user.freeUsed ? (
                <span className="text-red-500">무료 체험 완료 · 업그레이드 필요</span>
              ) : (
                <span className="text-green-600">무료 체험 1회 남음</span>
              )}
            </div>
          )}
        </div>

        {/* 비로그인 */}
        {!session?.user ? (
          <LoginGate />
        ) : showUpgradeGate ? (
          /* 무료 소진 */
          <UpgradeGate />
        ) : (
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

            <SetlistUploader onFilesSelect={handleFilesSelect} hasExistingSongs={songs.length > 0} />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {hasErrors && (
              <Alert variant="destructive">
                <AlertDescription>
                  일부 곡의 변환에 실패했습니다.
                  {songs.filter(s => s.status === 'error' && s.error).map(s => (
                    <div key={s.id} className="mt-1 text-xs opacity-80">{s.fileName}: {s.error}</div>
                  ))}
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
        )}
      </div>
    </div>
  );
}
