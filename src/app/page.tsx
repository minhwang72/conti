import Link from 'next/link';
import { Music2, Zap, FileDown, Layers, ChevronRight, Check } from 'lucide-react';
import { auth } from '@/auth';

const FEATURES = [
  {
    icon: Zap,
    title: 'Claude AI 정밀 인식',
    desc: 'Anthropic Claude Vision 모델로 멜로디, 코드, 가사를 동시에 인식합니다. 단순 코드 변환이 아닌 실제 악보를 이해합니다.',
  },
  {
    icon: Music2,
    title: '멜로디 + 코드 동시 변환',
    desc: '코드 기호(Em7, F/A...)와 멜로디 음표가 함께 정확하게 옮겨집니다. 반음 단위 12개 키 전부 지원합니다.',
  },
  {
    icon: Layers,
    title: '셋리스트 한 번에',
    desc: '여러 곡을 동시에 업로드하고 드래그로 순서를 정리하세요. 예배팀, 밴드 셋리스트 준비가 훨씬 빨라집니다.',
  },
  {
    icon: FileDown,
    title: 'PDF · Word 내보내기',
    desc: '변환된 악보를 개별 이미지, 합본 PDF, Word 파일로 저장합니다. 인쇄하거나 팀원에게 바로 공유하세요.',
  },
];

const STEPS = [
  { n: '01', title: '악보 이미지 업로드', desc: '스마트폰으로 찍은 사진이나 스캔 이미지를 드래그하거나 클릭해서 올려주세요. JPG · PNG · WebP 지원.' },
  { n: '02', title: '목표 키 선택', desc: '각 곡마다 원하는 키를 C부터 B까지 선택하세요. 여러 곡을 각각 다른 키로 설정할 수 있습니다.' },
  { n: '03', title: 'AI 변환 & 다운로드', desc: '변환하기 버튼을 누르면 AI가 악보를 분석해 자동으로 조옮김합니다. 완료되면 PDF로 저장하세요.' },
];

const USES = [
  { emoji: '⛪', title: '교회 예배팀 · 찬양팀', desc: '보컬 키에 맞게 코드표와 악보를 한 번에 변환. 매주 반복되는 준비 시간을 줄이세요.' },
  { emoji: '🎸', title: '밴드 · 세션 뮤지션', desc: '악기별 조옮김 악보가 필요할 때, 여러 키 버전을 한꺼번에 만들 수 있습니다.' },
  { emoji: '🎹', title: '음악 선생님 · 학원', desc: '학생의 음역대에 맞게 악보를 바꿔줄 때 수작업 없이 몇 초 만에 완성합니다.' },
  { emoji: '🎤', title: '보컬 · 솔로 연주자', desc: '자신에게 맞는 키로 편하게 연습하세요. 원하는 키 악보를 즉시 출력할 수 있습니다.' },
];

const PLANS = [
  {
    name: '무료 체험',
    price: '0원',
    desc: 'Google 로그인 후 1회 무료 변환',
    features: ['악보 1장 무료 변환', 'AI 키 변환 체험', 'PDF 다운로드'],
    cta: '무료로 체험하기',
    highlight: false,
  },
  {
    name: '프리미엄',
    price: '₩6,900',
    period: '/월',
    desc: 'Claude AI로 고품질 무제한 변환',
    features: ['무제한 악보 변환', 'Claude AI 고품질 인식', '셋리스트 한 번에', 'PDF · Word 내보내기', '멜로디 + 코드 동시 변환'],
    cta: '곧 오픈 예정',
    highlight: true,
  },
];

const FAQS = [
  { q: '무료로 사용할 수 있나요?', a: 'Google 계정으로 로그인하면 악보 1장을 무료로 변환해볼 수 있습니다. 이후 계속 사용하려면 프리미엄 구독이 필요합니다.' },
  { q: '어떤 악보 이미지를 쓸 수 있나요?', a: 'JPG, PNG, WebP 형식의 이미지 파일을 지원합니다. 스마트폰으로 찍은 사진도 가능합니다. 선명할수록 인식률이 높아집니다.' },
  { q: '정확도는 어느 정도인가요?', a: 'Claude AI Vision을 사용하여 코드와 멜로디를 인식합니다. 깨끗하게 인쇄된 악보에서 높은 정확도를 보입니다. 리드시트, 코드 악보에서 가장 잘 작동합니다.' },
  { q: '한 번에 몇 곡까지 처리할 수 있나요?', a: '프리미엄 플랜에서는 여러 곡을 동시에 업로드할 수 있습니다. 병렬 처리로 5~10곡도 빠르게 완료됩니다.' },
  { q: '변환 결과를 수정할 수 있나요?', a: '현재 버전에서는 AI 변환 결과를 직접 편집하는 기능은 없습니다. 추후 업데이트에서 추가할 예정입니다.' },
];

export default async function LandingPage() {
  const session = await auth();
  const isPremium = session?.user?.isPremium;
  const freeUsed = session?.user?.freeUsed;
  const isLoggedIn = !!session?.user;

  let heroCtaText = '무료 체험 시작하기';
  let heroSubText = 'Google 로그인 후 1회 무료 · 이후 월 ₩6,900';

  if (isPremium) {
    heroCtaText = '앱 바로가기';
    heroSubText = '프리미엄 플랜 이용 중';
  } else if (isLoggedIn && freeUsed) {
    heroCtaText = '프리미엄 업그레이드';
    heroSubText = '무료 체험 완료 · 프리미엄으로 계속 사용';
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <span className="inline-block mb-4 rounded-full bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary/80 tracking-wide">
            Claude AI 기반 악보 변환
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            악보 조옮김,<br />
            <span className="text-primary/70">AI가 10초 만에</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            멜로디와 코드가 함께 바뀌는 악보 키 변환 서비스.
            이미지를 올리고 키를 선택하면 끝입니다.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {heroCtaText}
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              사용 방법 보기
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{heroSubText}</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight">3단계로 완성</h2>
          <p className="mt-2 text-muted-foreground text-sm">복잡한 설정 없이 누구나 바로 사용할 수 있습니다</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="text-3xl font-bold text-foreground/10 font-mono">{s.n}</span>
              <h3 className="mt-3 font-semibold text-base">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-accent/30">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight">왜 CONTI인가요?</h2>
            <p className="mt-2 text-muted-foreground text-sm">단순한 코드 변환을 넘어 악보 전체를 이해합니다</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                  <f.icon className="size-5 text-primary/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight">이런 분들께 딱 맞습니다</h2>
          <p className="mt-2 text-muted-foreground text-sm">음악을 사랑하는 모든 분들을 위해 만들었습니다</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {USES.map((u) => (
            <div key={u.title} className="rounded-2xl border border-border p-6">
              <div className="text-2xl mb-3">{u.emoji}</div>
              <h3 className="font-semibold text-sm">{u.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border/50 bg-accent/30">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight">요금제</h2>
            <p className="mt-2 text-muted-foreground text-sm">처음엔 무료로, 마음에 들면 계속</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-7 flex flex-col gap-5 ${
                  p.highlight
                    ? 'border-primary/40 bg-primary/4 shadow-sm'
                    : 'border-border bg-card'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base">{p.name}</span>
                    {p.highlight && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">추천</span>
                    )}
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">{p.price}</span>
                    {p.period && <span className="text-sm text-muted-foreground mb-0.5">{p.period}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                </div>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-3.5 text-primary/60 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className={`mt-auto text-center rounded-full py-2.5 text-sm font-semibold transition-colors ${
                    p.highlight
                      ? 'bg-primary/20 text-primary/80 cursor-not-allowed pointer-events-none'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">자주 묻는 질문</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
