"use client";

import { useState, useEffect } from "react";
import { SendHorizontal, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AudioVisualizer } from "@/components/news/audio-visualizer";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

export function VoiceChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  
  // Simulate assistant greeting
  useEffect(() => {
    setTimeout(() => {
      const welcomeMessage = {
        id: Date.now().toString(),
        content: "Hi there! I'm your BoltBrief assistant. Ask me about news, request more details on a story, or tell me your interests.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }, 1000);
  }, []);
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate assistant response
    handleAssistantResponse(input);
  };
  
  const handleAssistantResponse = (userInput: string) => {
    setIsResponding(true);
    
    // Simple mock responses based on input keywords
    let response = "";
    
    if (userInput.toLowerCase().includes("tech")) {
      response = "I found several technology stories today. Would you like to hear about AI developments, quantum computing, or the latest smartphone releases?";
    } else if (userInput.toLowerCase().includes("weather")) {
      response = "I don't have weather information at the moment, but I can help you find news about climate and environmental stories if you're interested.";
    } else if (userInput.toLowerCase().includes("sport") || userInput.toLowerCase().includes("sports")) {
      response = "There are several sports updates today. The championship game ended with an unexpected victory, and there are some interesting player transfer rumors.";
    } else {
      response = "I understand you're interested in that topic. I can find recent news stories about it or provide summaries of the most important developments. What would you prefer?";
    }
    
    // Simulate typing effect
    let index = 0;
    const interval = setInterval(() => {
      if (index <= response.length) {
        setCurrentResponse(response.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsResponding(false);
        
        // Add assistant message
        const assistantMessage = {
          id: Date.now().toString(),
          content: response,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentResponse("");
      }
    }, 30);
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setInput("Tell me about the latest technology news");
      }, 3000);
    }
  };

  return (
    <Card className="border-muted/50">
      <CardContent className="p-4 h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.isUser 
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isResponding && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                <AudioVisualizer text={currentResponse} isPlaying={true} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t flex items-end gap-2">
        <Button
          onClick={toggleRecording}
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          className="rounded-full h-9 w-9 shrink-0"
        >
          {isRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything about the news..."
          className="min-h-9 resize-none"
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        
        <Button 
          onClick={handleSend}
          size="icon" 
          disabled={!input.trim()}
          className="rounded-full h-9 w-9 shrink-0"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}