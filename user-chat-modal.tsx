"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Trash2, X } from "lucide-react"
import { useFirebaseChatMessages } from "./hooks/useFirebase"
import { firebaseHelpers, DB_PATHS } from "./lib/firebase"

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
}

interface ChatMessage {
  id: number
  user: string
  message: string
  timestamp: string
  color: string
}

interface UserChatModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
}

export default function UserChatModal({ isOpen, onClose, userData }: UserChatModalProps) {
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null)
  const { messages: allMessages, loading } = useFirebaseChatMessages()

  // Get user's own messages
  const userMessages = allMessages.filter((msg) => msg.user === userData?.username)

  const handleDeleteMessage = async (messageId: number) => {
    if (deletingMessageId) return // Prevent multiple deletions

    setDeletingMessageId(messageId)

    try {
      // Check if this message belongs to the current user
      const messageToDelete = userMessages.find((msg) => msg.id === messageId)

      if (messageToDelete && messageToDelete.user === userData?.username) {
        // Delete from Firebase by removing the specific message
        const result = await firebaseHelpers.saveData(`${DB_PATHS.CHAT_MESSAGES}/${messageId}`, null)

        if (result.success) {
          console.log("Message deleted successfully from Firebase")
        } else {
          console.error("Failed to delete message from Firebase")
          alert("Мессеж устгахад алдаа гарлаа. Дахин оролдоно уу.")
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Мессеж устгахад алдаа гарлаа. Дахин оролдоно уу.")
    }

    setDeletingMessageId(null)
  }

  if (!isOpen || !userData) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 shadow-2xl max-w-2xl w-full max-h-[90vh]">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Миний чат мессежүүд
            </h2>
            <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Нийт {userMessages.length} мессеж</p>
            <p className="text-gray-500 text-xs mt-1">Хогийн савны icon дээр дарж мессеж устгах</p>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400">Мессежүүд ачааллаж байна...</p>
                </div>
              ) : userMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Та одоогоор мессеж бичээгүй байна</p>
                  <p className="text-gray-500 text-sm">Чатад орж эхний мессежээ бичээрэй!</p>
                </div>
              ) : (
                userMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="group hover:bg-white/5 rounded-lg p-4 transition-all duration-300 border border-purple-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: msg.color }}></div>
                        <span className="text-sm font-semibold" style={{ color: msg.color }}>
                          {msg.user}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        {/* Delete Button - Always visible */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 h-auto rounded-full opacity-70 hover:opacity-100 transition-all duration-200"
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
                      </div>
                    </div>
                    <div className="text-gray-200 ml-5">{msg.message}</div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Firebase Status */}
          <div className="mt-4 p-3 bg-gray-900/30 rounded-lg border border-purple-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-400 text-sm font-medium">Өгөгдөл холбогдсон</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">Мессеж устгах үйлдэл шууд хадгалагдана</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
