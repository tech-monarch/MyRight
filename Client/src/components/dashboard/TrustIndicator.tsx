import { RiShieldCheckLine } from "react-icons/ri";

export default function TrustIndicator() {
  return (
    <div className="flex items-center gap-4 pl-4 border-l-2 border-(--color-primary-blue)">
      <RiShieldCheckLine className="w-5 h-5 text-(--color-primary-blue) shrink-0" />
      <p className="text-xs font-semibold text-(--color-text-muted) leading-relaxed">
        <span className="text-(--color-primary-navy)">Certified & Secure.</span>{" "}
        All mediations are handled by impartial, certified ADR professionals
        under Nigerian law.
      </p>
    </div>
  );
}
