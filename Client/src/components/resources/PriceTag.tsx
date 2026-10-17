import { Badge } from "@/components/ui/Badge";
import { formatNaira, isFree, type LegalResource } from "@/lib/legal-resources";
import { cn } from "@/lib/utils";

/**
 * Free and paid read differently on purpose: a free example is a green badge,
 * a paid one is a price. Prices are proposals for the demo, and say so.
 */
export function PriceTag({ resource, size = "md", className }: { resource: Pick<LegalResource, "priceNgn">; size?: "md" | "lg"; className?: string }) {
  if (isFree(resource as LegalResource)) {
    return (
      <div className={className}>
        <Badge tone="success">Free example</Badge>
      </div>
    );
  }
  return (
    <div className={cn("leading-tight", className)}>
      <p className={cn("font-extrabold text-navy", size === "lg" ? "text-3xl" : "text-xl")}>{formatNaira(resource.priceNgn)}</p>
      <p className="text-[11px] text-text-muted">Proposed price</p>
    </div>
  );
}
