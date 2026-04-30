import { Link } from "react-router-dom";

export default function ChatHeader() {
  return (
    <div className="h-16 shrink-0 border-b border-gray-200 flex items-center px-6 justify-between bg-white z-10">
      <Link
        to="/dashboard"
        className="text-xl font-black tracking-tighter text-(--color-primary-navy)"
      >
        MyRight<span className="text-(--color-primary-blue)">.</span>
      </Link>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-(--color-primary-blue) animate-pulse" />
        <span className="text-xs font-bold text-(--color-text-muted) uppercase tracking-widest">
          AI Intake Agent
        </span>
      </div>
    </div>
  );
}
