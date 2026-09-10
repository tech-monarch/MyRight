import { Logo } from "@/components/Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-text-muted">
            AI-guided dispute resolution for Nigerians, built to help you
            understand your options and reach a fair outcome faster.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            ["How it works", "/#how-it-works"],
            ["About ADR", "/#adr"],
            ["Start a dispute", "/register"],
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ["About us", "/#"],
            ["Contact", "/#"],
            ["Careers", "/#"],
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            ["Privacy policy", "/#"],
            ["Terms of use", "/#"],
            ["Disclaimer", "/#"],
          ]}
        />
      </div>
      <div className="border-t border-border py-5">
        <p className="container-page text-xs text-text-muted">
          © {new Date().getFullYear()} MyRight. MyRight provides AI-assisted
          information and access to mediation services. It does not provide
          legal representation or replace a licensed lawyer.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-navy">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-sm text-text-muted hover:text-blue">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
