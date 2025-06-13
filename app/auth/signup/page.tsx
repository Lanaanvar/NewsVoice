"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { doSignInWithGoogle } from "@/lib/auth";
import { getDeviceToken } from "@/lib/device-token";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

// Import VAPID key from environment variable
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

export default function SignupPage() {
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const userLoggedIn = auth?.userLoggedIn;
  const loading = auth?.loading;

  console.log("SignupPage render:", {
    userLoggedIn,
    loading,
    isSigningIn,
    isNewRegistration,
  });

  // Handle navigation based on auth state
  useEffect(() => {
    console.log("Navigation useEffect:", {
      userLoggedIn,
      loading,
      isSigningIn,
      isNewRegistration,
    });

    if (!loading && userLoggedIn) {
      if (isNewRegistration) {
        console.log(
          "New user registration detected - navigating to onboarding"
        );
        router.replace("/onboarding");
      } else if (!isSigningIn) {
        console.log("Existing user detected - navigating to homepage");
        router.replace("/");
      }
    }
  }, [userLoggedIn, loading, isSigningIn, isNewRegistration, router]);

  const onGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSigningIn) return;

    setIsSigningIn(true);
    setError("");

    try {
      console.log("🚀 Starting Google sign-in...");
      const { user, idToken } = await doSignInWithGoogle();
      console.log("Google sign-in returned:", { user, idToken });
      // Get device token for push notifications
      const deviceToken = await getDeviceToken(VAPID_KEY);
      console.log("Device token:", deviceToken);

      // Register device token with backend
      if (deviceToken) {
        try {
          console.log("Registering device token with backend...");
          const notifRes = await fetch(
            "http://localhost:8000/user/notification/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ device_token: deviceToken }),
            }
          );
          const notifData = await notifRes.json().catch(() => ({}));
          console.log("Notification API response status:", notifRes.status);
          console.log("Notification API response body:", notifData);
          if (!notifRes.ok) {
            console.error("Notification registration failed:", notifData);
            throw new Error(
              notifData.message ||
                `Notification registration failed (status ${notifRes.status})`
            );
          }
          console.log("Device token registered successfully.");
        } catch (notifErr) {
          console.error("Device token registration failed:", notifErr);
        }
      } else {
        console.warn("No device token obtained, skipping device registration.");
      }

      console.log("Google ID Token being sent:", idToken);
      console.log(
        "Google ID Token (first 100 chars):",
        idToken?.substring(0, 100)
      );

      // Prepare payload
      const payload = {
        display_name: user.displayName,
        email: user.email,
        country: "India", // replace or get dynamically
        preferred_time: "08:30", // or get from UI
        // photo_url: user.photoURL,
        // device_token: "optional-device-token", // you can handle this later
      };

      console.log("Sending registration payload to backend:", payload);
      // Call your backend
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = {
          message: "Failed to parse backend response",
          raw: await response.text(),
        };
        console.error("Failed to parse backend response as JSON:", data);
      }

      console.log("Backend response status:", response.status);
      console.log("Backend response body:", data);

      console.log("ID Token:", await user.getIdToken());
      // console.log("Access Token:", user.accessToken()); // or from _tokenResponse.oauthAccessToken

      if (!response.ok) {
        console.error("Registration failed with backend:", data);
        throw new Error(
          data.message || `Registration failed (status ${response.status})`
        );
      }

      console.log("User registered successfully:", data);
      console.log("Marking as new registration...");

      setIsNewRegistration(true); // Mark this as a new registration
      setIsSigningIn(false); // Reset signing in state

      // Note: The useEffect will handle navigation to onboarding
    } catch (err: any) {
      console.error("Google sign-in or registration failed:", err);
      setError(err.message || "Google sign-up failed");
      setIsSigningIn(false);
    }

    // try {
    //   console.log("Starting Google sign-in...");
    //   const result = await doSignInWithGoogle();
    //   console.log("Google sign-in success:", result);

    //   // The auth context should update automatically
    //   // But add a backup redirect just in case
    //   setTimeout(() => {
    //     console.log("Backup check - userLoggedIn:", userLoggedIn);
    //     if (!userLoggedIn) {
    //       console.log("Backup redirect triggered");
    //       router.push("/");
    //     }
    //     setIsSigningIn(false);
    //   }, 3000);

    // } catch (err: any) {
    //   console.error("Google sign-in failed:", err);
    //   setError(err.message || "Google sign-up failed");
    //   setIsSigningIn(false);
    // }
  };

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show signup form if user is already logged in
  if (userLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <p>Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md shadow rounded-xl border">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded text-center">
              {error}
            </div>
          )}

          <Button
            onClick={onGoogleSignIn}
            className="w-full mb-6 flex items-center justify-center gap-2"
            disabled={isSigningIn}
            variant="outline"
          >
            {/* Google icon */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <g>
                <path
                  d="M44.5 20H24v8.5h11.7C34.7 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.3-4z"
                  fill="#FFC107"
                />
                <path
                  d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"
                  fill="#FF3D00"
                />
                <path
                  d="M24 45c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.9 36.9 27.1 38 24 38c-6.1 0-10.7-3.1-13.3-7.7l-7 5.4C6.6 40.9 14.4 45 24 45z"
                  fill="#4CAF50"
                />
                <path
                  d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2.1l-7 5.4C18.1 41.9 20.9 43 24 43c6.1 0 11.2-4.1 13.1-9.5 1.1-2.7 1.7-5.6 1.7-8.5 0-1.3-.1-2.7-.3-4z"
                  fill="#1976D2"
                />
              </g>
            </svg>
            {isSigningIn ? "Signing up..." : "Sign up with Google"}
          </Button>

          {/* Divider with icon */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-3 flex items-center justify-center">
              {/* Minimal user icon */}
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Button
              variant="link"
              className="underline p-0 h-auto min-h-0"
              onClick={() => router.push("/auth/login")}
              disabled={isSigningIn}
            >
              Log in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
