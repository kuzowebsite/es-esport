"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, MessageCircle, ChevronDown } from "lucide-react"

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
  profileImage?: string
}

interface UserProfileDropdownProps {
  userData: UserData
  onLogout: () => void
  onOpenProfile: () => void
  onOpenChat: () => void
  onGoToAdmin?: () => void
  profileImage?: string
}

export default function UserProfileDropdown({
  userData,
  onLogout,
  onOpenProfile,
  onOpenChat,
  onGoToAdmin,
  profileImage,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [headerHeight, setHeaderHeight] = useState(0)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Ensure component is mounted (for SSR)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position and header height when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const header = document.querySelector("header")
      const headerRect = header?.getBoundingClientRect()

      setDropdownPosition({
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right,
      })

      setHeaderHeight(headerRect ? headerRect.bottom : 80)
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  const menuItems = [
    {
      icon: User,
      label: "Профайл",
      onClick: () => {
        onOpenProfile()
        setIsOpen(false)
      },
    },
    {
      icon: MessageCircle,
      label: "Чат",
      onClick: () => {
        onOpenChat()
        setIsOpen(false)
      },
    },
    {
      icon: Settings,
      label: "Тохиргоо",
      onClick: () => {
        console.log("Тохиргоо clicked")
        setIsOpen(false)
      },
    },
  ]

  const dropdownContent =
    isOpen && mounted ? (
      <>
        {/* Backdrop Overlay - Exclude header area */}
        <div
          className="fixed inset-0 z-[999998]"
          onClick={() => setIsOpen(false)}
          style={{
            background: `linear-gradient(to bottom, transparent 0px, transparent ${headerHeight}px, rgba(0, 0, 0, 0.2) ${headerHeight}px)`,
            backdropFilter: `blur(0px) 0px ${headerHeight}px, blur(4px) ${headerHeight}px 100%`,
          }}
        />

        {/* Dropdown Menu */}
        <div
          ref={dropdownRef}
          className="fixed w-64 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl z-[999999] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
          }}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                {profileImage || userData.profileImage ? (
                  <img
                    src={profileImage || userData.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to user icon if image fails to load
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling.style.display = "flex"
                    }}
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
                {(profileImage || userData.profileImage) && (
                  <User className="w-5 h-5 text-white" style={{ display: "none" }} />
                )}
              </div>
              <div>
                <div className="text-white font-medium">{userData.username}</div>
                <div className="text-gray-400 text-sm">{userData.email}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}

            {/* Divider */}
            <div className="border-t border-gray-700 my-2"></div>

            {/* Logout */}
            <button
              onClick={() => {
                onLogout()
                setIsOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </div>
      </>
    ) : null

  return (
    <>
      {/* Profile Button */}
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-transparent hover:bg-gray-800/50 text-white border-none p-2 h-auto"
      >
        <div className="flex items-center space-x-2">
          {/* Profile Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
            {profileImage || userData.profileImage ? (
              <img
                src={profileImage || userData.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to user icon if image fails to load
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling.style.display = "flex"
                }}
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
            {(profileImage || userData.profileImage) && (
              <User className="w-4 h-4 text-white" style={{ display: "none" }} />
            )}
          </div>
          {/* Username */}
          <span className="text-sm font-medium hidden sm:block">{userData.username}</span>
          {/* Dropdown Arrow */}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </Button>

      {/* Portal Dropdown */}
      {mounted && typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  )
}
