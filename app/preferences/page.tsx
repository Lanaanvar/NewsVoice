"use client";

import { useState } from "react";
import { 
  Bell, 
  VolumeX, 
  Volume2,
  PanelLeftClose,
  BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorySelector } from "@/components/preferences/category-selector";
import { TimeSelector } from "@/components/preferences/time-selector";
import VoiceButton from "@/components/voice-button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function PreferencesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["tech", "business"]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [topicsEnabled, setTopicsEnabled] = useState(true);
  
  const handleAudioToggle = (checked: boolean) => {
    setAudioEnabled(checked);
    toast({
      title: checked ? "Audio enabled" : "Audio disabled",
      description: checked 
        ? "Audio summaries will be available for news articles" 
        : "Audio summaries have been disabled",
    });
  };
  
  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    toast({
      title: checked ? "Notifications enabled" : "Notifications disabled",
      description: checked 
        ? "You'll receive notifications for new stories" 
        : "Notifications have been disabled",
    });
  };
  
  const handleTopicsToggle = (checked: boolean) => {
    setTopicsEnabled(checked);
    toast({
      title: checked ? "Topics enabled" : "Topics disabled",
      description: checked 
        ? "You'll see topic recommendations based on your interests" 
        : "Topic recommendations have been disabled",
    });
  };
  
  return (
    <div className="container px-4 py-6 space-y-6 mb-16">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Preferences
        </h1>
        <p className="text-muted-foreground">
          Customize your news experience
        </p>
      </section>
      
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>News Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <CategorySelector 
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Topic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Topic Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get recommendations based on your reading habits
                  </p>
                </div>
                <Switch 
                  checked={topicsEnabled}
                  onCheckedChange={handleTopicsToggle}
                />
              </div>
              
              <Separator />
              
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 rounded-md p-2 bg-primary/10 text-primary"
                  )}>
                    <PanelLeftClose className="h-4 w-4" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Content Filters</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose content filtering level to customize your news feed
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="justify-start">
                        Minimal
                      </Button>
                      <Button variant="secondary" size="sm" className="justify-start">
                        Standard
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        Strict
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSelector 
                defaultTime="08:00" 
                defaultEnabled={true}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for breaking news
                  </p>
                </div>
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsToggle}
                />
              </div>
              
              <Separator />
              
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 rounded-md p-2",
                    notificationsEnabled 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <BellRing className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">Notification Frequency</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose how often you want to receive notifications
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="justify-start">
                        Minimal
                      </Button>
                      <Button variant="secondary" size="sm" className="justify-start">
                        Standard
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        All News
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interface" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Audio Summaries</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable audio narration of news articles
                  </p>
                </div>
                <Switch 
                  checked={audioEnabled}
                  onCheckedChange={handleAudioToggle}
                />
              </div>
              
              <Separator />
              
              <div className={cn(
                "bg-muted/30 p-4 rounded-lg border border-border",
                !audioEnabled && "opacity-50 pointer-events-none"
              )}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md p-2 bg-primary/10 text-primary">
                    {audioEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Voice Style</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose the voice for your audio summaries
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="secondary" size="sm" className="justify-start">
                        Female Voice
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        Male Voice
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Reduce Motion</h3>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations throughout the interface
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Large Text</h3>
                  <p className="text-sm text-muted-foreground">
                    Increase text size for better readability
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <VoiceButton />
    </div>
  );
}