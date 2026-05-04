import { HiBell, HiQuestionMarkCircle } from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";

/**
 * DashboardTopNav
 *
 * A slim top navigation bar for dashboard-related pages.
 * Displays user initials, notifications, and help icons.
 */
export default function DashboardTopNav() {
  const { user } = useAuth();

  // Extract initials from user_metadata (provided by Supabase auth)
  const fullName = user?.user_metadata?.name || "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav
      className="h-16 shrink-0 flex items-center justify-end px-6 lg:px-10 bg-white border-b border-gray-100 sticky top-0 z-30"
      aria-label="Utility navigation"
    >
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Button */}
        <button
          className="text-gray-400 hover:text-(--color-primary-blue) transition-all duration-200 relative p-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-blue)/20"
          aria-label="View notifications"
        >
          <HiBell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Help Button */}
        <button
          className="text-gray-400 hover:text-(--color-primary-blue) transition-all duration-200 p-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-blue)/20"
          aria-label="Get help"
        >
          <HiQuestionMarkCircle className="w-6 h-6" />
        </button>

        {/* User Profile / Initials */}
        <div
          className="w-10 h-10 bg-(--color-primary-blue) rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm select-none cursor-default"
          title={fullName}
        >
          {initials || "U"}
        </div>
      </div>
    </nav>
  );
}
