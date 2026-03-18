"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Vehicle, KPISnapshot } from "@/types";
import { generateResponse, QUICK_ACTIONS, ChatMessage } from "@/lib/ai-chat";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIChatProps {
  vehicles: Vehicle[];
  kpis: KPISnapshot;
  onSelectVehicle: (vehicleId: string) => void;
  lang: "en" | "nl";
}

function formatMessageContent(
  content: string,
  vehicleIds: string[] | undefined,
  vehicles: Vehicle[],
  onSelectVehicle: (id: string) => void
) {
  // Replace **text** with bold spans
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  const elements: (string | JSX.Element)[] = [];

  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const text = part.slice(2, -2);
      // Check if text matches a vehicle name and we have vehicleIds
      const matchedVehicle =
        vehicleIds &&
        vehicles.find(
          (v) =>
            vehicleIds.includes(v.id) &&
            (text === v.name || text.includes(v.name))
        );
      if (matchedVehicle) {
        elements.push(
          <button
            key={`v-${i}`}
            onClick={() => onSelectVehicle(matchedVehicle.id)}
            className="font-semibold text-brand underline decoration-brand/30 hover:decoration-brand cursor-pointer transition-colors"
          >
            {text}
          </button>
        );
      } else {
        elements.push(
          <span key={`b-${i}`} className="font-semibold">
            {text}
          </span>
        );
      }
    } else {
      // Handle line breaks
      const lines = part.split("\n");
      lines.forEach((line, li) => {
        if (li > 0) elements.push(<br key={`br-${i}-${li}`} />);
        elements.push(line);
      });
    }
  });

  return elements;
}

export function AIChat({ vehicles, kpis, onSelectVehicle, lang }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNl = lang === "nl";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: isNl
            ? "Hallo! Ik ben je VoorraadInzicht assistent. Stel me een vraag over je voorraad, rentekosten, of marktpositie."
            : "Hello! I'm your VoorraadInzicht assistant. Ask me a question about your inventory, interest costs, or market position.",
        },
      ]);
    }
  };

  const handleSend = (text?: string) => {
    const query = (text || input).trim();
    if (!query) return;

    const userMessage: ChatMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate brief typing delay
    setTimeout(() => {
      const response = generateResponse(query, vehicles, kpis, lang);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 400 + Math.random() * 300);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (query: string) => {
    handleSend(query);
  };

  const handleVehicleClick = (vehicleId: string) => {
    onSelectVehicle(vehicleId);
    // On mobile, close the chat when selecting a vehicle
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const quickActions = QUICK_ACTIONS[lang];

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-brand text-white px-4 py-3 rounded-full shadow-lg hover:bg-brand-dark transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">{isNl ? "Vraag AI" : "Ask AI"}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed z-50 bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden",
                // Mobile: full-screen bottom sheet
                "inset-x-0 bottom-0 top-12 rounded-b-none sm:rounded-xl",
                // Desktop: popover
                "sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:w-[400px] sm:h-[500px]"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-brand text-white">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">VoorraadInzicht AI</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Quick actions at top */}
                {messages.length <= 1 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {quickActions.map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => handleQuickAction(qa.query)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                      >
                        {qa.label}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                        msg.role === "user"
                          ? "bg-brand text-white rounded-br-sm"
                          : "bg-secondary text-foreground rounded-bl-sm"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <span className="whitespace-pre-wrap">
                          {formatMessageContent(
                            msg.content,
                            msg.vehicleIds,
                            vehicles,
                            handleVehicleClick
                          )}
                        </span>
                      ) : (
                        msg.content
                      )}
                      {/* Action button */}
                      {msg.action && (
                        <button
                          onClick={() => {
                            if (msg.action!.type === "select" && msg.action!.payload) {
                              handleVehicleClick(msg.action!.payload);
                            }
                          }}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded-md hover:bg-brand/20 transition-colors"
                        >
                          {msg.action.label}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-2 text-[13px]">
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2.5 bg-background">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isNl
                        ? "Stel een vraag over je voorraad..."
                        : "Ask a question about your inventory..."
                    }
                    className="flex-1 text-sm bg-secondary rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand/30 placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      input.trim()
                        ? "bg-brand text-white hover:bg-brand-dark"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
