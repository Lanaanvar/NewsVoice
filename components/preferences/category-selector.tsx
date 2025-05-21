"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { categories, type Category } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function CategorySelector({ 
  selectedCategories = [], 
  onChange 
}: CategorySelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedCategories);
  
  const toggleCategory = (categoryId: string) => {
    setSelected(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  const handleSave = () => {
    onChange(selected);
    toast({
      title: "Preferences updated",
      description: "Your news category preferences have been saved.",
    });
  };

  const getCategoryIcon = (iconName: string) => {
    // This is a placeholder. In a real implementation, you'd import and use the actual icon
    return <span className="h-4 w-4">#{iconName}</span>;
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                "hover:bg-muted/50",
                selected.includes(category.id) ? "bg-muted border-primary/20" : "bg-background border-transparent",
                "border"
              )}
            >
              <div className={cn(
                "mt-0.5 rounded-md p-2",
                selected.includes(category.id) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {getCategoryIcon(category.icon)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{category.name}</h3>
                  {selected.includes(category.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
      
      <div className="flex flex-wrap gap-2 py-2">
        <p className="text-sm text-muted-foreground mr-2">Selected:</p>
        {selected.length === 0 ? (
          <Badge variant="outline" className="border-dashed">None selected</Badge>
        ) : (
          selected.map(id => {
            const category = categories.find(c => c.id === id);
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {category?.name}
                <button 
                  onClick={() => toggleCategory(id)}
                  className="ml-1 hover:text-destructive rounded-full"
                >
                  ×
                </button>
              </Badge>
            );
          })
        )}
      </div>
      
      <Button onClick={handleSave} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}