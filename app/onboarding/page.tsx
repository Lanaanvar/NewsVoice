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
// If you use 'sonner' for toasts, import it like this:
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";

const COUNTRIES = ["India", "USA", "Canada", "UK", "Australia"];

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
  const [preferredTime, setPreferredTime] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
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
      toast("Preferences saved! Your news feed is now personalized.");
      setTimeout(() => router.push("/"), 1200);
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
            Step {step} of 2
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
                <TimeInput value={preferredTime} onChange={setPreferredTime} />
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
              <TimeInput value={preferredTime} onChange={setPreferredTime} />
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
        </div>
      </Card>
    </div>
  );
}

// Animations
// Add this to your global CSS or Tailwind config:
// .animate-fade-in { animation: fadeIn 0.5s; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
