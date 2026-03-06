'use client';

import { useCallback, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SetlistUploaderProps {
  onFilesSelect: (files: File[]) => void;
  hasExistingSongs: boolean;
}

export function SetlistUploader({ onFilesSelect, hasExistingSongs }: SetlistUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const valid: File[] = [];
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;
        valid.push(file);
      }
      if (valid.length > 0) onFilesSelect(valid);
    },
    [onFilesSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFiles]
  );

  const openFileDialog = () => inputRef.current?.click();

  if (hasExistingSongs) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <button
          onClick={openFileDialog}
          className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg transition-colors"
        >
          + 악보 추가
        </button>
      </>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          border border-dashed rounded-xl p-16 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-foreground/40 bg-accent' : 'border-border hover:border-foreground/30'}
        `}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/80">악보 이미지를 여기에 드래그하거나 클릭</p>
          <p className="text-xs text-muted-foreground">
            여러 장 동시 선택 가능 &middot; JPG, PNG, WebP &middot; 5MB
          </p>
        </div>
      </div>
    </>
  );
}
