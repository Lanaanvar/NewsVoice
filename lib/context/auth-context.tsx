"use client";
import React, { useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextProps {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean; // Add loading to the interface
}

const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener...");
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return () => {
      console.log("Cleaning up auth state listener...");
      unsubscribe();
    };
  }, []);

  const initializeUser = async (user: User | null) => {
    console.log("Auth state changed - initializeUser called with:", user);
    console.log("User UID:", user?.uid);
    console.log("User email:", user?.email);
    
    if (user) {
      setCurrentUser(user);
      setUserLoggedIn(true);

      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      const isGoogle = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );
      setIsGoogleUser(isGoogle);
      
      console.log("User state updated - userLoggedIn: true, isGoogle:", isGoogle);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
      setIsEmailUser(false);
      setIsGoogleUser(false);
      
      console.log("User state updated - userLoggedIn: false");
    }

    setLoading(false);
    console.log("Loading set to false");
  };

  const value: AuthContextProps = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    setCurrentUser,
    loading, // Include loading in the value
  };

  return (
    <AuthContext.Provider value={value}>
      {children} {/* Always render children, let individual components handle loading */}
    </AuthContext.Provider>
  );
}