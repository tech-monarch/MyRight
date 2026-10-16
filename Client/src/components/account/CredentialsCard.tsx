"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** The one-time reveal of a temporary password. It is never shown again. */
export function CredentialsCard({
  title,
  username,
  password,
  onDismiss,
}: {
  title: string;
  username: string;
  password: string;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="border-success/30 bg-success-light/40">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-light text-success">
          <Check size={15} />
        </span>
        <h2 className="text-base font-bold text-navy">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-text-muted">
        Share these through a secure channel. The password is shown only now and must be changed at first login.
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <div className="rounded-lg border border-border bg-white px-3.5 py-2">
          <p className="text-xs text-text-muted">Username</p>
          <p className="font-medium text-navy">{username}</p>
        </div>
        <div className="rounded-lg border border-border bg-white px-3.5 py-2">
          <p className="text-xs text-text-muted">Temporary password</p>
          <p className="font-mono text-navy">{password}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={() => {
            navigator.clipboard?.writeText(`Username: ${username}\nTemporary password: ${password}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Copied" : "Copy credentials"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </Card>
  );
}
