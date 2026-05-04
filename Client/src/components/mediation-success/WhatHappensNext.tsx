export default function WhatHappensNext() {
  const steps = [
    {
      num: 1,
      text: "The other party receives an official invitation to join the dispute resolution session.",
      active: true
    },
    {
      num: 2,
      text: "Once they accept, a certified mediator from MyRight will be assigned within 24 hours.",
      active: false
    },
    {
      num: 3,
      text: "You will be notified via email to schedule your first joint introductory session.",
      active: false
    }
  ];

  return (
    <div className="bg-[#f8f9fc] rounded-xl p-8 md:p-10 border border-[#eff1f5] h-full">
      <h3 className="text-[15px] font-extrabold text-gray-900 mb-8">
        What happens next?
      </h3>

      <div className="flex flex-col gap-7">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold ${
                step.active
                  ? "bg-[#dce7ff] text-[#2c5ebc]"
                  : "bg-[#e8ebf0] text-gray-500"
              }`}
            >
              {step.num}
            </div>
            <p className="text-[13.5px] text-gray-600 leading-[1.6] pt-0.5 font-medium">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
