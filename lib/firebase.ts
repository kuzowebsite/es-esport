import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, get, onValue, off } from "firebase/database"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCilUAmZfCS5vohZ99kHPdOS0Yata8ignk",
  authDomain: "livestream-b0827.firebaseapp.com",
  databaseURL: "https://livestream-b0827-default-rtdb.firebaseio.com",
  projectId: "livestream-b0827",
  storageBucket: "livestream-b0827.firebasestorage.app",
  messagingSenderId: "439858370048",
  appId: "1:439858370048:web:007a8ab5026efd1dbdaae5",
  measurementId: "G-77W6LKEKNS",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const auth = getAuth(app)

// Auth providers
export const googleProvider = new GoogleAuthProvider()
export const facebookProvider = new FacebookAuthProvider()

// Database paths
export const DB_PATHS = {
  ADMIN_SETTINGS: "adminSettings",
  CHAT_MESSAGES: "chatMessages",
  USER_DATA: "userData",
  SITE_IMAGES: "siteImages",
}

// Firebase helper functions
export const firebaseHelpers = {
  // Save data to Firebase
  async saveData(path: string, data: any) {
    console.log(`Firebase saveData: Saving to path ${path}`, data)
    try {
      await set(ref(database, path), data)
      console.log(`Firebase saveData: Successfully saved to ${path}`)
      return { success: true }
    } catch (error) {
      console.error(`Firebase saveData: Error saving to ${path}:`, error)
      return { success: false, error }
    }
  },

  // Get data from Firebase
  async getData(path: string) {
    try {
      const snapshot = await get(ref(database, path))
      return { success: true, data: snapshot.val() }
    } catch (error) {
      console.error("Firebase get error:", error)
      return { success: false, error }
    }
  },

  // Listen to data changes
  listenToData(path: string, callback: (data: any) => void) {
    console.log(`Firebase listenToData: Setting up listener for ${path}`)
    const dataRef = ref(database, path)
    onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val()
        console.log(`Firebase listenToData: Received data from ${path}:`, data)
        callback(data)
      },
      (error) => {
        console.error(`Firebase listenToData: Error listening to ${path}:`, error)
      },
    )
    return dataRef
  },

  // Stop listening to data changes
  stopListening(dataRef: any) {
    off(dataRef)
  },

  // Save image as base64 to Firebase
  async saveImage(imageName: string, base64Data: string) {
    try {
      await set(ref(database, `${DB_PATHS.SITE_IMAGES}/${imageName}`), {
        data: base64Data,
        timestamp: Date.now(),
        type: "base64",
      })
      return { success: true }
    } catch (error) {
      console.error("Firebase image save error:", error)
      return { success: false, error }
    }
  },

  // Get image from Firebase
  async getImage(imageName: string) {
    try {
      const snapshot = await get(ref(database, `${DB_PATHS.SITE_IMAGES}/${imageName}`))
      const imageData = snapshot.val()
      return { success: true, data: imageData?.data || null }
    } catch (error) {
      console.error("Firebase image get error:", error)
      return { success: false, error }
    }
  },
}

// Firebase Auth helper functions
export const authHelpers = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error: any) {
      console.error("Firebase sign in error:", error)
      return { success: false, error: error.message }
    }
  },

  // Create user with email and password
  async createUserWithEmail(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
      })

      return { success: true, user: userCredential.user }
    } catch (error: any) {
      console.error("Firebase create user error:", error)
      return { success: false, error: error.message }
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return { success: true, user: result.user }
    } catch (error: any) {
      console.error("Firebase Google sign in error:", error)
      return { success: false, error: error.message }
    }
  },

  // Sign in with Facebook
  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      return { success: true, user: result.user }
    } catch (error: any) {
      console.error("Firebase Facebook sign in error:", error)
      return { success: false, error: error.message }
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error: any) {
      console.error("Firebase sign out error:", error)
      return { success: false, error: error.message }
    }
  },

  // Send password reset email
  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error("Firebase password reset error:", error)
      return { success: false, error: error.message }
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser
  },

  // Save user data to Firebase Realtime Database - Enhanced for profile images
  async saveUserData(user: User, additionalData: any = {}) {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || additionalData.username || user.email?.split("@")[0] || "User",
        role: additionalData.role || "user",
        profileImage: additionalData.profileImage || user.photoURL || "",
        createdAt: additionalData.createdAt || Date.now(),
        lastLogin: Date.now(),
        lastUpdated: Date.now(),
        ...additionalData,
      }

      // Save to Firebase Realtime Database
      await set(ref(database, `${DB_PATHS.USER_DATA}/${user.uid}`), userData)
      console.log("User data saved to Firebase Realtime Database:", userData)

      return { success: true, userData }
    } catch (error) {
      console.error("Error saving user data to Firebase Realtime Database:", error)
      return { success: false, error }
    }
  },

  // Get user data from database
  async getUserData(uid: string) {
    try {
      const snapshot = await get(ref(database, `${DB_PATHS.USER_DATA}/${uid}`))
      return { success: true, data: snapshot.val() }
    } catch (error) {
      console.error("Error getting user data:", error)
      return { success: false, error }
    }
  },
}
