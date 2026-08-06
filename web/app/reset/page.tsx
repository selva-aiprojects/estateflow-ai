"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { apiSend } from "@/lib/api-client";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiSend("/api/auth/reset", { method: "POST", body: JSON.stringify({ email }) });
      setMessage("If an account exists for that email, a reset link is on its way.");
      setBusy(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const confirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiSend("/api/auth/reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage("Password updated. Redirecting to sign in…");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired reset token.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="EstateFlow" width={521} height={90} className="h-9 w-auto" priority />
          <p className="text-sm text-text-muted">Account security</p>
        </div>

        <Card className="p-6 sm:p-8">
          {message ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 size={32} className="text-success" />
              <h1 className="text-lg font-semibold text-text tracking-tight">{message}</h1>
            </div>
          ) : token ? (
            <form onSubmit={confirmReset} className="space-y-4">
              <div>
                <h1 className="text-lg font-semibold text-text tracking-tight">Set a new password</h1>
                <p className="mt-1 text-sm text-text-muted">Must be at least 8 characters.</p>
              </div>
              <Input
                label="New password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
              />
              {error && (
                <p role="alert" className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy || password.length < 8} className="w-full">
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          ) : (
            <form onSubmit={requestReset} className="space-y-4">
              <div>
                <h1 className="text-lg font-semibold text-text tracking-tight">Reset your password</h1>
                <p className="mt-1 text-sm text-text-muted">We'll email you a secure, one-time reset link.</p>
              </div>
              <Input label="Email address" value={email} onChange={setEmail} placeholder="you@company.in" autoComplete="email" />
              {error && (
                <p role="alert" className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy || !email} className="w-full">
                {busy ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors cursor-pointer">
            <ArrowLeft size={13} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
        </div>
      }
    >
      <ResetInner />
    </Suspense>
  );
}
