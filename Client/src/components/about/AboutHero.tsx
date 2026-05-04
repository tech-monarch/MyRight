import { motion } from 'framer-motion';

const AboutHero = () => {
  return (
    <section className="px-6 md:px-12 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="inline-block bg-(--color-primary-light) text-(--color-primary-blue) text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            Educational Portal
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-(--color-primary-navy) leading-tight mb-6">
            The Architectural Resolution.
          </h1>
          <p className="text-(--color-text-muted) text-base md:text-lg leading-relaxed max-w-lg">
            Justice doesn't always require a courtroom. Alternative Dispute
            Resolution (ADR) provides a sophisticated, efficient, and private
            path to harmony.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full flex justify-center md:justify-end"
        >
          <div className="w-full max-w-125 aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
            <img
              src="/1.png"
              alt="Architectural building representing structure and resolution"
              className="w-full h-full object-cover grayscale brightness-90 contrast-125"
            />
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;
