import { useState } from "react";
import type { ChangeEvent } from "react";

const CATEGORIES: string[] = [
  "Landlord / Tenant",
  "Commercial Contract",
  "Employment",
  "Family / Inheritance",
  "Consumer Rights",
];

interface DisputeCategorySelectProps {
  onChange?: (value: string) => void;
}

export default function DisputeCategorySelect({ onChange }: DisputeCategorySelectProps) {
  const [selected, setSelected] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <label className="text-xs font-semibold text-primary-navy uppercase tracking-wide block mb-2">
        Dispute Category
      </label>
      <select
        value={selected}
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
      >
        <option value="">Select a category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}