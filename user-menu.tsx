"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings, Shield } from "lucide-react"

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
}

interface UserMenuProps {
  userData: UserData
  onLogout: () => void
  onOpenAdmin?: () => void
}

export default function UserMenu({ userData, onLogout, onOpenAdmin }: UserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${
          userData.role === "admin"
            ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        } text-white font-semibold px-4 transform transition-all duration-300 hover:scale-105`}
      >
        {userData.role === "admin" ? <Shield className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
        {userData.username}
      </Button>

      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-2xl z-50">
            {/* User Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 ${
                    userData.role === "admin"
                      ? "bg-gradient-to-r from-orange-500 to-red-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-600"
                  } rounded-full flex items-center justify-center`}
                >
                  {userData.role === "admin" ? (
                    <Shield className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-bold">{userData.username}</h3>
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
                          <User className="w-3 h-3 mr-1" />
                          ХЭРЭГЛЭГЧ
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {userData.role === "admin" && onOpenAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 mb-1"
                  onClick={() => {
                    onOpenAdmin()
                    setIsMenuOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Админ удирдлага
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 mb-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Тохиргоо
              </Button>

              <div className="border-t border-gray-700 my-2"></div>

              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  onLogout()
                  setIsMenuOpen(false)
                }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Гарах
              </Button>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700 bg-gray-900/50">
              <p className="text-gray-500 text-xs text-center">
                {userData.role === "admin" ? "Админ эрхтэй" : "Хэрэглэгч эрхтэй"} •{" "}
                {new Date().toLocaleDateString("mn-MN")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
