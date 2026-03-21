import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "default_secret_key_change_me_in_prod";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

interface SessionPayload {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  expires: string;
  [key: string]: unknown;
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (_error) {
    return null;
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "./nextauth";

export async function setSession(user: { id: string; email: string; role: string; name: string }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  
  if (session) {
    const decrypted = await decrypt(session);
    if (decrypted) return decrypted;
  }

  // Fallback to NextAuth session
  try {
    const nextSession = await getServerSession(authOptions);
    if (nextSession?.user) {
      return {
        user: {
          id: (nextSession.user as any).id,
          email: nextSession.user.email!,
          role: (nextSession.user as any).role || "PSICOLOGO",
          name: nextSession.user.name || "",
        },
        expires: nextSession.expires,
      };
    }
  } catch (e) {
    console.error("Error fetching NextAuth session:", e);
  }

  return null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  // Note: signOut from next-auth should be handled on client or separately if needed
}
