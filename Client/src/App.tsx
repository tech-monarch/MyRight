import { useState, useEffect } from "react"
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useAuth } from "./hooks/useAuth"
import Auth from "./components/Auth"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Features from "./components/Features"
import CTA from "./components/CTA"

const App = () => {
  const { user, loading } = useAuth()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  // Not logged in
  if (!user) return <Auth />

  // Logged in
  return (
    <div>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center text-sm py-2 font-medium">
          You're offline — some features may be unavailable
        </div>
      )}

      <Navbar />
      <Hero />
      <Features />
      <CTA />

      {needRefresh && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Update Available</h2>
                <p className="text-sm text-gray-500 mt-1">A new version of the app is ready.</p>
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
  )
}

export default App