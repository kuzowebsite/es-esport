"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { authHelpers } from "../lib/firebase"

interface UserData {
  uid: string
  username: string
  email: string
  role: "admin" | "user"
  profileImage?: string
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChanged(async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser)

      if (firebaseUser) {
        setUser(firebaseUser)
        setIsLoggedIn(true)

        // Get additional user data from database including profile image
        const result = await authHelpers.getUserData(firebaseUser.uid)
        if (result.success && result.data) {
          console.log("Loaded user data with profile image:", result.data)
          setUserData(result.data)
        } else {
          // Create user data if it doesn't exist
          const saveResult = await authHelpers.saveUserData(firebaseUser)
          if (saveResult.success) {
            setUserData(saveResult.userData)
          }
        }
      } else {
        setUser(null)
        setUserData(null)
        setIsLoggedIn(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true)
    const result = await authHelpers.signInWithEmail(email, password)
    setLoading(false)
    return result
  }

  // Create user with email and password
  const createUserWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true)
    const result = await authHelpers.createUserWithEmail(email, password, displayName)

    if (result.success && result.user) {
      // Save additional user data
      await authHelpers.saveUserData(result.user, { role: "user" })
    }

    setLoading(false)
    return result
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true)
    const result = await authHelpers.signInWithGoogle()

    if (result.success && result.user) {
      // Save additional user data
      await authHelpers.saveUserData(result.user, { role: "user" })
    }

    setLoading(false)
    return result
  }

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    setLoading(true)
    const result = await authHelpers.signInWithFacebook()

    if (result.success && result.user) {
      // Save additional user data
      await authHelpers.saveUserData(result.user, { role: "user" })
    }

    setLoading(false)
    return result
  }

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    return await authHelpers.sendPasswordReset(email)
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    const result = await authHelpers.signOut()
    setLoading(false)
    return result
  }

  // Update user profile - Enhanced to save to Firebase Realtime Database
  const updateUserProfile = async (updates: Partial<UserData>) => {
    if (!user || !userData) return { success: false, error: "No user logged in" }

    try {
      const updatedUserData = {
        ...userData,
        ...updates,
        lastUpdated: Date.now(),
      }

      // Save to Firebase Realtime Database
      const result = await authHelpers.saveUserData(user, updatedUserData)

      if (result.success) {
        setUserData(updatedUserData)
        console.log("Profile updated and saved to Firebase Realtime Database:", updatedUserData)
      }

      return result
    } catch (error) {
      console.error("Error updating user profile:", error)
      return { success: false, error }
    }
  }

  // Add a function to refresh user profile data
  const refreshUserProfile = async () => {
    if (!user) return { success: false, error: "No user logged in" }

    try {
      const result = await authHelpers.getUserData(user.uid)
      if (result.success && result.data) {
        setUserData(result.data)
        console.log("Refreshed user profile with latest data:", result.data)
        return { success: true, data: result.data }
      }
      return result
    } catch (error) {
      console.error("Error refreshing user profile:", error)
      return { success: false, error }
    }
  }

  return {
    user,
    userData,
    isLoggedIn,
    loading,
    signInWithEmail,
    createUserWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    sendPasswordReset,
    signOut,
    updateUserProfile,
    refreshUserProfile,
  }
}
