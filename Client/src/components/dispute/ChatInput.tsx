import { useState, useRef, useEffect } from "react";
import { RiArrowUpLine, RiAttachment2 } from "react-icons/ri";

interface ChatInputProps {
  onSend: (text: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Message MyRight AI...",
  autoFocus = true,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Focus on mount
  useEffect(() => {
    if (autoFocus && !disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const handleSubmit = () => {
    if ((text.trim() === "" && files.length === 0) || disabled) return;
    onSend(text.trim(), files.length > 0 ? files : undefined);
    setText("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-6">
      <div className="relative bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-(--color-primary-navy) focus-within:ring-1 focus-within:ring-(--color-primary-navy) transition-all duration-200">
        
        {/* Attached files preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-(--color-primary-navy)">
                <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-500 hover:text-red-500 font-bold ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-(--color-primary-navy) transition-colors rounded-xl disabled:opacity-50"
            title="Attach files"
          >
            <RiAttachment2 className="w-5 h-5" />
          </button>
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "Please wait..." : placeholder}
            className="flex-1 max-h-[200px] min-h-[24px] bg-transparent outline-none resize-none py-2 text-[15px] leading-relaxed text-(--color-primary-navy) placeholder:text-gray-400 disabled:opacity-50"
            rows={1}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || (text.trim() === "" && files.length === 0)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              text.trim() || files.length > 0
                ? "bg-(--color-primary-navy) text-white shadow-sm hover:bg-opacity-90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <RiArrowUpLine className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">
        MyRight AI can make mistakes. Please review critical information before submitting.
      </p>
    </div>
  );
}
