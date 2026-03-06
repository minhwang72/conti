import { NextRequest, NextResponse } from 'next/server';
import { getGenAI } from '@/lib/gemini';
import { getSemitoneShift, transposeChordSymbol } from '@/lib/music/transpose-abc';

// ============================================================
// STEP 1: Extract chords from image (Gemini Flash - fast)
// ============================================================
const EXTRACT_PROMPT = `이 악보 이미지를 분석해서 아래 JSON 형식으로 정확히 추출해줘.

코드(chord)와 가사를 빠짐없이 추출해야 합니다. 멜로디 음표는 추출하지 않아도 됩니다.

JSON 형식:
{
  "title": "곡 제목",
  "composer": "작곡가 (있으면)",
  "arranger": "편곡 (있으면)",
  "key": "원래 키 (예: D, Eb, F#m)",
  "timeSignature": "박자 (예: 4/4)",
  "measures": [
    {
      "number": 1,
      "chords": ["D", "Em7"],
      "lyrics": "나를 향한 주의 사랑"
    }
  ]
}

규칙:
- key: 조표와 코드 진행을 보고 정확히 판별
- chords: 해당 마디에 나오는 모든 코드 기호 정확히 (Em7, C7sus4, D/F#, Gm7, Em7/A 등)
- lyrics: 해당 마디의 가사
- 마디 번호는 1부터 순서대로

반드시 유효한 JSON만 출력. 마크다운 펜싱 없이 JSON만.`;

// ============================================================
// STEP 2: Transpose chords in code (100% accurate)
// ============================================================
interface Measure {
  number: number;
  chords: string[];
  lyrics: string;
}

interface ExtractedMusic {
  title: string;
  composer?: string;
  arranger?: string;
  key: string;
  timeSignature: string;
  measures: Measure[];
}

function transposeMusicData(data: ExtractedMusic, targetKey: string) {
  const semitones = getSemitoneShift(data.key, targetKey);

  const transposedMeasures = data.measures.map((measure) => ({
    ...measure,
    chords: measure.chords.map((chord) =>
      transposeChordSymbol(chord, semitones, targetKey)
    ),
  }));

  return {
    original: data,
    transposed: { ...data, key: targetKey, measures: transposedMeasures },
    semitones,
  };
}

// ============================================================
// STEP 3: Build prompt for image generation
// ============================================================
const KEY_SIG: Record<string, number> = {
  'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6,
  'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6,
};

function keySigDesc(key: string): string {
  const s = KEY_SIG[key.replace('m', '')];
  if (s === undefined) return '';
  if (s === 0) return '조표 없음';
  if (s > 0) return `샵(#) ${s}개`;
  return `플랫(b) ${Math.abs(s)}개`;
}

function buildImagePrompt(original: ExtractedMusic, transposed: ExtractedMusic, semitones: number): string {
  // Chord mapping
  const chordMap = new Map<string, string>();
  original.measures.forEach((m, i) => {
    m.chords.forEach((chord, j) => {
      if (transposed.measures[i]?.chords[j]) chordMap.set(chord, transposed.measures[i].chords[j]);
    });
  });
  const chordMapStr = Array.from(chordMap.entries()).map(([f, t]) => `  ${f} → ${t}`).join('\n');

  // Measure details (chords + lyrics only)
  const measureDetail = transposed.measures
    .map((m) => `마디${m.number}: 코드=[${m.chords.join(', ')}] 가사="${m.lyrics}"`)
    .join('\n');

  return `첨부된 원본 악보를 ${transposed.key}키로 조옮김해서 동일한 디자인의 악보 이미지를 그려줘.

코드만 변경하고, 음표(멜로디)는 원본 그대로 유지해줘.

제목: ${transposed.title}
${transposed.arranger ? `편곡: ${transposed.arranger}` : ''}${transposed.composer ? `\n작곡: ${transposed.composer}` : ''}
박자: ${transposed.timeSignature}

## 조표 변경
원본: ${keySigDesc(original.key)} → 변환: ${keySigDesc(transposed.key)}

## 코드 변환 (100% 이 값만 사용):
${chordMapStr}

## 마디별 상세:
${measureDetail}

## 규칙:
1. 반드시 흰색(#FFFFFF) 배경으로 출력
2. 원본과 동일한 디자인/레이아웃/폰트
3. 코드: 위 변환표 100% 정확 사용 (가장 중요!)
4. 음표/멜로디: 원본과 동일하게 유지
5. 조표: ${keySigDesc(transposed.key)}로 변경
6. 가사/제목/작곡자 원본과 동일
7. 반복기호(Fine, D.C. al Fine) 원본과 동일
7. 악보 이미지로 출력`;
}

// ============================================================
// Main handler
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const targetKey = formData.get('targetKey') as string;

    if (!imageFile || !targetKey) {
      return NextResponse.json(
        { success: false, error: '이미지와 변경할 키를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const ai = getGenAI();

    // ---- STEP 1: Extract chords as JSON (Flash - fast) ----
    const extractResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: imageFile.type, data: base64Data } },
            { text: EXTRACT_PROMPT },
          ],
        },
      ],
    });

    const extractText = extractResponse.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('') || '';

    const jsonStr = extractText
      .replace(/^```(?:json)?\n?/gm, '')
      .replace(/\n?```$/gm, '')
      .trim();

    let extractedData: ExtractedMusic;
    try {
      extractedData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { success: false, error: '악보 데이터 추출에 실패했습니다. 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    // ---- STEP 2: Transpose chords in code (100% accurate) ----
    if (extractedData.key === targetKey) {
      // Same key — skip image generation, return original
      return NextResponse.json({
        success: true,
        data: {
          image: base64Data,
          mimeType: imageFile.type,
          originalKey: extractedData.key,
          targetKey,
          semitoneShift: 0,
          title: extractedData.title,
        },
      });
    }

    const { original, transposed, semitones } = transposeMusicData(extractedData, targetKey);

    // Build chord mapping for UI display
    const chordMap: Record<string, string> = {};
    original.measures.forEach((m, i) => {
      m.chords.forEach((chord, j) => {
        if (transposed.measures[i]?.chords[j] && !chordMap[chord]) {
          chordMap[chord] = transposed.measures[i].chords[j];
        }
      });
    });

    // ---- STEP 3: Generate image ----
    const imagePrompt = buildImagePrompt(original, transposed, semitones);

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: imageFile.type, data: base64Data } },
            { text: imagePrompt },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    let generatedImage: string | null = null;
    let generatedMimeType = 'image/png';
    let description = '';

    if (imageResponse.candidates?.[0]?.content?.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImage = part.inlineData.data ?? null;
          generatedMimeType = part.inlineData.mimeType ?? 'image/png';
        }
        if (part.text) {
          description += part.text;
        }
      }
    }

    if (!generatedImage) {
      console.error('Image generation failed. Response:', JSON.stringify(imageResponse.candidates?.[0], null, 2));
      return NextResponse.json(
        { success: false, error: '악보 이미지 생성에 실패했습니다. 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        image: generatedImage,
        mimeType: generatedMimeType,
        originalKey: original.key,
        targetKey,
        semitoneShift: semitones,
        title: original.title,
        chordMap,
        description,
      },
    });
  } catch (error) {
    console.error('Transpose API error:', error);
    const raw = error instanceof Error ? error.message : String(error);
    const friendly = toFriendlyError(raw);
    return NextResponse.json(
      { success: false, error: friendly },
      { status: 500 }
    );
  }
}

function toFriendlyError(msg: string): string {
  const lower = msg.toLowerCase();

  if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource exhausted') || lower.includes('429')) {
    return 'AI 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }
  if (lower.includes('too many requests')) {
    return '요청이 너무 많습니다. 1~2분 후 다시 시도해주세요.';
  }
  if (lower.includes('timeout') || lower.includes('deadline')) {
    return '응답 시간이 초과되었습니다. 다시 시도해주세요.';
  }
  if (lower.includes('api key') || lower.includes('authentication') || lower.includes('permission') || lower.includes('403')) {
    return 'API 인증에 문제가 있습니다. 관리자에게 문의해주세요.';
  }
  if (lower.includes('not found') || lower.includes('404')) {
    return 'AI 모델을 찾을 수 없습니다. 관리자에게 문의해주세요.';
  }
  if (lower.includes('500') || lower.includes('internal server error') || lower.includes('unavailable')) {
    return 'AI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
  }
  if (lower.includes('safety') || lower.includes('blocked') || lower.includes('content filter')) {
    return '악보 이미지를 처리할 수 없습니다. 다른 이미지로 시도해주세요.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('econnrefused')) {
    return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
  }

  return '변환 중 오류가 발생했습니다. 다시 시도해주세요.';
}
