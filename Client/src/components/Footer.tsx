const Footer = () => {
  return (
    <footer className="py-8 px-6 md:px-12 bg-[#f4f7fb] font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="text-xl font-extrabold text-[var(--color-primary-navy)] tracking-tight">
            MyRight
          </div>
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
            © 2024 MYRIGHT ADR. OPTIMIZED FOR THE NIGERIAN LEGAL CONTEXT.
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          <a href="#" className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest hover:text-[var(--color-primary-navy)] transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest hover:text-[var(--color-primary-navy)] transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest hover:text-[var(--color-primary-navy)] transition-colors">
            Legal Disclaimer
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
