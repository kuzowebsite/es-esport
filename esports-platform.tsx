"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { User, Send, Eye, Users, ChevronRight, ChevronLeft, MessageCircle, Trash2, X } from "lucide-react"
import UserProfileModal from "./user-profile-modal"
import ProfileEditModal from "./profile-edit-modal"
import UserChatModal from "./user-chat-modal"
// Import the new Firebase hook
import { useFirebaseAdminSettings, useFirebaseChatMessages, useFirebaseUserProfile } from "./hooks/useFirebase"
import { firebaseHelpers, DB_PATHS } from "./lib/firebase"
import UserProfileDropdown from "./user-profile-dropdown"

// Declare Twitch global type
declare global {
  interface Window {
    Twitch: {
      Player: new (elementId: string, options: any) => any
    }
  }
}

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
  profileImage?: string
}

interface EsportsPlatformProps {
  userData: UserData | null
  isLoggedIn: boolean
  onLogin: (UserData: UserData) => void
  onLogout: () => void
  onOpenLogin: () => void
  onGoToAdmin: () => void
}

export default function EsportsPlatform({
  userData,
  isLoggedIn,
  onLogout,
  onOpenLogin,
  onGoToAdmin,
}: EsportsPlatformProps) {
  const [chatMessage, setChatMessage] = useState("")
  const [username, setUsername] = useState("")
  const [twitchPlayerLoaded, setTwitchPlayerLoaded] = useState(false)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(true) // Default to true to show chat
  const [viewerCount] = useState(18247)
  const [isLive] = useState(true)
  const [longPressedMessage, setLongPressedMessage] = useState<number | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [userProfileImage, setUserProfileImage] = useState<string>("")
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showMobileInfo, setShowMobileInfo] = useState(false)
  const [chatButtonPosition, setChatButtonPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Firebase hooks
  const { settings: adminSettings, loading: settingsLoading } = useFirebaseAdminSettings()
  const { messages: chatMessages, addMessage, clearMessages, loading: chatLoading } = useFirebaseChatMessages()
  // Add the Firebase hook to the component
  const { loadUserProfile } = useFirebaseUserProfile()

  // Get user's own messages
  const userMessages = chatMessages.filter((msg) => msg.user === (userData?.username || username))

  // Handle initial mobile state - MOVED TO TOP BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    // On mobile, show info section by default when chat is closed
    if (!isMobileChatOpen) {
      setShowMobileInfo(true)
    } else {
      setShowMobileInfo(false)
    }
  }, [isMobileChatOpen])

  // Load username from localStorage or set from userData
  useEffect(() => {
    const savedUsername = localStorage.getItem("eslcs-username")
    if (savedUsername) {
      setUsername(savedUsername)
    } else if (userData) {
      setUsername(userData.username)
    } else {
      const randomUsername = `User${Math.floor(Math.random() * 10000)}`
      setUsername(randomUsername)
      localStorage.setItem("eslcs-username", randomUsername)
    }
  }, [userData])

  // Auto-delete messages after 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const tenMinutesAgo = now - 10 * 60 * 1000 // 10 minutes in milliseconds

      // Filter out messages older than 10 minutes
      const messagesToKeep = chatMessages.filter((msg) => {
        const messageTime = msg.id // Using id as timestamp
        return messageTime > tenMinutesAgo
      })

      // If there are messages to remove, update Firebase
      if (messagesToKeep.length !== chatMessages.length) {
        console.log(`Auto-deleting ${chatMessages.length - messagesToKeep.length} old messages`)
        // You would implement this in your Firebase hooks
        // For now, we'll just log it
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [chatMessages])

  useEffect(() => {
    console.log("Current chat messages:", chatMessages)
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Load Twitch player only if stream is active, no ad is showing, and no custom iframe
  useEffect(() => {
    if (!adminSettings.isStreamActive || adminSettings.isAdActive || adminSettings.streamLink) {
      return
    }

    const script = document.createElement("script")
    script.src = "https://player.twitch.tv/js/embed/v1.js"
    script.async = true

    script.onload = () => {
      if (window.Twitch && window.Twitch.Player) {
        // Check if the element exists before initializing
        const embedElement = document.getElementById("twitch-embed")
        if (embedElement) {
          try {
            new window.Twitch.Player("twitch-embed", {
              channel: "eslcs",
              width: "100%",
              height: "100%",
              layout: "video",
              autoplay: false,
              muted: false,
            })
            setTwitchPlayerLoaded(true)
          } catch (error) {
            console.error("Error initializing Twitch player:", error)
          }
        } else {
          console.warn("Twitch embed element not found, skipping initialization")
        }
      }
    }

    script.onerror = () => {
      console.error("Failed to load Twitch player script")
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [adminSettings.isStreamActive, adminSettings.isAdActive, adminSettings.streamLink])

  const getRandomColor = () => {
    const colors = [
      "#00D4FF",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      // Use logged-in user's username if available, otherwise use local username
      const displayUsername = userData?.username || username
      const currentProfileImage = userData?.profileImage || userProfileImage || ""

      const newMessage = {
        id: Date.now(),
        user: displayUsername,
        message: chatMessage.trim(),
        timestamp: new Date().toLocaleTimeString("mn-MN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        color: getRandomColor(),
        profileImage: currentProfileImage,
      }

      console.log("Sending message with profile image:", newMessage)
      const result = await addMessage(newMessage)
      console.log("Message send result:", result)
      setChatMessage("")
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (deletingMessageId) return // Prevent multiple deletions

    setDeletingMessageId(messageId)

    try {
      // Check if this message belongs to the current user
      const messageToDelete = chatMessages.find((msg) => msg.id === messageId)
      const currentUsername = userData?.username || username

      if (messageToDelete && messageToDelete.user === currentUsername) {
        // Delete from Firebase by removing the specific message
        const result = await firebaseHelpers.saveData(`${DB_PATHS.CHAT_MESSAGES}/${messageId}`, null)
        if (result.success) {
          console.log("Message deleted successfully from Firebase")
        } else {
          console.error("Failed to delete message from Firebase")
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }

    setDeletingMessageId(null)
    setLongPressedMessage(null)
  }

  const handleMouseDown = (messageId: number) => {
    const timer = setTimeout(() => {
      setLongPressedMessage(messageId)
    }, 800) // 800ms long press
    setLongPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleChatButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleChatButtonMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    // Keep button within viewport bounds
    const maxX = window.innerWidth - 56 // 56px is button width
    const maxY = window.innerHeight - 56 // 56px is button height

    setChatButtonPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }

  const handleChatButtonMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const touch = e.touches[0]
      const newX = touch.clientX - dragOffset.x
      const newY = touch.clientY - dragOffset.y

      // Keep button within viewport bounds
      const maxX = window.innerWidth - 56 // 56px is button width
      const maxY = window.innerHeight - 56 // 56px is button height

      setChatButtonPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleChatButtonMouseMove)
      document.addEventListener("mouseup", handleChatButtonMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)

      return () => {
        document.removeEventListener("mousemove", handleChatButtonMouseMove)
        document.removeEventListener("mouseup", handleChatButtonMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging, dragOffset])

  // Update the handleUpdateProfile function to load updated data from Firebase
  const handleUpdateProfile = async (newData: { username: string; profileImage?: string }) => {
    if (newData.profileImage) {
      setUserProfileImage(newData.profileImage)
    }

    // Update username logic here
    setUsername(newData.username)
    localStorage.setItem("eslcs-username", newData.username)

    // Update userData if available and reload from Firebase
    if (userData) {
      userData.username = newData.username
      if (newData.profileImage) {
        userData.profileImage = newData.profileImage
      }

      // Optionally reload user data from Firebase to ensure consistency
      try {
        const result = await loadUserProfile(userData.email)
        if (result.success && result.data) {
          // Update local userData with fresh data from Firebase
          Object.assign(userData, result.data)
        }
      } catch (error) {
        console.error("Error reloading user profile:", error)
      }
    }
  }

  const handleChangePassword = (oldPassword: string, newPassword: string) => {
    // Password change logic here
    console.log("Password change requested")
    alert("Нууц үг амжилттай солигдлоо!")
  }

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername)
    localStorage.setItem("eslcs-username", newUsername)
  }

  const handleClearChat = async () => {
    await clearMessages()
  }

  const renderVideoContent = () => {
    // Show advertisement if active
    if (adminSettings.isAdActive && adminSettings.adLink) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6">
          <div className="w-full max-w-4xl">
            {/* Advertisement Video */}
            <div
              className="w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-4 relative"
              style={{ aspectRatio: "16/9" }}
            >
              {adminSettings.adLink.includes("youtube.com") || adminSettings.adLink.includes("youtu.be") ? (
                <iframe
                  src={adminSettings.adLink.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ pointerEvents: "none" }}
                />
              ) : (
                <video
                  src={adminSettings.adLink}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  controls={false}
                  style={{ pointerEvents: "none" }}
                />
              )}

              <div
                className="absolute inset-0 bg-transparent pointer-events-auto"
                onClick={() => adminSettings.adWebsiteLink && window.open(adminSettings.adWebsiteLink, "_blank")}
                style={{ cursor: adminSettings.adWebsiteLink ? "pointer" : "default" }}
              />
            </div>

            {adminSettings.adTitle && (
              <h3 className="text-2xl font-bold text-white mb-2 text-center">{adminSettings.adTitle}</h3>
            )}
            {adminSettings.adDescription && (
              <p className="text-gray-300 text-lg text-center mb-4">{adminSettings.adDescription}</p>
            )}
            {adminSettings.adWebsiteLink && (
              <div className="text-center">
                <Button
                  onClick={() => window.open(adminSettings.adWebsiteLink, "_blank")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3"
                >
                  Сайт руу очих
                </Button>
              </div>
            )}
            <div className="flex justify-center mt-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
                Суртчилгаа - Зогсоох боломжгүй
              </Badge>
            </div>
          </div>
        </div>
      )
    }

    // Show stream offline message if stream is inactive
    if (!adminSettings.isStreamActive) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center p-8">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-4">Дамжуулалт идэвхгүй байна</h3>
            <p className="text-gray-500">Удахгүй эхлэх болно...</p>
            <Badge className="bg-gray-600 text-white mt-4 px-4 py-2">Offline</Badge>
          </div>
        </div>
      )
    }

    // Show custom stream link if provided
    if (adminSettings.streamLink) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          {adminSettings.streamLink.includes("twitch.tv") ? (
            <iframe
              src={`https://player.twitch.tv/?channel=${adminSettings.streamLink.split("/").pop()}&parent=${window.location.hostname}`}
              className="w-full h-full rounded-xl"
              frameBorder="0"
              allowFullScreen
            />
          ) : adminSettings.streamLink.includes("youtube.com") || adminSettings.streamLink.includes("youtu.be") ? (
            <iframe
              src={adminSettings.streamLink.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              className="w-full h-full rounded-xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={adminSettings.streamLink} className="w-full h-full object-cover rounded-xl" controls autoPlay />
          )}
        </div>
      )
    }

    // Show default Twitch embed - only render the div when conditions are met
    return (
      <div className="w-full h-full relative">
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
          <div id="twitch-embed" className="w-full h-full relative z-10 rounded-xl overflow-hidden bg-black"></div>
        </div>
      </div>
    )
  }

  const getSampleMessages = () => {
    if (chatMessages.length > 0) return chatMessages

    // Return 6 sample messages if no real messages exist
    return [
      {
        id: Date.now() - 5000,
        user: "KuZo",
        message: "dd",
        timestamp: "12:50 AM",
        color: "#00D4FF",
        profileImage: "",
      },
      {
        id: Date.now() - 4000,
        user: "KuZo",
        message: "a",
        timestamp: "12:51 AM",
        color: "#00D4FF",
        profileImage: "",
      },
      {
        id: Date.now() - 3000,
        user: "Player123",
        message: "Hello everyone!",
        timestamp: "09:15 PM",
        color: "#FF6B6B",
        profileImage: "",
      },
      {
        id: Date.now() - 2000,
        user: "GamerPro",
        message: "Nice play!",
        timestamp: "09:16 PM",
        color: "#4ECDC4",
        profileImage: "",
      },
      {
        id: Date.now() - 1000,
        user: "ESfan",
        message: "When is the next match?",
        timestamp: "09:17 PM",
        color: "#BB8FCE",
        profileImage: "",
      },
      {
        id: Date.now(),
        user: "Moderator",
        message: "Welcome to the stream!",
        timestamp: "09:18 PM",
        color: "#F7DC6F",
        profileImage: "",
      },
    ]
  }

  if (settingsLoading || chatLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          {/* Show logo if available */}
          {adminSettings.logoUrl ? (
            <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto mb-6 bg-white/10 relative">
              <img
                src={adminSettings.logoUrl || "/placeholder.svg"}
                alt="Logo"
                className="w-full h-full object-contain"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.6))",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl animate-pulse"></div>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 relative">
              <div className="w-12 h-12 bg-white rounded-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl animate-pulse"></div>
            </div>
          )}
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Түр хүлээн үү . . .</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* User Profile Modal */}
      {isLoggedIn && userData && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userData={userData}
          userMessages={userMessages}
          onUpdateProfile={handleUpdateProfile}
          onChangePassword={handleChangePassword}
          onLogout={onLogout} // Add this line
        />
      )}

      {/* Profile Edit Modal */}
      {isLoggedIn && userData && (
        <ProfileEditModal
          isOpen={isProfileEditModalOpen}
          onClose={() => setIsProfileEditModalOpen(false)}
          userData={userData}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* User Chat Modal */}
      {isLoggedIn && userData && (
        <UserChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} userData={userData} />
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo with Constant Glow Effect */}
            {adminSettings.logoUrl ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden relative cursor-pointer transition-all duration-300">
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-lg flex items-center justify-center relative cursor-pointer transition-all duration-300">
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
            <h1 className="text-xl font-bold">
              <span
                className="text-cyan-400 transition-all duration-300 hover:text-cyan-300"
                style={{
                  textShadow: "0 0 10px rgba(34, 211, 238, 0.6), 0 0 20px rgba(34, 211, 238, 0.3)",
                }}
              >
                {adminSettings.siteName || "ES.mn"}
              </span>
            </h1>
          </div>

          {/* Right Section - Profile or Login */}
          <div className="flex items-center pr-2">
            {isLoggedIn && userData ? (
              <UserProfileDropdown
                userData={userData}
                onLogout={onLogout}
                onOpenProfile={() => setIsProfileEditModalOpen(true)}
                onOpenChat={() => setIsChatModalOpen(true)}
                onGoToAdmin={onGoToAdmin}
                profileImage={userProfileImage}
              />
            ) : (
              <Button
                onClick={onOpenLogin}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 mt-1"
              >
                <User className="w-4 h-4 mr-1" />
                Нэвтрэх
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex flex-col h-screen pt-16">
          {/* Video Player - Matches reference proportions */}
          <div className="relative bg-black mx-3 mt-1 mb-1 rounded-xl overflow-hidden" style={{ height: "45vh" }}>
            {/* Loading State */}
            {!twitchPlayerLoaded &&
              adminSettings.isStreamActive &&
              !adminSettings.isAdActive &&
              !adminSettings.streamLink && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}

            {/* Video Content */}
            {renderVideoContent()}
          </div>

          {/* Floating Chat Icon - Only show when chat is closed */}
          {!isMobileChatOpen && (
            <div
              className="fixed z-[45] cursor-move select-none"
              style={{
                left: chatButtonPosition.x || "auto",
                top: chatButtonPosition.y || "auto",
                right: chatButtonPosition.x ? "auto" : "1.5rem",
                bottom: chatButtonPosition.y ? "auto" : "1.5rem",
              }}
              onMouseDown={handleChatButtonMouseDown}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                const rect = e.currentTarget.getBoundingClientRect()
                setIsDragging(true)
                setDragOffset({
                  x: touch.clientX - rect.left,
                  y: touch.clientY - rect.top,
                })
              }}
            >
              <Button
                onClick={() => {
                  setIsMobileChatOpen(true)
                  setShowMobileInfo(false) // Hide info section when opening chat
                }}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-2xl transform transition-all duration-300 hover:scale-110 flex items-center justify-center"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
            </div>
          )}

          {/* Info Section - When chat is closed */}
          {showMobileInfo && (
            <div className="flex-1 bg-gray-900/95 mx-3 mt-3 mb-4 rounded-xl flex flex-col overflow-hidden">
              {/* Info Header */}
              <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
                <h3 className="text-white font-semibold">Мэдээлэл</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMobileInfo(false)
                    setIsMobileChatOpen(true)
                  }}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>

              {/* Stream Info Content - Now Scrollable */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{adminSettings.streamTitle || "Дамжуулалт"}</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {adminSettings.streamDescription || "Дамжуулалтын тайлбар"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">1,234 үзэгч</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-white">567 дагагч</span>
                    </div>
                  </div>

                  {/* Updated sections using admin settings with fallbacks */}
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="text-white font-semibold mb-2">Тоглоом</h5>
                    <p className="text-gray-300 text-sm">{adminSettings.gameTitle || "Counter-Strike 2"}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="text-white font-semibold mb-2">Категори</h5>
                    <p className="text-gray-300 text-sm">{adminSettings.category || "eSports • FPS • Уралдаан"}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="text-white font-semibold mb-2">Дараагийн тоглолт</h5>
                    <p className="text-gray-300 text-sm">{adminSettings.nextMatch || "Удахгүй мэдэгдэх болно"}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="text-white font-semibold mb-2">Спонсорууд</h5>
                    <p className="text-gray-300 text-sm">{adminSettings.sponsors || "Спонсор байхгүй"}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Chat Section - When chat is open */}
          {isMobileChatOpen && !showMobileInfo && (
            <div className="flex-1 bg-gray-900/95 mx-3 mt-3 mb-4 rounded-xl flex flex-col overflow-hidden">
              {/* Chat Header - Matches reference */}
              <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold">Чат</h3>
                  <span className="text-gray-400 text-sm">{getSampleMessages().length} мессеж</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">1234</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMobileChatOpen(false)
                      setShowMobileInfo(true)
                    }}
                    className="text-gray-400 hover:text-white p-1 hover:bg-gray-700/50 transition-colors z-[45]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages - Matches reference styling */}
              <ScrollArea className="flex-1 px-4 py-2 max-h-[calc(100vh-280px)]">
                <div className="space-y-3">
                  {getSampleMessages().length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Чатад мессеж алга байна</p>
                    </div>
                  ) : (
                    getSampleMessages().map((msg) => (
                      <div key={msg.id} className="flex items-start space-x-3">
                        {/* Profile Image - Matches reference */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          {msg.profileImage ? (
                            <img
                              src={msg.profileImage || "/placeholder.svg"}
                              alt={msg.user}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"
                                }
                              }}
                            />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                          {msg.profileImage && <User className="w-4 h-4 text-white" style={{ display: "none" }} />}
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-semibold text-white">{msg.user}</span>
                            <span className="text-xs text-gray-500">{msg.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-300">{msg.message}</p>
                        </div>

                        {/* Delete Button for own messages */}
                        {msg.user === (userData?.username || username) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-auto opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={deletingMessageId === msg.id}
                          >
                            {deletingMessageId === msg.id ? (
                              <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Login Section - Seamlessly integrated without gap */}
              {!isLoggedIn && (
                <div className="px-4 py-4 bg-gray-900/95">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Чат бичихийн тулд нэвтэрнэ үү</p>
                  </div>
                </div>
              )}

              {/* Chat Input - Only visible when logged in */}
              {isLoggedIn && (
                <div className="px-4 py-4 bg-gray-900/95">
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Мессеж бичих..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      disabled={false}
                      autoComplete="off"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4"
                      disabled={!chatMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className={`flex flex-1 relative z-10 pt-20`}>
          {/* Main Content */}
          <div
            className={`flex-1 flex flex-col overflow-y-auto max-h-screen transition-all duration-300 ${!isChatCollapsed ? "pr-80" : "pr-20"}`}
          >
            {/* Video Player */}
            <div className="relative bg-black border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl aspect-video m-2">
              {/* Loading State */}
              {!twitchPlayerLoaded &&
                adminSettings.isStreamActive &&
                !adminSettings.isAdActive &&
                !adminSettings.streamLink && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin animate-reverse"></div>
                    </div>
                  </div>
                )}

              {/* Video Content */}
              {renderVideoContent()}
            </div>

            {/* Stream Info Section */}
            <div className="bg-black/40 backdrop-blur-xl mx-2 mb-2 p-6 rounded-2xl border border-cyan-500/20 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title with gradient and live indicator */}
                  <div className="flex items-center space-x-3 mb-3">
                    {/* Live indicator dot */}
                    {adminSettings.isStreamActive && !adminSettings.isAdActive && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                      {adminSettings.streamTitle}
                    </h1>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4 text-lg leading-relaxed">{adminSettings.streamDescription}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Chat Sidebar */}
          {!isChatCollapsed && (
            <div className="fixed top-20 right-0 w-80 bg-black/40 backdrop-blur-xl border-l border-cyan-500/20 flex flex-col h-[calc(100vh-5rem)] shadow-2xl z-40 transition-all duration-300">
              {/* Chat Header */}
              <div className="p-4 border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wide">Stream Chat</h3>
                  <div className="flex items-center space-x-2">
                    {/* Viewer count - Always show regardless of stream status */}
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 font-bold text-sm">{viewerCount.toLocaleString()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsChatCollapsed(true)}
                      className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                      title="Hide Chat"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 scrollbar-hide max-h-[calc(100vh-240px)]">
                <div className="space-y-4 max-h-full">
                  {getSampleMessages().length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-cyan-400" />
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Чатад тавтай морилно уу! 🎮</p>
                      <p className="text-gray-500 text-xs">Эхний мессежээ бичээрэй!</p>
                    </div>
                  ) : (
                    getSampleMessages().map((msg) => (
                      <div
                        key={msg.id}
                        className="group hover:bg-white/5 rounded-lg p-3 transition-all duration-300 relative cursor-pointer select-none"
                        onMouseDown={() => handleMouseDown(msg.id)}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={() => handleMouseDown(msg.id)}
                        onTouchEnd={handleMouseUp}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            {msg.profileImage ? (
                              <img
                                src={msg.profileImage || "/placeholder.svg"}
                                alt={msg.user}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to user icon if image fails to load
                                  e.currentTarget.style.display = "none"
                                  if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"
                                  }
                                }}
                              />
                            ) : (
                              <User className="w-3 h-3 text-white" />
                            )}
                            {msg.profileImage && <User className="w-3 h-3 text-white" style={{ display: "none" }} />}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: msg.color }}>
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-500">{msg.timestamp}</span>

                          {/* Delete Button - Show for own messages only */}
                          {msg.user === (userData?.username || username) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-auto ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMessage(msg.id)
                              }}
                              disabled={deletingMessageId === msg.id}
                              title="Мессеж устгах"
                            >
                              {deletingMessageId === msg.id ? (
                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-gray-200 ml-4">{msg.message}</div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input - Always show, but content depends on login status */}
              <div className="p-4 border-t border-cyan-500/20">
                {!isLoggedIn ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-3">Чат бичихийн тулд нэвтэрнэ үү</p>
                    <Button
                      onClick={onOpenLogin}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Нэвтрэх
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-3 mb-3">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Мессеж бичих..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="bg-gray-900/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 backdrop-blur-sm pr-12"
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 transform transition-all duration-300 hover:scale-105"
                        disabled={!chatMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{getSampleMessages().length} мессеж</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Collapsed Chat Indicator */}
          {isChatCollapsed && (
            <div className="fixed top-20 right-0 w-16 bg-black/40 backdrop-blur-xl border-l border-cyan-500/20 flex flex-col items-center justify-center h-[calc(100vh-5rem)] shadow-2xl z-40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatCollapsed(false)}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 transform hover:scale-110 mb-4"
                title="Show Chat"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <div className="text-xs text-gray-400 transform -rotate-90 whitespace-nowrap">Chat</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatCollapsed(false)}
                className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 mt-4"
                title="Expand Chat"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to hide delete button */}
      {longPressedMessage && <div className="fixed inset-0 z-5" onClick={() => setLongPressedMessage(null)} />}
    </div>
  )
}
