'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SongCard } from '@/components/song-card';
import type { SongItem } from '@/types/setlist';

interface SortableSongListProps {
  songs: SongItem[];
  onReorder: (songs: SongItem[]) => void;
  onKeyChange: (id: string, key: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function SortableSongList({
  songs,
  onReorder,
  onKeyChange,
  onRemove,
  disabled,
}: SortableSongListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex((s) => s.id === active.id);
      const newIndex = songs.findIndex((s) => s.id === over.id);
      onReorder(arrayMove(songs, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={songs.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        <div className="space-y-2">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onKeyChange={onKeyChange}
              onRemove={onRemove}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
