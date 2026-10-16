"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/Field";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { updateContact } from "@/lib/auth-client";
import { ApiError } from "@/lib/api";

/** Phone and email, which is where WhatsApp and email notifications go. Changing the email needs the current password. */
export function ContactDetailsCard() {
  const { data: user, refetch } = useCurrentUser();
  const [phone, setPhone] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!user) return null;
  const phoneValue = phone ?? user.phone ?? "";
  const emailValue = email ?? user.email ?? "";
  const emailChanged = emailValue.trim().toLowerCase() !== (user.email ?? "").toLowerCase();
  const phoneChanged = phoneValue.trim() !== (user.phone ?? "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await updateContact({
        ...(phoneChanged ? { phone: phoneValue.trim() } : {}),
        ...(emailChanged ? { email: emailValue.trim(), currentPassword: password } : {}),
      });
      setSaved(true);
      setPassword("");
      setPhone(null);
      setEmail(null);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-bold text-navy">Contact details</h2>
      <p className="mt-1 text-sm text-text-muted">Where we send WhatsApp and email updates about your cases.</p>
      <form onSubmit={save} className="mt-5 space-y-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">Saved.</p>}
        <div>
          <Label htmlFor="cd-phone">Phone number</Label>
          <Input id="cd-phone" type="tel" value={phoneValue} onChange={(e) => setPhone(e.target.value)} placeholder="07012345678" />
          {!user.phone && <FieldHint>Add a number to get WhatsApp updates.</FieldHint>}
        </div>
        <div>
          <Label htmlFor="cd-email">Email</Label>
          <Input id="cd-email" type="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {emailChanged && (
          <div>
            <Label htmlFor="cd-pw">Current password</Label>
            <Input id="cd-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <FieldHint>Needed to change your email, since it&apos;s how you sign in.</FieldHint>
          </div>
        )}
        <Button type="submit" disabled={busy || (!phoneChanged && !emailChanged)} icon={busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}>
          {busy ? "Saving..." : "Save"}
        </Button>
      </form>
    </Card>
  );
}
