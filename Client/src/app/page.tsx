import {
  MessageCircleQuestion,
  FileCheck2,
  Handshake,
  ShieldCheck,
  Clock,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <WhyMyRight />
        <ADRExplainer />
        <CTASection />
      </main>
      <MarketingFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-b from-white to-surface-off">
      <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <Badge tone="blue">AI-guided • Human-backed</Badge>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
            Sort out your dispute without going to court
          </h1>
          <p className="mt-5 max-w-prose text-lg text-text-muted">
            Tell MyRight what happened, in your own words. We&apos;ll help you
            understand your options and connect you with mediation, so you
            can resolve things faster and with less stress.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/register" size="lg">
              Start my dispute, it&apos;s free
            </ButtonLink>
            <ButtonLink href="/#how-it-works" variant="secondary" size="lg">
              See how it works
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" /> No legal
              jargon
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" /> Private &amp;
              confidential
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" /> Works on
              your phone
            </span>
          </div>
        </div>

        <HeroPreviewCard />
      </div>
    </section>
  );
}

function HeroPreviewCard() {
  return (
    <Card className="rounded-xl p-0 shadow-raised">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-navy">Your dispute</p>
          <p className="text-xs text-text-muted">Landlord withheld deposit</p>
        </div>
        <Badge tone="warning">Action needed</Badge>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="rounded-lg bg-surface-off p-3.5 text-sm text-navy">
          &ldquo;My landlord refused to refund my deposit after I moved out,
          even though the apartment was in good condition.&rdquo;
        </div>
        <div className="rounded-lg border border-blue-light bg-blue-light/60 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue">
            MyRight suggests
          </p>
          <p className="mt-1 text-sm text-navy">
            This looks like a tenancy dispute. Mediation is usually the
            fastest way to resolve deposit disagreements.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-muted">
            Request mediation
          </span>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-muted">
            Upload evidence
          </span>
        </div>
      </div>
    </Card>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: "Private & secure" },
    { icon: Clock, label: "Most cases start in minutes" },
    { icon: Smartphone, label: "Built for mobile, low data" },
    { icon: Handshake, label: "Backed by real mediators" },
  ];
  return (
    <section className="border-y border-border bg-white py-6">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-text-muted">
        {items.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-2">
            <Icon size={18} className="text-blue" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MessageCircleQuestion,
      title: "Tell us what happened",
      body: "Describe your situation in plain language. Our assistant asks a few simple follow-up questions to understand it fully.",
    },
    {
      icon: FileCheck2,
      title: "Get a clear picture",
      body: "MyRight explains your options, what's realistic, and what to gather, like receipts, messages, or photos.",
    },
    {
      icon: Handshake,
      title: "Resolve it",
      body: "Request mediation, invite the other party, and work toward a resolution with a real mediator when you're ready.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-navy">
            Three simple steps
          </h2>
          <p className="mt-3 text-text-muted">
            No forms full of legal terms. Just tell us your story and we&apos;ll
            guide you the rest of the way.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title} className="text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-light text-blue">
                <step.icon size={22} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-blue">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{step.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyMyRight() {
  const features = [
    {
      title: "Plain-language guidance",
      body: "We translate your situation into clear next steps, no confusing legal terms.",
    },
    {
      title: "Keep your evidence organized",
      body: "Upload contracts, receipts, screenshots, or photos, and MyRight keeps them with your case.",
    },
    {
      title: "Know where things stand",
      body: "A simple case timeline shows exactly what's happened and what's next.",
    },
    {
      title: "Your information stays private",
      body: "Only you, the other party (if invited), and your assigned mediator can see your case.",
    },
  ];
  return (
    <section className="bg-surface-off py-20">
      <div className="container-page">
        <h2 className="text-3xl font-extrabold text-navy">
          Built to make dispute resolution less stressful
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <CheckCircle2 className="mt-1 shrink-0 text-success" size={22} />
              <div>
                <h3 className="font-semibold text-navy">{f.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ADRExplainer() {
  return (
    <section id="adr" className="py-20">
      <div className="container-page grid items-center gap-10 md:grid-cols-2">
        <div>
          <Badge tone="blue">What is ADR?</Badge>
          <h2 className="mt-3 text-3xl font-extrabold text-navy">
            Alternative Dispute Resolution
          </h2>
          <p className="mt-3 max-w-prose text-text-muted">
            ADR simply means resolving a disagreement without going through a
            full court case. A neutral mediator helps both sides talk things
            through and reach an agreement, usually faster, cheaper, and
            less stressful than litigation.
          </p>
        </div>
        <Card>
          <ul className="space-y-4">
            {[
              ["Faster", "Many disputes settle in weeks, not years."],
              ["Lower cost", "No lengthy court fees or extended legal bills."],
              [
                "More control",
                "You and the other party help shape the resolution.",
              ],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={20} />
                <div>
                  <p className="font-semibold text-navy">{title}</p>
                  <p className="text-sm text-text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16">
      <div className="container-page">
        <div className="rounded-xl bg-navy px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-extrabold">
            Ready to sort out your dispute?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-light">
            It takes a few minutes to get started, and it&apos;s free to
            describe your situation and see your options.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/register" size="lg" className="bg-white !text-navy hover:bg-blue-light">
              Start my dispute
            </ButtonLink>
            <ButtonLink
              href="/login"
              size="lg"
              variant="ghost"
              className="!text-white hover:bg-white/10"
            >
              Log in
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
