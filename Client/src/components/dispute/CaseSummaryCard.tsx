
interface CaseSummaryCardProps {
  description: string;
  contactText: string;
}

export default function CaseSummaryCard({ description, contactText }: CaseSummaryCardProps) {
  return (
    <div className="mt-4 border border-(--color-border-light) rounded-xl bg-white p-5 max-w-md shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-(--color-text-muted) border-b border-(--color-border-light) pb-3 mb-3">
        Case Summary
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Category</p>
          <p className="text-sm font-semibold">Business/Contract</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Description</p>
          <p className="text-sm line-clamp-2 text-gray-600">{description}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Opponent Contact</p>
          <p className="text-sm font-semibold">{contactText}</p>
        </div>
      </div>
    </div>
  );
}
