"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Locale } from "@ioma/config";

interface VoiceAdvisorState {
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  transcript: string;
}

export function useVoiceAdvisor(locale: Locale = "en") {
  const [state, setState] = useState<VoiceAdvisorState>({
    isSpeaking: false,
    isListening: false,
    isMuted: false,
    hasSpeechRecognition: false,
    hasSpeechSynthesis: false,
    transcript: "",
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSynthesis = "speechSynthesis" in window;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const hasRecognition = Boolean(SpeechRecognition);

      if (hasSynthesis) {
        synthRef.current = window.speechSynthesis;
      }

      if (hasRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = locale === "ar" ? "ar-AE" : locale === "fr" ? "fr-FR" : "en-US";
          recognitionRef.current = rec;
        } catch {
          // Recognition setup fallback
        }
      }

      setState((prev) => ({
        ...prev,
        hasSpeechSynthesis: hasSynthesis,
        hasSpeechRecognition: hasRecognition,
      }));
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [locale]);

  const speak = useCallback(
    async (text: string) => {
      if (state.isMuted) return;

      // Stop any existing audio or speech
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }

      const cleanText = text.replace(/[*#_~`]/g, "").trim();
      if (!cleanText) return;

      // 1. First Attempt: Server-side High-Fidelity Female Neural TTS
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3200";
        const res = await fetch(`${apiUrl}/api/ai-analysis/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText, locale }),
          signal: abortControllerRef.current.signal,
        });

        if (res.ok) {
          const data = (await res.json()) as { audioBase64?: string; audioUrl?: string };
          const audioSrc = data.audioBase64 || data.audioUrl;

          if (audioSrc) {
            const audio = new Audio(audioSrc);
            audioPlayerRef.current = audio;

            audio.onplay = () => {
              setState((prev) => ({ ...prev, isSpeaking: true }));
            };
            audio.onended = () => {
              setState((prev) => ({ ...prev, isSpeaking: false }));
              audioPlayerRef.current = null;
            };
            audio.onerror = () => {
              setState((prev) => ({ ...prev, isSpeaking: false }));
              audioPlayerRef.current = null;
              speakWithBrowserFallback(cleanText, locale);
            };

            await audio.play();
            return;
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }

      // 2. Fallback: Browser Speech Synthesis with STRICT Female Filter
      speakWithBrowserFallback(cleanText, locale);
    },
    [locale, state.isMuted],
  );

  const speakWithBrowserFallback = useCallback(
    (cleanText: string, activeLocale: Locale) => {
      if (!synthRef.current || state.isMuted) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang =
        activeLocale === "ar" ? "ar-AE" : activeLocale === "fr" ? "fr-FR" : "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1.05; // Slightly higher pitch to guarantee a pleasant feminine tone

      const voices = synthRef.current.getVoices();
      const targetLangPrefix =
        activeLocale === "ar" ? "ar" : activeLocale === "fr" ? "fr" : "en";

      // Verified list of female voice identifiers across Windows, Edge, Chrome, Safari, and Android
      const femaleKeywords = [
        "female",
        "zira",
        "jenny",
        "aria",
        "sonia",
        "fatima",
        "salma",
        "denise",
        "cosette",
        "samantha",
        "victoria",
        "karen",
        "moira",
        "tessa",
        "ava",
        "chloe",
        "amira",
        "laila",
        "noor",
        "hoda",
        "meryem",
        "najat",
        "zeina",
        "mariam",
        "siri",
        "natural",
      ];

      // Male voice reject list to prevent male voice selection
      const maleKeywords = [
        "david",
        "mark",
        "george",
        "naayf",
        "paul",
        "richard",
        "guy",
        "male",
        "james",
        "alex",
        "fred",
        "daniel",
        "thomas",
        "nicolas",
        "hamed",
        "shakir",
      ];

      const matchingLangVoices = voices.filter((v) =>
        v.lang.startsWith(targetLangPrefix),
      );

      // Find an explicit female voice
      const explicitFemaleVoice = matchingLangVoices.find((v) => {
        const nameLower = v.name.toLowerCase();
        const isMale = maleKeywords.some((m) => nameLower.includes(m));
        if (isMale) return false;
        return femaleKeywords.some((f) => nameLower.includes(f));
      });

      // Otherwise find any voice that is NOT explicitly male
      const safeVoice =
        explicitFemaleVoice ||
        matchingLangVoices.find((v) => {
          const nameLower = v.name.toLowerCase();
          return !maleKeywords.some((m) => nameLower.includes(m));
        });

      if (safeVoice) {
        utterance.voice = safeVoice;
      }

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true }));
      };
      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };
      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };

      synthRef.current.speak(utterance);
    },
    [state.isMuted],
  );

  const stopSpeaking = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((prev) => {
      const nextMuted = !prev.isMuted;
      if (nextMuted) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      }
      return { ...prev, isMuted: nextMuted, isSpeaking: false };
    });
  }, []);

  const startListening = useCallback(
    (onResult?: (text: string) => void) => {
      if (!recognitionRef.current) return;

      try {
        const rec = recognitionRef.current;
        rec.lang = locale === "ar" ? "ar-AE" : locale === "fr" ? "fr-FR" : "en-US";

        rec.onstart = () => {
          setState((prev) => ({ ...prev, isListening: true, transcript: "" }));
        };

        rec.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setState((prev) => ({ ...prev, transcript: transcriptText }));
          if (event.results[current].isFinal && onResult) {
            onResult(transcriptText);
          }
        };

        rec.onerror = () => {
          setState((prev) => ({ ...prev, isListening: false }));
        };

        rec.onend = () => {
          setState((prev) => ({ ...prev, isListening: false }));
        };

        rec.start();
      } catch {
        setState((prev) => ({ ...prev, isListening: false }));
      }
    },
    [locale],
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState((prev) => ({ ...prev, isListening: false }));
    }
  }, []);

  return {
    ...state,
    speak,
    stopSpeaking,
    toggleMute,
    startListening,
    stopListening,
  };
}
