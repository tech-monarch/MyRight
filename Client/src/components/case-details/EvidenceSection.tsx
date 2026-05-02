import { FileText } from "lucide-react";

const evidenceFiles = [
  {
    name: "Partner_Agreement.pdf",
    size: "2.4 MB",
    date: "Uploaded Mar 22"
  },
  {
    name: "Bank_Reciepts.pdf",
    size: "2.4 MB",
    date: "Uploaded Mar 22"
  }
];

export default function EvidenceSection() {
  return (
    <div className="mb-12">
      <h2 className="text-[19px] font-extrabold text-primary-navy tracking-tight mb-6">
        Evidence &amp; Documentation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {evidenceFiles.map((file, idx) => (
          <div key={idx} className="bg-white border border-[#eaedf3] rounded-2xl p-6 flex items-start gap-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="text-primary-navy mt-0.5 group-hover:scale-110 transition-transform duration-200">
              <FileText className="w-[26px] h-[26px]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[15px] font-bold text-primary-navy leading-tight">
                {file.name}
              </span>
              <span className="text-[12px] text-gray-500 font-medium">
                {file.size} &bull; {file.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
