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
  RefreshCw,
  Loader2,
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
  const isArabic = locale === "ar";
  const [inputValue, setInputValue] = useState("");
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

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

  const handleToggleSpeakMessage = (msgId: string, content: string) => {
    if (activeSpeakingMsgId === msgId && isSpeaking) {
      stopSpeaking();
      setActiveSpeakingMsgId(null);
    } else {
      setActiveSpeakingMsgId(msgId);
      speak(content);
    }
  };

  return (
    <div
      className="border border-border/80 bg-card rounded-2xl p-6 md:p-8 space-y-6 shadow-sm"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-neutral-950 flex items-center justify-center font-display text-sm font-semibold tracking-wider shadow-md">
            EP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-medium text-foreground">
                {t("title")}
              </h3>
              <span className="text-[0.65rem] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-medium border border-emerald-500/20">
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
          className="hidden sm:inline-flex uppercase tracking-widest text-[0.7rem] border-amber-500/30 hover:border-amber-500/60"
        >
          <Link href="/booking">
            <Calendar className="me-2 size-3.5 text-amber-500" />
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
                className="text-xs bg-accent/60 hover:bg-accent border border-border/80 px-3.5 py-1.5 rounded-full text-foreground transition-all duration-200 hover:border-amber-500/50 disabled:opacity-50 text-left"
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
          <div className="p-8 text-center border border-dashed border-border/80 rounded-xl text-muted-foreground text-xs">
            <MessageSquare className="size-8 mx-auto stroke-1 mb-2 opacity-60 text-amber-500" />
            <p>{t("emptyPrompt")}</p>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isUser = msg.role === "user";
            const isMsgSpeaking = isSpeaking && activeSpeakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="size-7 rounded-full bg-neutral-900 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 text-[0.65rem] font-bold mt-1 shadow-xs">
                    EP
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[85%] whitespace-pre-wrap transition-all ${
                    isUser
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium shadow-sm"
                      : "bg-accent/40 border border-border/80 text-foreground shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="leading-relaxed">{msg.content}</p>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeakMessage(msg.id, msg.content)}
                        className={`shrink-0 p-1.5 rounded-full transition-all ${
                          isMsgSpeaking
                            ? "bg-amber-500/20 text-amber-500 animate-pulse"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                        title={t("listenButton")}
                      >
                        {isMsgSpeaking ? (
                          <VolumeX className="size-3.5 text-amber-500" />
                        ) : (
                          <Volume2 className="size-3.5" />
                        )}
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

        {/* Sending / Thinking State */}
        {isSending && (
          <div className="flex gap-3 text-xs leading-relaxed justify-start animate-in fade-in duration-300">
            <div className="size-7 rounded-full bg-neutral-900 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 text-[0.65rem] font-bold mt-1">
              EP
            </div>
            <div className="p-4 rounded-2xl bg-accent/30 border border-border/60 text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin text-amber-500" />
              <span>
                {isArabic
                  ? "إيليونور تصيغ إجابتكِ بدقة..."
                  : "Éléonore is formulating your response..."}
              </span>
            </div>
          </div>
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
            className={`px-3 shrink-0 rounded-xl transition-all ${
              isListening
                ? "border-rose-500 text-rose-500 bg-rose-500/10 animate-pulse"
                : "border-border/80 hover:border-amber-500/50"
            }`}
            title={isListening ? t("stopVoiceInput") : t("voiceInput")}
          >
            {isListening ? (
              <MicOff className="size-3.5 text-rose-500" />
            ) : (
              <Mic className="size-3.5 text-amber-500" />
            )}
          </Button>
        )}

        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("inputPlaceholder")}
          disabled={isSending}
          className="text-xs md:text-sm bg-background/60 rounded-xl border-border/80 focus-visible:ring-amber-500/30"
          data-testid="ai-chat-input"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          data-testid="ai-chat-send-button"
          className="shrink-0 uppercase tracking-widest px-4 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400"
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
          className="w-full text-xs uppercase tracking-widest border-amber-500/30"
        >
          <Link href="/booking">
            <Calendar className="me-2 size-3.5 text-amber-500" />
            {t("bookExpert")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
