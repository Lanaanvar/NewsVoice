import React, { useEffect, useState } from "react";

interface AnimatedSummaryProps {
  summary: string | null;
}

const AnimatedSummary: React.FC<AnimatedSummaryProps> = ({ summary }) => {
  const [displayedSummary, setDisplayedSummary] = useState("");

  useEffect(() => {
    if (!summary) return;
    setDisplayedSummary("");
    const words = summary.split(" ");
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayedSummary((prev) => (prev ? prev + " " : "") + words[idx]);
      idx++;
      if (idx >= words.length) clearInterval(interval);
    }, 350); // Adjust speed as needed
    return () => clearInterval(interval);
  }, [summary]);

  if (!summary) return null;

  return (
    <div className="w-full flex justify-center pointer-events-none select-none z-10 mb-8">
      <span
        className="text-2xl md:text-3xl text-white/20 font-inter text-center px-8 whitespace-pre-line"
        style={{
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          fontWeight: 600,
          letterSpacing: "0.01em",
          lineHeight: 1.4,
          userSelect: "none",
        }}
      >
        {displayedSummary}
      </span>
    </div>
  );
};

export default AnimatedSummary;
