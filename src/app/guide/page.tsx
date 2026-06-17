import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '사용 가이드 — 악보 키 변환하는 법',
  description: 'CONTI로 악보 키를 변환하는 방법을 단계별로 설명합니다. 이미지 업로드부터 PDF 저장까지 5분이면 충분합니다.',
};

const TIPS = [
  {
    title: '선명한 이미지를 사용하세요',
    desc: '스마트폰 카메라로 찍을 때는 직접 위에서 수직으로 찍어주세요. 그림자나 빛 반사가 없을수록 인식률이 올라갑니다. 스캔 이미지라면 300dpi 이상을 권장합니다.',
  },
  {
    title: '한 장에 한 곡이 좋습니다',
    desc: '여러 곡이 한 이미지에 섞여 있으면 AI가 어느 부분을 처리해야 할지 혼동할 수 있습니다. 곡 단위로 이미지를 잘라서 업로드하면 정확도가 높아집니다.',
  },
  {
    title: '코드 악보에서 가장 잘 동작합니다',
    desc: 'CONTI는 리드시트(멜로디 + 코드 + 가사) 형식에 최적화되어 있습니다. 피아노 대보 형태의 복잡한 악보보다는 기타 코드표나 보컬 악보에서 정확도가 높습니다.',
  },
  {
    title: '여러 곡은 한번에 업로드하세요',
    desc: '파일 선택 시 여러 개를 동시에 선택하거나, 이미 업로드된 상태에서 추가 버튼을 눌러 계속 추가할 수 있습니다. 순서는 드래그로 조정하세요.',
  },
];

const STEPS_DETAIL = [
  {
    n: '1',
    title: '악보 이미지 준비하기',
    content: `먼저 변환할 악보 이미지를 준비합니다. 스마트폰 카메라로 찍은 사진이나, 스캔된 PDF를 이미지로 저장한 것, 또는 디지털 악보 파일이라면 스크린샷을 사용해도 됩니다.

지원 형식은 JPG, PNG, WebP이며 파일 크기는 5MB 이하여야 합니다. 1장에 1곡씩 준비하는 것이 인식률에 유리합니다.`,
  },
  {
    n: '2',
    title: 'CONTI 앱에 업로드하기',
    content: `상단 메뉴에서 "앱"을 클릭하거나, 아래 버튼을 눌러 앱 페이지로 이동하세요.

회색 영역에 이미지를 드래그해서 놓거나, 클릭해서 파일 선택 창을 열어주세요. 여러 파일을 한꺼번에 선택하면 동시에 업로드됩니다.

업로드된 곡 목록에서 드래그 핸들(⠿ 아이콘)을 잡아 순서를 바꿀 수 있습니다.`,
  },
  {
    n: '3',
    title: '목표 키 선택하기',
    content: `각 곡 오른쪽에 있는 키 선택 드롭다운에서 원하는 키를 고르세요. C Major부터 B Major까지 모든 장조와, 단조(Am, Em...)도 선택할 수 있습니다.

"원본 유지"를 선택하면 해당 곡은 AI 분석 없이 그대로 출력됩니다. 셋리스트에서 일부 곡만 키를 바꿀 때 유용합니다.

같은 곡을 여러 키로 만들고 싶다면 같은 이미지를 두 번 업로드한 뒤 각각 다른 키를 설정하세요.`,
  },
  {
    n: '4',
    title: 'AI 변환하기',
    content: `키 설정이 끝나면 "변환하기" 버튼을 누르세요. Claude AI가 이미지를 분석하여 멜로디, 코드, 가사를 추출하고 선택한 키로 조옮김합니다.

변환 시간은 곡당 약 5~15초입니다. 여러 곡은 병렬로 처리되기 때문에 10곡이라도 15~20초 내에 완료됩니다.

이전에 분석된 곡은 키를 바꿔도 재분석 없이 즉시 변환됩니다.`,
  },
  {
    n: '5',
    title: '저장 및 내보내기',
    content: `변환이 완료되면 하단에 결과 악보가 표시됩니다. 각 악보 오른쪽 "저장" 버튼으로 개별 PNG 이미지를 다운로드할 수 있습니다.

셋리스트 전체를 저장하려면:
- PDF 버튼: A4 한 페이지에 한 곡씩 들어간 PDF 파일 저장
- Word 버튼: 편집 가능한 Word(.docx) 파일로 저장

파일명은 곡 제목과 키 정보가 자동으로 포함됩니다.`,
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">사용 가이드</h1>
        <p className="mt-3 text-muted-foreground">악보 키를 변환하는 방법을 단계별로 알아보세요</p>
      </div>

      {/* 상세 단계 */}
      <div className="space-y-10">
        {STEPS_DETAIL.map((s) => (
          <div key={s.n} className="flex gap-5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary/70 mt-0.5">
              {s.n}
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
              <div className="mt-2 space-y-2">
                {s.content.trim().split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{para}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 팁 */}
      <div className="mt-14">
        <h2 className="text-xl font-bold tracking-tight mb-6">더 좋은 결과를 위한 팁</h2>
        <div className="space-y-4">
          {TIPS.map((tip) => (
            <div key={tip.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">💡 {tip.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 지원 키 목록 */}
      <div className="mt-14">
        <h2 className="text-xl font-bold tracking-tight mb-4">지원하는 키 목록</h2>
        <p className="text-sm text-muted-foreground mb-4">장조(Major) 12개와 단조(Minor) 전체를 지원합니다.</p>
        <div className="flex flex-wrap gap-2">
          {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].map((k) => (
            <span key={k} className="px-3 py-1 rounded-lg bg-accent text-xs font-mono font-medium text-foreground/70">
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 pt-8 border-t border-border">
        <h2 className="text-base font-semibold">준비되셨나요?</h2>
        <p className="mt-1 text-sm text-muted-foreground">악보 이미지만 있으면 바로 시작할 수 있습니다.</p>
        <Link
          href="/app"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          지금 변환하기
          <ChevronRight className="size-4" />
        </Link>
      </div>

    </div>
  );
}
