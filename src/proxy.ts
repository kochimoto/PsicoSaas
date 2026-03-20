import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

const protectedRoutes = ['/dashboard', '/portal', '/admin'];
const publicOnlyRoutes = ['/login', '/cadastro'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => path.startsWith(route));

  const sessionCookie = request.cookies.get('session')?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicOnlyRoute && session?.user) {
    if (session.user.role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.nextUrl));
    } else if (session.user.role === 'PACIENTE') {
      return NextResponse.redirect(new URL('/portal', request.nextUrl));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
