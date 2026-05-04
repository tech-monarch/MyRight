import { useState } from "react";

import DisputeCategorySelect from "../components/initialize/DisputeCategorySelect";
import DescriptionTextarea from "../components/initialize/DescriptionTextarea";
import SupportingEvidenceUpload from "../components/initialize/SupportingEvidenceUpload";
import AnalysisTipsCard from "../components/initialize/AnalysisTipsCard";
import ProcessTimeline from "../components/initialize/ProcessTimeliine";
import AnalyzeButton from "../components/initialize/AnalyzeButton";
import PageHeader from "../components/initialize/PageHeader";

interface FormState {
  category: string;
  description: string;
  files: File[];
}

export default function InitializeDisputePage() {
  const [form, setForm] = useState<FormState>({
    category: "",
    description: "",
    files: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  const isValid =
    form.category.trim() !== "" && form.description.trim().length >= 150;

  const handleAnalyze = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      // TODO: wire up API call
      await new Promise((res) => setTimeout(res, 2000));
      console.log("Submitting:", form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <PageHeader />
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        
          <div className="flex-1 w-full">
            <DisputeCategorySelect
              onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
            />
            <DescriptionTextarea
              onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
            />
            <SupportingEvidenceUpload
              onFilesChange={(files) => setForm((prev) => ({ ...prev, files }))}
            />
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!isValid}
              loading={loading}
            />
          </div>

          {/* Right column */}
          <div className="w-full lg:w-72 shrink-0">
            <AnalysisTipsCard />
            <ProcessTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}