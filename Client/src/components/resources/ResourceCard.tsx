import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ResourceCover } from "@/components/resources/ResourceCover";
import { PriceTag } from "@/components/resources/PriceTag";
import { ctaLabel, getCategory, type LegalResource } from "@/lib/legal-resources";
import { cn } from "@/lib/utils";

export function ResourceCard({ resource, className }: { resource: LegalResource; className?: string }) {
  const href = `/resources/${resource.slug}`;
  const category = getCategory(resource.category);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-raised motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
    >
      {/* The cover is a second route to the same page; the title link below is the accessible one. */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block p-3 pb-0">
        <ResourceCover resource={resource} className="transition duration-300 group-hover:brightness-[1.02]" />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="blue">{category.label}</Badge>
          <span className="shrink-0 text-xs text-text-muted">{resource.kind}</span>
        </div>

        <h3 className="mt-2.5 text-base font-bold leading-snug">
          <Link href={href} className="hover:text-blue">
            {resource.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">{resource.summary}</p>

        <PriceTag resource={resource} className="mt-4" />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <ButtonLink href={href} variant="secondary" size="sm">
            View details
          </ButtonLink>
          <ButtonLink href={`${href}#get`} size="sm">
            {ctaLabel(resource)}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
