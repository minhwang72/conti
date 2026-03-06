import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadApiKey(): string {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^GEMINI_API_KEY=(.+)$/);
      if (match) return match[1].trim();
    }
  } catch {
    // ignore
  }

  throw new Error('GEMINI_API_KEY를 찾을 수 없습니다. .env.local 파일을 확인해주세요.');
}

export function getGenAI() {
  return new GoogleGenAI({ apiKey: loadApiKey() });
}
