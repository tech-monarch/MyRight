import { useState} from "react";
import type { ChangeEvent } from "react";
import { Paperclip, Mic } from "lucide-react";

const MIN_CHARS = 150;

interface DescriptionTextareaProps {
  onChange?: (value: string) => void;
}

export default function DescriptionTextarea({ onChange }: DescriptionTextareaProps) {
  const [value, setValue] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  const charCount = value.length;
  const meetsMinimum = charCount >= MIN_CHARS;

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Description of Issue
        </label>
        <span className={`text-xs transition-colors ${meetsMinimum ? "text-green-500" : "text-gray-400"}`}>
          {meetsMinimum ? `${charCount} chars ✓` : `MIN ${MIN_CHARS} CHARACTERS`}
        </span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="My landlord increased rent without notice..."
        rows={6}
        className="w-full text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none"
      />
      <div className="flex justify-end gap-3 mt-2 border-t border-gray-100 pt-2">
        <button type="button" aria-label="Attach file" className="text-gray-400 hover:text-gray-600">
          <Paperclip size={16} />
        </button>
        <button type="button" aria-label="Voice input" className="text-gray-400 hover:text-gray-600">
          <Mic size={16} />
        </button>
      </div>
    </div>
  );
}