"use client"

import { useState, useEffect } from "react"
import { firebaseHelpers, DB_PATHS } from "../lib/firebase"

interface AdminSettings {
  streamTitle: string
  streamDescription: string
  streamLink: string
  isStreamActive: boolean
  isAdActive: boolean
  adLink: string
  adTitle: string
  adDescription: string
  adWebsiteLink: string
  siteName: string
  logoUrl: string
  // New fields for stream info
  gameTitle: string
  category: string
  nextMatch: string
  sponsors: string
}

interface ChatMessage {
  id: number
  user: string
  message: string
  timestamp: string
  color: string
  profileImage?: string
}

interface UserData {
  username: string
  email: string
  role: "admin" | "user"
}

export function useFirebaseAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    streamTitle: "",
    streamDescription:
      "",
    streamLink: "",
    isStreamActive: true,
    isAdActive: false,
    adLink: "",
    adTitle: "",
    adDescription: "",
    adWebsiteLink: "",
    siteName: "",
    logoUrl: "",
    // Default values for new fields
    gameTitle: "",
    category: "",
    nextMatch: "",
    sponsors: "",
  })
  const [loading, setLoading] = useState(true)

  // Load settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      const result = await firebaseHelpers.getData(DB_PATHS.ADMIN_SETTINGS)
      if (result.success && result.data) {
        // Ensure all fields have default values to prevent undefined
        const loadedSettings = {
          streamTitle: result.data.streamTitle || "",
          streamDescription:
            result.data.streamDescription ||
            "",
          streamLink: result.data.streamLink || "",
          isStreamActive: result.data.isStreamActive !== undefined ? result.data.isStreamActive : true,
          isAdActive: result.data.isAdActive !== undefined ? result.data.isAdActive : false,
          adLink: result.data.adLink || "",
          adTitle: result.data.adTitle || "",
          adDescription: result.data.adDescription || "",
          adWebsiteLink: result.data.adWebsiteLink || "",
          siteName: result.data.siteName || "",
          logoUrl: result.data.logoUrl || "",
          gameTitle: result.data.gameTitle || "",
          category: result.data.category || "",
          nextMatch: result.data.nextMatch || "",
          sponsors: result.data.sponsors || "",
        }
        setSettings(loadedSettings)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  // Save settings to Firebase
  const saveSettings = async (newSettings: AdminSettings) => {
    setSettings(newSettings)
    const result = await firebaseHelpers.saveData(DB_PATHS.ADMIN_SETTINGS, newSettings)
    if (result.success) {
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent("adminSettingsChanged", { detail: newSettings }))
    }
    return result
  }

  // Listen to real-time changes
  useEffect(() => {
    const dataRef = firebaseHelpers.listenToData(DB_PATHS.ADMIN_SETTINGS, (data) => {
      if (data) {
        // Ensure all fields have default values to prevent undefined
        const updatedSettings = {
          streamTitle: data.streamTitle || "",
          streamDescription:
            data.streamDescription ||
            "",
          streamLink: data.streamLink || "",
          isStreamActive: data.isStreamActive !== undefined ? data.isStreamActive : true,
          isAdActive: data.isAdActive !== undefined ? data.isAdActive : false,
          adLink: data.adLink || "",
          adTitle: data.adTitle || "",
          adDescription: data.adDescription || "",
          adWebsiteLink: data.adWebsiteLink || "",
          siteName: data.siteName || "ES.mn",
          logoUrl: data.logoUrl || "",
          gameTitle: data.gameTitle || "",
          category: data.category || "",
          nextMatch: data.nextMatch || "",
          sponsors: data.sponsors || "",
        }
        setSettings(updatedSettings)
      }
    })

    return () => {
      firebaseHelpers.stopListening(dataRef)
    }
  }, [])

  return { settings, saveSettings, loading }
}

export function useFirebaseChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  // Load messages from Firebase on mount
  useEffect(() => {
    const loadMessages = async () => {
      const result = await firebaseHelpers.getData(DB_PATHS.CHAT_MESSAGES)
      if (result.success && result.data) {
        // Convert object to array and sort by timestamp
        const messagesArray = Object.values(result.data) as ChatMessage[]
        setMessages(messagesArray.sort((a, b) => a.id - b.id))
      }
      setLoading(false)
    }
    loadMessages()
  }, [])

  // Listen to real-time changes
  useEffect(() => {
    console.log("Setting up Firebase listener for chat messages")
    const dataRef = firebaseHelpers.listenToData(DB_PATHS.CHAT_MESSAGES, (data) => {
      console.log("Received chat data from Firebase:", data)
      if (data) {
        const messagesArray = Object.values(data) as ChatMessage[]
        const sortedMessages = messagesArray.sort((a, b) => a.id - b.id)
        console.log("Sorted messages:", sortedMessages)
        setMessages(sortedMessages)
      } else {
        // If data is null, set messages to empty array
        console.log("No chat data found, setting empty array")
        setMessages([])
      }
    })

    return () => {
      console.log("Removing Firebase listener")
      firebaseHelpers.stopListening(dataRef)
    }
  }, [])

  // Add new message
  const addMessage = async (message: ChatMessage) => {
    console.log("Adding message to Firebase with profile image:", message)
    try {
      // First, check if the messages collection exists
      const messagesRef = await firebaseHelpers.getData(DB_PATHS.CHAT_MESSAGES)

      // If it doesn't exist, initialize it as an empty object
      if (!messagesRef.success || !messagesRef.data) {
        await firebaseHelpers.saveData(DB_PATHS.CHAT_MESSAGES, {})
      }

      // Ensure the message includes profile image data
      const messageWithImage = {
        ...message,
        profileImage: message.profileImage || "",
      }

      // Now save the message with its ID as the key
      const result = await firebaseHelpers.saveData(`${DB_PATHS.CHAT_MESSAGES}/${message.id}`, messageWithImage)
      console.log("Firebase save result with profile image:", result)
      return result
    } catch (error) {
      console.error("Error adding message:", error)
      return { success: false, error }
    }
  }

  // Clear all messages
  const clearMessages = async () => {
    const result = await firebaseHelpers.saveData(DB_PATHS.CHAT_MESSAGES, {})
    if (result.success) {
      setMessages([])
    }
    return result
  }

  return { messages, addMessage, clearMessages, loading }
}

export function useFirebaseUserData() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load user data from Firebase on mount
  useEffect(() => {
    const loadUserData = async () => {
      // First check localStorage for current session
      const localUserData = localStorage.getItem("eslcs-user-data")
      if (localUserData) {
        try {
          const parsedUserData = JSON.parse(localUserData)
          setUserData(parsedUserData)
          setIsLoggedIn(true)
        } catch (error) {
          console.error("Error loading local user data:", error)
        }
      }
      setLoading(false)
    }
    loadUserData()
  }, [])

  // Save user data
  const saveUserData = async (newUserData: UserData) => {
    setUserData(newUserData)
    setIsLoggedIn(true)
    localStorage.setItem("eslcs-user-data", JSON.stringify(newUserData))

    // Also save to Firebase for persistence
    const sanitizedEmail = newUserData.email.replace(/[.#$[\]@]/g, "_")
    const result = await firebaseHelpers.saveData(`${DB_PATHS.USER_DATA}/${sanitizedEmail}`, {
      ...newUserData,
      lastLogin: Date.now(),
    })
    return result
  }

  // Logout user
  const logout = () => {
    setUserData(null)
    setIsLoggedIn(false)
    localStorage.removeItem("eslcs-user-data")
  }

  return { userData, isLoggedIn, saveUserData, logout, loading }
}

export function useFirebaseImages() {
  const [loading, setLoading] = useState(false)

  // Save image to Firebase as base64
  const saveImage = async (
    imageName: string,
    file: File,
  ): Promise<{ success: boolean; data?: string; error?: any }> => {
    setLoading(true)
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Save to Firebase
      const result = await firebaseHelpers.saveImage(imageName, base64)
      setLoading(false)

      if (result.success) {
        return { success: true, data: base64 }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      setLoading(false)
      return { success: false, error }
    }
  }

  // Get image from Firebase
  const getImage = async (imageName: string) => {
    setLoading(true)
    const result = await firebaseHelpers.getImage(imageName)
    setLoading(false)
    return result
  }

  return { saveImage, getImage, loading }
}

// Add a new function to save user profile data to Firebase
export function useFirebaseUserProfile() {
  const [loading, setLoading] = useState(false)

  // Save user profile data to Firebase
  const saveUserProfile = async (userData: UserData, profileData: { username: string; profileImage?: string }) => {
    setLoading(true)
    try {
      const userKey = userData.email.replace(/[.#$[\]@]/g, "_") // Firebase doesn't allow certain characters in keys

      const updatedUserData = {
        ...userData,
        username: profileData.username,
        profileImage: profileData.profileImage || "",
        lastUpdated: Date.now(),
      }

      // Save to Firebase
      const result = await firebaseHelpers.saveData(`${DB_PATHS.USER_DATA}/${userKey}`, updatedUserData)

      // Also update localStorage
      localStorage.setItem("eslcs-user-data", JSON.stringify(updatedUserData))

      setLoading(false)
      return { success: result.success, data: updatedUserData }
    } catch (error) {
      setLoading(false)
      return { success: false, error }
    }
  }

  // Load user profile from Firebase
  const loadUserProfile = async (email: string) => {
    setLoading(true)
    try {
      const userKey = email.replace(/[.#$[\]@]/g, "_")
      const result = await firebaseHelpers.getData(`${DB_PATHS.USER_DATA}/${userKey}`)
      setLoading(false)
      return result
    } catch (error) {
      setLoading(false)
      return { success: false, error }
    }
  }

  return { saveUserProfile, loadUserProfile, loading }
}
