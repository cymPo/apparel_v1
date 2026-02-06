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

function redirectFallback(origin: string, next: string, reason: string) {
  const url = new URL("/auth/microsoft", origin);
  url.searchParams.set("next", next);
  // Non-sensitive reason code for debugging.
  url.searchParams.set("handoff_error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) return redirectFallback(origin, next, "missing_code");

  const redeemUrl =
    process.env.BUBBLE_REDEEM_HANDOFF_URL ??
    "https://demo-app-15880.bubbleapps.io/version-test/api/1.1/wf/redeem_handoff";

  const secret = process.env.BUBBLE_HANDOFF_SECRET;
  if (!secret) {
    console.error("[bubble-handoff] Missing BUBBLE_HANDOFF_SECRET env var");
    return redirectFallback(origin, next, "missing_secret_env");
  }

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

    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      console.error("[bubble-handoff] Bubble redeem HTTP error", {
        status: res.status,
        contentType,
        bodyPreview: bodyText.slice(0, 300),
      });
      return redirectFallback(origin, next, `bubble_http_${res.status}`);
    }

    if (contentType.includes("application/json")) {
      redeemJson = (await res.json()) as BubbleRedeemResponse;
    } else {
      const bodyText = await res.text();
      // Bubble misconfigured returns (plain text / HTML) will land here.
      console.error("[bubble-handoff] Bubble redeem returned non-JSON", {
        contentType,
        bodyPreview: bodyText.slice(0, 300),
      });
      return redirectFallback(origin, next, "bubble_non_json");
    }
  } catch (e) {
    console.error("[bubble-handoff] Bubble redeem fetch failed", e);
    return redirectFallback(origin, next, "bubble_fetch_failed");
  }

  if (redeemJson?.error) {
    console.error("[bubble-handoff] Bubble redeem returned error", redeemJson.error);
    return redirectFallback(origin, next, `bubble_${redeemJson.error}`);
  }

  const idToken = redeemJson?.id_token;
  if (!idToken || typeof idToken !== "string") {
    console.error("[bubble-handoff] Bubble redeem missing id_token");
    return redirectFallback(origin, next, "bubble_missing_id_token");
  }

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
  if (error) {
    console.error("[bubble-handoff] Supabase signInWithIdToken error", {
      name: error.name,
      message: error.message,
    });
    return redirectFallback(origin, next, "supabase_signin_failed");
  }
return NextResponse.redirect(`${origin}${next}`);
}

