"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface TimeSelectorProps {
  defaultTime?: string;
  defaultEnabled?: boolean;
  onChange?: (time: string, enabled: boolean) => void;
}

export function TimeSelector({ 
  defaultTime = "08:00", 
  defaultEnabled = true,
  onChange
}: TimeSelectorProps) {
  const [time, setTime] = useState(defaultTime);
  const [enabled, setEnabled] = useState(defaultEnabled);
  
  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  
  const handleTimeChange = (value: string) => {
    setTime(value);
  };
  
  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
  };
  
  const handleSave = () => {
    if (onChange) {
      onChange(time, enabled);
    }
    
    toast({
      title: "Delivery time updated",
      description: enabled 
        ? `Your daily news brief will be delivered at ${time}`
        : "Scheduled delivery is disabled",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-medium">Daily Briefing</h3>
          <p className="text-sm text-muted-foreground">
            Schedule a time to receive your personalized news brief
          </p>
        </div>
        <Switch 
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>
      
      {enabled && (
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Delivery Time</p>
              <Select 
                value={time} 
                onValueChange={handleTimeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {times.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      <Button onClick={handleSave} className="w-full">
        Save Schedule
      </Button>
    </div>
  );
}