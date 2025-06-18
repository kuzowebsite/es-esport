"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, X, Mail, User, Lock, Loader2 } from "lucide-react"
import { useFirebaseAdminSettings } from "./hooks/useFirebase"
import { useFirebaseAuth } from "./hooks/useFirebaseAuth"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: () => void
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Get site settings from Firebase
  const { settings: adminSettings, loading: settingsLoading } = useFirebaseAdminSettings()

  // Firebase Auth hook
  const {
    signInWithEmail,
    createUserWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    sendPasswordReset,
    loading: authLoading,
  } = useFirebaseAuth()

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "Энэ и-мэйл хаягаар бүртгэлгүй байна"
      case "auth/wrong-password":
        return "Нууц үг буруу байна"
      case "auth/invalid-email":
        return "И-мэйл хаягийн формат буруу байна"
      case "auth/user-disabled":
        return "Энэ хэрэглэгчийн эрх хаагдсан байна"
      case "auth/email-already-in-use":
        return "Энэ и-мэйл хаягаар аль хэдийн бүртгүүлсэн байна"
      case "auth/weak-password":
        return "Нууц үг хэтэрхий сул байна"
      case "auth/operation-not-allowed":
        return "Энэ үйлдэл зөвшөөрөгдөөгүй байна"
      case "auth/too-many-requests":
        return "Хэт олон оролдлого хийсэн байна. Түр хүлээнэ үү"
      default:
        return "Алдаа гарлаа. Дахин оролдоно уу"
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("И-мэйл болон нууц үг оруулна уу")
      return
    }

    setError("")

    const result = await signInWithEmail(email.trim(), password)

    if (result.success) {
      onLoginSuccess()
      onClose()
      setEmail("")
      setPassword("")
    } else {
      setError(getFirebaseErrorMessage(result.error))
    }
  }

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Бүх талбарыг бөглөнө үү")
      return
    }

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна")
      return
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
      return
    }

    if (!email.includes("@")) {
      setError("Зөв и-мэйл хаяг оруулна уу")
      return
    }

    setError("")

    const result = await createUserWithEmail(email.trim(), password, username.trim())

    if (result.success) {
      onLoginSuccess()
      onClose()
      setUsername("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    } else {
      setError(getFirebaseErrorMessage(result.error))
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("И-мэйл хаяг оруулна уу")
      return
    }

    if (!email.includes("@")) {
      setError("Зөв и-мэйл хаяг оруулна уу")
      return
    }

    setError("")

    const result = await sendPasswordReset(email.trim())

    if (result.success) {
      setSuccess("Нууц үг сэргээх холбоосыг и-мэйл рүү илгээлээ!")

      // Auto switch back to login after 3 seconds
      setTimeout(() => {
        setActiveTab("login")
        setSuccess("")
        setEmail("")
      }, 3000)
    } else {
      setError(getFirebaseErrorMessage(result.error))
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setError("")

    let result
    if (provider === "google") {
      result = await signInWithGoogle()
    } else {
      result = await signInWithFacebook()
    }

    if (result.success) {
      onLoginSuccess()
      onClose()
    } else {
      setError(getFirebaseErrorMessage(result.error))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !authLoading) {
      if (activeTab === "login") {
        handleLogin()
      } else if (activeTab === "signup") {
        handleSignup()
      } else if (activeTab === "forgot") {
        handleForgotPassword()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-[#1a1a1a] border-gray-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0 max-h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              {/* Dynamic Logo and Site Name from Firebase with Glow Effects */}
              {settingsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {adminSettings.logoUrl ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative cursor-pointer transition-all duration-300 hover:scale-110">
                      <img
                        src={adminSettings.logoUrl || "/placeholder.svg"}
                        alt="Logo"
                        className="w-full h-full object-contain transition-all duration-300"
                        style={{
                          filter:
                            "drop-shadow(0 0 12px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 24px rgba(59, 130, 246, 0.6))",
                        }}
                      />
                      {/* Constant glow background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-lg animate-pulse"></div>
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-lg ring-1 ring-purple-500/40 transition-all duration-300"></div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-lg flex items-center justify-center relative cursor-pointer transition-all duration-300 hover:scale-110">
                      <span
                        className="text-white font-bold text-sm transition-all duration-300"
                        style={{
                          textShadow: "0 0 12px rgba(147, 51, 234, 0.9), 0 0 24px rgba(59, 130, 246, 0.7)",
                        }}
                      >
                        ES
                      </span>
                      {/* Constant glow background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 rounded-lg animate-pulse"></div>
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-lg ring-1 ring-purple-500/40 transition-all duration-300"></div>
                      {/* Box shadow glow */}
                      <div
                        className="absolute inset-0 rounded-lg transition-all duration-300"
                        style={{
                          boxShadow: "0 0 25px rgba(147, 51, 234, 0.5), 0 0 50px rgba(59, 130, 246, 0.3)",
                        }}
                      ></div>
                    </div>
                  )}
                  <div className="text-2xl font-bold">
                    <span
                      className="text-cyan-400 transition-all duration-300"
                      style={{
                        textShadow: "0 0 10px rgba(34, 211, 238, 0.6), 0 0 20px rgba(34, 211, 238, 0.3)",
                      }}
                    >
                      {adminSettings.siteName?.split(".")[0] || "ES"}
                    </span>
                    <span className="text-white">.{adminSettings.siteName?.split(".")[1] || "mn"}</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
              disabled={authLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-6">
            <div className="flex border-b border-gray-700 mb-6">
              <button
                onClick={() => {
                  setActiveTab("login")
                  setError("")
                  setSuccess("")
                }}
                disabled={authLoading}
                className={`pb-3 px-1 mr-8 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "login"
                    ? "text-white border-cyan-400"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                Нэвтрэх
              </button>
              <button
                onClick={() => {
                  setActiveTab("signup")
                  setError("")
                  setSuccess("")
                }}
                disabled={authLoading}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "signup"
                    ? "text-white border-cyan-400"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                Бүртгүүлэх
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">И-мэйл хаяг</label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10"
                      placeholder="example@email.com"
                      disabled={authLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">Нууц үг</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10 pr-12"
                      placeholder="Нууц үг"
                      disabled={authLoading}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    onClick={() => {
                      setActiveTab("forgot")
                      setError("")
                      setSuccess("")
                    }}
                    disabled={authLoading}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Нууц үг мартсан уу?
                  </button>
                </div>

                {/* Error/Success Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={authLoading || !email.trim() || !password.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-12 text-base"
                >
                  {authLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Нэвтэрч байна...</span>
                    </div>
                  ) : (
                    "Нэвтрэх"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1a1a1a] text-gray-400">эсвэл үргэлжлүүлэх</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleSocialLogin("google")}
                    variant="outline"
                    className="flex-1 border-gray-600 bg-gray-800 text-white hover:bg-gray-700 h-12"
                    disabled={authLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </Button>

                  <Button
                    onClick={() => handleSocialLogin("facebook")}
                    variant="outline"
                    className="flex-1 border-gray-600 bg-gray-800 text-white hover:bg-gray-700 h-12"
                    disabled={authLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            {activeTab === "signup" && (
              <div className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">Хэрэглэгчийн нэр</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10"
                      placeholder="Хэрэглэгчийн нэр"
                      disabled={authLoading}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">И-мэйл хаяг</label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10"
                      placeholder="example@email.com"
                      disabled={authLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">Нууц үг</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10 pr-12"
                      placeholder="Хамгийн багадаа 6 тэмдэгт"
                      disabled={authLoading}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">Нууц үг баталгаажуулах</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10 pr-12"
                      placeholder="Нууц үгээ дахин оруулна уу"
                      disabled={authLoading}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={authLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Sign Up Button */}
                <Button
                  onClick={handleSignup}
                  disabled={
                    authLoading || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()
                  }
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-12 text-base"
                >
                  {authLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Бүртгүүлж байна...</span>
                    </div>
                  ) : (
                    "Бүртгүүлэх"
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-gray-400 text-center">
                  Бүртгүүлснээр та манай <button className="text-cyan-400 hover:underline">Үйлчилгээний нөхцөл</button>{" "}
                  болон <button className="text-cyan-400 hover:underline">Нууцлалын бодлого</button>-той зөвшөөрч байна
                </p>
              </div>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot" && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Нууц үг сэргээх</h3>
                  <p className="text-sm text-gray-400">
                    И-мэйл хаягаа оруулна уу. Бид танд нууц үг сэргээх холбоос илгээх болно.
                  </p>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">И-мэйл хаяг</label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pl-10"
                      placeholder="example@email.com"
                      disabled={authLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Error/Success Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}

                {/* Send Reset Button */}
                <Button
                  onClick={handleForgotPassword}
                  disabled={authLoading || !email.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold h-12 text-base"
                >
                  {authLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Илгээж байна...</span>
                    </div>
                  ) : (
                    "Сэргээх холбоос илгээх"
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setActiveTab("login")
                      setError("")
                      setSuccess("")
                      setEmail("")
                    }}
                    disabled={authLoading}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Нэвтрэх хэсэг рүү буцах
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
