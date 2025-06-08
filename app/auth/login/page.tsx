"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { doSignInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const auth = useAuth();
  const userLoggedIn = auth?.userLoggedIn;
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (userLoggedIn) {
    router.replace("/");
    return null;
  }

  const onGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      doSignInWithGoogle().catch((err) => {
        setError(err.message || "Google sign-in failed");
        setIsSigningIn(false);
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <Button
            onClick={onGoogleSignIn}
            className="w-full"
            disabled={isSigningIn}
          >
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
