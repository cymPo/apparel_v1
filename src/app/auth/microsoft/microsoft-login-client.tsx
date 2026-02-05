// File: src/app/auth/microsoft/microsoft-login-client.tsx
// Client-only redirect to Microsoft OAuth to avoid a second login prompt.

"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function MicrosoftLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const supabase = createClient();
    const safeNext = next.startsWith("/") ? next : "/dashboard";
    const secureFlag = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `auth-next=${encodeURIComponent(
      safeNext
    )}; path=/; max-age=300; samesite=lax${secureFlag}`;
    const redirectTo = `${window.location.origin}/auth/callback`;

    supabase.auth
      .signInWithOAuth({
        provider: "azure",
        options: { redirectTo, scopes: "email" },
      })
      .then(({ error: oauthError }) => {
        if (oauthError) setError(oauthError.message);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to start Microsoft sign-in.");
      });
  }, [next]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        {error ?? "Redirecting to Microsoft…"}
      </div>
    </main>
  );
}
