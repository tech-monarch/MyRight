import { useState } from "react";
import type { ChangeEvent } from "react";
import { Paperclip, Mic } from "lucide-react";
import { useInitializeStore } from "../stores/initializeStore";

const MIN_CHARS = 150;

export default function DescriptionTextarea() {
  const { description, setDescription } = useInitializeStore();
  const [charCount, setCharCount] = useState(description.length);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    setCharCount(value.length);
  };

  const meetsMinimum = charCount >= MIN_CHARS;

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-primary-navy uppercase tracking-wide">
          Description of Issue
        </label>
        <span className={`text-xs transition-colors ${meetsMinimum ? "text-green-500" : "text-gray-400"}`}>
          {meetsMinimum ? `${charCount} chars ✓` : `MIN ${MIN_CHARS} CHARACTERS`}
        </span>
      </div>
      <textarea
        value={description}
        onChange={handleChange}
        placeholder="My landlord increased rent without notice..."
        rows={6}
        className="w-full text-sm bg-white text-gray-700 placeholder-gray-300 resize-none focus:outline-none p-3"
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