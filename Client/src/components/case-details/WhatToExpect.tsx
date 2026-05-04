const steps = [
  {
    number: 1,
    title: "Acknowledgment",
    description: "Waiting for the other party to respond to your request. If they decline, we will suggest alternative legal pathways.",
    active: true
  },
  {
    number: 2,
    title: "Mediation Selection",
    description: "Once accepted, we will assign a neutral third-party mediator specialized in property law. You will receive an email notification.",
    active: false
  },
  {
    number: 3,
    title: "Scheduling",
    description: "Both parties will select three available time slots. A virtual session will be scheduled through our secure platform.",
    active: false
  }
];

export default function WhatToExpect() {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-6">What to Expect</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-4 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                step.active ? "bg-primary-navy text-white shadow-md" : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.number}
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-[15px] font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed pr-2">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
