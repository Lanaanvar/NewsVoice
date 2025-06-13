"use client";

import { useEffect, useState } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SamplePage() {
  const [token, setToken] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user);
          setToken(token);
        } catch (err) {
          console.error("Error getting token:", err);
          setError("Failed to get authentication token");
        }
      } else {
        setToken(null);
        setProfileData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/user/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {token ? (
          <div>
            <p className="text-green-600 mb-2">✓ User authenticated</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-4">
              <p className="text-sm font-mono break-all">
                {token}
                {/* {token.substring(0, 20)}...{token.substring(token.length - 20)} */}
              </p>
            </div>
            <Button 
              onClick={fetchUserProfile} 
              disabled={loading}
            >
              {loading ? "Loading..." : "Fetch User Profile"}
            </Button>
          </div>
        ) : (
          <p className="text-red-600">✗ User not authenticated</p>
        )}
      </Card>

      {error && (
        <Card className="p-6 mb-6 border-red-500">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p>{error}</p>
        </Card>
      )}

      {profileData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Profile Data</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}