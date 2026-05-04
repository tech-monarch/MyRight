import { RiScales3Line, RiAuctionLine } from "react-icons/ri";

const WhatIsADR = () => (
  <section className="px-6 md:px-12 py-16 md:py-24 bg-(--color-bg-off-white)">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
      <div className="lg:w-1/3">
        <h2 className="text-[26px] md:text-[32px] font-extrabold text-(--color-primary-navy) mb-4 leading-tight">
          What is ADR?
        </h2>
        <div className="w-12 h-0.75 bg-(--color-primary-navy) mb-6"></div>
        <p className="text-(--color-text-muted) text-[13.5px] md:text-sm leading-[1.65] max-w-[280px]">
          Alternative Dispute Resolution (ADR) includes methods like mediation
          and arbitration to resolve conflicts without formal litigation.
        </p>
      </div>

      <div className="lg:w-2/3 flex flex-col gap-6">
        <div className="bg-white rounded-md rounded-l-none border border-(--color-border-light) border-l-[3px] border-l-(--color-primary-navy) p-7 md:p-8 shadow-sm">
          <h3 className="text-(--color-primary-navy) font-bold text-[17px] mb-3">
            A Collaborative Approach
          </h3>
          <p className="text-(--color-text-muted) text-[13.5px] leading-[1.65]">
            At its core, ADR is about empowerment. Instead of leaving a decision
            to a judge who may not understand the intricacies of your industry
            or personal situation, parties work with a neutral third party to
            find a mutually beneficial solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-md p-6 lg:p-7 border border-(--color-border-light) shadow-sm flex flex-col justify-center">
            <RiScales3Line className="w-6 h-6 text-(--color-primary-navy) mb-4" />
            <h4 className="text-(--color-primary-navy) font-bold mb-2 text-[15px]">
              Mediation
            </h4>
            <p className="text-(--color-text-muted) text-[13px] leading-[1.6]">
              A voluntary process where a neutral mediator helps parties
              communicate and negotiate a settlement.
            </p>
          </div>
          <div className="bg-white rounded-md p-6 lg:p-7 border border-(--color-border-light) shadow-sm flex flex-col justify-center">
            <RiAuctionLine className="w-6 h-6 text-(--color-primary-navy) mb-4" />
            <h4 className="text-(--color-primary-navy) font-bold mb-2 text-[15px]">
              Arbitration
            </h4>
            <p className="text-(--color-text-muted) text-[13px] leading-[1.6]">
              A more structured process where a neutral arbitrator makes a
              binding decision after hearing both sides.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default WhatIsADR;
