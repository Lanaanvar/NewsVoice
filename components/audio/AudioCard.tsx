import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import AnimatedSummary from "@/components/audio/AnimatedSummary";
import { useSearchParams } from "next/navigation";

export default function AudioCard() {
  const searchParams = useSearchParams();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
  const [showFollowups, setShowFollowups] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnswerPlaying, setIsAnswerPlaying] = useState(false);
  const [summaryPaused, setSummaryPaused] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    // Get category from URL
    const cat = searchParams.get("category");
    setCategoryId(cat && /^\d+$/.test(cat) ? Number(cat) : null);
  }, [searchParams]);

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
    const fetchAndPlay = async () => {
      let apiUrl = "";
      let fetchOptions: RequestInit = {};
      if (!categoryId) {
        apiUrl = "http://localhost:8000/news/top_personalised_news";
        try {
          const { getAuth } = await import("firebase/auth");
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            const idToken = await user.getIdToken();
            fetchOptions.headers = { Authorization: `Bearer ${idToken}` };
          }
        } catch (err) {
          // Optionally handle error
        }
      } else {
        apiUrl = `http://localhost:8000/news/category_news/${categoryId}`;
      }
      try {
        const res = await fetch(apiUrl, fetchOptions);
        const data = await res.json();
        setAudioUrl(`http://127.0.0.1:8000/${data.audio_file_path}`);
        setSummary(data.summary);
        setFollowupQuestions(data.followup_questions || []);
        if (data.audio_id) {
          localStorage.setItem("featured_audio_id", data.audio_id.toString());
        }
        setIsPlaying(true);
        setSummaryPaused(false);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchAndPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  useEffect(() => {
    if (audioUrl && audioRef.current && isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [audioUrl, isPlaying]);

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
      setSummaryPaused(true);
    }
  };

  const handlePlay = async () => {
    let apiUrl = "";
    let fetchOptions: RequestInit = {};
    if (!categoryId) {
      apiUrl = "http://localhost:8000/news/top_personalised_news";
      // Use Firebase getIdToken for the current user
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          fetchOptions.headers = { Authorization: `Bearer ${idToken}` };
        }
      } catch (err) {
        // Optionally handle error
      }
    } else {
      apiUrl = `http://localhost:8000/news/category_news/${categoryId}`;
    }
    try {
      const res = await fetch(apiUrl, fetchOptions);
      const data = await res.json();
      setAudioUrl(`http://127.0.0.1:8000/${data.audio_file_path}`);
      setSummary(data.summary);
      setFollowupQuestions(data.followup_questions || []);
      if (data.audio_id) {
        localStorage.setItem("featured_audio_id", data.audio_id.toString());
      }
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        setSummaryPaused(false);
      }
    } catch (err) {
      // Optionally handle error
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
        setIsAnswerPlaying(true);
        answerAudio.play();
        answerAudio.onended = () => {
          setIsAnswerPlaying(false);
          setShowFollowups(true); // Show followups after answer audio ends
        };
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
      setShowFollowups(false); // Hide followups when mic is pressed
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
              setIsAnswerPlaying(true);
              answerAudio.play();
              answerAudio.onended = () => {
                setIsAnswerPlaying(false);
                setShowFollowups(true); // Show followups after answer audio ends
              };
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
      {/* Move summary animation to the top with justified alignment */}
      {summary && (
        <div className="w-full flex justify-center mt-2 mb-2">
          <div className="w-full max-w-3xl">
            <AnimatedSummary
              summary={summary}
              isPlaying={isPlaying && !summaryPaused}
              highlightColor="#fff"
              className="mx-auto"
              audioDuration={audioDuration}
              wordCount={summary.split(" ").length}
            />
          </div>
        </div>
      )}
      <Card
        className="relative w-full max-w-xs rounded-2xl shadow-xl border-none z-10 mb-4"
        style={{ backgroundColor: "#1c1e20" }}
      >
        <CardContent className="p-6 flex flex-col items-center font-inter gap-4">
          {/* Enhanced animated wave for audio playing or recording */}
          {!showFollowups && (isPlaying || isRecording || isAnswerPlaying) && (
            <div className="flex justify-center items-center mb-3 h-10 w-full">
              <div
                className={`flex gap-2 max-w-[120px] w-fit mx-auto ${
                  isRecording ? "text-red-500" : "text-blue-400"
                }`}
                aria-label={isRecording ? "Recording..." : "Playing..."}
              >
                <span
                  className={`block w-3 h-7 rounded-full bg-current animate-wave1 ${
                    isRecording ? "bg-red-500" : "bg-blue-500"
                  }`}
                ></span>
                <span
                  className={`block w-3 h-5 rounded-full bg-current animate-wave2 ${
                    isRecording ? "bg-red-400" : "bg-blue-400"
                  }`}
                ></span>
                <span
                  className={`block w-3 h-9 rounded-full bg-current animate-wave3 ${
                    isRecording ? "bg-red-300" : "bg-blue-300"
                  }`}
                ></span>
                <span
                  className={`block w-3 h-6 rounded-full bg-current animate-wave4 ${
                    isRecording ? "bg-red-400" : "bg-blue-400"
                  }`}
                ></span>
                <span
                  className={`block w-3 h-8 rounded-full bg-current animate-wave5 ${
                    isRecording ? "bg-red-500" : "bg-blue-500"
                  }`}
                ></span>
              </div>
            </div>
          )}
          <div className="w-full flex flex-col items-start mb-6">
            {showFollowups && followupQuestions.length > 0 && (
              <>
                <span className="text-sm font-semibold text-white/80 mb-1 font-inter">
                  What would you like to ask today?
                </span>

                <h1 className="text-xl font-bold text-white leading-tight font-inter">
                  Tap the mic or questions
                </h1>
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
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
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
                  onLoadedMetadata={(e) =>
                    setAudioDuration(e.currentTarget.duration)
                  }
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
            {/* Show Play button if no audioUrl yet */}
            {!audioUrl && (
              <Button
                size="icon"
                className="bg-white/90 hover:bg-white text-black shadow-lg rounded-full w-10 h-10 border border-white/80 z-10"
                onClick={handlePlay}
                aria-label="Play audio"
              >
                <Play className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
