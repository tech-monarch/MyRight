import { Search } from 'lucide-react';

export default function FeesTopNav() {
  return (
    <nav className="h-20 shrink-0 flex items-center justify-between px-6 lg:px-10 bg-transparent sticky top-0 z-30">
        <div className="hidden md:flex"></div>
        <div className="flex items-center gap-6 flex-1 justify-end mt-4">
            <div className="relative w-80 max-w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-3 py-2.5 border border-transparent rounded-full leading-5 bg-[#EAECEF] text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition-colors"
                    placeholder="Search resources..."
                />
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-full h-full object-cover" />
            </div>
        </div>
    </nav>
  );
}
