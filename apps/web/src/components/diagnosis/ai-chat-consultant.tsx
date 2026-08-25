"use client";

import { useState, useRef, useEffect } from "react";
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
  Loader2,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Bot,
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
  isOpenDefault?: boolean;
}

export function AiChatConsultant({
  chatHistory,
  suggestedQuestions,
  onSendMessage,
  isSending,
  isOpenDefault = false,
}: AiChatConsultantProps) {
  const t = useTranslations("Diagnosis.chat");
  const locale = useLocale() as Locale;
  const isArabic = locale === "ar";

  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [inputValue, setInputValue] = useState("");
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    isListening,
    startListening,
    stopListening,
    hasSpeechRecognition,
  } = useVoiceAdvisor(locale);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isSending, isOpen]);

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
    <>
      {/* 1. FLOATING FIXED LAUNCHER BUTTON (Visible on all scroll positions) */}
      <div
        className={`fixed bottom-6 z-50 flex items-center gap-3 ${
          isArabic ? "left-6 flex-row-reverse" : "right-6"
        }`}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card/90 backdrop-blur-md border border-amber-500/40 text-foreground shadow-xl hover:border-amber-500 hover:shadow-amber-500/10 transition-all duration-300 animate-in fade-in"
          >
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium">
              {isArabic ? "استشيري خبيرة إيوما" : "Ask Éléonore — AI Expert"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative size-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen
              ? "bg-neutral-900 text-white dark:bg-card dark:text-foreground border border-border rotate-90"
              : "bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-neutral-950 hover:scale-105 hover:shadow-amber-500/30 ring-4 ring-amber-500/20"
          }`}
          aria-label={isOpen ? "Close AI Consultant" : "Open AI Consultant"}
          data-testid="ai-chat-launcher"
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <span className="font-display font-bold text-xs tracking-wider">EP</span>
                <Sparkles className="size-3 text-neutral-950 fill-neutral-950 absolute -top-0.5 -right-0.5" />
              </div>
              {/* Unread dot */}
              {chatHistory.length > 0 && (
                <span className="absolute top-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background" />
              )}
            </>
          )}
        </button>
      </div>

      {/* 2. FLOATING FIXED CHAT WIDGET WINDOW */}
      {isOpen && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`fixed bottom-24 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[82vh] h-[580px] flex flex-col rounded-2xl border border-amber-500/30 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 ${
            isArabic ? "left-4 sm:left-8" : "right-4 sm:right-8"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-gradient-to-r from-card via-card to-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-neutral-950 flex items-center justify-center font-display text-xs font-bold shadow-sm">
                EP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {isArabic ? "إيليونور — إيوما باريس" : "Éléonore — IOMA Paris"}
                  </h3>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-emerald-500/20">
                    {t("onlineStatus")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isArabic
                    ? "خبيرة التشخيص المباشر"
                    : "Lead Diagnostic Skincare Advisor"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-amber-500"
                title={t("bookExpert")}
              >
                <Link href="/booking">
                  <Calendar className="size-3.5" />
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                aria-label="Minimize Chat"
              >
                <Minus className="size-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {chatHistory.length === 0 ? (
              <div className="py-12 px-4 text-center text-muted-foreground space-y-3">
                <div className="size-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Bot className="size-6 stroke-1.5" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <p className="font-medium text-foreground text-xs">
                    {isArabic
                      ? "مرحباً بكِ في استشارتكِ الخاصة"
                      : "Welcome to your consultation"}
                  </p>
                  <p className="text-[11px] leading-relaxed">{t("emptyPrompt")}</p>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isUser = msg.role === "user";
                const isMsgSpeaking = isSpeaking && activeSpeakingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 leading-relaxed ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="size-6 rounded-full bg-neutral-900 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 text-[10px] font-bold mt-1">
                        EP
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap transition-all ${
                        isUser
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium shadow-xs"
                          : "bg-accent/50 border border-border/80 text-foreground shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="leading-relaxed text-xs">{msg.content}</p>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleToggleSpeakMessage(msg.id, msg.content)}
                            className={`shrink-0 p-1 rounded-full transition-all ${
                              isMsgSpeaking
                                ? "bg-amber-500/20 text-amber-500 animate-pulse"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                            title={t("listenButton")}
                          >
                            {isMsgSpeaking ? (
                              <VolumeX className="size-3 text-amber-500" />
                            ) : (
                              <Volume2 className="size-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {isUser && (
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border mt-1">
                        <User className="size-3 text-foreground" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Thinking / Formulation state */}
            {isSending && (
              <div className="flex gap-2.5 leading-relaxed justify-start animate-in fade-in duration-200">
                <div className="size-6 rounded-full bg-neutral-900 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 text-[10px] font-bold mt-1">
                  EP
                </div>
                <div className="p-3 rounded-2xl bg-accent/40 border border-border/60 text-muted-foreground flex items-center gap-2 text-xs">
                  <Loader2 className="size-3.5 animate-spin text-amber-500" />
                  <span>
                    {isArabic
                      ? "إيليونور تصيغ إجابتكِ بدقة..."
                      : "Éléonore is formulating your response..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Pills */}
          {suggestedQuestions && suggestedQuestions.length > 0 && (
            <div className="px-4 py-2 border-t border-border/40 bg-accent/20">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePillClick(q)}
                    disabled={isSending}
                    className="shrink-0 text-[11px] bg-background hover:bg-accent border border-border/80 px-3 py-1 rounded-full text-foreground transition-all duration-150 hover:border-amber-500/50 disabled:opacity-50 text-start truncate max-w-[260px]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-border/60 bg-background flex items-center gap-2">
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
                className={`size-9 p-0 shrink-0 rounded-xl transition-all ${
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
              className="text-xs bg-accent/40 rounded-xl border-border/80 focus-visible:ring-amber-500/30 h-9"
              data-testid="ai-chat-input"
            />

            <Button
              size="sm"
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              data-testid="ai-chat-send-button"
              className="size-9 p-0 shrink-0 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-sm"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
