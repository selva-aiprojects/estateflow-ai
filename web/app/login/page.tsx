"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { apiSend } from "@/lib/api-client";

const demoAccounts = [
  { label: "Nexus Admin (superadmin)", email: "nexus@estateflow.in", password: "Nexus@2026" },
  { label: "Builder A Homes", email: "admin@builder-a.estateflow.in", password: "BuilderA@2026" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiSend("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Invalid email or password.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="EstateFlow" width={521} height={90} className="h-9 w-auto" priority />
          <p className="text-sm text-text-muted">Sign in to your workspace</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-text tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-text-muted">Enter your credentials to continue.</p>
            </div>

            <Input label="Email address" value={email} onChange={setEmail} placeholder="you@company.in" type="text" />
            <Input label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

            {error && (
              <p role="alert" className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy || !email || !password} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight size={15} />}
            </Button>

            <div className="text-center">
              <Link href="/reset" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <ShieldCheck size={13} className="text-success" />
              Demo accounts
            </p>
            <ul className="mt-2.5 space-y-2">
              {demoAccounts.map((a) => (
                <li key={a.email}>
                  <button
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(a.password);
                      setError(null);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-surface-muted/50 px-3 py-2 text-left text-xs text-text transition-colors hover:border-border-strong hover:bg-surface-muted"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-primary" />
                      {a.label}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">{a.email}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-text-subtle">
              <KeyRound size={12} className="mt-0.5 shrink-0" />
              Workspace creation is handled by the Nexus Admin console. New tenants receive a welcome-kit email with
              temporary credentials.
            </p>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-text-subtle">
          EstateFlow · AI Real Estate OS · <span className="text-text-muted">DPDP 2023 compliant</span>
        </p>
      </div>
    </div>
  );
}
