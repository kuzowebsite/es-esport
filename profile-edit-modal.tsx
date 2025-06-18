"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { User, Save, Camera, Loader2, CheckCircle, X } from "lucide-react"
import { useFirebaseAuth } from "./hooks/useFirebaseAuth"

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
  profileImage?: string
}

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
  onUpdateProfile: (newData: { username: string; profileImage?: string }) => void
}

export default function ProfileEditModal({ isOpen, onClose, userData, onUpdateProfile }: ProfileEditModalProps) {
  const [editedUsername, setEditedUsername] = useState(userData?.username || "")
  const [profileImage, setProfileImage] = useState<string>(userData?.profileImage || "")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Firebase Auth hook
  const { user, updateUserProfile } = useFirebaseAuth()

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
    if (!userData || !user) return

    setLoading(true)

    try {
      // Update user profile using Firebase Auth hook
      const result = await updateUserProfile({
        username: editedUsername,
        profileImage: profileImage,
      })

      if (result.success) {
        // Update local state
        onUpdateProfile({
          username: editedUsername,
          profileImage: profileImage,
        })

        setSaveSuccess(true)

        // Hide success message after 2 seconds and close modal
        setTimeout(() => {
          setSaveSuccess(false)
          onClose()
        }, 2000)
      } else {
        alert("Профайл хадгалахад алдаа гарлаа. Дахин оролдоно уу.")
      }
    } catch (error) {
      console.error("Profile save error:", error)
      alert("Профайл хадгалахад алдаа гарлаа. Дахин оролдоно уу.")
    }

    setLoading(false)
  }

  if (!isOpen || !userData) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 shadow-2xl max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Профайл засах
            </h2>
            <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-4 h-4" />
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

          <div className="space-y-6">
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
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-cyan-500 hover:bg-cyan-600"
                  disabled={loading}
                >
                  <Camera className="w-4 h-4" />
                </Button>
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
                <Input
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="bg-gray-900/50 border-cyan-500/30 text-white"
                  placeholder="Хэрэглэгчийн нэр оруулах..."
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">И-мэйл</label>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-300">{userData.email}</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading || !editedUsername.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex-1"
                >
                  {loading ? (
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
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800 flex-1"
                  disabled={loading}
                >
                  Цуцлах
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
