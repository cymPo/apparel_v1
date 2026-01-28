import { Suspense } from "react";
import MicrosoftLoginClient from "./microsoft-login-client";

function LoginFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Redirecting to Microsoft…
      </div>
    </main>
  );
}

export default function MicrosoftLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <MicrosoftLoginClient />
    </Suspense>
  );
}
