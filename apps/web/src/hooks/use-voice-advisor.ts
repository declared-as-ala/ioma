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
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [locale]);

  const speak = useCallback(
    (text: string) => {
      if (state.isMuted || !synthRef.current) return;

      synthRef.current.cancel();

      // Clean markdown tags like **bold** for voice synthesis
      const cleanText = text.replace(/[*#_~`]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.lang = locale === "ar" ? "ar-AE" : locale === "fr" ? "fr-FR" : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Match elegant voice if available
      const voices = synthRef.current.getVoices();
      const targetLangPrefix = locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en";
      const matchedVoice =
        voices.find((v) => v.lang.startsWith(targetLangPrefix) && v.name.includes("Natural")) ||
        voices.find((v) => v.lang.startsWith(targetLangPrefix));

      if (matchedVoice) {
        utterance.voice = matchedVoice;
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
    [locale, state.isMuted],
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setState((prev) => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    setState((prev) => {
      const nextMuted = !prev.isMuted;
      if (nextMuted && synthRef.current) {
        synthRef.current.cancel();
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
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
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
