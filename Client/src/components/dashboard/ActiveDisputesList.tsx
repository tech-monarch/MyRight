import {
  RiRobot2Line,
  RiMessage3Line,
  RiFileList3Line,
  RiArrowRightLine,
} from "react-icons/ri";
import type { Dispute } from "../../../types/types";

interface ActiveDisputesListProps {
  disputes: Dispute[];
}

export default function ActiveDisputesList({
  disputes,
}: ActiveDisputesListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-text-muted)">
          Active Disputes
        </p>
        <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-(--color-primary-blue) hover:gap-2 transition-all duration-150 bg-(--color-primary-light) px-3 py-1.5 rounded-md">
          View All <RiArrowRightLine className="w-3.5 h-3.5" />
        </button>
      </div>

      {disputes.length > 0 ? (
        <div className="border border-(--color-border-light) divide-y divide-(--color-border-light)">
          {disputes.map((dispute, index) => {
            const status = statusConfig[dispute.status];
            return (
              <div
                key={dispute.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white hover:bg-(--color-bg-off-white) transition-colors duration-150 group"
              >
                {/* Index + Title */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="text-xs font-black text-(--color-border-light) tabular-nums mt-0.5 w-5 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`}
                        />
                        {status.label}
                      </span>
                      <span className="text-[10px] font-bold text-(--color-text-muted) bg-(--color-bg-off-white) px-2 py-0.5 uppercase tracking-wider border border-(--color-border-light)">
                        {dispute.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-(--color-primary-navy) truncate">
                      {dispute.title}
                    </h3>
                    <p className="text-[11px] text-(--color-text-muted) mt-0.5 font-mono tracking-wide">
                      {dispute.id} · Initiated {dispute.dateInitiated}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-9 md:ml-0 shrink-0">
                  <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-(--color-border-light) px-3 py-2 rounded-md text-(--color-primary-navy) hover:border-(--color-primary-navy) transition-colors duration-150">
                    <RiRobot2Line className="w-3.5 h-3.5" />
                    AI Guide
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-(--color-primary-navy) text-white px-3 py-2 rounded-md hover:bg-(--color-primary-blue) transition-colors duration-150">
                    <RiMessage3Line className="w-3.5 h-3.5" />
                    Chatroom
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-(--color-border-light) p-16 flex flex-col items-center justify-center text-center bg-white">
          <div className="w-10 h-10 border-2 border-(--color-border-light) flex items-center justify-center mb-5">
            <RiFileList3Line className="w-5 h-5 text-(--color-text-muted)" />
          </div>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-(--color-primary-navy) mb-2">
            No Active Disputes
          </h3>
          <p className="text-xs text-(--color-text-muted) max-w-xs mb-6 leading-relaxed">
            You have no ongoing cases. Start the resolution process and let
            MyRight guide you.
          </p>
          <button className="text-xs font-bold uppercase tracking-widest bg-(--color-primary-navy) text-white px-6 py-3 rounded-md hover:bg-(--color-primary-blue) transition-colors duration-150">
            Start New Dispute
          </button>
        </div>
      )}
    </div>
  );
}

const statusConfig: Record<Dispute["status"], { label: string; dot: string }> =
  {
    "In Mediation": { label: "In Mediation", dot: "bg-(--color-primary-blue)" },
    "AI Assessment": { label: "AI Assessment", dot: "bg-violet-500" },
    "Invited Party": { label: "Invited Party", dot: "bg-amber-500" },
    Resolved: { label: "Resolved", dot: "bg-emerald-500" },
  };
