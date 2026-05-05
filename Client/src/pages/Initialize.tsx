import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
import { api } from "../lib/api";
import { useInitializeStore } from "../components/stores/initializeStore";
import type { AnalysisResult } from "../types/types";
import DisputeCategorySelect from "../components/initialize/DisputeCategorySelect";
import DescriptionTextarea from "../components/initialize/DescriptionTextarea";
import SupportingEvidenceUpload from "../components/initialize/SupportingEvidenceUpload";
import AnalysisTipsCard from "../components/initialize/AnalysisTipsCard";
import ProcessTimeline from "../components/initialize/ProcessTimeliine";
import AnalyzeButton from "../components/initialize/AnalyzeButton";
import PageHeader from "../components/initialize/PageHeader";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";
import MediationForm from "../components/mediation-request/MediationForm";

export default function InitializeDisputePage() {
  const navigate = useNavigate(); // ✅ added
  const { category, description, files } = useInitializeStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  const isValid = category.trim() !== "" && description.trim().length >= 150;

  const handleAnalyze = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const uploadResult = await api.documents.upload(files);
        uploadedUrls = uploadResult.urls || [];
      }

      const analysis = await api.initialize.analyze({
        description,
        category,
        fileUrls: uploadedUrls,
      });

      // Store analysis result and file URLs in localStorage
      localStorage.setItem("pendingDispute", JSON.stringify({
        result: analysis,
        fileUrls: uploadedUrls,
        description,
        category,
      }));

      // Navigate to the resolution page
      navigate("/resolution");
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <PageHeader />
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <div className="flex-1 w-full">
                <DisputeCategorySelect />
                <DescriptionTextarea />
                <SupportingEvidenceUpload />
                <AnalyzeButton
                  onClick={handleAnalyze}
                  disabled={!isValid}
                  loading={loading}
                />
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-72 shrink-0">
                <AnalysisTipsCard />
                <ProcessTimeline />
              </div>
            </div>

            {/* Optional: this block is never shown because we navigate away, but kept for completeness */}
            {result && (
              <>
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-primary-navy mb-4">Mediation Roadmap</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Summary</h3>
                      <p className="text-gray-600">{result.summary}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Key Issues</h3>
                      <ul className="list-disc pl-5 text-gray-600">
                        {result.keyIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Relevant Laws</h3>
                      <ul className="list-disc pl-5 text-gray-600">
                        {result.relevantLaws.map((law, i) => <li key={i}>{law}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">ADR Recommendation</h3>
                      <p className="text-gray-600">{result.ADRRecommendation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Next Steps</h3>
                      <ol className="list-decimal pl-5 text-gray-600">
                        {result.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                      </ol>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-700">Urgency</h3>
                        <p className="capitalize text-gray-600">{result.urgencyLevel}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Estimated Duration</h3>
                        <p className="text-gray-600">{result.estimatedDuration}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Risk Notes</h3>
                      <p className="text-gray-600">{result.riskNotes}</p>
                    </div>
                    {result.localResources && (
                      <div>
                        <h3 className="font-semibold text-gray-700">Local Resources</h3>
                        <p className="text-gray-600">{result.localResources}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <MediationForm analysisResult={result} fileUrls={[]} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}