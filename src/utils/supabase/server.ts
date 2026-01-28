import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // cookies can only be set in Server Actions / Route Handlers
              // If this runs in a Server Component, it may throw — that's okay.
              (cookieStore as MutableCookies).set(name, value, options);
            });
          } catch {
            // Ignore if called from a Server Component.
          }
        },
      },
    }
  );
}
