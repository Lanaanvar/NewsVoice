"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Clock, 
  Calendar, 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { NewsCard } from "@/components/news/news-card";
import VoiceButton from "@/components/voice-button";
import { mockNewsItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GroupedNews = {
  date: string;
  items: typeof mockNewsItems;
};

export default function TimelinePage() {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  
  // Group news by date
  const groupedNews: GroupedNews[] = mockNewsItems.reduce((acc, item) => {
    const date = format(new Date(item.publishedAt), "yyyy-MM-dd");
    const existingGroup = acc.find(group => group.date === date);
    
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      acc.push({ date, items: [item] });
    }
    
    return acc;
  }, [] as GroupedNews[]);
  
  // Sort groups by date (newest first)
  groupedNews.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };
  
  const filteredGroups = filter === "all" 
    ? groupedNews 
    : groupedNews.map(group => ({
        ...group,
        items: group.items.filter(item => item.category === filter)
      })).filter(group => group.items.length > 0);

  return (
    <div className="container px-4 py-6 space-y-6 mb-16">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          News Timeline
        </h1>
        <p className="text-muted-foreground">
          Browse your past news updates
        </p>
      </section>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span>Filter by Date</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="world">World</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-8">
        {filteredGroups.map(group => (
          <div 
            key={group.date} 
            className="space-y-4 border-l-2 border-muted pl-4 ml-2"
          >
            <div className="flex items-center -ml-6">
              <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center z-10">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 flex items-center gap-1 font-medium"
                onClick={() => toggleDateExpansion(group.date)}
              >
                {format(new Date(group.date), "MMMM d, yyyy")}
                {expandedDates.includes(group.date) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className={cn(
              "grid gap-4 transition-all duration-300 pl-4",
              !expandedDates.includes(group.date) && "hidden"
            )}>
              {group.items.map(item => (
                <NewsCard 
                  key={item.id}
                  news={item}
                  isCompact
                />
              ))}
            </div>
          </div>
        ))}
        
        {filteredGroups.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No news items found for the selected filter.
            </p>
          </div>
        )}
      </div>
      
      <VoiceButton />
    </div>
  );
}