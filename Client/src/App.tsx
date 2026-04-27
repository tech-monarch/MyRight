import { useRegisterSW } from 'virtual:pwa-register/react'
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";

const App = () => {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <CTA />

      {needRefresh && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
              {/* Icon */}
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Update Available</h2>
                <p className="text-sm text-gray-500 mt-1">
                  A new version of the app is ready. Update now for the latest features and fixes.
                </p>
              </div>

              <div className="flex flex-col w-full gap-2">
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-colors"
                  onClick={() => updateServiceWorker(true)}
                >
                  Update Now
                </button>
                <button
                  className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
                  onClick={() => updateServiceWorker(false)}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;