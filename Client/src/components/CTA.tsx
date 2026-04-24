const CTA = () => {
  return (
    <section className="py-24 px-6 md:px-12 font-sans bg-[var(--color-bg-white)] flex justify-center">
      <div className="w-full max-w-5xl bg-[var(--color-primary-navy)] rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow/gradient to match the design's premium feel */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-white mb-6 tracking-tight">
            Ready to settle your first case?
          </h2>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10">
            Join hundreds of businesses and individuals resolving conflicts faster and cheaper than the traditional court system.
          </p>
          <button className="bg-white text-[var(--color-primary-navy)] px-8 py-4 rounded-md font-bold hover:bg-gray-100 transition-colors shadow-sm text-sm md:text-base">
            Start Dispute Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
