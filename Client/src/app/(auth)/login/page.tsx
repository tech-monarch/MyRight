"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { login, roleHome } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success || !result.user) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(roleHome(result.user.role));
  }

  return (
    <Card className="shadow-raised">
      <h1 className="text-2xl font-extrabold text-navy">Welcome back</h1>
      <p className="mt-1 text-sm text-text-muted">
        Log in to continue with your dispute.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger-light px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="email">Email or username</Label>
          <Input
            id="email"
            type="text"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/forgot-password" className="text-xs font-medium text-blue hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FieldError>{undefined}</FieldError>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        New to MyRight?{" "}
        <ButtonLink href="/register" variant="ghost" size="sm" className="px-1 py-0 inline">
          Create an account
        </ButtonLink>
      </p>
    </Card>
  );
}
