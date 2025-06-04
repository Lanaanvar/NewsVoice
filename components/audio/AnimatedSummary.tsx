import React, { useEffect, useState, useRef } from "react";

interface AnimatedSummaryProps {
  summary: string;
  isPlaying: boolean;
  highlightColor?: string;
  className?: string;
  audioDuration?: number;
  wordCount?: number;
}

const AnimatedSummary: React.FC<AnimatedSummaryProps> = ({
  summary,
  isPlaying,
  highlightColor = "#fff",
  className,
  audioDuration,
  wordCount,
}) => {
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const words = summary.split(" ");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate interval based on audio duration and word count
  const intervalMs =
    audioDuration && wordCount && wordCount > 0
      ? (audioDuration / wordCount) * 1000
      : 350;

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    if (wordIdx >= words.length) return;
    intervalRef.current = setInterval(() => {
      setWordIdx((prev) => {
        if (prev < words.length) {
          return prev + 1;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
      });
    }, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, intervalMs]);

  useEffect(() => {
    if (!isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isPlaying]);

  useEffect(() => {
    setWordIdx(0);
  }, [summary]);

  useEffect(() => {
    setDisplayedSummary(words.slice(0, wordIdx).join(" "));
  }, [wordIdx, summary]);

  return (
    <div
      className={`text-2xl md:text-3xl text-white/20 font-inter text-center px-8 whitespace-pre-line ${
        className || ""
      }`}
      style={{
        textShadow: "0 2px 16px rgba(0,0,0,0.7)",
        fontWeight: 600,
        letterSpacing: "0.01em",
        lineHeight: 1.4,
        userSelect: "none",
      }}
    >
      {displayedSummary}
    </div>
  );
};

export default AnimatedSummary;
