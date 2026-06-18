import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? '';
const MONTHLY_PRICE = 6900;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authKey = searchParams.get('authKey');
  const customerKey = searchParams.get('customerKey');

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/app?error=login_required', request.url));
  }

  if (!authKey || !customerKey) {
    return NextResponse.redirect(new URL('/upgrade?error=missing_params', request.url));
  }

  try {
    // 1. authKey → billingKey 발급
    const authResponse = await fetch(
      `https://api.tosspayments.com/v1/billing/authorizations/${authKey}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerKey }),
      }
    );

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      console.error('[billing-auth] billingKey 발급 실패', authData);
      return NextResponse.redirect(new URL('/upgrade?error=billing_auth_failed', request.url));
    }

    const billingKey: string = authData.billingKey;

    // 2. 즉시 첫 달 결제
    const orderId = `CONTI-${session.user.id}-${Date.now()}`;
    const chargeResponse = await fetch(
      `https://api.tosspayments.com/v1/billing/${billingKey}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerKey,
          amount: MONTHLY_PRICE,
          orderId,
          orderName: 'CONTI 프리미엄 (1개월)',
          customerEmail: session.user.email ?? '',
          customerName: session.user.name ?? '사용자',
        }),
      }
    );

    const chargeData = await chargeResponse.json();
    if (!chargeResponse.ok) {
      console.error('[billing-auth] 결제 실패', chargeData);
      return NextResponse.redirect(new URL('/upgrade?error=payment_failed', request.url));
    }

    // 3. DB 업데이트
    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + 1);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { isPremium: true, premiumUntil, billingKey },
      }),
      prisma.payment.create({
        data: {
          userId: session.user.id,
          orderId,
          amount: MONTHLY_PRICE,
          status: 'DONE',
          billingKey,
        },
      }),
    ]);

    return NextResponse.redirect(new URL('/app?premium=activated', request.url));
  } catch (err) {
    console.error('[billing-auth] 오류', err);
    return NextResponse.redirect(new URL('/upgrade?error=server_error', request.url));
  }
}
