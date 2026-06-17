'use client';

import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import Image from 'next/image';

export function HeaderAuth({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
      <div className="ml-2 flex items-center gap-2">
        {session.user.isPremium && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">PRO</span>
        )}
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? ''}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut()}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="ml-2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      Google 로그인
    </button>
  );
}
