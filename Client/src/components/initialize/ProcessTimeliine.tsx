interface TimelineStep {
  label: string;
  sub: string;
  active: boolean;
}

const STEPS: TimelineStep[] = [
  { label: "Input Details", sub: "Current Step", active: true },
  { label: "AI Analysis", sub: "Coming next", active: false },
  { label: "Mediation Roadmap", sub: "Final Output", active: false },
];

export default function ProcessTimeline() {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        Process Timeline
      </p>
      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${
                  step.active ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
              {i < STEPS.length - 1 && (
                <div className="w-px h-6 bg-gray-200 mt-1" />
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${step.active ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-400">{step.sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}