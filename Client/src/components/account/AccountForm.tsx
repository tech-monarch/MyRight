"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/Field";

export interface AccountValues {
  name: string;
  username: string;
  email: string;
  phone: string;
}

function slugifyUsername(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean).join(".");
}

/** Name, username, email and phone: every account an admin creates needs all four (email and phone so the person can be notified). */
export function AccountForm({
  submitLabel,
  busy,
  error,
  extra,
  onSubmit,
}: {
  submitLabel: string;
  busy: boolean;
  error: string;
  extra?: React.ReactNode;
  onSubmit: (values: AccountValues) => void;
}) {
  const [v, setV] = useState<AccountValues>({ name: "", username: "", email: "", phone: "" });
  const [usernameEdited, setUsernameEdited] = useState(false);
  const complete = v.name.trim() && v.username.trim() && v.email.trim() && v.phone.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="space-y-4"
    >
      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <Label htmlFor="acc-name">Full name</Label>
        <Input
          id="acc-name"
          required
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value, username: usernameEdited ? v.username : slugifyUsername(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="acc-username">Username</Label>
        <Input id="acc-username" required value={v.username} onChange={(e) => { setV({ ...v, username: e.target.value }); setUsernameEdited(true); }} />
        <FieldHint>Generated from the name. They sign in with this (or their email).</FieldHint>
      </div>
      <div>
        <Label htmlFor="acc-email">Email</Label>
        <Input id="acc-email" type="email" required value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="acc-phone">Phone number</Label>
        <Input id="acc-phone" type="tel" required value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="07012345678" />
        <FieldHint>Used for WhatsApp updates.</FieldHint>
      </div>
      {extra}
      <Button type="submit" className="w-full" disabled={busy || !complete} icon={busy ? <Loader2 size={16} className="animate-spin" /> : undefined}>
        {busy ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
