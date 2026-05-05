/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useInitializeStore } from "../stores/initializeStore";
import { useNavigate } from "react-router-dom";
import type { AnalysisResult } from "../../types/types";

interface MediationFormProps {
  analysisResult?: AnalysisResult;
  fileUrls?: string[];
}

// List of dispute categories
const DISPUTE_CATEGORIES = [
  "Landlord / Tenant",
  "Commercial Contract",
  "Employment",
  "Family / Inheritance",
  "Consumer Rights",
];

// Type for stored data in localStorage
interface StoredDisputeData {
  result: AnalysisResult;
  fileUrls: string[];
  description: string;
  category: string;
}

export default function MediationForm({
  analysisResult: propAnalysisResult,
  fileUrls: propFileUrls = [],
}: MediationFormProps) {
  const navigate = useNavigate();
  const { description: storeDescription, category: storeCategory, setDescription, setCategory } = useInitializeStore();

  // Local state for data from localStorage
  const [localAnalysis, setLocalAnalysis] = useState<AnalysisResult | null>(null);
  const [localFileUrls, setLocalFileUrls] = useState<string[]>([]);
  const [localDescription, setLocalDescription] = useState<string>("");
  const [localCategory, setLocalCategory] = useState<string>("");
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  // Load from localStorage when component mounts
  useEffect(() => {
    const stored = localStorage.getItem("pendingDispute");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredDisputeData;
        setLocalAnalysis(parsed.result);
        setLocalFileUrls(parsed.fileUrls || []);
        setLocalDescription(parsed.description || "");
        setLocalCategory(parsed.category || "");
        // Update global store
        if (parsed.description) setDescription(parsed.description);
        if (parsed.category) setCategory(parsed.category);
        // Clear localStorage after reading
        localStorage.removeItem("pendingDispute");
      } catch (err) {
        console.error("Failed to parse stored dispute data", err);
      }
    }
    setIsLoadingLocal(false);
  }, [setDescription, setCategory]);

  // Use props if provided, otherwise fallback to localStorage data
  const analysisResult = propAnalysisResult || localAnalysis;
  const fileUrls = propFileUrls.length > 0 ? propFileUrls : localFileUrls;
  const description = storeDescription || localDescription;
  const category = storeCategory || localCategory;

  // Determine initial category for the dropdown
  const initialCategory =
    analysisResult?.ADRRecommendation && DISPUTE_CATEGORIES.includes(analysisResult.ADRRecommendation)
      ? analysisResult.ADRRecommendation
      : category && DISPUTE_CATEGORIES.includes(category)
      ? category
      : DISPUTE_CATEGORIES[0];

  const [formData, setFormData] = useState({
    opponentName: "",
    opponentOrganization: "",
    opponentEmail: "",
    opponentPhone: "",
    disputeType: initialCategory,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep formData.disputeType in sync if initialCategory changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, disputeType: initialCategory }));
  }, [initialCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.opponentName ||
      !formData.opponentEmail ||
      !formData.opponentPhone ||
      !formData.disputeType
    ) {
      setError("Please fill all required fields (name, email, phone, dispute type).");
      return;
    }

    setLoading(true);
    setError("");

    if (!analysisResult) {
      setError("Missing analysis data. Please go back and re-run the analysis.");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get disputeId if it exists (from analysis result)
      const existingDisputeId = (analysisResult as { disputeId?: string }).disputeId;

      let insertedData: { id: string; created_at: string } | null = null;
      let operationError: Error | null = null;

      if (existingDisputeId) {
        // UPDATE existing record
        const { data: updated, error: updateError } = await supabase
          .from("mediation_requests")
          .update({
            category: formData.disputeType,
            opponent_name: formData.opponentName,
            opponent_organization: formData.opponentOrganization || null,
            opponent_email: formData.opponentEmail,
            opponent_phone: formData.opponentPhone,
            file_urls: fileUrls,
            analysis_result: analysisResult,
            status: "pending",
          })
          .eq("id", existingDisputeId)
          .select("id, created_at")
          .single();

        if (updated) insertedData = updated;
        if (updateError) operationError = updateError;
      } else {
        // INSERT new record
        const { data: inserted, error: insertError } = await supabase
          .from("mediation_requests")
          .insert({
            user_id: user.id,
            description,
            category: formData.disputeType,
            opponent_name: formData.opponentName,
            opponent_organization: formData.opponentOrganization || null,
            opponent_email: formData.opponentEmail,
            opponent_phone: formData.opponentPhone,
            file_urls: fileUrls,
            analysis_result: analysisResult,
            status: "pending",
          })
          .select("id, created_at")
          .single();

        if (inserted) insertedData = inserted;
        if (insertError) operationError = insertError;
      }

      if (operationError) throw operationError;
      if (!insertedData) throw new Error("No data returned after insert/update");

      localStorage.removeItem("pendingDispute");
      // Navigate to success page
      navigate("/mediation/success", {
        state: {
          caseId: insertedData.id,
          disputeType: formData.disputeType,
          initiatedOn: insertedData.created_at,
          opponentName: formData.opponentName,
          description,
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error(err);
      setError(errorMessage || "Failed to save mediation request.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingLocal) {
    return <div className="p-4 text-center">Loading form...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#f4f6f8] w-12 h-12 flex items-center justify-center rounded-lg text-primary-navy">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary-navy">
            Other party contact
          </h2>
          <p className="text-[13px] text-gray-500">
            Provide details to invite them to this case.
          </p>
        </div>
      </div>

      {/* Dispute Type dropdown */}
      <div className="mb-6">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
          DISPUTE TYPE *
        </label>
        <select
          name="disputeType"
          value={formData.disputeType}
          onChange={handleChange}
          className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-navy"
          required
        >
          {DISPUTE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
            FULL NAME *
          </label>
          <input
            type="text"
            name="opponentName"
            value={formData.opponentName}
            onChange={handleChange}
            placeholder="Nimah A"
            className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
            ORGANIZATION (optional)
          </label>
          <input
            type="text"
            name="opponentOrganization"
            value={formData.opponentOrganization}
            onChange={handleChange}
            placeholder="Pantheon"
            className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
          EMAIL ADDRESS *
        </label>
        <input
          type="email"
          name="opponentEmail"
          value={formData.opponentEmail}
          onChange={handleChange}
          placeholder="contact@otherparty.com"
          className="w-full bg-bg-light-gray border-none rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-navy"
          required
        />
      </div>

      <div className="mb-8">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
          PHONE NUMBER *
        </label>
        <div className="flex bg-bg-light-gray rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary-navy transition-shadow">
          <div className="px-4 py-3 bg-[#e2e6eb] text-sm font-semibold text-gray-700 flex items-center shrink-0">
            +234
          </div>
          <input
            type="tel"
            name="opponentPhone"
            value={formData.opponentPhone}
            onChange={handleChange}
            placeholder="801 234 5678"
            className="w-full bg-transparent border-none px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            required
          />
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary-navy text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-blue-900 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Send Invitation"}
      </button>
    </form>
  );
}