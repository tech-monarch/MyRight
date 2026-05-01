import { Target } from "lucide-react";

interface Tip {
  text: string;
}

const TIPS: Tip[] = [
  { text: "Be specific about dates, locations, and involved parties." },
  { text: "Mention any previous attempts at verbal or written resolution." },
  { text: "Upload contracts, receipts, or message logs if available." },
];

export default function AnalysisTipsCard() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-gray-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Analysis Tips
        </span>
      </div>

      <ul className="space-y-3">
        {TIPS.map((tip, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center shrink-0 font-bold">
              {i + 1}
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">{tip.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80"
          alt="Law books background"
          className="w-full h-28 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-3">
          <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-1">
            Resolution Philosophy
          </p>
          <p className="text-xs text-white font-medium leading-snug italic">
            &ldquo;The best resolution is the one where both parties shape the outcome.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}