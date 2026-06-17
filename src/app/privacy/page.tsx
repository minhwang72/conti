import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'CONTI 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">개인정보처리방침</h1>
      <p className="text-sm text-muted-foreground mb-10">최종 수정일: 2026년 6월 16일</p>

      <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. 서비스 개요</h2>
          <p>
            CONTI(이하 "서비스")는 악보 이미지를 AI로 분석하여 키를 변환하는 웹 서비스입니다.
            본 개인정보처리방침은 서비스 이용 과정에서 수집되는 정보와 그 처리 방식을 설명합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. 수집하는 정보</h2>
          <p>서비스는 다음과 같은 정보를 처리합니다.</p>
          <ul className="mt-2 space-y-1.5 pl-4 list-disc list-outside">
            <li>사용자가 업로드하는 악보 이미지 파일</li>
            <li>서비스 이용 시 자동으로 수집되는 접속 로그 (IP 주소, 접속 시간, 브라우저 정보)</li>
          </ul>
          <p className="mt-2">서비스를 이용하려면 Google 계정으로 로그인이 필요하며, 이를 통해 이름, 이메일, 프로필 사진이 수집됩니다. 수집된 정보는 서비스 이용 현황 관리(무료 체험 여부, 프리미엄 구독 여부)에만 사용됩니다.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. 이미지 처리 방식</h2>
          <p>
            업로드된 악보 이미지는 Anthropic의 Claude API를 통해 처리됩니다.
            이미지는 AI 분석 목적으로만 사용되며, 서비스 서버에 저장되지 않습니다.
            Anthropic의 API 사용 정책에 따라 이미지는 전송 후 즉시 처리되고 보관되지 않습니다.
          </p>
          <p className="mt-2">
            Anthropic의 개인정보 처리 방침은{' '}
            <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:underline">
              anthropic.com/privacy
            </a>
            에서 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. 쿠키 및 분석</h2>
          <p>
            서비스는 서비스 품질 향상을 위해 Google Analytics 등의 분석 도구를 사용할 수 있습니다.
            이를 통해 수집되는 정보는 개인을 식별할 수 없는 집계 데이터입니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. 제3자 제공</h2>
          <p>
            서비스는 법령에 의한 경우를 제외하고, 수집된 정보를 제3자에게 판매하거나 공유하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. 문의</h2>
          <p>
            개인정보 처리에 관한 문의 사항은 아래 이메일로 연락해 주세요.
          </p>
          <p className="mt-1">
            <a href="mailto:zxcyui6181@gmail.com" className="text-primary/80 hover:underline">
              zxcyui6181@gmail.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
