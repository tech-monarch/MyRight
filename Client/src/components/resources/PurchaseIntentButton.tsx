"use client";

import { useCallback, useState } from "react";
import { Download, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PurchaseIntentModal } from "@/components/resources/PurchaseIntentModal";

export function PurchaseIntentButton({ title, free, label }: { title: string; free: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)} icon={free ? <Download size={18} /> : <ShoppingBag size={18} />} aria-haspopup="dialog">
        {label}
      </Button>
      <PurchaseIntentModal open={open} onClose={close} title={title} free={free} />
    </>
  );
}
