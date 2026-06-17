import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { HeaderAuth } from '@/components/header-auth';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CONTI — AI 악보 키 변환',
    template: '%s | CONTI',
  },
  description:
    'AI로 악보 이미지를 자동으로 분석하여 멜로디와 코드를 정확하게 조옮김합니다. 교회 예배팀, 밴드, 음악 선생님을 위한 무료 악보 키 변환 서비스.',
  keywords: ['악보 키 변환', '조옮김', '악보 변환', 'AI 악보', '코드 변환', '셋리스트', '예배팀', '찬양팀'],
  openGraph: {
    title: 'CONTI — AI 악보 키 변환',
    description: 'AI로 악보 이미지를 멜로디·코드 포함 자동 조옮김. 무료 체험 제공.',
    url: 'https://conti.eungming.com',
    siteName: 'CONTI',
    locale: 'ko_KR',
    type: 'website',
  },
};

async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-sm font-bold tracking-widest text-foreground">CONTI</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/app" className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            앱
          </Link>
          <Link href="/guide" className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            사용 가이드
          </Link>
          <Link href="/about" className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            소개
          </Link>
          <HeaderAuth session={session} />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 mt-16">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-widest text-foreground/70">CONTI</span>
          <span>·</span>
          <span>AI 악보 키 변환 서비스</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/about" className="hover:text-foreground transition-colors">소개</Link>
          <Link href="/guide" className="hover:text-foreground transition-colors">사용 가이드</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">개인정보처리방침</Link>
        </nav>
      </div>
    </footer>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <Header />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
