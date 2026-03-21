import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          console.log("DEBUG - Criando novo usuário via Google:", user.email);
          await prisma.user.create({
            data: {
              name: user.name || "Usuário Google",
              email: user.email,
              role: "PSICOLOGO",
              tenantOwner: {
                create: {
                  plan: "FREE",
                  clinicName: `Consultório de ${user.name?.split(" ")[0] || "Google"}`,
                }
              }
            } as any
          });
        }
        return true;
      } catch (error) {
        console.error("DEBUG - Erro no signIn callback NextAuth:", error);
        return false;
      }
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
