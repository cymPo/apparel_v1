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

type BubbleRedeemResponse = {
  id_token?: string;
  error?: string;
};

function safeNextPath(next: string | null | undefined) {
  if (!next) return "/dashboard";
  return next.startsWith("/") ? next : "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  // Fallback to your normal Microsoft OAuth flow if anything goes wrong.
  const fallbackUrl = new URL("/auth/microsoft", origin);
  fallbackUrl.searchParams.set("next", next);

  if (!code) return NextResponse.redirect(fallbackUrl);

  const redeemUrl =
    process.env.BUBBLE_REDEEM_HANDOFF_URL ??
    "https://demo-app-15880.bubbleapps.io/version-test/api/1.1/wf/redeem_handoff";

  const secret = process.env.BUBBLE_HANDOFF_SECRET;
  if (!secret) return NextResponse.redirect(fallbackUrl);

  let redeemJson: BubbleRedeemResponse | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(redeemUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, secret }),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Bubble should return JSON, but don't assume perfect behavior.
    redeemJson = (await res.json()) as BubbleRedeemResponse;
  } catch {
    return NextResponse.redirect(fallbackUrl);
  }

  const idToken = redeemJson?.id_token;
  if (!idToken || typeof idToken !== "string") return NextResponse.redirect(fallbackUrl);

  const cookieStore = await cookies();
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

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "azure",
    token: idToken,
  });

  if (error) return NextResponse.redirect(fallbackUrl);

  return NextResponse.redirect(`${origin}${next}`);
}
