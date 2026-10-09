import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  // Only allow local paths to prevent open redirects.
  const nextPath =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/interview";

  const response = NextResponse.redirect(
    new URL(nextPath, requestUrl.origin)
  );

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", requestUrl.origin)
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", requestUrl.origin)
    );
  }

  return response;
}