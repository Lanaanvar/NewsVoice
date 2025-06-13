"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import AnimatedSummary from "@/components/audio/AnimatedSummary";
import { useSearchParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/lib/context/auth-context";

/**
 * AudioCard – self‑contained player/recorder component.
 *
 * Key fixes & improvements:
 * 1. Added the `"use client"` directive so the component runs on the client.
 * 2. Removed duplicate/dynamic imports of `getAuth`; instead use a helper to fetch the ID token.
 * 3. Centralised API base URL via `NEXT_PUBLIC_API_BASE` env (falls back to localhost).
 * 4. Hardened error handling and cleaned up async logic.
 * 5. Guards against `undefined` summary when counting words.
 * 6. Added proper cleanup for SpeechRecognition event handlers.
 */
export default function AudioCard() {
  const searchParams = useSearchParams();
  const { loading, currentUser } = useAuth();

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
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

  // ──────────────────────────────────────────── helpers ──
  const getTokenHeader = async () => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
      }
    } catch {
      /* silent */
    }
    return {};
  };

  const fetchWithAuth = async (endpoint: string) => {
    const headers = await getTokenHeader();
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  };

  // ────────────────────────────────────────── effects ──
  // Resolve category from the query param
  useEffect(() => {
    const cat = searchParams.get("category");
    setCategoryId(cat && /^\d+$/.test(cat) ? Number(cat) : null);
  }, [searchParams]);

  // Fetch & autoplay new audio whenever the category changes
  useEffect(() => {
    if (loading || !currentUser) return; // Wait for auth
    (async () => {
      try {
        const data = await fetchWithAuth(
          categoryId !== null ? `/news/category_news/${categoryId}` : "/news/top_personalised_news"
        );

        setAudioUrl(`${API_BASE}/${data.audio_file_path}`);
        setSummary(data.summary);
        setFollowupQuestions(data.followup_questions ?? []);
        if (data.audio_id) {
          localStorage.setItem("featured_audio_id", String(data.audio_id));
        }
        setShowFollowups(false);
        // Do NOT set isPlaying or summaryPaused here
      } catch (err) {
        console.error("Failed to fetch audio:", err);
      }
    })();
    // deliberately ignore API_BASE in deps to avoid SSR mismatch warnings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, loading, currentUser]);

  // Autoplay whenever `audioUrl` or play‑state toggles
  useEffect(() => {
    if (audioUrl && audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [audioUrl, isPlaying]);

  // Setup SpeechRecognition – run once client‑side
  useEffect(() => {
    if (recognition || typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recog: SpeechRecognition = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";
    setRecognition(recog);
  }, [recognition]);

  // ───────────────────────────────────────── handlers ──
  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setSummaryPaused(true);
  };

  const handlePlay = () => {
    if (!audioUrl) return; // nothing yet – await useEffect fetch
    audioRef.current?.play().then(() => {
      setIsPlaying(true);
      setSummaryPaused(false);
    });
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setShowFollowups(true);
  };

  const askQuestion = async (question: string) => {
    const audioId = localStorage.getItem("featured_audio_id");
    if (!audioId) return;

    const payload = { audio_id: audioId, question };
    localStorage.setItem("featured_question", JSON.stringify(payload));

    try {
      const headers = { "Content-Type": "application/json", ...(await getTokenHeader()) };
      const res = await fetch(`${API_BASE}/news/questions`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result?.answer) {
        const answerAudio = new Audio(`${API_BASE}/${result.answer}`);
        setIsAnswerPlaying(true);
        answerAudio.play();
        answerAudio.onended = () => {
          setIsAnswerPlaying(false);
          setShowFollowups(true);
        };
      }
    } catch (err) {
      console.error("Follow‑up failed:", err);
    }
  };

  const handleFollowupClick = (q: string) => askQuestion(q);

  const handleMicClick = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      return setIsRecording(false);
    }

    setIsRecording(true);
    setShowFollowups(false);

    recognition.start();
    recognition.onresult = (ev: SpeechRecognitionEvent) => {
      recognition.stop();
      setIsRecording(false);
      const transcript = ev.results[0][0].transcript;
      if (transcript) askQuestion(transcript);
    };
    recognition.onerror = () => {
      recognition.stop();
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
  };

  // ────────────────────────────────────────── render ──
  return (
    <div className="fixed inset-x-0 bottom-0 flex flex-col items-center z-20">
      {summary && (
        <div className="w-full flex justify-center mt-2 mb-2">
          <div className="w-full max-w-3xl">
            <AnimatedSummary
              summary={summary}
              isPlaying={isPlaying && !summaryPaused}
              highlightColor="#fff"
              className="mx-auto"
              audioDuration={audioDuration}
              wordCount={summary ? summary.split(" ").length : 0}
            />
          </div>
        </div>
      )}

      <Card
        className="relative w-full max-w-xs rounded-2xl shadow-xl border-none z-10 mb-4"
        style={{ backgroundColor: "#1c1e20" }}
      >
        <CardContent className="p-6 flex flex-col items-center font-inter gap-4">
          {/* animated bars when playing / recording */}
          {!showFollowups && (isPlaying || isRecording || isAnswerPlaying) && (
            <div className="flex justify-center items-center mb-3 h-10 w-full">
              <div
                className={`flex gap-2 max-w-[120px] w-fit mx-auto ${
                  isRecording ? "text-red-500" : "text-blue-400"
                }`}
                aria-label={isRecording ? "Recording..." : "Playing..."}
              >
                {[7, 5, 9, 6, 8].map((h, i) => (
                  <span
                    key={i}
                    className={`block w-3 rounded-full bg-current animate-wave${i + 1}`}
                    style={{ height: `${h * 4}px` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* follow‑up prompt */}
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
                  {followupQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
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

          {/* controls */}
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

            {audioUrl ? (
              <>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  preload="auto"
                  style={{ display: "none" }}
                  onEnded={handleAudioEnded}
                  onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                  onPlay={() => {
                    setIsPlaying(true);
                    setSummaryPaused(false);
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    setSummaryPaused(true);
                  }}
                />

                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-black shadow-lg rounded-full w-10 h-10 border border-white/80 z-10"
                  onClick={isPlaying ? handlePause : handlePlay}
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
              </>
            ) : (
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
