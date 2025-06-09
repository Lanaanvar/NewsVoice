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
  const router = useRouter();
  const auth = useAuth();

  const userLoggedIn = auth?.userLoggedIn;
  const loading = auth?.loading;

  console.log("SignupPage render:", { userLoggedIn, loading, isSigningIn });

  // Redirect when user is logged in and not currently signing in
  useEffect(() => {
    console.log("Redirect useEffect:", { userLoggedIn, loading, isSigningIn });

    if (userLoggedIn && !loading) {
      console.log(
        "User is logged in and not loading - redirecting to homepage"
      );
      router.push("/");
    }
  }, [userLoggedIn, loading, router]);

  const onGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSigningIn) return;

    setIsSigningIn(true);
    setError("");

    try {
      console.log("🚀 Starting Google sign-in...");
      const { user, idToken } = await doSignInWithGoogle();
      // Get device token for push notifications
      const deviceToken = await getDeviceToken(VAPID_KEY);
      console.log("Device token:", deviceToken);

      // Register device token with backend
      if (deviceToken) {
        try {
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
            throw new Error(
              notifData.message ||
                `Notification registration failed (status ${notifRes.status})`
            );
          }
        } catch (notifErr) {
          console.error("Device token registration failed:", notifErr);
        }
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
      }

      console.log("Backend response status:", response.status);
      console.log("Backend response body:", data);

      console.log("ID Token:", await user.getIdToken());
      // console.log("Access Token:", user.accessToken()); // or from _tokenResponse.oauthAccessToken

      if (!response.ok)
        throw new Error(
          data.message || `Registration failed (status ${response.status})`
        );

      console.log("User registered successfully:", data);

      // Redirect to onboarding after successful registration
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
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
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={onGoogleSignIn}
            className="w-full mb-4"
            disabled={isSigningIn}
            variant="outline"
          >
            {isSigningIn ? "Signing up..." : "Sign up with Google"}
          </Button>

          <div className="mt-4 text-center text-sm">
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
