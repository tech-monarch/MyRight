export default function ChatLoadingIndicator() {
  return (
    <div className="flex w-full py-6 md:py-8 bg-(--color-bg-off-white) animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto w-full px-6 flex gap-4 md:gap-6 items-center">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-(--color-primary-navy) flex items-center justify-center shadow-sm shrink-0">
          <span
            className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-white rounded-full animate-bounce mx-1"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
