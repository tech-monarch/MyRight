const Hero = () => {
  return (
    <section className="px-6 md:px-12 py-12 md:py-16 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column */}
        <div>
          <div className="inline-block bg-(--color-primary-light) text-(--color-primary-blue) text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            The Architectural Resolution
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-(--color-primary-navy) leading-[1.1] md:leading-[1.05] tracking-tight mb-6">
            Resolve disputes without going to court.
          </h1>
          
          <p className="text-[var(--color-text-muted)] text-base lg:text-lg leading-relaxed mb-10 max-w-lg">
            Alternative Dispute Resolution (ADR) provides a confidential, faster, and more collaborative environment to reach settlements without the stress of litigation.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 mb-12 lg:mb-16">
            <button className="w-full sm:w-auto bg-[var(--color-primary-navy)] text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity flex justify-center items-center">
              Start Resolution
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-[var(--color-primary-navy)] bg-white shadow-sm border border-[var(--color-border-light)] hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              How it Works
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary-navy)]">5,000+</span>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">CASES SETTLED</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary-navy)]">85%</span>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">SUCCESS RATE</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary-navy)]">24h</span>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">FIRST RESPONSE</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="relative w-full h-[400px] lg:h-[600px] mt-8 lg:mt-0 bg-gradient-to-br from-[#f4f7fb] to-[#e4e9f0] rounded-2xl p-6 lg:p-8 border border-white shadow-sm">
          <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8 bg-white p-5 lg:p-6 rounded-xl shadow-lg border border-[var(--color-border-light)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[var(--color-primary-light)] p-1.5 rounded-full flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[var(--color-primary-blue)]">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <span className="text-sm font-bold text-[var(--color-primary-navy)]">Nigerian Legal Compliance</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Fully optimized for the Nigerian Multi-Door Courthouse system and commercial ADR standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
