import {
  RiMoneyDollarBoxLine,
  RiLockPasswordLine,
  RiTimeLine,
  RiFileList3Line,
} from "react-icons/ri";

export default function Benefits() {
  return (
    <section className="px-6 md:px-12 py-16 md:py-24 bg-(--color-bg-off-white)">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-(--color-primary-navy) mb-4 tracking-tight">
            The Benefits of MyRight
          </h2>
          <p className="text-(--color-text-muted) text-sm md:text-base">
            Efficiency meets empathy in the digital age.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 h-auto">
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="bg-(--color-primary-navy) rounded-xl p-8 shadow-sm flex flex-col justify-end min-h-[300px]"
          >
            <div className="mb-auto">
              <RiTimeLine className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="text-white font-bold text-2xl mb-3">Faster</h3>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Resolve disputes in days or weeks, not years. Our platform
                streamlines communication and documentation for rapid closure.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="bg-white rounded-xl p-8 border border-(--color-border-light) shadow-sm flex flex-col justify-end min-h-[300px]"
            >
              <div className="mb-auto">
                <RiMoneyDollarBoxLine className="w-6 h-6 text-(--color-primary-navy)" />
              </div>
              <div>
                <h3 className="text-(--color-primary-navy) font-bold text-2xl mb-3">
                  Cheaper
                </h3>
                <p className="text-(--color-text-muted) text-sm leading-relaxed">
                  Eliminate excessive legal fees and administrative court costs
                  with our flat-rate mediation sessions.
                </p>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="bg-(--color-primary-light) rounded-xl p-8 border border-blue-100 shadow-sm flex flex-col justify-end min-h-[300px]"
            >
              <div className="mb-auto">
                <RiFileList3Line className="w-6 h-6 text-(--color-primary-navy)" />
              </div>
              <div>
                <h3 className="text-(--color-primary-navy) font-bold text-2xl mb-3">
                  Less Formal
                </h3>
                <p className="text-(--color-text-muted) text-sm leading-relaxed">
                  Conduct sessions in plain English from the comfort of your
                  office. No rigid court protocols or intimidating atmospheres.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          className="bg-white rounded-xl p-6 md:p-8 border border-[var(--color-border-light)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="bg-[#fdf3e1] p-4 rounded-lg shrink-0">
              <RiLockPasswordLine className="w-6 h-6 text-[#d97706]" />
            </div>
            <div>
              <h4 className="text-(--color-primary-navy) font-bold text-base mb-1">
                Confidential & Private
              </h4>
              <p className="text-(--color-text-muted) text-sm leading-relaxed">
                Unlike public court records, ADR proceedings on MyRight are
                strictly confidential, protecting your personal brand and
                business secrets.
              </p>
            </div>
          </div>
          <button className="shrink-0 bg-(--color-primary-navy) text-white px-6 py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity">
            Explore Resources
          </button>
        </div>
      </div>
    </section>
  );
}
