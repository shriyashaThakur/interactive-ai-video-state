"use client";

import { useState, useRef, useEffect } from "react";
import {
  Repeat2,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

const VIDEO_SOURCES = ["/video1.mp4", "/video2.mp4"];

type Message = {
  role: "user" | "ai";
  content: string;
};

const ZARA_WELCOME_MSG =
  "Hi 👋 I’m your Zara AI Stylist. Ask me anything about outfits, looks, or how to style your next purchase!";

export default function MobileVideoPrototype() {
  const [videoIndex, setVideoIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: ZARA_WELCOME_MSG },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleSwap = () => {
    setVideoIndex((prev) => (prev === 0 ? 1 : 0));
  };

  const handleChatOpen = () => {
    setChatOpen(true);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 400);
  };

  const handleChatClose = () => setChatOpen(false);

  // Scroll to bottom when messages change or loading
  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, chatOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message || isLoading) return;
    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);
    setChatInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: message, 
          currentVideo: VIDEO_SOURCES[videoIndex] 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch AI reply.");
      }

      const data = await res.json();
      const aiMsg =
        typeof data.reply === "string"
          ? data.reply
          : "Sorry, I couldn’t process that. Please try again!";

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: aiMsg },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full font-sans bg-black overflow-hidden">
      {/* Video Background */}
      <video
        key={VIDEO_SOURCES[videoIndex]} // re-render on source swap for autoplay
        src={VIDEO_SOURCES[videoIndex]}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Overlay Gradient for premium polish */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />

      {/* Logo Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <span className="text-xl font-semibold tracking-widest text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.13)] select-none">
          ZARA <span className="mx-1 opacity-70">x</span> <span className="font-light">FLAM</span>
        </span>
      </div>

      {/* Buttons (mobile first: bottom right, desktop: right mid) */}
      <div className="absolute z-20 flex flex-row gap-4 items-end bottom-6 right-6 sm:flex-col sm:items-center sm:justify-center sm:top-1/2 sm:bottom-auto sm:right-8 sm:-translate-y-1/2">
        {/* Swap Look */}
        <button
          aria-label="Swap Look"
          onClick={handleSwap}
          className="mb-2 flex items-center gap-2 rounded-full bg-black/60 hover:bg-zinc-900/85 active:scale-95 transition-all px-5 py-3 text-white shadow-lg glass border border-white/5 backdrop-blur-md"
        >
          <Repeat2 className="w-5 h-5" strokeWidth={2.2} />
          <span className="font-medium text-base tracking-tight">Swap Look</span>
        </button>
        {/* Ask AI Stylist */}
        <button
          aria-label="Ask AI Stylist"
          onClick={handleChatOpen}
          className="flex items-center gap-2 rounded-full bg-white/95 hover:bg-white/80 active:scale-95 transition-all px-5 py-3 text-black shadow-lg border border-black/10 backdrop-blur-md"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2.2} />
          <span className="font-medium text-base tracking-tight opacity-90">Ask AI Stylist</span>
        </button>
      </div>

      {/* Glassmorphism Bottom Sheet Drawer */}
      <div
        className={`fixed left-0 w-full z-40 transition-all duration-400 
          ${
            chatOpen
              ? "bottom-0"
              : "-bottom-[60vh] pointer-events-none"
          }
        `}
        style={{
          height: "53vh",
          minHeight: "320px",
          maxHeight: "100svh"
        }}
      >
        {/* Backdrop (click to close) */}
        {chatOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={handleChatClose}
            aria-hidden
          />
        )}

        {/* Chat Sheet */}
        <div className="relative h-full max-h-full z-40 rounded-t-xl border-t border-white/10 bg-black/40 backdrop-blur-md shadow-2xl flex flex-col">
          {/* Close button */}
          <button
            onClick={handleChatClose}
            aria-label="Close chat drawer"
            className="absolute top-4 right-5 z-50 p-2 rounded-full text-white/80 hover:text-white bg-black/30 hover:bg-black/60 backdrop-blur"
          >
            <X className="h-6 w-6" />
          </button>
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-4 pt-10 pb-2">
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) =>
                msg.role === "ai" ? (
                  <div
                    key={idx}
                    className="self-start max-w-[75%] bg-white/20 rounded-xl py-2.5 px-4 shadow backdrop-blur-[2px]"
                  >
                    <span className="font-semibold text-white text-sm tracking-wide">
                      Zara AI Stylist
                    </span>
                    <p className="text-white/95 mt-1 leading-relaxed text-base whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="self-end max-w-[75%] bg-black/70 rounded-xl py-2.5 px-4 shadow-lg border border-white/10 backdrop-blur-[1.5px] text-right"
                  >
                    <span className="text-xs font-semibold text-zinc-400 tracking-wide block mb-0.5">
                      You
                    </span>
                    <p className="text-white mt-1 leading-relaxed text-base whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                )
              )}
              {isLoading && (
                <div className="self-start max-w-[75%] bg-white/10 rounded-xl py-2.5 px-4 shadow backdrop-blur-[2px] flex items-center gap-2">
                  <span className="text-white/70 font-medium text-sm opacity-95">Zara AI Stylist</span>
                  <span className="animate-pulse text-white/90 text-base ml-2">Typing...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          </div>
          {/* Sticky input area */}
          <form
            className="relative bg-black/60 backdrop-blur-lg border-t border-white/10 px-2 py-3 flex items-center gap-2"
            onSubmit={handleSubmit}
          >
            <input
              ref={chatInputRef}
              type="text"
              className="flex-1 rounded-lg bg-white/90 focus:bg-white/100 placeholder-zinc-500 px-4 py-2 text-black text-base outline-none transition"
              placeholder="Type your message…"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ml-1 rounded-full bg-zara-black w-10 h-10 flex items-center justify-center text-white bg-black/85 hover:bg-black transition"
              disabled={isLoading || chatInput.trim() === ""}
              tabIndex={0}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}