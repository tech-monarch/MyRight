import { useInitializeStore } from "../stores/initializeStore";

const CATEGORIES: string[] = [
  "Landlord / Tenant",
  "Commercial Contract",
  "Employment",
  "Family / Inheritance",
  "Consumer Rights",
];

export default function DisputeCategorySelect() {
  const { category, setCategory } = useInitializeStore();

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <label className="text-xs font-semibold text-primary-navy uppercase tracking-wide block mb-2">
        Dispute Category
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
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