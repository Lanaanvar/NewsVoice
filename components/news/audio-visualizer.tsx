"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  text: string;
  isPlaying: boolean;
}

export function AudioVisualizer({ text, isPlaying }: AudioVisualizerProps) {
  const [words, setWords] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  
  useEffect(() => {
    if (!text) return;
    
    // Split text into words
    const splitWords = text.split(" ");
    setWords(splitWords);
    
    // Reset active word when text changes
    setActiveWordIndex(-1);
    
    if (isPlaying) {
      // Animate through words
      const wordInterval = setInterval(() => {
        setActiveWordIndex(prev => {
          if (prev >= splitWords.length - 1) {
            clearInterval(wordInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 300); // Speed of word highlighting
      
      return () => clearInterval(wordInterval);
    }
  }, [text, isPlaying]);
  
  return (
    <div className="rounded-lg bg-muted/30 p-4 max-w-full overflow-hidden">
      <p className="leading-7 text-base">
        {words.map((word, index) => (
          <span
            key={index}
            className={cn(
              "px-0.5 py-0.5 rounded transition-all duration-300",
              index === activeWordIndex && "bg-primary/20 text-primary font-medium",
              index < activeWordIndex && "text-muted-foreground"
            )}
          >
            {word}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}