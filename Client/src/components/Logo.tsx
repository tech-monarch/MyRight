import { Scale } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
        <Scale size={18} strokeWidth={2.25} />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-navy">
        MyRight
      </span>
    </Link>
  );
}
