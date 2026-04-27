import { useState } from "react";
import { RiMenu3Line, RiCloseLine, RiSearchLine } from "react-icons/ri";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  onLoginClick: () => void
  user: User | null
}

const Navbar = ({ onLoginClick, user }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-(--color-bg-white) border-b border-(--color-border-light) font-sans">
      <div className="flex justify-between items-center px-5 md:px-12 py-4">
        <div className="text-[22px] font-extrabold text-(--color-primary-navy) tracking-tight">
          MyRight
        </div>

        <ul className="hidden md:flex list-none gap-8 m-0 p-0">
          <li>
            <a href="#" className="text-(--color-primary-navy) text-sm font-medium transition-colors duration-200 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-(--color-primary-navy) after:rounded-full">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="text-(--color-text-muted) text-sm font-medium transition-colors duration-200 hover:text-(--color-primary-navy)">
              Mediation
            </a>
          </li>
          <li>
            <a href="#" className="text-(--color-text-muted) text-sm font-medium transition-colors duration-200 hover:text-(--color-primary-navy)">
              About ADR
            </a>
          </li>
        </ul>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center bg-(--color-bg-off-white) rounded-lg px-4 py-2 gap-2">
            <RiSearchLine className="text-(--color-text-muted) w-4 h-4" />
            <input
              type="text"
              placeholder="Search Case"
              className="border-none bg-transparent outline-none text-[13px] text-(--color-text-main) w-27.5 placeholder:text-(--color-text-muted)"
            />
          </div>
          {user ? (
            <button className="bg-(--color-primary-navy) text-(--color-bg-white) rounded-md px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-(--color-primary-navy) text-sm font-semibold hover:opacity-70 transition-opacity"
              >
                Log In
              </button>
              <button
                onClick={onLoginClick}
                className="bg-(--color-primary-navy) text-(--color-bg-white) rounded-md px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </>
          )}
          <div className="w-9.5 h-9.5 bg-[#e6e9ee] rounded-lg cursor-pointer" />
        </div>

        {/* Mobile right: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <div className="w-8.5 h-8.5 bg-[#e6e9ee] rounded-lg cursor-pointer" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-(--color-primary-navy) p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-(--color-border-light) px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center bg-(--color-bg-off-white) rounded-lg px-4 py-2.5 gap-2">
            <RiSearchLine className="text-(--color-text-muted) w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search Case"
              className="border-none bg-transparent outline-none text-[13px] text-(--color-text-main) w-full placeholder:text-(--color-text-muted)"
            />
          </div>

          <ul className="flex flex-col list-none gap-1 m-0 p-0">
            <li><a href="#" className="block py-2.5 text-sm font-semibold text-(--color-primary-navy)">Dashboard</a></li>
            <li><a href="#" className="block py-2.5 text-sm font-medium text-(--color-text-muted) hover:text-(--color-primary-navy)">Mediation</a></li>
            <li><a href="#" className="block py-2.5 text-sm font-medium text-(--color-text-muted) hover:text-(--color-primary-navy)">About ADR</a></li>
          </ul>

          {user ? (
            <button className="w-full bg-(--color-primary-navy) text-(--color-bg-white) rounded-md px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
              Dashboard
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full bg-(--color-primary-navy) text-(--color-bg-white) rounded-md px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;