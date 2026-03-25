import { NextAuthOptions, getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        });
        
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
