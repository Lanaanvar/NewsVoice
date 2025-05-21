"use client";

import { useState } from "react";
import { Play, Share2, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsList } from "@/components/news/news-list";
import { NewsGrid } from "@/components/news/news-grid";
import { VoiceChatWidget } from "@/components/voice-chat-widget";
import VoiceButton from "@/components/voice-button";
import { mockNewsItems } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handlePlayNews = (id: string) => {
    setActiveNewsId(id);
    const news = mockNewsItems.find(item => item.id === id);
    
    if (news) {
      toast({
        title: `Now playing`,
        description: news.title,
        duration: 3000,
      });
    }
  };
  
  const featuredNews = mockNewsItems[0];
  const recentNews = mockNewsItems.slice(1, 5);

  return (
    <div className="container px-4 py-6 space-y-8 mb-16">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Your Daily Brief
        </h1>
        <p className="text-muted-foreground">
          Top stories curated just for you
        </p>
      </section>
      
      {/* Featured news */}
      <section className="relative overflow-hidden rounded-xl border border-muted bg-gradient-to-b from-muted/50 to-card">
        <div className="relative z-10 p-6 md:p-8">
          <div className="space-y-3 max-w-3xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {featuredNews.title}
              </h2>
              <p className="text-muted-foreground">
                {featuredNews.summary}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Play Audio
              </Button>
              <Button variant="outline" size="icon">
                <BookmarkPlus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent news */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Recent Updates
          </h2>
        </div>
        
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="mt-4">
            <NewsList 
              newsItems={recentNews} 
              onPlay={handlePlayNews}
            />
          </TabsContent>
          
          <TabsContent value="grid" className="mt-4">
            <NewsGrid 
              newsItems={recentNews}
              onPlay={handlePlayNews}
            />
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Voice chat section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Ask About The News
        </h2>
        <Card>
          <CardContent className="p-0 overflow-hidden">
            <VoiceChatWidget />
          </CardContent>
        </Card>
      </section>
      
      {/* Floating voice button */}
      <VoiceButton />
    </div>
  );
}