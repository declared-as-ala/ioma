"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AiChatMessage } from "@ioma/types";
import { Send, Sparkles, User, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

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
  const [inputValue, setInputValue] = useState("");

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
    <div className="border border-border bg-card rounded-md p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-accent flex items-center justify-center border border-border">
            <Sparkles className="size-4 text-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg">{t("title")}</h3>
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
          <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            {t("suggestedTitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePillClick(q)}
                disabled={isSending}
                className="text-xs bg-accent/60 hover:bg-accent border border-border px-3 py-1.5 rounded-full text-foreground transition-colors disabled:opacity-50"
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
          <div className="p-8 text-center border border-dashed border-border rounded text-muted-foreground text-xs">
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
                  <div className="size-6 rounded-full bg-accent flex items-center justify-center shrink-0 border border-border mt-1">
                    <Sparkles className="size-3 text-foreground" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-md max-w-[85%] whitespace-pre-wrap ${
                    isUser
                      ? "bg-foreground text-background font-medium"
                      : "bg-accent/40 border border-border text-foreground"
                  }`}
                >
                  {msg.content}
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
      </div>

      {/* Input row */}
      <div className="pt-2 flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("inputPlaceholder")}
          disabled={isSending}
          className="text-xs"
          data-testid="ai-chat-input"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          data-testid="ai-chat-send-button"
        >
          <Send className="size-3.5" />
        </Button>
      </div>

      {/* Mobile Expert Booking link */}
      <div className="pt-2 sm:hidden text-center">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs uppercase tracking-widest"
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
