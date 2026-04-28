const AboutCTA = () => {
  return (
    <section className="px-6 md:px-12 py-20 bg-(--color-primary-navy) text-center text-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
          Ready to resolve?
        </h2>
        <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-10">
          Join thousands of Nigerians choosing the smarter path to resolution.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="w-full sm:w-auto bg-white text-(--color-primary-navy) px-8 py-3.5 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm">
            Start My Case
          </button>
          <button className="w-full sm:w-auto bg-transparent border border-white/30 text-white px-8 py-3.5 rounded-md text-sm font-bold hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
