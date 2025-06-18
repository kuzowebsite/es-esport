"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Edit3,
  Save,
  Eye,
  EyeOff,
  MessageCircle,
  Camera,
  Shield,
  Crown,
  LogOut,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { useFirebaseUserProfile } from "./hooks/useFirebase"

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
  profileImage?: string
}

interface ChatMessage {
  id: number
  user: string
  message: string
  timestamp: string
  color: string
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
  userMessages: ChatMessage[]
  onUpdateProfile: (newData: { username: string; profileImage?: string }) => void
  onChangePassword: (oldPassword: string, newPassword: string) => void
  onLogout: () => void
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userData,
  userMessages,
  onUpdateProfile,
  onChangePassword,
  onLogout,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [isEditing, setIsEditing] = useState(false)
  const [editedUsername, setEditedUsername] = useState(userData?.username || "")
  const [profileImage, setProfileImage] = useState<string>(userData?.profileImage || "")
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Firebase hook for user profile
  const { saveUserProfile, loading: profileLoading } = useFirebaseUserProfile()

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setEditedUsername(userData.username)
      setProfileImage(userData.profileImage || "")
    }
  }, [userData])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!userData) return

    try {
      // Save to Firebase
      const result = await saveUserProfile(userData, {
        username: editedUsername,
        profileImage: profileImage,
      })

      if (result.success) {
        // Update local state
        onUpdateProfile({
          username: editedUsername,
          profileImage: profileImage,
        })

        setIsEditing(false)
        setSaveSuccess(true)

        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert("Профайл хадгалахад алдаа гарлаа. Дахин оролдоно уу.")
      }
    } catch (error) {
      console.error("Profile save error:", error)
      alert("Профайл хадгалахад алдаа гарлаа. Дахин оролдоно уу.")
    }
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Шинэ нууц үг таарахгүй байна")
      return
    }
    if (newPassword.length < 4) {
      alert("Нууц үг хамгийн багадаа 4 тэмдэгт байх ёстой")
      return
    }
    onChangePassword(oldPassword, newPassword)
    setShowPasswordChange(false)
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  if (!isOpen || !userData) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Хэрэглэгчийн профайл
            </h2>
            <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Амжилттай хадгалагдлаа!</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                <User className="w-4 h-4 mr-2" />
                Мэдээлэл
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Чат
              </TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="info" className="space-y-6 mt-6">
              {/* Profile Image */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-cyan-500 hover:bg-cyan-600"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Хэрэглэгчийн нэр</label>
                  {isEditing ? (
                    <Input
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="bg-gray-900/50 border-cyan-500/30 text-white"
                      placeholder="Хэрэглэгчийн нэр оруулах..."
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-white font-medium">{userData.username}</span>
                      <Badge
                        className={`${
                          userData.role === "admin"
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        } text-white text-xs px-2 py-1`}
                      >
                        {userData.role === "admin" ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            АДМИН
                          </>
                        ) : (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">И-мэйл</label>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-300">{userData.email}</span>
                  </div>
                </div>

                {/* Firebase Status */}
                <div className="p-3 bg-gray-900/30 rounded-lg border border-green-500/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Firebase Realtime Database холбогдсон</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Таны өгөгдөл автоматаар хадгалагдана</p>
                </div>

                {/* Edit/Save Buttons */}
                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={profileLoading || !editedUsername.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex-1"
                      >
                        {profileLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Хадгалж байна...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Хадгалах
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedUsername(userData.username)
                          setProfileImage(userData.profileImage || "")
                        }}
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:bg-gray-800 flex-1"
                        disabled={profileLoading}
                      >
                        Цуцлах
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white w-full"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Засах
                    </Button>
                  )}
                </div>

                {/* Password Change */}
                <div className="border-t border-gray-700 pt-4">
                  {!showPasswordChange ? (
                    <Button
                      onClick={() => setShowPasswordChange(true)}
                      variant="outline"
                      className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      Нууц үг солих
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Нууц үг солих</h4>

                      <div>
                        <label className="text-white font-medium mb-2 block text-sm">Одоогийн нууц үг</label>
                        <div className="relative">
                          <Input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="bg-gray-900/50 border-orange-500/30 text-white pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                          >
                            {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-white font-medium mb-2 block text-sm">Шинэ нууц үг</label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-gray-900/50 border-orange-500/30 text-white pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-white font-medium mb-2 block text-sm">Нууц үг баталгаажуулах</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-gray-900/50 border-orange-500/30 text-white"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={handleChangePassword}
                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white flex-1"
                          disabled={!oldPassword || !newPassword || !confirmPassword}
                        >
                          Солих
                        </Button>
                        <Button
                          onClick={() => {
                            setShowPasswordChange(false)
                            setOldPassword("")
                            setNewPassword("")
                            setConfirmPassword("")
                          }}
                          variant="outline"
                          className="border-gray-600 text-gray-400 hover:bg-gray-800 flex-1"
                        >
                          Цуцлах
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-700 pt-4">
                  <Button
                    onClick={() => {
                      onLogout()
                      onClose()
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Гарах
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4 mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-purple-400 mb-2">Таны бичсэн мессежүүд</h3>
                <p className="text-gray-400 text-sm">Нийт {userMessages.length} мессеж</p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 bg-gray-900/30 rounded-lg p-4">
                {userMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Та одоогоор мессеж бичээгүй байна</p>
                  </div>
                ) : (
                  userMessages.map((msg) => (
                    <div key={msg.id} className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{msg.timestamp}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: msg.color }}></div>
                      </div>
                      <p className="text-white">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
