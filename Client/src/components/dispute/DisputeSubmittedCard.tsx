import { Link } from "react-router-dom";
import { RiCheckLine } from "react-icons/ri";

export default function DisputeSubmittedCard() {
  return (
    <div className="mt-4 border border-emerald-200 bg-emerald-50 rounded-xl p-5 max-w-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-emerald-100 p-2 rounded-full">
          <RiCheckLine className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="text-emerald-900 font-bold">Dispute Submitted</h3>
      </div>
      <p className="text-emerald-800 text-sm leading-relaxed mb-4">
        A formal mediation invitation has been sent. While you wait for their response, here's what you can do:
      </p>
      <ul className="text-sm text-emerald-800 space-y-2 list-disc pl-5 mb-5">
        <li>Gather your documents (receipts, contracts)</li>
        <li>Write a short summary of your ideal outcome</li>
        <li>Stay open to compromise</li>
      </ul>
      <Link to="/dashboard" className="inline-block bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
}
