import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type MutableCookies = {
  get(name: string): { name: string; value: string } | undefined;
  set(
    name: string,
    value: string,
    options?: {
      path?: string;
      maxAge?: number;
      domain?: string;
      expires?: Date;
      httpOnly?: boolean;
      sameSite?: boolean | "lax" | "strict" | "none";
      secure?: boolean;
    }
  ): void;
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const cookieStore = await cookies();
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const nextCookie = cookieStore.get("auth-next")?.value;
  const nextFromCookie = nextCookie ? decodeURIComponent(nextCookie) : null;
  const redirectTo =
    (next && next.startsWith("/") ? next : null) ??
    (nextFromCookie && nextFromCookie.startsWith("/") ? nextFromCookie : "/dashboard");

  if (nextCookie) {
    (cookieStore as MutableCookies).set("auth-next", "", { path: "/", maxAge: 0 });
  }

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              (cookieStore as MutableCookies).set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const errorUrl = new URL("/auth/login", origin);
      errorUrl.searchParams.set("error", "auth_code_error");
      errorUrl.searchParams.set("next", redirectTo);
      return NextResponse.redirect(errorUrl);
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
