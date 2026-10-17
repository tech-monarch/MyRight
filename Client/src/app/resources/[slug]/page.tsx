import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, FileText, Info, Users } from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/resources/DemoNotice";
import { PriceTag } from "@/components/resources/PriceTag";
import { PurchaseIntentButton } from "@/components/resources/PurchaseIntentButton";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceCover } from "@/components/resources/ResourceCover";
import { LEGAL_RESOURCES, getCategory, getResource, isFree, relatedResources } from "@/lib/legal-resources";

// Every listing is known at build time, so each detail page is pre-rendered.
export function generateStaticParams() {
  return LEGAL_RESOURCES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = getResource(params.slug);
  if (!r) return { title: "Resource not found | MyRight" };
  return { title: `${r.title} | Legal Resources | MyRight`, description: r.summary };
}

function Section({ title, icon: Icon, children }: { title: string; icon?: typeof Users; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
        {Icon && <Icon size={20} className="text-blue" />}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ResourceDetailPage({ params }: { params: { slug: string } }) {
  const resource = getResource(params.slug);
  if (!resource) notFound();

  const category = getCategory(resource.category);
  const free = isFree(resource);
  const related = relatedResources(resource);
  const purchaseLabel = free ? (resource.kind === "Guide" ? "Get free guide" : "Get free checklist") : `Get this ${resource.kind.toLowerCase()}`;

  return (
    <>
      <MarketingNav />
      <main className="pb-16">
        <div className="container-page pt-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-text-muted">
            <Link href="/resources" className="hover:text-navy">
              Legal Resources
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/resources?category=${category.id}`} className="hover:text-navy">
              {category.label}
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page" className="font-medium text-navy">
              {resource.title}
            </span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <DemoNotice />
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
            {/* Main column */}
            <div className="min-w-0">
              <ResourceCover resource={resource} variant="hero" />
              <p className="mt-2 text-xs text-text-muted">Illustrative cover. It is not an image of the actual document.</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link href={`/resources?category=${category.id}`}>
                  <Badge tone="blue">{category.label}</Badge>
                </Link>
                <Badge tone="neutral">{resource.kind}</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl">{resource.title}</h1>
              <p className="mt-4 text-lg text-text-muted">{resource.description}</p>

              {/* The purchase panel appears here on small screens, in the side column on large ones */}
              <div className="mt-8 lg:hidden">
                <PurchasePanel resource={resource} purchaseLabel={purchaseLabel} free={free} />
              </div>

              <Section title="Who it's for" icon={Users}>
                <ul className="space-y-2">
                  {resource.audience.map((a) => (
                    <li key={a} className="flex gap-3 text-text-muted">
                      <Check size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="What would be included" icon={FileText}>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {resource.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-navy">
                      <Check size={16} className="mt-0.5 shrink-0 text-blue" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-text-muted">Format: {resource.format}</p>
              </Section>

              <Section title="Sample preview">
                <figure>
                  <div className="relative overflow-hidden rounded-lg border border-border bg-white p-6 shadow-card sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue">{resource.excerpt.heading}</p>
                    <div className="mt-4 space-y-4">
                      {resource.excerpt.clauses.map((c) => (
                        <div key={c.title}>
                          <p className="text-sm font-bold text-navy">{c.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-text-muted">{c.text}</p>
                        </div>
                      ))}
                    </div>
                    {/* fades out, because this is an excerpt and not the whole document */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <figcaption className="mt-2 text-xs text-text-muted">
                    Illustrative sample wording to show the style of the resource. It is not a reviewed template and is not legal advice.
                  </figcaption>
                </figure>
              </Section>

              <Section title="Intended use and limitations" icon={Info}>
                <div className="rounded-lg border border-warning/30 bg-warning-light p-5">
                  <ul className="space-y-2 text-sm text-warning">
                    {resource.limitations.map((l) => (
                      <li key={l} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                        <span className="text-navy">{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Section>
            </div>

            {/* Side column: sticky on large screens */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <PurchasePanel resource={resource} purchaseLabel={purchaseLabel} free={free} />
              </div>
            </aside>
          </div>
        </div>

        <section className="container-page mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold text-navy">More legal resources</h2>
            <ButtonLink href="/resources" variant="secondary" size="sm">
              Browse all
            </ButtonLink>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}

function PurchasePanel({ resource, purchaseLabel, free }: { resource: NonNullable<ReturnType<typeof getResource>>; purchaseLabel: string; free: boolean }) {
  return (
    <div id="get" className="scroll-mt-24 rounded-xl border border-border bg-white p-6 shadow-raised">
      <PriceTag resource={resource} size="lg" />
      <div className="mt-5">
        <PurchaseIntentButton title={resource.title} free={free} label={purchaseLabel} />
      </div>
      <p className="mt-3 text-center text-xs text-text-muted">
        {free ? "Downloads open in a future release." : "Purchasing opens in a future release. No payment is taken."}
      </p>
      <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Type</dt>
          <dd className="font-medium text-navy">{resource.kind}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Format</dt>
          <dd className="text-right font-medium text-navy">{resource.format}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Contents</dt>
          <dd className="font-medium text-navy">{resource.includes.length} items</dd>
        </div>
      </dl>
    </div>
  );
}
