"use client";

import { useState, useEffect } from "react";
import { Play, Share2, BookmarkPlus, Pause, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsList } from "@/components/news/news-list";
import { NewsGrid } from "@/components/news/news-grid";
import { VoiceChatWidget } from "@/components/voice-chat-widget";
import VoiceButton from "@/components/voice-button";
import { mockNewsItems } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { fetchFeaturedNews } from "@/lib/api";

export default function Home() {
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null);
  const [featuredNews, setFeaturedNews] = useState<any>(null);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  let interruptedAudio: HTMLAudioElement | null = null;
  let interruptedAudioTime: number | null = null;

  // Setup SpeechRecognition instance
  useEffect(() => {
    if (typeof window !== "undefined" && !recognition) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true; // <-- changed from false to true
        recog.interimResults = false;
        recog.lang = "en-US";
        setRecognition(recog);
      }
    }
  }, [recognition]);

  useEffect(() => {
    fetchFeaturedNews()
      .then((data) => {
        setFeaturedNews(data);
        if (data && data.audio_id) {
          localStorage.setItem("featured_audio_id", data.audio_id.toString());
        }
      })
      .catch(() => setFeaturedNews(null));
  }, []);

  useEffect(() => {
    // Pause audio when component unmounts
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const handlePlayNews = (id: string) => {
    setActiveNewsId(id);
    const news = featuredNews && featuredNews.id === id ? featuredNews : null;
    if (news) {
      toast({
        title: `Now playing`,
        description: news.title,
        duration: 3000,
      });
    }
  };

  const recentNews = mockNewsItems.slice(1, 5);

  return (
    <div className="container px-4 py-6 space-y-8 mb-16">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Daily Brief</h1>
        <p className="text-muted-foreground">
          Top stories curated just for you
        </p>
      </section>

      {/* Featured news */}
      <section className="relative overflow-hidden rounded-xl border border-muted bg-gradient-to-b from-muted/50 to-card">
        <div className="relative z-10 p-6 md:p-8">
          <div className="space-y-3 max-w-3xl">
            {/* Recent Updates heading and summary inside the box */}
            <div className="space-y-2 flex items-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {featuredNews ? "Recent Updates" : "Loading..."}
              </h2>
              <Button
                variant="outline"
                className="ml-4"
                size="icon"
                disabled={!featuredNews || !recognition}
                onClick={async () => {
                  if (!recognition) return;
                  if (!isRecording) {
                    // If news audio is playing, pause and remember position
                    if (audio && !audio.paused) {
                      interruptedAudio = audio;
                      interruptedAudioTime = audio.currentTime;
                      audio.pause();
                    } else {
                      interruptedAudio = null;
                      interruptedAudioTime = null;
                    }
                    setIsRecording(true);
                    recognition.start();
                    recognition.onresult = async (event: any) => {
                      const transcript = event.results[0][0].transcript;
                      const audioId = featuredNews?.audio_id;
                      if (audioId && transcript) {
                        const payload = {
                          audio_id: audioId,
                          question: transcript,
                        };
                        localStorage.setItem(
                          "featured_question",
                          JSON.stringify(payload)
                        );
                        // Send to API
                        try {
                          const res = await fetch(
                            "http://127.0.0.1:8000/news/questions",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                            }
                          );
                          const result = await res.json();
                          // Play the answer audio after getting the answer
                          if (result && result.answer) {
                            const answerAudioUrl = `http://127.0.0.1:8000/${result.answer}`;
                            let answerAudio = new Audio(answerAudioUrl);
                            answerAudio.play();
                            setIsPlaying(false); // UI: show play for news
                            // When answer finishes, resume previous news audio
                            answerAudio.onended = () => {
                              if (
                                interruptedAudio &&
                                interruptedAudioTime !== null
                              ) {
                                interruptedAudio.currentTime =
                                  interruptedAudioTime;
                                interruptedAudio.play();
                                setIsPlaying(true);
                              }
                            };
                          }
                        } catch (err) {
                          // Optionally handle error (no alert)
                        }
                      }
                    };
                  } else {
                    recognition.stop();
                    setIsRecording(false);
                  }
                }}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              {/* Mic button for voice question */}
              {/* Button and summary moved below Recent Updates */}
            </div>
            <div className="flex items-center justify-between">
              {/* <h2 className="text-xl font-semibold tracking-tight">
                Recent Updates
              </h2> */}
              <div className="flex items-center ">
                <p className="text-muted-foreground mr-2">
                  {featuredNews ? featuredNews.summary : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Button
                className="gap-2"
                disabled={!featuredNews}
                onClick={() => {
                  if (!featuredNews || !featuredNews.audio_file_path) return;
                  const audioUrl = `http://127.0.0.1:8000/${featuredNews.audio_file_path}`;
                  if (!audio) {
                    const newAudio = new Audio(audioUrl);
                    setAudio(newAudio);
                    newAudio.play();
                    setIsPlaying(true);
                    handlePlayNews(featuredNews.audio_id?.toString() || "");
                  } else {
                    if (isPlaying) {
                      audio.pause();
                      setIsPlaying(false);
                    } else {
                      audio.play();
                      setIsPlaying(true);
                      handlePlayNews(featuredNews.audio_id?.toString() || "");
                    }
                  }
                }}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isPlaying ? "Pause Audio" : "Play Audio"}
              </Button>
              <Button variant="outline" size="icon" disabled={!featuredNews}>
                <BookmarkPlus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={!featuredNews}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent news */}
      <section className="space-y-4">
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-4">
            <NewsList newsItems={recentNews} onPlay={handlePlayNews} />
          </TabsContent>

          <TabsContent value="grid" className="mt-4">
            <NewsGrid newsItems={recentNews} onPlay={handlePlayNews} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Voice chat section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Ask About The News
        </h2>
        <Card>
          <CardContent className="p-0 overflow-hidden">
            <VoiceChatWidget />
          </CardContent>
        </Card>
      </section>

      {/* Floating voice button */}
      <VoiceButton />
    </div>
  );
}
