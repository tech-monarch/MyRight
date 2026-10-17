import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResourcesCarousel } from "@/components/resources/ResourcesCarousel";
import { featuredResources } from "@/lib/legal-resources";

/** Landing-page entry point to the Legal Resources marketplace. */
export function LegalResourcesSection() {
  const items = featuredResources().slice(0, 6);

  return (
    <section id="legal-resources" aria-labelledby="legal-resources-heading" className="border-y border-border bg-white py-20">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Badge tone="blue">Legal Resources</Badge>
            <h2 id="legal-resources-heading" className="mt-3 text-3xl font-extrabold text-navy">
              Legal Resources for Real-World Needs
            </h2>
            <p className="mt-3 text-text-muted">
              Explore practical legal templates, business agreements, and document resources designed to help individuals and
              businesses navigate common legal needs.
            </p>
          </div>
          <ButtonLink href="/resources" variant="secondary" icon={<ArrowRight size={16} className="order-last" />}>
            Browse All Resources
          </ButtonLink>
        </div>

        <div className="mt-10">
          <ResourcesCarousel items={items} label="Featured legal resources" />
        </div>

        <p className="mt-2 text-xs text-text-muted">
          Demonstration listings with illustrative prices. Resources are not yet available to buy and have not been reviewed by a lawyer.
        </p>
      </div>
    </section>
  );
}
