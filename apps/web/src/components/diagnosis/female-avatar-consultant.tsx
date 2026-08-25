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
  Captions,
  Radio,
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
  const [currentSubtitle, setCurrentSubtitle] = useState<AvatarSpeechSubtitle | null>(
    null,
  );
  const [mouthOpen, setMouthOpen] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Female Voice Hook
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
      const freq = (Date.now() % 320) / 320;
      const mouthValue = Math.sin(freq * Math.PI) * 0.65 + Math.random() * 0.25;
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
  };

  const handleTogglePlay = () => {
    if (!isStarted) {
      handleStartConsultation();
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      stopSpeaking();
      if (videoRef.current) videoRef.current.pause();
    } else {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      } else {
        if (!isMuted) speak(speechText);
      }
    }
  };

  const handleReplay = () => {
    stopSpeaking();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    startTimeRef.current = Date.now();
    setIsPlaying(true);
    setIsStarted(true);
    if (!isMuted) {
      speak(speechText);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeaking();
      if (videoRef.current) videoRef.current.muted = true;
    } else {
      if (videoRef.current) videoRef.current.muted = false;
      if (isPlaying) speak(speechText);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateSubtitleAndLipSync);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, updateSubtitleAndLipSync]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-amber-500/20 bg-neutral-950 shadow-2xl ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top Luxury Consultant Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-amber-500/30">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-medium tracking-wide text-amber-200 uppercase">
            {isArabic ? "إيليونور — خبيرة التجميل الذكية" : "Éléonore — IOMA Skin Expert"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setShowSubtitles((prev) => !prev)}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              showSubtitles
                ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                : "bg-neutral-900/70 border-white/10 text-neutral-400 hover:text-white"
            }`}
            title={isArabic ? "ترجمة الحوار" : "Toggle Subtitles"}
          >
            <Captions className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-neutral-900/70 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all"
            title={
              isMuted
                ? isArabic
                  ? "تشغيل الصوت"
                  : "Unmute"
                : isArabic
                  ? "كتم الصوت"
                  : "Mute"
            }
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Avatar Stage */}
      <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black overflow-hidden flex items-center justify-center">
        {/* If real video URL exists */}
        {avatarResult?.videoUrl ? (
          <video
            ref={videoRef}
            src={avatarResult.videoUrl}
            poster={avatarResult.posterUrl || "/images/ai-expert/eleonore-poster.webp"}
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
            onEnded={() => {
              setIsPlaying(false);
              onHighlightTopic?.(null);
            }}
          />
        ) : (
          /* High-Fidelity Studio Animated Stage */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Ambient Backlight Glow */}
            <div
              className={`absolute w-72 h-72 rounded-full blur-3xl transition-opacity duration-1000 ${
                isPlaying ? "bg-amber-500/20 opacity-80" : "bg-amber-600/10 opacity-30"
              }`}
            />

            {/* Consultant Portrait Graphic */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src="/images/ai-expert/eleonore-poster.webp"
                alt="Éléonore IOMA Consultant"
                className="w-full h-full object-cover object-top filter brightness-95 contrast-105"
                onError={(e) => {
                  // Fallback to elegant SVG illustration if webp poster missing
                  (e.target as HTMLElement).style.display = "none";
                }}
              />

              {/* Dynamic Lip Sync Simulation Layer */}
              {isPlaying && (
                <div
                  className="absolute z-10 w-8 h-3 rounded-full bg-rose-950/40 blur-xs transition-transform duration-75 pointer-events-none"
                  style={{
                    bottom: "38%",
                    transform: `scaleY(${1 + mouthOpen * 1.8}) scaleX(${1 + mouthOpen * 0.3})`,
                  }}
                />
              )}

              {/* Speaking Waveform Indicator */}
              {isPlaying && (
                <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-amber-500/40">
                  <span className="w-1 h-3 bg-amber-400 rounded-full animate-[pulse_0.4s_infinite]" />
                  <span className="w-1 h-5 bg-amber-400 rounded-full animate-[pulse_0.6s_infinite]" />
                  <span className="w-1 h-2 bg-amber-400 rounded-full animate-[pulse_0.5s_infinite]" />
                  <span className="w-1 h-4 bg-amber-400 rounded-full animate-[pulse_0.7s_infinite]" />
                  <span className="text-[10px] font-semibold text-amber-200 ml-1.5 uppercase tracking-wider">
                    {isArabic ? "صوت مباشر" : "Live Voice"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Start Overlay CTA */}
        {!isStarted && (
          <div className="absolute inset-0 z-30 bg-neutral-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <button
              onClick={handleStartConsultation}
              className="group relative flex items-center justify-center w-18 h-18 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all duration-300 active:scale-95"
            >
              <Play className="w-8 h-8 fill-neutral-950 ml-1 group-hover:scale-110 transition-transform" />
            </button>
            <h3 className="mt-4 text-base font-medium text-white tracking-wide">
              {isArabic ? "استمعي إلى استشارة خبيرة إيوما" : "Listen to Your IOMA Expert"}
            </h3>
            <p className="mt-1 text-xs text-neutral-400 max-w-sm">
              {isArabic
                ? "تقييم دقيق لمؤشرات بشرتكِ مع شرح الروتين المناسب لمناخ دبي"
                : "Personalized cosmetic assessment and tailored ritual for Dubai climate"}
            </p>
          </div>
        )}

        {/* Real-time Subtitles Banner */}
        {showSubtitles && isStarted && currentSubtitle && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
            <div className="max-w-xl px-4 py-2.5 rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-amber-500/30 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs md:text-sm font-medium text-amber-100/90 leading-relaxed">
                {currentSubtitle.text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Minimal Luxury Control Bar */}
      <div className="px-5 py-3.5 bg-neutral-900/90 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-md"
            title={
              isPlaying
                ? isArabic
                  ? "إيقاف مؤقت"
                  : "Pause"
                : isArabic
                  ? "تشغيل"
                  : "Play"
            }
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-neutral-950" />
            ) : (
              <Play className="w-4 h-4 fill-neutral-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleReplay}
            className="p-2 rounded-full text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-all"
            title={isArabic ? "إعادة الاستشارة" : "Replay Consultation"}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <span className="text-xs text-neutral-400 hidden sm:inline-block">
            {isPlaying
              ? isArabic
                ? "جاري الاستماع إلى إيليونور..."
                : "Éléonore is speaking..."
              : isArabic
                ? "جاهزة للإجابة على أسئلتكِ"
                : "Ready to answer your questions"}
          </span>
        </div>

        {/* Voice Input Question Shortcut */}
        {hasSpeechRecognition && onAskQuestion && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening((transcript) => {
                    if (transcript.trim()) {
                      onAskQuestion(transcript.trim());
                    }
                  });
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isListening
                  ? "bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse"
                  : "bg-neutral-800 border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-700"
              }`}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {isListening
                  ? isArabic
                    ? "جاري الاستماع..."
                    : "Listening..."
                  : isArabic
                    ? "تحدثي مع الخبيرة"
                    : "Speak to Expert"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
