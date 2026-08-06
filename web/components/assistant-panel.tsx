"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, User, Send, Check, Copy, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useApiData, apiSend } from "@/lib/api-client";

export function AssistantPanel() {
  const [chat, setChat] = useApiData<{ from: "user" | "ai"; text: string }[]>("/api/ai/chat");
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chat && messages.length === 0) setMessages(chat.slice(0, 4));
  }, [chat]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setThinking(true);
    apiSend<{ from: "user" | "ai"; text: string }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ from: "user", text }),
    }).catch(() => {});
    setTimeout(() => {
      const reply = {
        from: "ai" as const,
        text: "Confirmed. I've synced this with the booking engine and WhatsApp. Would you like me to send a payment-plan PDF as well?",
      };
      setMessages((m) => [...m, reply]);
      setChat((c) => (c ? [...c, { from: "user", text }, reply] : [{ from: "user", text }, reply]));
      setThinking(false);
    }, 1200);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const seedText = chat?.[0]?.text ?? "Confirm the booking…";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
          <Bot size={15} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success border-2 border-surface" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text leading-tight">AI Sales Agent</p>
          <p className="text-[10px] text-text-subtle leading-tight">LangGraph · WhatsApp · EN/HI</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-surface-muted/50 px-4 py-3 text-sm text-text-muted animate-fade-in">
            <p className="mb-1 font-medium text-text">Converse with a live lead</p>
            <p className="text-xs">
              This is a preview of the AI Sales Agent conversation with <span className="font-medium text-text">Priya Sharma</span> (WhatsApp).
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed animate-fade-in",
                m.from === "user"
                  ? "rounded-br-sm bg-primary text-white"
                  : "rounded-bl-sm border border-border bg-surface text-text",
              )}
            >
              {m.from === "ai" && (
                <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-success">
                  <Bot size={10} /> Sales Agent
                </div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-lg rounded-bl-sm border border-border bg-surface px-3.5 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-text-subtle animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-text-subtle animate-bounce [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-text-subtle animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            rows={1}
            placeholder={messages.length === 0 ? `Reply as Priya… "${seedText}"` : "Reply as the customer…"}
            className="max-h-24 flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-40 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-text-subtle">
          <Check size={10} className="text-success" />
          Agent writes only via authorized API · human handoff supported
        </p>
      </div>
    </div>
  );
}
