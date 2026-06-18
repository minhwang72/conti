'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';
const MONTHLY_PRICE = 6900;

const ERROR_MESSAGES: Record<string, string> = {
  payment_failed: '결제에 실패했습니다. 다시 시도해주세요.',
  billing_auth_failed: '카드 등록에 실패했습니다.',
  server_error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

function UpgradeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam) setErrorMsg(ERROR_MESSAGES[errParam] ?? '오류가 발생했습니다.');
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleUpgrade = async () => {
    if (!TOSS_CLIENT_KEY || TOSS_CLIENT_KEY === 'test_ck_placeholder') {
      setErrorMsg('결제 키가 설정되지 않았습니다. 관리자에게 문의하세요.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: session.user.id! });
      await payment.requestBillingAuth({
        method: 'CARD',
        successUrl: `${window.location.origin}/api/payment/billing-auth`,
        failUrl: `${window.location.origin}/upgrade?error=payment_failed`,
        customerEmail: session.user.email ?? undefined,
        customerName: session.user.name ?? undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '결제 오류';
      if (!msg.includes('취소')) setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl mb-3">⭐</div>
          <h1 className="text-xl font-semibold">CONTI 프리미엄</h1>
          <p className="text-sm text-muted-foreground">Claude AI 고품질 변환 · 무제한 사용</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-3">
            {[
              'Claude AI 고품질 악보 인식',
              '무제한 악보 변환',
              'PDF / Word 내보내기',
              '셋리스트 일괄 변환',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">₩6,900</span>
              <span className="text-sm text-muted-foreground">/ 월</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">매월 자동 갱신 · 언제든 해지 가능</p>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{errorMsg}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isLoading ? '연결 중...' : '카드 등록하고 시작하기'}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            토스페이먼츠 보안 결제 · SSL 암호화
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="w-full text-xs text-muted-foreground hover:text-foreground text-center"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        로딩 중...
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}
