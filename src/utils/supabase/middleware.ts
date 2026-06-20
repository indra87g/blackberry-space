import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// SameSite=None+Secure only in production (HTTPS). In local HTTP dev the browser
// would reject those cookies and break the session — use Lax + insecure instead.
const isProd = process.env.NODE_ENV === 'production';

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
          }),
        );
      },
    },
  });

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // CHECK MAINTENANCE MODE
  const { data: settings } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  const isMaintenance = settings?.value === true;
  const isMaintenancePage = request.nextUrl.pathname.startsWith('/maintenance');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');

  if (isMaintenance && !isMaintenancePage && !isLoginPage && !isAuthCallback) {
    // Check if user is admin
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('isAdmin')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.isAdmin || false;
    }

    if (!isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/maintenance';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If site is NOT in maintenance but user is on maintenance page, redirect to home
  if (!isMaintenance && isMaintenancePage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to login if user is not authenticated and trying to access protected routes
  const isAuthRoute = isLoginPage || isAuthCallback || isMaintenancePage;

  if (!user && !isAuthRoute) {
    // Note: User's requirement says "mengharuskan guest untuk login terlebih dahulu agar bisa mengakses seluruh konten"
    // So we protect everything except auth routes.
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in but tries to access login page, redirect to home
  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
};
