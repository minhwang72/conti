'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeySelector } from '@/components/key-selector';
import type { SongItem } from '@/types/setlist';

interface SongCardProps {
  song: SongItem;
  onKeyChange: (id: string, key: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function SongCard({ song, onKeyChange, onRemove, disabled }: SongCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-3 px-3 py-2.5 bg-card rounded-lg border">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground"
          disabled={disabled}
        >
          <GripVertical className="size-4" />
        </button>

        <img
          src={song.preview}
          alt={song.fileName}
          className="size-10 rounded object-cover border flex-shrink-0"
        />

        <span className="flex-1 truncate text-sm min-w-0">
          {song.fileName}
        </span>

        <div className="flex-shrink-0 w-4">
          {song.status === 'processing' && (
            <Loader2 className="size-3.5 animate-spin text-foreground/40" />
          )}
          {song.status === 'done' && (
            <Check className="size-3.5 text-foreground/50" />
          )}
          {song.status === 'error' && (
            <AlertCircle className="size-3.5 text-destructive" />
          )}
        </div>

        <div className="flex-shrink-0">
          <KeySelector
            targetKey={song.targetKey}
            onTargetKeyChange={(key) => onKeyChange(song.id, key)}
            compact
          />
        </div>

        <button
          className="flex-shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
          onClick={() => onRemove(song.id)}
          disabled={disabled}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
