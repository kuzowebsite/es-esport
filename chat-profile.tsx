"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, Crown } from "lucide-react"

interface UserData {
  username: string
  email: string
}

interface ChatProfileProps {
  userData: UserData | null
  isLoggedIn: boolean
  onLogout: () => void
}

export default function ChatProfile({ userData, isLoggedIn, onLogout }: ChatProfileProps) {
  if (!isLoggedIn || !userData) {
    return null
  }

  return (
    <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
      {/* Top Profile Badge */}
      <div className="flex justify-center mb-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
          <User className="w-4 h-4" />
          <span className="font-medium text-sm">{userData.email}</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{userData.username}</span>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                </Badge>
              </div>
              <p className="text-gray-400 text-xs">{userData.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
            onClick={onLogout}
            title="Гарах"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-xs">{userData.email}</span>
            <Badge className="bg-green-500 text-white text-xs px-2 py-1">Нэвтэрсэн</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
            title="Тохиргоо"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
