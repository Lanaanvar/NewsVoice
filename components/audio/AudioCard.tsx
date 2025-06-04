import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import AnimatedSummary from "@/components/audio/AnimatedSummary";

export default function AudioCard() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [displayedSummary, setDisplayedSummary] = useState<string>("");
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
  const [showFollowups, setShowFollowups] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("http://127.0.0.1:8000/news/todays_news")
        .then((res) => res.json())
        .then((data) => {
          setAudioUrl(`http://127.0.0.1:8000/${data.audio_file_path}`);
          setSummary(data.summary);
          setFollowupQuestions(data.followup_questions || []);
          if (data.audio_id) {
            localStorage.setItem("featured_audio_id", data.audio_id.toString());
          }
        });
    }, 5000); // 5 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      // Remove autoPlay attribute from <audio> and always play programmatically
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [audioUrl]);

  // Animate summary word by word
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

  // Setup SpeechRecognition instance
  useEffect(() => {
    if (typeof window !== "undefined" && !recognition) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";
        setRecognition(recog);
      }
    }
  }, [recognition]);

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Show followup questions after audio ends
  const handleAudioEnded = () => {
    setShowFollowups(true);
  };

  // Handle followup question click
  const handleFollowupClick = async (question: string) => {
    const audioId = localStorage.getItem("featured_audio_id");
    if (!audioId) return;
    const payload = {
      audio_id: audioId,
      question,
    };
    localStorage.setItem("featured_question", JSON.stringify(payload));
    try {
      const res = await fetch("http://127.0.0.1:8000/news/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      // Play the answer audio after getting the answer
      if (result && result.answer) {
        const answerAudioUrl = `http://127.0.0.1:8000/${result.answer}`;
        let answerAudio = new Audio(answerAudioUrl);
        answerAudio.play();
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Handle mic button for voice question
  const handleMicClick = async () => {
    if (!recognition) return;
    if (!isRecording) {
      setIsRecording(true);
      recognition.start();
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        const audioId = localStorage.getItem("featured_audio_id");
        if (audioId && transcript) {
          const payload = {
            audio_id: audioId,
            question: transcript,
          };
          localStorage.setItem("featured_question", JSON.stringify(payload));
          try {
            const res = await fetch("http://127.0.0.1:8000/news/questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const result = await res.json();
            // Play the answer audio after getting the answer
            if (result && result.answer) {
              const answerAudioUrl = `http://127.0.0.1:8000/${result.answer}`;
              let answerAudio = new Audio(answerAudioUrl);
              answerAudio.play();
            }
          } catch (err) {
            // Optionally handle error
          }
        }
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 flex flex-col items-center z-20">
      {summary && <AnimatedSummary summary={summary} />}
      <Card className="relative w-full max-w-xs rounded-2xl shadow-xl bg-white/95 border-none z-10 mb-4">
        <CardContent className="p-4 flex flex-col items-center font-inter">
          <div className="w-full flex flex-col items-start mb-6">
            <span className="text-sm font-semibold text-white/80 mb-1 font-inter">
              What would you like to do today?
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight font-inter">
              Type, talk, or share a photo
            </h1>
            {showFollowups && followupQuestions.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 w-full">
                {followupQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 font-medium transition-colors duration-150 shadow"
                    onClick={() => handleFollowupClick(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-2">
            <Button
              size="icon"
              className={`bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full w-12 h-12 border-2 border-white/80 z-10 ${
                isRecording ? "animate-pulse" : ""
              }`}
              onClick={handleMicClick}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <Mic className="w-6 h-6" />
            </Button>
            {audioUrl && (
              <>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  style={{ display: "none" }}
                  onEnded={handleAudioEnded}
                />
                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-black shadow-lg rounded-full w-10 h-10 border border-white/80 z-10"
                  onClick={isPlaying ? handlePause : handlePlay}
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
