import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiPlusCircle,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useChatStore } from "../store";

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const resetChat = useChatStore((state) => state.resetChat);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 hidden md:flex flex-col">
      <div className="flex items-center px-6 h-20 border-b border-gray-200">
        <Link
          to="/"
          className="text-[22px] font-extrabold text-(--color-primary-navy) tracking-tight"
        >
          MyRight
        </Link>
      </div>
      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          const isNewDispute = link.path === "/dispute/new";

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                if (isNewDispute) resetChat();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-(--color-primary-navy) text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <FiUser className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.user_metadata?.name ||
                user?.email?.split("@")[0] ||
                "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

const links = [
  { name: "Dashboard", path: "/dashboard", icon: FiHome },
  { name: "New Dispute", path: "/dispute/new", icon: FiPlusCircle },
  { name: "Mediation", path: "/mediation", icon: FiMessageSquare },
  { name: "Settings", path: "/settings", icon: FiSettings },
];
