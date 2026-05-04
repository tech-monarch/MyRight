import { RiRobot2Line } from "react-icons/ri";
import type { AIMessageProps } from "../../types/types";

export default function ChatMessage({
  role,
  content,
  animate = false,
}: AIMessageProps) {
  const isAI = role === "ai";

  return (
    <div
      className={`flex w-full px-4 md:px-6 py-2 ${
        isAI ? "justify-start" : "justify-end"
      } ${animate ? "animate-in fade-in slide-in-from-bottom-4 duration-300" : ""}`}
    >
      <div
        className={`flex gap-2 max-w-[85%] md:max-w-[75%] ${isAI ? "flex-row" : "flex-row-reverse"}`}
      >
        {isAI && (
          <div className="shrink-0 mt-auto">
            <div className="w-8 h-8 rounded-full bg-(--color-primary-navy) flex items-center justify-center">
              <RiRobot2Line className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <div
          className={`flex flex-col relative px-4 py-2.5 ${
            isAI
              ? "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100"
              : "bg-(--color-primary-light) text-gray-800 rounded-2xl rounded-br-sm"
          }`}
        >
          {isAI && (
            <span className="text-[11px] font-bold text-blue-800 mb-0.5 ml-1">
              MyRight Guide
            </span>
          )}

          <div className="text-[15px] leading-snug prose prose-sm max-w-none wrap-break-word">
            {typeof content === "string" ? (
              <p className="whitespace-pre-wrap m-0 text-gray-800">{content}</p>
            ) : (
              content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
