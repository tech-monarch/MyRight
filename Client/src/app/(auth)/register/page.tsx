"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Label, Input, FieldHint } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { register, roleHome } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (!result.success || !result.user) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(roleHome(result.user.role));
  }

  return (
    <Card className="shadow-raised">
      <h1 className="text-2xl font-extrabold text-navy">Create your account</h1>
      <p className="mt-1 text-sm text-text-muted">
        It only takes a minute. You can start describing your dispute right after.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger-light px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Adaeze Okafor"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
          <FieldHint>Use 8 or more characters with a mix of letters and numbers.</FieldHint>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-text-muted">
        By continuing, you agree to MyRight&apos;s Terms of Use and Privacy Policy.
      </p>

      <p className="mt-4 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <ButtonLink href="/login" variant="ghost" size="sm" className="px-1 py-0 inline">
          Log in
        </ButtonLink>
      </p>
    </Card>
  );
}
