"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Toast } from "@/components/ui/toast";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";

const COUNTRIES = ["India", "USA", "Canada", "UK", "Australia"];
const TIME_OPTIONS = [
  { label: "8:00 AM", value: "08:00" },
  { label: "8:00 PM", value: "20:00" },
];

function TimeInput({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  [key: string]: any;
}) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      step="60"
      {...props}
    />
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_OPTIONS[0].value);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  // Step 1 validation
  const canProceed = username && country && preferredTime;

  // Step 2 validation
  const canSave = selectedCategories.length > 0 && preferredTime;

  // Animated transitions
  const transitionClass = "transition-all duration-500 ease-in-out";

  // API helpers
  async function updateProfile() {
    console.log("[Onboarding] updateProfile called", {
      username,
      country,
      preferredTime,
    });
    try {
      if (!currentUser) throw new Error("No authenticated user");
      const idToken = await currentUser.getIdToken();
      const res = await fetch("http://localhost:8000/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          display_name: username,
          country,
          preferred_time: preferredTime,
        }),
      });
      console.log("[Onboarding] updateProfile response status:", res.status);
      const data = await res.text();
      console.log("[Onboarding] updateProfile response body:", data);
      if (!res.ok)
        throw new Error(`Profile update failed: ${res.status} ${data}`);
    } catch (err) {
      console.error("[Onboarding] updateProfile error:", err);
      throw err;
    }
  }
  async function savePreferences() {
    if (!currentUser) throw new Error("No authenticated user");
    const idToken = await currentUser.getIdToken();
    console.log("[Onboarding] savePreferences called", {
      selectedCategories,
      //   preferredTime,
      idToken: idToken?.substring(0, 12) + "...",
    });
    await fetch("http://localhost:8000/user/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        preferences: selectedCategories,
        // preferred_time: preferredTime,
      }),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log(
          "[Onboarding] savePreferences response status:",
          res.status
        );
        console.log("[Onboarding] savePreferences response body:", text);
      })
      .catch((err) => {
        console.error("[Onboarding] savePreferences fetch error:", err);
        throw err;
      });
  }

  // Fetch categories from API on step 2 mount
  useEffect(() => {
    if (step === 2 && categories.length === 0 && currentUser) {
      currentUser.getIdToken().then((idToken) => {
        fetch("http://localhost:8000/user/categories", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
          .then((res) => res.json())
          .then((data) => setCategories(data))
          .catch((err) => {
            console.error("Failed to fetch categories:", err);
            setCategories([]);
          });
      });
    }
  }, [step, currentUser]);

  // Show notification permission popup only when step === 3
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      step === 3
    ) {
      console.log(
        "[Onboarding] Current Notification.permission:",
        Notification.permission
      );
      setNotificationPermission(Notification.permission);
      // Only prompt if permission is still default
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
          console.log(
            "[Onboarding] Notification.requestPermission result:",
            permission
          );
        });
      }
    }
  }, [step]);

  // Handler for requesting notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        // Always call requestPermission on click, regardless of current permission
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        console.log(
          "[Onboarding] Notification.requestPermission result:",
          permission
        );
        if (permission === "granted") {
          toast("Notifications enabled! You'll receive updates.");
          setTimeout(() => router.push("/"), 1200);
        } else if (permission === "denied") {
          toast(
            "Notifications are blocked. Please enable them in your browser settings."
          );
          setTimeout(() => router.push("/"), 1200);
        } else {
          toast(
            "Notifications are disabled. You can enable them in your browser settings."
          );
          setTimeout(() => router.push("/"), 1200);
        }
      } catch (err) {
        toast("Failed to request notification permission.");
        setTimeout(() => router.push("/"), 1200);
      }
    } else {
      toast("Notifications are not supported in this browser.");
      setTimeout(() => router.push("/"), 1200);
    }
  };

  // Handlers
  const handleNext = async () => {
    setSaving(true);
    try {
      await updateProfile();
      setStep(2);
    } finally {
      setSaving(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await savePreferences();
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-lg shadow-lg p-0 border-none bg-white dark:bg-zinc-900">
        <div className={cn("w-full h-full p-8", transitionClass)}>
          {/* Step Indicator */}
          <div className="mb-6 text-sm text-muted-foreground text-center">
            Step {step} of 3
          </div>

          {/* Step 1: User Info */}
          {step === 1 && (
            <div className={cn("flex flex-col gap-6 animate-fade-in")}>
              <h2 className="text-2xl font-bold text-center mb-2">
                Welcome! Let’s Get to Know You
              </h2>
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={preferredTime} onValueChange={setPreferredTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Preferred Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleNext}
                disabled={!canProceed || saving}
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className={cn("flex flex-col gap-6 animate-fade-in")}>
              <h2 className="text-2xl font-bold text-center mb-2">
                Customize Your News Feed
              </h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer px-4 py-2 rounded transition-colors",
                      "bg-muted hover:bg-accent border border-transparent",
                      selectedCategories.includes(cat.id)
                        ? "ring-2 ring-primary bg-primary/10 border-primary"
                        : ""
                    )}
                    style={{ minWidth: 150 }}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        setSelectedCategories((prev) =>
                          checked
                            ? [...prev, cat.id]
                            : prev.filter((id) => id !== cat.id)
                        );
                      }}
                      id={`cat-${cat.id}`}
                    />
                    <span
                      className={
                        selectedCategories.includes(cat.id)
                          ? "font-semibold"
                          : ""
                      }
                    >
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
              <Select value={preferredTime} onValueChange={setPreferredTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Preferred Time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={saving}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={!canSave || saving}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Notification Permission */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in items-center justify-center min-h-[300px]">
              {/* Bell Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-2">
                {/* Heroicons Bell */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600 dark:text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">
                Enable Notifications
              </h2>
              <p className="text-center text-muted-foreground mb-4 max-w-xs">
                Would you like to receive notifications for personalized news
                updates and important alerts?
              </p>
              <Button
                className="w-full max-w-xs"
                onClick={() => router.push("/")}
              >
                Finish
              </Button>
              {notificationPermission === "denied" && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  You have denied notifications. You can enable them in your
                  browser settings.
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Animations
// Add this to your global CSS or Tailwind config:
// .animate-fade-in { animation: fadeIn 0.5s; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; }
