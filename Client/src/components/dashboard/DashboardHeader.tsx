import { RiAddCircleLine, RiCalendarLine } from "react-icons/ri";
import { format } from "date-fns";
import type { User } from "../../types/types";
import { paths } from "../../../utils/paths";
import { Link } from "react-router-dom";
import { useChatStore } from "../../store";

interface DashboardHeaderProps {
  user: User | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const today = format(new Date(), "EEEE, d MMMM yyyy");
  const fullName = user?.fullName || "Guest";
  const resetChat = useChatStore((state) => state.resetChat);

  return (
    <div className="border-b-2 border-(--color-primary-navy) pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-(--color-primary-navy) leading-tight tracking-tight">
            Welcome back, {fullName}!
          </h1>
          <div className="flex items-center gap-2 mt-3 text-(--color-text-muted)">
            <RiCalendarLine className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{today}</span>
          </div>
        </div>

        <Link
          to={paths.disputeNew}
          onClick={() => resetChat()}
          className="group flex items-center gap-3 bg-(--color-primary-navy) text-white px-7 py-3.5 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-(--color-primary-blue) transition-colors duration-200 w-full md:w-auto justify-center"
        >
          <RiAddCircleLine className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          New Dispute
        </Link>
      </div>
    </div>
  );
}
