import { Link } from "react-router-dom";
import {
  RiArrowRightLine,
  RiDownload2Line,
  RiFileCheckLine,
} from "react-icons/ri";
import type { Agreement } from "../../../types/types";

interface EducationalSidebarProps {
  recentAgreements: Agreement[];
}

export default function EducationalSidebar({
  recentAgreements,
}: EducationalSidebarProps) {
  return (
    <div className="lg:w-72 xl:w-80 flex flex-col gap-8">
      {/* ADR Education Block */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-text-muted) mb-4">
          Learn ADR
        </p>
        <div className="bg-(--color-primary-navy) p-6 relative overflow-hidden">
          {/* Decorative large letter */}
          <span className="absolute -bottom-6 -right-3 text-[120px] font-black text-white/5 leading-none pointer-events-none select-none">
            ADR
          </span>
          <div className="relative z-10">
            <h3 className="text-lg font-extrabold text-white leading-tight mb-3">
              What is Alternative Dispute Resolution?
            </h3>
            <p className="text-xs text-blue-200/80 leading-relaxed mb-6">
              Resolve conflicts without a courtroom — faster, cheaper, and
              privately. A smarter path to justice.
            </p>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-md transition-colors duration-150"
            >
              Explore the Basics
              <RiArrowRightLine className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Agreements */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-text-muted) mb-4">
          Recent Agreements
        </p>
        {recentAgreements.length > 0 ? (
          <div className="border border-(--color-border-light) divide-y divide-(--color-border-light)">
            {recentAgreements.map((agreement) => (
              <div
                key={agreement.id}
                className="group flex items-start gap-3 p-4 bg-white hover:bg-(--color-bg-off-white) transition-colors duration-150"
              >
                <div className="shrink-0 mt-0.5">
                  <RiFileCheckLine className="w-4 h-4 text-(--color-primary-navy)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-(--color-primary-navy) leading-snug mb-0.5">
                    {agreement.title}
                  </p>
                  <p className="text-[10px] font-mono text-(--color-text-muted) tracking-wide">
                    Signed {agreement.dateSigned}
                  </p>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-md text-(--color-primary-blue) hover:bg-(--color-primary-light) transition-all duration-150"
                  title="Download"
                >
                  <RiDownload2Line className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-(--color-text-muted) py-4 border border-dashed border-(--color-border-light) text-center">
            No agreements on record yet.
          </p>
        )}
      </div>
    </div>
  );
}
