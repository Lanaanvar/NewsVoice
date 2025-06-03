// ✅ Updated `app/preferences/page.tsx`
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySelector } from "@/components/preferences/category-selector";
import { TimeSelector } from "@/components/preferences/time-selector";
import { toast } from "@/hooks/use-toast";

export default function PreferencesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [topicsEnabled, setTopicsEnabled] = useState(true);
  const [preferredTime, setPreferredTime] = useState("08:00");

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(setCategoryOptions)
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const getSelectedCategoryIds = () => {
    return selectedCategories.map(name => {
      const match = categoryOptions.find(cat => cat.name === name);
      return match ? match.id : null;
    }).filter(Boolean);
  };

  const savePreferences = async () => {
    const categoryIds = getSelectedCategoryIds();

    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preferences: categoryIds,
        preferred_time: preferredTime,
      })
    });

    const data = await res.json();
    toast({ title: "Preferences saved", description: data.message });
  };

  return (
    <div className="container px-4 py-6 space-y-6 mb-16">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground">Customize your news experience</p>
      </section>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>News Categories</CardTitle></CardHeader>
            <CardContent>
              <CategorySelector selectedCategories={selectedCategories} onChange={setSelectedCategories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Scheduled Delivery</CardTitle></CardHeader>
            <CardContent>
              <TimeSelector defaultTime={preferredTime} defaultEnabled={true} onChange={setPreferredTime} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Audio Preferences</CardTitle></CardHeader>
            <CardContent>
              <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={savePreferences}>Save Preferences</Button>
    </div>
  );
}