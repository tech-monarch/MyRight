export default function ChatLoadingIndicator() {
  return (
    <div className="flex w-full px-4 md:px-6 py-2 justify-start animate-in fade-in duration-300">
      <div className="flex gap-2 items-end max-w-[85%] md:max-w-[75%]">
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-(--color-primary-navy) flex items-center justify-center shadow-sm">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:200ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
