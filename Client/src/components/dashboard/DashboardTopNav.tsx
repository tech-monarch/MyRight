import { HiBell, HiQuestionMarkCircle } from "react-icons/hi2";
import { RiMenu3Line } from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../stores/uiStore";

export default function DashboardTopNav() {
  const { user } = useAuth();
  const { toggleSidebar } = useUIStore();

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
      className="h-16 shrink-0 flex items-center justify-between px-6 lg:px-10 bg-white border-b border-gray-100 sticky top-0 z-30"
      aria-label="Utility navigation"
    >
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
        aria-label="Open menu"
      >
        <RiMenu3Line size={24} />
      </button>

      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        <button
          className="text-gray-400 hover:text-(--color-primary-blue) transition-all duration-200 relative p-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-blue)/20"
          aria-label="View notifications"
        >
          <HiBell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button
          className="text-gray-400 hover:text-(--color-primary-blue) transition-all duration-200 p-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--color-primary-blue)/20"
          aria-label="Get help"
        >
          <HiQuestionMarkCircle className="w-6 h-6" />
        </button>
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