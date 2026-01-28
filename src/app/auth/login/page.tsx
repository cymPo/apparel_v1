import { Suspense } from "react";
import LoginClient from "./login-client";

function LoginFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading…
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
