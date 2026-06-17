import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CONTI 소개',
  description: 'CONTI는 Claude AI 기반 악보 키 변환 서비스입니다. 교회 예배팀, 밴드, 음악 선생님을 위해 만들어졌습니다.',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">CONTI 소개</h1>
        <p className="mt-3 text-muted-foreground">AI 악보 키 변환 서비스</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground/80 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">만든 이유</h2>
          <p>
            교회 예배팀에서 악기를 연주하다 보면 매주 같은 고민이 반복됩니다.
            보컬의 키에 맞게 악보를 조옮김해야 하는데, 수작업으로 하면 코드 기호 하나씩 바꾸는 데만 20~30분이 걸렸습니다.
            기존 앱들은 코드 기호만 텍스트로 바꿔주거나, 정확도가 낮거나, 유료인 경우가 많았습니다.
          </p>
          <p className="mt-3">
            CONTI는 그 불편함을 해결하기 위해 만들어졌습니다.
            악보 이미지 하나를 올리면 AI가 멜로디, 코드, 가사를 모두 인식하고 원하는 키로 변환해줍니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">기술 구조</h2>
          <p>
            CONTI는 Anthropic의 Claude Vision 모델을 사용합니다.
            악보 이미지를 업로드하면 Claude AI가 이미지를 분석하여 표준 음악 표기 형식인 ABC notation으로 변환합니다.
            이후 클라이언트 사이드에서 수학적으로 정확한 조옮김 알고리즘을 적용하고,
            abcjs 라이브러리로 깔끔한 악보 이미지를 렌더링합니다.
          </p>
          <p className="mt-3">
            이미지 생성 AI에 의존하지 않기 때문에 코드 기호와 멜로디가 100% 정확하게 변환됩니다.
            단순히 이미지를 다시 그리는 것이 아니라 음악을 이해한 결과를 출력합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">누구를 위한 서비스인가</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              '교회 예배팀 · 찬양팀 — 매주 보컬 키에 맞게 악보를 준비해야 하는 분들',
              '밴드 · 세션 뮤지션 — 악기별 조옮김 악보가 자주 필요한 분들',
              '음악 선생님 · 학원 — 학생 수준에 맞게 악보를 바꿔주는 분들',
              '보컬 · 솔로 연주자 — 자신에게 맞는 키로 연습하고 싶은 분들',
            ].map((t) => (
              <li key={t} className="flex gap-2 text-sm">
                <span className="text-primary/60 flex-shrink-0">—</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">개발 방향</h2>
          <p>
            CONTI는 계속 발전하고 있습니다. 현재 계획 중인 기능으로는 악보 편집 기능, 다중 성부 악보 지원,
            템포·음량 표시 보존, 모바일 최적화 등이 있습니다.
            피드백이나 제안이 있으시면 언제든지 연락 주세요.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">문의</h2>
          <p>
            서비스 이용 중 문제가 발생하거나 개선 제안이 있으시면 이메일로 연락해 주세요.
          </p>
          <p className="mt-2">
            <a href="mailto:zxcyui6181@gmail.com" className="text-primary/80 hover:underline">
              zxcyui6181@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          지금 사용해보기
          <ChevronRight className="size-4" />
        </Link>
      </div>

    </div>
  );
}
