"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Card } from "@/components/ui/Card";
import { Label, Input, FieldHint } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { createLawyer } from "@/lib/admin-client";
import { ApiError } from "@/lib/api";

function slugifyUsername(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(".");
}

export default function AddLawyerPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!usernameEdited) setUsername(slugifyUsername(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const result = await createLawyer({
        name,
        username,
        email: email || undefined,
        phone: phone || undefined,
        specialization: specialization || undefined,
      });
      setCreated({ username: result.lawyer.username ?? username, password: result.tempPassword });
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Couldn't create that account. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  if (created) {
    return (
      <>
        <DashboardTopbar title="Lawyer account created" />
        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="mx-auto max-w-lg">
            <Card className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
                <Check size={26} />
              </div>
              <h1 className="mt-4 text-lg font-bold text-navy">{name}&apos;s account is ready</h1>
              <p className="mt-2 text-sm text-text-muted">
                Share these credentials with {name} through a secure channel. They will be
                required to change this password on first login.
              </p>

              <div className="mt-5 space-y-3 text-left">
                <CredentialRow label="Username" value={created.username} />
                <CredentialRow label="Temporary password" value={created.password} isSecret />
              </div>

              <Button
                variant="secondary"
                className="mt-4 w-full"
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `Username: ${created.username}\nTemporary password: ${created.password}`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied" : "Copy credentials"}
              </Button>
            </Card>
            <ButtonLink href="/admin/lawyers" variant="ghost" className="mt-4 w-full justify-center">
              Back to lawyers
            </ButtonLink>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar title="Add lawyer" />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-lg">
          <Card>
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-blue" />
              <h1 className="text-lg font-bold text-navy">Create a lawyer account</h1>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              A temporary password will be generated. The lawyer must change it on first login.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {createError && <p className="text-sm text-danger">{createError}</p>}
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Chinelo Adeyemi"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameEdited(true);
                  }}
                />
                <FieldHint>Generated automatically from the name. You can edit it.</FieldHint>
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone number (optional)</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization (optional)</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Tenancy & property disputes"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={creating || !name || !username}
                icon={creating ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {creating ? "Creating account..." : "Create lawyer account"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}

function CredentialRow({ label, value, isSecret }: { label: string; value: string; isSecret?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-off px-3.5 py-2.5">
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className={isSecret ? "font-mono text-sm text-navy" : "text-sm font-medium text-navy"}>{value}</p>
      </div>
    </div>
  );
}
