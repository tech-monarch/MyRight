import { RiBuilding3Line, RiHandCoinLine } from "react-icons/ri";

const WhyItMatters = () => {
  return (
    <section className="px-6 md:px-12 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 w-full order-2 md:order-1">
          <div className="w-full max-w-125 h-150 rounded-2xl overflow-hidden shadow-2xl relative mx-auto md:mx-0">
            <img
              src="/3.png"
              alt="Nigerian cityscape at night"
              className="w-full h-full object-cover brightness-75 contrast-125"
            />
            <div className="absolute inset-0 bg-linear-to-t from-(--color-primary-navy)/90 via-(--color-primary-navy)/20 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-white font-bold text-2xl">
                Resolving Nigeria's backlog.
              </h3>
            </div>
          </div>
        </div>

        <div className="flex-1 order-1 md:order-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-(--color-primary-navy) mb-6">
            Why it matters in Nigeria
          </h2>
          <p className="text-(--color-text-muted) text-sm md:text-base leading-relaxed mb-8">
            The Nigerian judicial system faces an unprecedented backlog of
            cases. Commercial disputes can often take years to reach a final
            judgment in traditional courts, stifling economic growth and
            personal peace.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-(--color-primary-navy) text-white p-1 rounded-full shrink-0">
                <RiBuilding3Line className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-(--color-primary-navy) font-bold text-sm mb-1">
                  Multi-Door Courthouses
                </h4>
                <p className="text-(--color-text-muted) text-xs leading-relaxed">
                  Supporting the institutional shift in Lagos, Abuja, and Kano
                  toward court-annexed mediation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-(--color-primary-navy) text-white p-1 rounded-full shrink-0">
                <RiHandCoinLine className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-(--color-primary-navy) font-bold text-sm mb-1">
                  Cultural Alignment
                </h4>
                <p className="text-(--color-text-muted) text-xs leading-relaxed">
                  ADR reflects traditional African dispute resolution values:
                  restoration over retribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMatters;
