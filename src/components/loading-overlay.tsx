'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

const TIPS = [
  'Claude AI가 악보를 분석하고 있어요',
  '멜로디와 코드를 인식하는 중이에요',
  '조옮김 계산하고 있어요',
  '악보를 렌더링하고 있어요',
  '거의 다 됐어요',
];

const SECONDS_PER_SONG = 15;

interface LoadingOverlayProps {
  done: number;
  total: number;
  onCancel: () => void;
}

export function LoadingOverlay({ done, total, onCancel }: LoadingOverlayProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const totalEstSec = Math.max(total, 1) * SECONDS_PER_SONG;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const realPercent = total > 0 ? (done / total) * 100 : 0;
      const timePercent = Math.min((elapsed / totalEstSec) * 100, 95);
      const target = done === total ? 100 : Math.min(Math.max(realPercent, timePercent), 99);

      setSmoothProgress((prev) => {
        if (done === total) return 100;
        return prev + (target - prev) * 0.1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [done, total]);

  useEffect(() => {
    const timer = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const estimateSec = Math.max(total, 1) * SECONDS_PER_SONG;
  const estimateStr = estimateSec >= 60
    ? `약 ${Math.ceil(estimateSec / 60)}분`
    : `약 ${estimateSec}초`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-6 max-w-sm text-center">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="3" className="text-foreground/10" />
            <circle
              cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - smoothProgress / 100)}`}
              className="text-foreground transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium tabular-nums">{Math.round(smoothProgress)}%</span>
          </div>
        </div>

        <div className="space-y-2">
          {total > 0 && (
            <p className="text-sm font-medium">{done} / {total} 곡 완료</p>
          )}
          <p className="text-sm text-muted-foreground animate-fade-in" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
          <p className="text-xs text-muted-foreground/60">예상 소요시간 {estimateStr}</p>
        </div>

        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
          취소
        </Button>
      </div>
    </div>
  );
}
