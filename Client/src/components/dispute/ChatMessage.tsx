import { RiRobot2Line, RiUserLine } from "react-icons/ri";
import type { AIMessageProps } from "../../../types/types";

export default function ChatMessage({ role, content, animate = false }: AIMessageProps) {
  const isAI = role === "ai";

  return (
    <div
      className={`flex w-full py-6 md:py-8 ${
        isAI ? "bg-(--color-bg-off-white)" : "bg-white"
      } ${animate ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : ""}`}
    >
      <div className="max-w-4xl mx-auto w-full px-6 flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isAI ? (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-(--color-primary-navy) flex items-center justify-center shadow-sm">
              <RiRobot2Line className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
              <RiUserLine className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted) mb-1.5">
            {isAI ? "MyRight Guide" : "You"}
          </p>
          <div className="text-sm md:text-base text-(--color-primary-navy) leading-relaxed prose prose-sm md:prose-base prose-blue max-w-none">
            {typeof content === "string" ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
