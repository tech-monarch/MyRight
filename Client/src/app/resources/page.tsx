import type { Metadata } from "next";
import { ArrowRight, FileCheck2, Scale, ShieldAlert } from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/resources/DemoNotice";
import { ResourcesBrowser } from "@/components/resources/ResourcesBrowser";
import { isValidCategory } from "@/lib/legal-resources";

export const metadata: Metadata = {
  title: "Legal Resources | MyRight",
  description:
    "Explore practical legal templates, business agreements, and document resources designed to help individuals and businesses navigate common legal needs.",
};

export default function ResourcesPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const initialCategory = isValidCategory(searchParams.category) ? searchParams.category : "all";

  return (
    <>
      <MarketingNav />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-white to-surface-off">
          <div className="container-page py-12 md:py-16">
            <Badge tone="blue">Legal Resources</Badge>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">Legal Resources for Real-World Needs</h1>
            <p className="mt-4 max-w-2xl text-lg text-text-muted">
              Practical templates, business agreements and plain-English guides for the situations people run into every day, so you can put
              things in writing clearly before they turn into disputes.
            </p>
            <div className="mt-6 max-w-3xl">
              <DemoNotice />
            </div>
          </div>
        </section>

        <section className="container-page py-10 md:py-12">
          <ResourcesBrowser initialQuery={searchParams.q?.slice(0, 100) ?? ""} initialCategory={initialCategory} />
        </section>

        <section className="border-y border-border bg-white py-14">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold text-navy">Good to know before using any template</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                { icon: FileCheck2, title: "A starting point, not a finished answer", body: "Templates give you a clear structure. Every situation is different, so read each document and adapt it before you rely on it." },
                { icon: Scale, title: "Rules vary", body: "Requirements can differ by state, sector and type of arrangement. Check the rules that apply to your situation." },
                { icon: ShieldAlert, title: "Not legal advice", body: "Resources are general information. For anything high-value or complicated, speak to a qualified lawyer." },
              ].map((p) => (
                <div key={p.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-light text-blue">
                    <p.icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy">{p.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-navy px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">
              <div className="max-w-xl">
                <h2 className="text-2xl font-extrabold text-white">Already in a disagreement?</h2>
                <p className="mt-2 text-blue-light">
                  Templates help you prevent disputes. If you&apos;re already in one, MyRight can help you understand your options and reach a resolution through mediation.
                </p>
              </div>
              <ButtonLink href="/register" size="lg" className="shrink-0 bg-white text-navy hover:bg-blue-light" icon={<ArrowRight size={18} className="order-last" />}>
                Start my dispute
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
