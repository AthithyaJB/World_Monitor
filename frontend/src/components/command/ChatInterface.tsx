"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { queryAI } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUERIES = [
  "What's trending in K-beauty right now?",
  "Which skincare ingredients are gaining momentum?",
  "Compare makeup trends in US vs Europe",
  "What are the top rising beauty products this week?",
  "Analyze sentiment around retinol products",
  "What beauty trends are emerging on TikTok?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (query?: string) => {
    const q = query || input;
    if (!q.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await queryAI(q);
      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm unable to process your query right now. Please ensure the backend is running and the Anthropic API key is configured.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              AI Trend Intelligence
            </h3>
            <p className="mb-6 max-w-md text-center text-sm text-muted">
              Ask questions about beauty trends, get AI-powered insights, and
              generate reports from real-time data.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="rounded-lg border border-border bg-card p-3 text-left text-xs text-muted transition-all hover:border-accent/30 hover:bg-card-hover hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-accent text-white"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                <div className="prose prose-sm prose-invert max-w-none">
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className="mb-1 text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-sm text-muted">Analyzing trends...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about beauty trends..."
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white transition-all hover:bg-accent-light disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
