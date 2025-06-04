"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/lib/context/auth-context";

export default function LoginPage() {
  const auth = useAuth();
  const userLoggedIn = auth?.userLoggedIn;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        setLoading(true);
        setError("");
        // TODO: Implement login logic (API call)
        setTimeout(() => {
          setLoading(false);
          // Redirect or show success
        }, 1000);
      } catch (err: any) {
        setError(err.message || "Login failed");
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      doSignInWithGoogle().catch(err => {
        setIsSigningIn(false);
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">    
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
