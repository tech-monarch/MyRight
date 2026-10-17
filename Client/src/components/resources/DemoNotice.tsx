import { Info } from "lucide-react";
import { DEMO_NOTICE } from "@/lib/legal-resources";

/** Said once, plainly, on every marketplace page: this is a demonstration. */
export function DemoNotice() {
  return (
    <div role="note" className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning-light px-4 py-3 text-sm text-warning">
      <Info size={16} className="mt-0.5 shrink-0" />
      <p>{DEMO_NOTICE}</p>
    </div>
  );
}
