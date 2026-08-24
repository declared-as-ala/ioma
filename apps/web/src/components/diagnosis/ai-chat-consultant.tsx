"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import type { AiChatMessage } from "@ioma/types";
import {
  Send,
  Sparkles,
  User,
  Calendar,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useVoiceAdvisor } from "@/hooks/use-voice-advisor";

interface AiChatConsultantProps {
  chatHistory: AiChatMessage[];
  suggestedQuestions: string[];
  onSendMessage: (message: string) => void;
  isSending?: boolean;
}

export function AiChatConsultant({
  chatHistory,
  suggestedQuestions,
  onSendMessage,
  isSending,
}: AiChatConsultantProps) {
  const t = useTranslations("Diagnosis.chat");
  const locale = useLocale() as Locale;
  const [inputValue, setInputValue] = useState("");

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    isListening,
    startListening,
    stopListening,
    hasSpeechRecognition,
  } = useVoiceAdvisor(locale);

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handlePillClick = (question: string) => {
    if (isSending) return;
    onSendMessage(question);
  };

  return (
    <div className="border border-border/80 bg-card rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center font-display text-sm font-semibold tracking-wider">
            EP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-medium text-foreground">
                {t("title")}
              </h3>
              <span className="text-[0.65rem] bg-accent px-2 py-0.5 rounded-full text-muted-foreground uppercase tracking-widest font-medium border border-border/60">
                {t("onlineStatus")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex uppercase tracking-widest text-[0.7rem]"
        >
          <Link href="/booking">
            <Calendar className="me-2 size-3.5" />
            {t("bookExpert")}
          </Link>
        </Button>
      </div>

      {/* Suggested Questions Pills */}
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
            {t("suggestedTitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePillClick(q)}
                disabled={isSending}
                className="text-xs bg-accent/60 hover:bg-accent border border-border/80 px-3.5 py-1.5 rounded-full text-foreground transition-all duration-200 hover:border-foreground/40 disabled:opacity-50 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {chatHistory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/80 rounded-lg text-muted-foreground text-xs">
            <MessageSquare className="size-8 mx-auto stroke-1 mb-2 opacity-60" />
            <p>{t("emptyPrompt")}</p>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="size-7 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 text-[0.65rem] font-bold mt-1">
                    EP
                  </div>
                )}
                <div
                  className={`p-4 rounded-xl max-w-[85%] whitespace-pre-wrap ${
                    isUser
                      ? "bg-foreground text-background font-medium"
                      : "bg-accent/40 border border-border/80 text-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="leading-relaxed">{msg.content}</p>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speak(msg.content);
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                        title={t("listenButton")}
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {isUser && (
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border mt-1">
                    <User className="size-3.5 text-foreground" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input row */}
      <div className="pt-2 flex items-center gap-2">
        {hasSpeechRecognition && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening((text) => {
                  setInputValue((prev) => (prev ? `${prev} ${text}` : text));
                });
              }
            }}
            className={`px-3 shrink-0 ${
              isListening ? "border-red-500 text-red-500 animate-pulse" : ""
            }`}
            title={isListening ? t("stopVoiceInput") : t("voiceInput")}
          >
            {isListening ? (
              <MicOff className="size-3.5" />
            ) : (
              <Mic className="size-3.5" />
            )}
          </Button>
        )}

        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("inputPlaceholder")}
          disabled={isSending}
          className="text-xs md:text-sm bg-background/60"
          data-testid="ai-chat-input"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          data-testid="ai-chat-send-button"
          className="shrink-0 uppercase tracking-widest px-4"
        >
          <Send className="size-3.5" />
        </Button>
      </div>

      {/* Mobile Expert Booking link */}
      <div className="pt-2 sm:hidden text-center">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full text-xs uppercase tracking-widest"
        >
          <Link href="/booking">
            <Calendar className="me-2 size-3.5" />
            {t("bookExpert")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
