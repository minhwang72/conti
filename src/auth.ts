import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.isPremium = (user as { isPremium?: boolean }).isPremium ?? false;
      session.user.freeUsed = (user as { freeUsed?: boolean }).freeUsed ?? false;
      session.user.extractionCount = (user as { extractionCount?: number }).extractionCount ?? 0;
      return session;
    },
  },
  pages: {
    signIn: '/app',
  },
});
