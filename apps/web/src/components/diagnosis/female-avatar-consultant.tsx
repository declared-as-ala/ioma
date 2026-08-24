"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Mic,
  MicOff,
} from "lucide-react";
import type { AvatarSpeechSubtitle, TalkingAvatarResult } from "@ioma/types";
import { useVoiceAdvisor } from "@/hooks/use-voice-advisor";

interface FemaleAvatarConsultantProps {
  locale: "en" | "ar" | "fr";
  analysisId?: string;
  narrativeText?: string;
  avatarResult?: TalkingAvatarResult | null;
  onHighlightTopic?: (topic: string | null) => void;
  onAskQuestion?: (question: string) => void;
  className?: string;
}

export function FemaleAvatarConsultant({
  locale,
  analysisId,
  narrativeText,
  avatarResult,
  onHighlightTopic,
  onAskQuestion,
  className = "",
}: FemaleAvatarConsultantProps) {
  const isArabic = locale === "ar";
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<AvatarSpeechSubtitle | null>(null);
  const [mouthOpen, setMouthOpen] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Web Speech Fallback Hook
  const {
    isSpeaking,
    isListening,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    hasSpeechRecognition,
  } = useVoiceAdvisor(isArabic ? "ar" : "en");

  // Default speech script if no avatar result exists yet
  const defaultEnglishText =
    narrativeText ||
    "Welcome to IOMA Paris. I have analyzed your skin photograph. Your primary priority is deep cellular hydration to protect against continuous air conditioning in Dubai. I have selected authentic formulations to restore your radiant comfort.";

  const defaultArabicText =
    narrativeText ||
    "أهلاً بكِ في إيوما باريس. لقد قمتُ بتحليل بشرتكِ بعناية من صورتكِ. أولويتنا الأساسية هي الترطيب الجلدي العميق لمواجهة جفاف التكييف في دبي. لقد صممتُ لكِ روتيناً مخصصاً لتعزيز نضارة وراحة بشرتكِ.";

  const speechText = isArabic ? defaultArabicText : defaultEnglishText;

  // Subtitles from backend or generated fallback
  const subtitles: AvatarSpeechSubtitle[] = avatarResult?.subtitles || [
    {
      startMs: 400,
      endMs: 3800,
      text: isArabic
        ? "أهلاً بكِ في إيوما باريس. لقد قمتُ بدراسة مؤشرات بشرتكِ بعناية من صورتكِ."
        : "Welcome to IOMA Paris. I have carefully studied the cosmetic indicators from your skin photograph.",
      activeConcernKey: "overview",
    },
    {
      startMs: 4200,
      endMs: 8500,
      text: isArabic
        ? "أظهر التحليل البصري أن مستوى الترطيب يحتاج إلى تعزيز لمواجهة تأثير التكييف في دبي."
        : "Your visual analysis indicates that hydration is our primary priority against continuous air conditioning exposure.",
      activeConcernKey: "hydration",
    },
    {
      startMs: 8900,
      endMs: 13500,
      text: isArabic
        ? "لقد صممتُ لكِ روتيناً متكاملاً من تركيبات إيوما الفرنسية لتعزيز راحة ونضارة بشرتكِ."
        : "I have tailored a complete ritual from pure IOMA formulations designed to restore cellular comfort and radiance.",
      activeConcernKey: "recommendations",
    },
  ];

  // Natural talking lip modulation loop
  const updateSubtitleAndLipSync = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsedMs = Date.now() - startTimeRef.current;

    // Find active subtitle
    const active = subtitles.find((s) => elapsedMs >= s.startMs && elapsedMs <= s.endMs);
    if (active) {
      setCurrentSubtitle(active);
      onHighlightTopic?.(active.activeConcernKey || null);
    } else {
      const last = subtitles[subtitles.length - 1];
      if (last && elapsedMs > last.endMs) {
        setCurrentSubtitle(null);
        onHighlightTopic?.(null);
        setIsPlaying(false);
        setMouthOpen(0);
        return;
      }
    }

    // Natural rhythmic mouth movement during speech
    if (isPlaying) {
      const freq = (Date.now() % 350) / 350;
      const mouthValue = Math.sin(freq * Math.PI) * 0.7 + Math.random() * 0.3;
      setMouthOpen(mouthValue);
    } else {
      setMouthOpen(0);
    }

    animFrameRef.current = requestAnimationFrame(updateSubtitleAndLipSync);
  }, [isPlaying, onHighlightTopic, subtitles]);

  const handleStartConsultation = () => {
    setIsStarted(true);
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    if (avatarResult?.videoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else {
      if (!isMuted) {
        speak(speechText);
      }
    }

    animFrameRef.current = requestAnimationFrame(updateSubtitleAndLipSync);
  };

  const handleTogglePlay = () => {
    if (!isStarted) {
      handleStartConsultation();
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (videoRef.current) videoRef.current.pause();
      stopSpeaking();
      setMouthOpen(0);
    } else {
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      if (videoRef.current) videoRef.current.play().catch(() => {});
      else if (!isMuted) speak(speechText);
      animFrameRef.current = requestAnimationFrame(updateSubtitleAndLipSync);
    }
  };

  const handleReplay = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      stopSpeaking();
      if (!isMuted) speak(speechText);
    }
    animFrameRef.current = requestAnimationFrame(updateSubtitleAndLipSync);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) {
      stopSpeaking();
      if (videoRef.current) videoRef.current.muted = true;
    } else {
      if (videoRef.current) videoRef.current.muted = false;
      if (isPlaying) speak(speechText);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        if (onAskQuestion && transcript.trim().length > 0) {
          onAskQuestion(transcript);
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-b from-stone-950 via-stone-900 to-black text-white shadow-2xl ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header Consultant Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border border-gold-400/60 overflow-hidden bg-stone-800">
              <img
                src="/images/ai-expert/eleonore-avatar.webp"
                alt="IOMA Skin Expert"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-sm font-medium text-cream-100 tracking-wide">
                {isArabic ? "إليونور — إيوما باريس" : "Éléonore — IOMA Paris"}
              </h3>
              <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <p className="text-[11px] text-stone-400">
              {isArabic
                ? "خبير تشخيص العناية الراقية بالبشرة"
                : "Lead Diagnostic Skincare Consultant"}
            </p>
          </div>
        </div>

        {/* Live Audio Indicator */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span>{isArabic ? "تتحدث الآن" : "Speaking"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Video / Talking Avatar Stage */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-stone-950 overflow-hidden">
        {/* Real Avatar Video (if provider URL exists) */}
        {avatarResult?.videoUrl ? (
          <video
            ref={videoRef}
            src={avatarResult.videoUrl}
            poster={avatarResult.posterUrl || "/images/ai-expert/eleonore-poster.webp"}
            className="h-full w-full object-cover"
            playsInline
            muted={isMuted}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentSubtitle(null);
              onHighlightTopic?.(null);
            }}
          />
        ) : (
          /* High-Fidelity Studio Consultant Simulation */
          <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-t from-stone-950 via-stone-900 to-stone-950">
            {/* Ambient Background Luxury Studio Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-900/15 via-transparent to-black" />

            {/* Consultant Portrait & Natural Animated Breathing Layer */}
            <div
              className={`relative h-full w-full max-w-md mx-auto flex items-center justify-center transition-transform duration-700 ${
                isPlaying ? "scale-[1.01]" : "scale-100"
              }`}
            >
              <img
                src="/images/ai-expert/eleonore-poster.webp"
                alt="IOMA French Skincare Consultant"
                className="h-full w-auto max-h-full object-contain filter drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80";
                }}
              />

              {/* Natural subtle lip-movement overlay when speaking */}
              {isPlaying && mouthOpen > 0.1 && (
                <div
                  className="absolute bottom-[36%] left-[49.5%] -translate-x-1/2 w-4 h-1.5 rounded-full bg-stone-950/40 blur-[1px] transition-all duration-75"
                  style={{
                    transform: `translate(-50%, 0) scaleY(${1 + mouthOpen * 1.8})`,
                    opacity: 0.35 + mouthOpen * 0.4,
                  }}
                />
              )}
            </div>

            {/* Speaking Waveform Visualizer */}
            {isPlaying && (
              <div className="absolute top-4 right-4 flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {[12, 18, 10, 22, 14].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 rounded-full bg-gold-400 animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${idx * 120}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial Overlay Prompt: "MEET YOUR IOMA SKIN EXPERT" */}
        {!isStarted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-center transition-opacity duration-300">
            <div className="mb-4 inline-flex p-3.5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-400 shadow-lg shadow-gold-500/10">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-light text-cream-100 mb-2">
              {isArabic
                ? "تحليلكِ التجميلي جاهز للمشاهدة"
                : "Your Skincare Diagnosis is Ready"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
              {isArabic
                ? "استمعي الآن إلى استشارتكِ الخاصة مع خبيرة إيوما باريس لتوضيح الملاحظات والروتين الموصى به."
                : "Experience a private consultation with your IOMA beauty expert as she walks you through your skin observations."}
            </p>
            <button
              type="button"
              onClick={handleStartConsultation}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-gold-500 to-amber-600 text-stone-950 font-medium text-sm tracking-wide shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              <Play className="h-4 w-4 fill-stone-950" />
              <span>
                {isArabic
                  ? "الاستماع للاستشارة مع خبيرة إيوما"
                  : "Meet Your IOMA Skin Expert"}
              </span>
            </button>
          </div>
        )}

        {/* Real-Time Synchronized Subtitle Bar */}
        {showSubtitles && (currentSubtitle || isPlaying) && (
          <div className="absolute bottom-3 left-4 right-4 z-10 transition-all duration-200">
            <div className="rounded-xl bg-black/85 backdrop-blur-md px-4 py-2.5 text-center border border-white/10 shadow-lg">
              <p className="text-xs sm:text-sm text-cream-100 leading-relaxed font-light">
                {currentSubtitle?.text || (isArabic ? "جارٍ التحدث..." : "Consulting...")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control & Interactive Voice Bar */}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 bg-stone-950/80 backdrop-blur-md">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <button
            type="button"
            onClick={handleReplay}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white transition-colors"
            title="Replay explanation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-gold-400" />}
          </button>
        </div>

        {/* User Voice Mic & Subtitle Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSubtitles((prev) => !prev)}
            className={`text-xs px-2.5 py-1 rounded border transition-colors ${
              showSubtitles
                ? "bg-gold-500/20 text-gold-300 border-gold-500/40"
                : "bg-white/5 text-stone-400 border-white/10"
            }`}
          >
            CC
          </button>

          {hasSpeechRecognition && (
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                isListening
                  ? "bg-red-500/20 border border-red-500 text-red-400 animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak your question"}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              <span>{isListening ? (isArabic ? "جارٍ الاستماع..." : "Listening...") : (isArabic ? "تحدثي بالسؤال" : "Ask by Voice")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
