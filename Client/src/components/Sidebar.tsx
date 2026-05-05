import { Link, useLocation } from "react-router-dom";
import { FiHome, FiMessageSquare, FiUser, FiLogOut, FiCreditCard } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatStore } from "../store";
import { paths } from "../../utils/paths";
import { LuGavel } from "react-icons/lu";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const links = [
  { name: "Overview", path: "/dashboard", icon: FiHome },
  { name: "AI Resolver", path: "/dispute/new", icon: Sparkles },
  { name: "Dispute Analysis", path: "/initialize", icon: LuGavel },
  { name: "My Disputes", path: "/dispute-overview", icon: FiMessageSquare },
  { name: "Fees & Payment", path: paths.fees, icon: FiCreditCard },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const resetChat = useChatStore((state) => state.resetChat);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  // Desktop sidebar (always visible on medium screens and up)
  const desktopSidebar = (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 hidden md:flex flex-col">
      <div className="flex items-center px-6 h-20 border-b border-gray-200">
        <Link to={paths.home} className="text-[22px] font-extrabold text-(--color-primary-navy) tracking-tight">
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
              {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
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

  // Mobile overlay + slide‑out sidebar
  const mobileSidebar = isOpen && (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 md:hidden flex flex-col animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between px-6 h-20 border-b border-gray-200">
          <Link to={paths.home} onClick={handleLinkClick} className="text-[22px] font-extrabold text-(--color-primary-navy) tracking-tight">
            MyRight
          </Link>
          <button onClick={onClose} className="text-gray-500 text-xl">✕</button>
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
                  handleLinkClick();
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
                {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              handleLinkClick();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}