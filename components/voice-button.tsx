"use client";

import { useState } from "react";
import { MicIcon, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [animationLevel, setAnimationLevel] = useState(0);

  const toggleListening = () => {
    setIsListening(!isListening);
    
    // Simulate voice level animation
    if (!isListening) {
      const interval = setInterval(() => {
        setAnimationLevel(Math.random());
      }, 100);
      
      // Simulate listening for 5 seconds then stop
      setTimeout(() => {
        clearInterval(interval);
        setIsListening(false);
        setAnimationLevel(0);
      }, 5000);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <div className="relative">
        {isListening && (
          <div className="absolute inset-0 -z-10">
            <div 
              className={cn(
                "absolute rounded-full bg-primary/20 transition-all duration-300",
                "animate-pulse"
              )}
              style={{
                width: `${(1 + animationLevel * 1.5) * 100}%`,
                height: `${(1 + animationLevel * 1.5) * 100}%`,
                left: `${((1 - animationLevel * 1.5) / 2) * 100}%`,
                top: `${((1 - animationLevel * 1.5) / 2) * 100}%`,
              }}
            />
          </div>
        )}
        
        <Button
          onClick={toggleListening}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
            isListening ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isListening ? (
            <Square className="h-5 w-5" />
          ) : (
            <MicIcon className="h-5 w-5" />
          )}
          <span className="sr-only">
            {isListening ? "Stop listening" : "Start voice command"}
          </span>
        </Button>
      </div>
    </div>
  );
}