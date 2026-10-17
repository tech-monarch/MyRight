"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Hourglass, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * The controlled demo state behind every "Get..." button.
 *
 * It does NOT simulate checkout: no payment screen, no receipt, no success
 * state, nothing implying a document was bought or delivered. It says plainly
 * that this is a demonstration listing and what is planned.
 */
export function PurchaseIntentModal({
  open,
  onClose,
  title,
  free,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  free: boolean;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // keep the page still behind the dialog
    closeButton.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep keyboard focus inside the dialog while it is open.
      const focusable = dialog.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnTo?.focus(); // hand focus back to the button that opened it
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-[2px]" aria-hidden="true" />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intent-title"
        aria-describedby="intent-body"
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-raised motion-safe:animate-[fadeUp_180ms_ease-out]"
      >
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Close dialog" className="absolute right-3 top-3 rounded-full p-1.5 text-text-muted hover:bg-surface-muted hover:text-navy">
          <X size={18} />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-light text-blue">
          <Hourglass size={20} />
        </span>
        <h2 id="intent-title" className="mt-4 text-xl font-extrabold text-navy">
          {free ? "Downloads aren't open yet" : "Purchasing isn't open yet"}
        </h2>
        <div id="intent-body" className="mt-2 space-y-3 text-sm text-text-muted">
          <p>
            You&apos;re looking at a demonstration listing for <span className="font-semibold text-navy">{title}</span>. Legal Resources is planned for a
            future release of MyRight, so no payment is taken here and no document is delivered from this page.
          </p>
          <p className="font-medium text-navy">Planned for the future release:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>{free ? "Secure, signed-in downloads" : "Secure checkout"}</li>
            {!free && <li>Download access once payment is confirmed</li>}
            <li>A history of your resources in your MyRight account</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <ButtonLink href="/resources">Browse more resources</ButtonLink>
        </div>
        <p className="mt-4 text-center text-xs text-text-muted">
          Want help with a dispute today?{" "}
          <Link href="/register" className="font-semibold text-blue hover:underline">
            Create a free MyRight account
          </Link>
        </p>
      </div>
    </div>
  );
}
