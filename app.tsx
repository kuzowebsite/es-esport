"use client"

import { useState, useEffect } from "react"
import EsportsPlatform from "./esports-platform"
import AdminDashboard from "./admin-dashboard"
import LoginModal from "./login-modal"
import { useFirebaseAuth } from "./hooks/useFirebaseAuth"

export default function App() {
  const [currentPage, setCurrentPage] = useState<"main" | "admin">("main")
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Use Firebase Auth hook
  const { userData, isLoggedIn, signOut, loading } = useFirebaseAuth()

  // Redirect admin to dashboard on login
  useEffect(() => {
    if (isLoggedIn && userData?.role === "admin") {
      setCurrentPage("admin")
    }
  }, [isLoggedIn, userData])

  const handleLoginSuccess = () => {
    // Login success is handled by the auth hook
    setIsLoginModalOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentPage("main")
  }

  const handleGoToMainPage = () => {
    setCurrentPage("main")
  }

  const handleGoToAdminPage = () => {
    if (userData?.role === "admin") {
      setCurrentPage("admin")
    }
  }

  // Show login modal if trying to access admin without being logged in as admin
  useEffect(() => {
    if (currentPage === "admin" && (!isLoggedIn || userData?.role !== "admin")) {
      setCurrentPage("main")
      setIsLoginModalOpen(true)
    }
  }, [currentPage, isLoggedIn, userData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Шалгаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Current Page */}
      {currentPage === "admin" && userData?.role === "admin" ? (
        <AdminDashboard userData={userData} onLogout={handleLogout} onGoToMainPage={handleGoToMainPage} />
      ) : (
        <EsportsPlatform
          userData={userData}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onGoToAdmin={handleGoToAdminPage}
        />
      )}
    </>
  )
}
