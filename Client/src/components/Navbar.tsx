const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-12 py-4 bg-[var(--color-bg-white)] border-b border-[var(--color-border-light)] font-sans">
      <div className="flex items-center gap-12">
        <div className="text-[22px] font-extrabold text-[var(--color-primary-navy)] tracking-tight">
          MyRight
        </div>
        <ul className="flex list-none gap-8 m-0 p-0">
          <li>
            <a href="#" className="text-[var(--color-primary-navy)] text-sm font-medium transition-colors duration-200 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-[var(--color-primary-navy)] after:rounded-full">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="text-[var(--color-text-muted)] text-sm font-medium transition-colors duration-200 relative pb-2 hover:text-[var(--color-primary-navy)]">
              Mediation
            </a>
          </li>
          <li>
            <a href="#" className="text-[var(--color-text-muted)] text-sm font-medium transition-colors duration-200 relative pb-2 hover:text-[var(--color-primary-navy)]">
              About ADR
            </a>
          </li>
        </ul>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-[var(--color-bg-off-white)] rounded-lg px-4 py-2 gap-2">
          <svg className="text-[var(--color-text-muted)] w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search Case" className="border-none bg-transparent outline-none text-[13px] text-[var(--color-text-main)] w-[110px] placeholder:text-[var(--color-text-muted)]" />
        </div>
        <button className="bg-[var(--color-primary-navy)] text-[var(--color-bg-white)] rounded-md px-5 py-2.5 text-sm font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-90">
          Start Dispute
        </button>
        <div className="w-[38px] h-[38px] bg-[#e6e9ee] rounded-lg cursor-pointer"></div>
      </div>
    </nav>
  );
};

export default Navbar;
