import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import { paths } from "../utils/paths";
import Auth from "./components/Auth";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import { useAuth } from "./hooks/useAuth";
import AboutADR from "./pages/AboutADR";
import CaseDetails from "./pages/CaseDetails";
import CreateDispute from "./pages/CreateDispute";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import InitializeDisputePage from "./pages/Initialize";
import MediationRequest from "./pages/MediationRequest";
import MediationSuccess from "./pages/MediationSuccess";
import RequestMediator from "./pages/RequestMediator";
import Resolution from "./pages/Resolution";
import FeesAndPayments from "./pages/FeesAndPayments";
import DisputeOverview from "./pages/DisputeOverview";
import DisputeProgress from "./pages/DisputeProgress";

const App = () => {
  const { user, loading } = useAuth();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null); // controls auth modal and its mode
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // No need for an effect to clear authMode – the modal's render condition already hides it when user exists

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center text-sm py-2 font-medium">
          You're offline — some features may be unavailable
        </div>
      )}

      {[paths.home, paths.about].includes(location.pathname) && (
        <Navbar
          onLoginClick={() => setAuthMode("signin")}
          onSignupClick={() => setAuthMode("signup")}
          user={user}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={<Home onGetStarted={() => setAuthMode("signup")} />}
        />
        <Route path={paths.about} element={<AboutADR />} />
        <Route path={paths.dashboard} element={<Dashboard />} />
        <Route path={paths.disputeNew} element={<CreateDispute />} />
        <Route
          path={paths.initialize}
          element={<InitializeDisputePage />}
        ></Route>
        <Route path={paths.resolution} element={<Resolution />} />
        <Route path={paths.mediation} element={<MediationRequest />} />
        <Route path={paths.mediationSuccess} element={<MediationSuccess />} />
        <Route path={paths.requestMediator} element={<RequestMediator />} />
        <Route path={paths.caseDetails} element={<CaseDetails />} />
        <Route path={paths.fees} element={<FeesAndPayments />} />
        <Route path="/dispute-overview" element={<DisputeOverview />} />
        <Route path="/dispute/:id" element={<DisputeProgress />} />
        <Route path="/dispute/:id/chat" element={<InitializeDisputePage />} /> 
        {/* <Route path="/dispute/:id/chat" element={<ChatWithDispute />} /> */}
      </Routes>
      <ScrollToTop />
      {[paths.home, paths.about].includes(location.pathname) && <Footer />}

      {/* Auth modal — shown when authMode is set and user is NOT logged in */}
      {authMode && !user && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setAuthMode(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setAuthMode(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-800 z-10"
              >
                ✕
              </button>
              <Auth
                onSuccess={() => {
                  setAuthMode(null);
                  navigate(paths.dashboard);
                }}
                initialMode={authMode}
              />
            </div>
          </div>
        </>
      )}

      {/* PWA update modal */}
      {needRefresh && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Available
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  A new version of the app is ready.
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
