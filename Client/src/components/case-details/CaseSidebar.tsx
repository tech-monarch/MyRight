import { FileEdit, Upload, Lightbulb } from "lucide-react";

export default function CaseSidebar() {
  return (
    <div className="flex flex-col gap-5">
      {/* Edit Request Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
        <div className="bg-[#f0f4fa] w-12 h-12 flex items-center justify-center rounded-lg text-primary-navy shrink-0">
          <FileEdit className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-gray-900 mb-0.5">Edit Request</span>
          <span className="text-[11px] text-gray-500">Update case details</span>
        </div>
      </div>

      {/* Upload Evidence Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
        <div className="bg-[#f0f4fa] w-12 h-12 flex items-center justify-center rounded-lg text-primary-navy shrink-0">
          <Upload className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-gray-900 mb-0.5">Upload Evidence</span>
          <span className="text-[11px] text-gray-500">PDF, JPG, or PNG files</span>
        </div>
      </div>

      {/* Resolution Pro-Tip Card */}
      <div className="bg-[#e9eff6] rounded-xl p-6 mt-4">
        <div className="flex items-center gap-2 text-primary-navy font-bold text-xs uppercase tracking-wider mb-4">
          <Lightbulb className="w-4 h-4 fill-primary-navy" />
          <span>Resolution Pro-Tip</span>
        </div>
        <p className="text-[13px] text-primary-navy/80 leading-relaxed font-medium">
          Users who upload at least three pieces of evidence resolve their
          disputes 40% faster on average. Ensure all receipts and photos are
          clearly legible.
        </p>
      </div>
    </div>
  );
}
