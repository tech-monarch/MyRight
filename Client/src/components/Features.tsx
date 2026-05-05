const Features = () => {
  return (
    <section className="py-24 px-12 bg-var(--color-bg-off-white) font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-var(--color-primary-navy) mb-4 tracking-tight">
            Why Choose MyRight?
          </h2>
          <p className="text-var(--color-text-muted) text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Modern legal challenges require architectural solutions. We move
            beyond standard templates to offer sophisticated resolution
            pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            data-aos="fade-up"
            data-aos-delay="0"
            className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-var(--color-border-light) flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-var(--color-bg-off-white) rounded-xl flex items-center justify-center mb-6 text-var(--color-primary-navy)">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-var(--color-primary-navy) mb-3">
                Rapid Mediation Workflow
              </h3>
              <p className="text-sm text-var(--color-text-muted) leading-relaxed mb-8 max-w-lg">
                Our automated document indexing and mediator matching reduces
                case preparation from weeks to hours. Experience efficiency
                without sacrificing thoroughness.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-var(--color-bg-off-white) text-var(--color-text-muted) text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider">
                Real-time Tracking
              </span>
              <span className="bg-var(--color-bg-off-white) text-var(--color-text-muted) text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider">
                Automated Filing
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="md:col-span-1 bg-var(--color-primary-navy) rounded-2xl p-8 flex flex-col justify-between text-white"
          >
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Confidential & Secure</h3>
              <p className="text-sm text-blue-100/80 leading-relaxed mb-8">
                Encrypted data vaults for sensitive evidence and private
                mediation chambers for safe dialogue.
              </p>
            </div>
            <a
              href="#"
              className="text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all"
            >
              Learn security protocols
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
          </div>

          {/* Card 3 */}
          <div
            data-aos="fade-up"
            data-aos-delay="0"
            className="md:col-span-1 bg-var(--color-bg-light-gray) rounded-2xl p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-var(--color-primary-navy)">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-var(--color-primary-navy) mb-3">
                Smart Documentation
              </h3>
              <p className="text-sm text-var(--color-text-muted) leading-relaxed">
                AI-assisted drafting for settlement agreements that meet high
                legal standards.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-var(--color-border-light) flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div className="flex-1 max-w-md">
              <h3 className="text-xl font-bold text-var(--color-primary-navy) mb-3">
                Certified Mediators
              </h3>
              <p className="text-sm text-var(--color-text-muted) leading-relaxed">
                Access a curated network of ICMC certified professionals across
                diverse sectors including maritime, real estate, and tech.
              </p>
            </div>
            <div className="flex items-center -space-x-2">
              <img
                src="/image1.jpg"
                className="w-10 h-10 rounded-lg bg-var(--color-border-light) border-2 border-white relative z-1"
              ></img>
              <img
                src="/image2.jpg"
                className="w-10 h-10 rounded-lg bg-[#d1d5db] border-2 border-white relative z-2"
              ></img>
              <img
                src="/image3.jpg"
                className="w-10 h-10 rounded-lg bg-[#9ca3af] border-2 border-white relative z-3"
              ></img>
              <div className="w-10 h-10 rounded-lg bg-var(--color-primary-navy) text-white text-[10px] font-bold flex items-center justify-center border-2 border-white relative z-4">
                +125
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
