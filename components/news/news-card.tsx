// ✅ Updated `news-card.tsx` with audio playback
"use client";

import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { PlayCircle, PauseCircle, Clock, BarChart2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/mock-data";
import { AudioVisualizer } from "@/components/news/audio-visualizer";

interface NewsCardProps {
  news: NewsItem & { audioFilePath?: string };
  isCompact?: boolean;
  onPlay?: (id: string) => void;
}

export function NewsCard({ news, isCompact = false, onPlay }: NewsCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timeAgo = formatDistanceToNow(new Date(news.publishedAt), {
    addSuffix: true,
  });

  const handlePlayToggle = () => {
    if (!audioRef.current && news.audioFilePath) {
      audioRef.current = new Audio(news.audioFilePath);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(console.error);
      setIsPlaying(true);
    }

    if (onPlay) onPlay(news.id);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:shadow-md dark:hover:shadow-primary/5",
        isCompact ? "border border-muted" : "border-none shadow-sm"
      )}
    >
      {!isCompact && news.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Badge className="absolute top-3 right-3" variant="secondary">
            {news.category}
          </Badge>
        </div>
      )}

      <CardHeader
        className={cn(
          isCompact ? "px-4 py-3" : "px-5 py-4",
          isCompact && "pb-0"
        )}
      >
        <div className="flex justify-between items-start">
          <CardTitle
            className={cn("leading-tight", isCompact ? "text-base" : "text-xl")}
          >
            {news.title}
          </CardTitle>

          {isCompact && (
            <Badge variant="outline" className="ml-2 shrink-0">
              {news.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <span>•</span>
          <span>{news.source}</span>
        </div>
      </CardHeader>

      <CardContent className={cn(isCompact ? "px-4 py-2" : "px-5 py-3")}>
        <p
          className={cn(
            "text-muted-foreground line-clamp-2",
            isCompact ? "text-sm" : "text-base"
          )}
        >
          {news.summary}
        </p>

        {isPlaying && news.transcript && (
          <div className="mt-4">
            <AudioVisualizer
              text={news.transcript[0] || news.summary}
              isPlaying={isPlaying}
            />
          </div>
        )}
      </CardContent>

      <CardFooter
        className={cn(
          "flex items-center justify-between",
          isCompact ? "px-4 py-3" : "px-5 py-4"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-xs"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>Full Story</span>
        </Button>

        <Button
          onClick={handlePlayToggle}
          variant="ghost"
          size="icon"
          className={cn("rounded-full transition-all", isPlaying && "text-primary")}
        >
          {isPlaying ? (
            <PauseCircle className="h-8 w-8" />
          ) : (
            <PlayCircle className="h-8 w-8" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 


// "use client";

// import { useState } from "react";
// import { formatDistanceToNow } from "date-fns";
// import { PlayCircle, PauseCircle, Clock, BarChart2 } from "lucide-react";
// import { 
//   Card, 
//   CardContent, 
//   CardFooter, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import type { NewsItem } from "@/lib/mock-data";
// import { AudioVisualizer } from "@/components/news/audio-visualizer";

// interface NewsCardProps {
//   news: NewsItem;
//   isCompact?: boolean;
//   onPlay?: (id: string) => void;
// }

// export function NewsCard({ news, isCompact = false, onPlay }: NewsCardProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentPosition, setCurrentPosition] = useState(0);
  
//   const timeAgo = formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true });
  
//   const handlePlayToggle = () => {
//     setIsPlaying(!isPlaying);
    
//     if (!isPlaying && onPlay) {
//       onPlay(news.id);
//     }
    
//     // Simulate playback progress
//     if (!isPlaying) {
//       const interval = setInterval(() => {
//         setCurrentPosition((prev) => {
//           const newPos = prev + 1;
//           if (newPos >= news.transcript.length) {
//             clearInterval(interval);
//             setIsPlaying(false);
//             return 0;
//           }
//           return newPos;
//         });
//       }, 3000);
      
//       return () => clearInterval(interval);
//     }
//   };

//   return (
//     <Card className={cn(
//       "overflow-hidden transition-all duration-300",
//       "hover:shadow-md dark:hover:shadow-primary/5",
//       isCompact ? "border border-muted" : "border-none shadow-sm"
//     )}>
//       {!isCompact && news.imageUrl && (
//         <div className="relative h-48 w-full overflow-hidden">
//           <img 
//             src={news.imageUrl} 
//             alt={news.title}
//             className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
//           <Badge className="absolute top-3 right-3" variant="secondary">
//             {news.category}
//           </Badge>
//         </div>
//       )}
      
//       <CardHeader className={cn(
//         isCompact ? "px-4 py-3" : "px-5 py-4",
//         isCompact && "pb-0"
//       )}>
//         <div className="flex justify-between items-start">
//           <CardTitle className={cn(
//             "leading-tight",
//             isCompact ? "text-base" : "text-xl"
//           )}>
//             {news.title}
//           </CardTitle>
          
//           {isCompact && (
//             <Badge variant="outline" className="ml-2 shrink-0">
//               {news.category}
//             </Badge>
//           )}
//         </div>
        
//         <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
//           <span className="flex items-center gap-1">
//             <Clock className="h-3 w-3" />
//             {timeAgo}
//           </span>
//           <span>•</span>
//           <span>{news.source}</span>
//         </div>
//       </CardHeader>
      
//       <CardContent className={cn(
//         isCompact ? "px-4 py-2" : "px-5 py-3",
//       )}>
//         <p className={cn(
//           "text-muted-foreground line-clamp-2",
//           isCompact ? "text-sm" : "text-base"
//         )}>
//           {news.summary}
//         </p>
        
//         {isPlaying && (
//           <div className="mt-4">
//             <AudioVisualizer 
//               text={news.transcript[currentPosition] || ""}
//               isPlaying={isPlaying}
//             />
//           </div>
//         )}
//       </CardContent>
      
//       <CardFooter className={cn(
//         "flex items-center justify-between",
//         isCompact ? "px-4 py-3" : "px-5 py-4",
//       )}>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-1 text-xs"
//         >
//           <BarChart2 className="h-3.5 w-3.5" />
//           <span>Full Story</span>
//         </Button>
        
//         <Button
//           onClick={handlePlayToggle}
//           variant="ghost"
//           size="icon"
//           className={cn(
//             "rounded-full transition-all",
//             isPlaying && "text-primary"
//           )}
//         >
//           {isPlaying ? (
//             <PauseCircle className="h-8 w-8" />
//           ) : (
//             <PlayCircle className="h-8 w-8" />
//           )}
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }