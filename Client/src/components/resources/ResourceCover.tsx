import {
  BookOpen,
  Briefcase,
  Check,
  ClipboardList,
  FileSignature,
  Handshake,
  Home,
  Layers,
  Lock,
  Mail,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoverStyle, LegalResource } from "@/lib/legal-resources";

const ICONS: Record<CoverStyle["icon"], LucideIcon> = {
  FileSignature,
  Lock,
  Briefcase,
  Home,
  Handshake,
  Mail,
  Users,
  Layers,
  ClipboardList,
  BookOpen,
  ScrollText,
};

/**
 * Background and accent for each tone, using only MyRight's existing palette
 * (navy, blue, success, warning, surface) so covers sit naturally beside the
 * rest of the product.
 */
const TONES: Record<CoverStyle["tone"], { bg: string; accent: string; icon: string; chip: string }> = {
  blue: { bg: "bg-gradient-to-br from-blue-light via-white to-blue-light", accent: "text-blue", icon: "bg-blue text-white", chip: "bg-blue-light text-blue" },
  navy: { bg: "bg-gradient-to-br from-navy to-[#14457d]", accent: "text-navy", icon: "bg-blue text-white", chip: "bg-blue-light text-blue" },
  green: { bg: "bg-gradient-to-br from-success-light via-white to-success-light", accent: "text-success", icon: "bg-success text-white", chip: "bg-success-light text-success" },
  amber: { bg: "bg-gradient-to-br from-warning-light via-white to-warning-light", accent: "text-warning", icon: "bg-warning text-white", chip: "bg-warning-light text-warning" },
  slate: { bg: "bg-gradient-to-br from-surface-muted via-white to-surface-muted", accent: "text-text-muted", icon: "bg-navy text-white", chip: "bg-surface-muted text-text-muted" },
};

/** A faint bar standing in for a line of text: it never pretends to be real wording. */
function Line({ w, className }: { w: number; className?: string }) {
  return <span className={cn("block h-1.5 rounded-full bg-navy/10", className)} style={{ width: `${w}%` }} />;
}

function Sheet({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("absolute aspect-[3/4] rounded-[6px] border border-border bg-white shadow-raised", className)}>{children}</div>
  );
}

/** What is printed on the front sheet: kind, title, then skeleton lines. */
function SheetFace({ kind, title, accent, hero }: { kind: string; title: string; accent: string; hero: boolean }) {
  return (
    <div className="flex h-full flex-col p-[9%]">
      <span className={cn("font-bold uppercase tracking-wider", accent, hero ? "text-[11px]" : "text-[8.5px]")}>{kind}</span>
      <span className={cn("mt-1 line-clamp-3 font-extrabold leading-tight text-navy", hero ? "text-[17px]" : "text-[11px]")}>{title}</span>
      <div className="mt-3 space-y-1.5">
        <Line w={92} />
        <Line w={84} />
        <Line w={90} />
        <Line w={58} />
      </div>
      <div className="mt-auto">
        <div className="mb-1 h-px w-2/5 bg-navy/25" />
        <Line w={30} className="h-1 bg-navy/10" />
      </div>
    </div>
  );
}

export function ResourceCover({
  resource,
  variant = "card",
  className,
}: {
  resource: Pick<LegalResource, "title" | "kind" | "cover">;
  variant?: "card" | "hero";
  className?: string;
}) {
  const { motif, tone, icon } = resource.cover;
  const t = TONES[tone];
  const Icon = ICONS[icon];
  const hero = variant === "hero";
  const dark = tone === "navy";

  return (
    // Decorative: the title and details are always present as real text next to it.
    <div aria-hidden="true" className={cn("relative isolate w-full overflow-hidden rounded-lg", hero ? "aspect-[16/10]" : "aspect-[4/3]", t.bg, className)}>
      {/* soft shapes for depth */}
      <div className={cn("absolute -right-10 -top-10 h-40 w-40 rounded-full", dark ? "bg-white/5" : "bg-white/60")} />
      <div className={cn("absolute -bottom-12 -left-8 h-36 w-36 rounded-full", dark ? "bg-blue/20" : "bg-white/50")} />

      {motif === "sheet" && (
        <Sheet className="left-1/2 top-1/2 h-[84%] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg]">
          <SheetFace kind={resource.kind} title={resource.title} accent={t.accent === "text-navy" ? "text-blue" : t.accent} hero={hero} />
        </Sheet>
      )}

      {(motif === "stack" || motif === "bundle") && (
        <>
          <Sheet className="left-1/2 top-1/2 h-[80%] -translate-x-[62%] -translate-y-[52%] rotate-[-9deg] opacity-80" />
          <Sheet className="left-1/2 top-1/2 h-[80%] -translate-x-[38%] -translate-y-[52%] rotate-[7deg] opacity-90" />
          <Sheet className="left-1/2 top-1/2 h-[84%] -translate-x-1/2 -translate-y-1/2 rotate-[-1deg]">
            <SheetFace kind={resource.kind} title={resource.title} accent={t.accent === "text-navy" ? "text-blue" : t.accent} hero={hero} />
          </Sheet>
        </>
      )}

      {motif === "bundle" && (
        // A folder front, so a bundle reads as "several documents in one".
        <div className="absolute inset-x-[16%] bottom-[7%] h-[24%]">
          <div className="absolute -top-[18%] left-0 h-[30%] w-[34%] rounded-t-md bg-blue" />
          <div className="absolute inset-0 flex items-center justify-between rounded-md bg-blue px-[6%] text-white shadow-raised">
            <span className={cn("font-bold uppercase tracking-wider", hero ? "text-xs" : "text-[9px]")}>Bundle</span>
            <Layers size={hero ? 18 : 13} />
          </div>
        </div>
      )}

      {motif === "letter" && (
        <Sheet className="left-1/2 top-1/2 h-[84%] -translate-x-1/2 -translate-y-1/2 rotate-[2deg]">
          <div className="flex h-full flex-col p-[9%]">
            <div className="flex items-center justify-between">
              <span className="h-2 w-1/3 rounded-full bg-navy/15" />
              <span className={cn("flex items-center justify-center rounded-full", t.icon, hero ? "h-8 w-8" : "h-5 w-5")}>
                <Icon size={hero ? 15 : 10} />
              </span>
            </div>
            <span className={cn("mt-3 font-bold uppercase tracking-wider text-blue", hero ? "text-[11px]" : "text-[8.5px]")}>{resource.kind}</span>
            <span className={cn("mt-1 line-clamp-3 font-extrabold leading-tight text-navy", hero ? "text-[17px]" : "text-[11px]")}>{resource.title}</span>
            <div className="mt-3 space-y-1.5">
              <Line w={90} />
              <Line w={96} />
              <Line w={82} />
              <Line w={88} />
              <Line w={50} />
            </div>
          </div>
        </Sheet>
      )}

      {motif === "checklist" && (
        <Sheet className="left-1/2 top-1/2 h-[84%] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg]">
          <div className="flex h-full flex-col p-[9%]">
            <span className={cn("font-bold uppercase tracking-wider", t.accent, hero ? "text-[11px]" : "text-[8.5px]")}>{resource.kind}</span>
            <span className={cn("mt-1 line-clamp-2 font-extrabold leading-tight text-navy", hero ? "text-[17px]" : "text-[11px]")}>{resource.title}</span>
            <div className="mt-3 space-y-2">
              {[true, true, false, false].map((done, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={cn("flex shrink-0 items-center justify-center rounded-[3px] border", hero ? "h-4 w-4" : "h-3 w-3", done ? "border-success bg-success text-white" : "border-navy/25")}>
                    {done && <Check size={hero ? 11 : 8} strokeWidth={3} />}
                  </span>
                  <Line w={[78, 66, 86, 54][i]!} />
                </div>
              ))}
            </div>
          </div>
        </Sheet>
      )}

      {motif === "guide" && (
        // A booklet with a spine, to read as a guide rather than a form.
        <div className="absolute left-1/2 top-1/2 flex h-[82%] aspect-[3/4] -translate-x-1/2 -translate-y-1/2 rotate-[2deg] overflow-hidden rounded-[6px] bg-white shadow-raised">
          <div className="w-[12%] bg-blue" />
          <div className="flex flex-1 flex-col p-[10%]">
            <span className={cn("flex items-center justify-center rounded-full", t.icon, hero ? "h-9 w-9" : "h-6 w-6")}>
              <Icon size={hero ? 17 : 12} />
            </span>
            <span className={cn("mt-2 font-bold uppercase tracking-wider text-blue", hero ? "text-[11px]" : "text-[8.5px]")}>{resource.kind}</span>
            <span className={cn("mt-1 line-clamp-4 font-extrabold leading-tight text-navy", hero ? "text-[16px]" : "text-[10.5px]")}>{resource.title}</span>
          </div>
        </div>
      )}

      {/* icon badge, bottom-left, on the motifs that don't already show one */}
      {(motif === "sheet" || motif === "stack" || motif === "checklist") && (
        <span className={cn("absolute bottom-[8%] left-[7%] flex items-center justify-center rounded-full shadow-card", t.icon, hero ? "h-11 w-11" : "h-8 w-8")}>
          <Icon size={hero ? 20 : 15} />
        </span>
      )}
    </div>
  );
}
