import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const EXTRACT_PROMPT = `악보 이미지를 ABC notation 형식으로 완전하게 변환하세요. 단 하나의 마디도 빠뜨리지 마세요.

헤더 (반드시 포함):
X:1
T:[곡 제목]
C:[작곡가] (있으면)
M:[박자기호] (예: 4/4, 3/4, 6/8)
L:1/8
Q:1/4=80 (빠르기 표시 있으면)
K:[조성] (예: G, Bm, Eb, Db, F#m)

음표 표기 (L:1/8 기준):
- 4분음표: C2 D2 E2
- 8분음표: C D E
- 2분음표: C4 D4
- 온음표: C8
- 점4분음표: C3
- 높은 옥타브: c d e (소문자)
- 매우 높은 옥타브: c' d' e'
- 낮은 옥타브: C, D, E,
- 올림표: ^C ^D
- 내림표: _B _E

코드 기호: 음표 바로 앞에 큰따옴표
예: "G"G2 "Em7"E2 "C/E"c2 "D"D4

가사: w: 줄에 하이픈으로 음절 구분 (각 마디 또는 섹션 뒤에)
예: w: 나-를 향-한 주-의 사-랑

마디 구조:
- 마디: |
- 도돌이표 시작: |:
- 도돌이표 끝: :|
- 겹세로줄: ||
- 쉼표: z(8분) z2(4분) z4(2분) z8(온음)

규칙:
1. 악보의 모든 마디를 처음부터 끝까지 빠짐없이 포함
2. 가사가 있으면 반드시 w: 줄 포함
3. 여러 단(system)이면 모두 포함
4. 각 마디가 박자에 맞게 채워지도록

마크다운 없이 X:1 로 시작하는 ABC notation 텍스트만 출력하세요.`;

function stripMarkdownFence(text: string): string {
  return text.replace(/^```(?:abc)?\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}

async function extractWithGemini(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY 없음');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { maxOutputTokens: 16384, temperature: 0.1 },
  });
  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64Data } },
    EXTRACT_PROMPT,
  ]);
  return stripMarkdownFence(result.response.text()?.trim() ?? '');
}

async function extractWithClaude(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 없음');
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: base64Data } },
        { type: 'text', text: EXTRACT_PROMPT },
      ],
    }],
  });
  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  return stripMarkdownFence(text);
}

export async function POST(request: NextRequest) {
  console.log('[extract] POST request received');
  try {
    const session = await auth();
    console.log('[extract] session:', session?.user?.id ?? 'no session');
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ success: false, error: '이미지를 업로드해주세요.' }, { status: 400 });
    }
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: '이미지 파일만 지원합니다.' }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    let rawAbc: string;

    if (!session?.user?.id) {
      // 비로그인: 완전 차단
      return NextResponse.json(
        { success: false, error: 'LOGIN_REQUIRED', message: '로그인 후 이용하실 수 있습니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (user.isPremium) {
      // 프리미엄: Claude 사용
      rawAbc = await extractWithClaude(base64Data, mimeType);
    } else if (!user.freeUsed) {
      // 무료 1회: Gemini 사용 후 freeUsed = true 로 업데이트
      rawAbc = await extractWithGemini(base64Data, mimeType);
      await prisma.user.update({
        where: { id: user.id },
        data: { freeUsed: true, extractionCount: { increment: 1 } },
      });
    } else {
      // 무료 소진: 업그레이드 안내
      return NextResponse.json(
        { success: false, error: 'UPGRADE_REQUIRED', message: '무료 체험이 종료되었습니다. 프리미엄으로 업그레이드하세요.' },
        { status: 402 }
      );
    }

    if (!rawAbc || !rawAbc.startsWith('X:')) {
      return NextResponse.json(
        { success: false, error: '악보를 인식하지 못했습니다. 더 선명한 이미지로 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    const keyMatch = rawAbc.match(/^K:(.+)$/m);
    const titleMatch = rawAbc.match(/^T:(.+)$/m);
    const originalKey = keyMatch?.[1]?.trim().replace(/\s.*$/, '') ?? 'C';
    const title = titleMatch?.[1]?.trim() ?? '';

    return NextResponse.json({ success: true, data: { abc: rawAbc, originalKey, title } });
  } catch (error) {
    console.error('Extract API error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: toFriendlyError(msg) }, { status: 500 });
  }
}

function toFriendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('credit') || m.includes('quota') || m.includes('rate limit')) return 'AI 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  if (m.includes('timeout') || m.includes('deadline')) return '응답 시간이 초과되었습니다. 다시 시도해주세요.';
  if (m.includes('api key') || m.includes('authentication') || m.includes('401')) return 'API 인증 오류가 발생했습니다.';
  return '변환 중 오류가 발생했습니다. 다시 시도해주세요.';
}
