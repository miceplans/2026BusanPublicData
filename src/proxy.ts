import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientEnv } from '@/lib/env/client';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname === '/admin/signup';

  let response = NextResponse.next({ request });
  const env = getClientEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    },
  );

  // getClaims validates the access token and uses the refresh token when
  // needed. It must execute before other request work so rotated cookies are
  // returned to the browser with this response.
  const { data, error } = await supabase.auth.getClaims();

  if (isPublicAdminRoute || (!error && data?.claims)) return response;

  const loginResponse = NextResponse.redirect(
    new URL('/admin/login', request.url),
  );
  response.cookies
    .getAll()
    .forEach(({ name, value, ...options }) =>
      loginResponse.cookies.set(name, value, options),
    );
  ['Cache-Control', 'Expires', 'Pragma'].forEach((name) => {
    const value = response.headers.get(name);
    if (value) loginResponse.headers.set(name, value);
  });
  return loginResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
