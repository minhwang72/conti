'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/music/constants';

interface KeySelectorProps {
  targetKey: string;
  onTargetKeyChange: (key: string) => void;
  compact?: boolean;
}

export function KeySelector({ targetKey, onTargetKeyChange, compact }: KeySelectorProps) {
  return (
    <Select value={targetKey} onValueChange={onTargetKeyChange}>
      <SelectTrigger className={compact ? 'w-[140px]' : undefined}>
        <SelectValue placeholder={compact ? '키 선택' : '키를 선택하세요'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__original__">원본 유지</SelectItem>
        <SelectSeparator />
        {ALL_KEYS.map((key) => (
          <SelectItem key={`target-${key}`} value={key}>
            {KEY_DISPLAY[key] || key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
