import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { classifyIntent, type ClassifierResult } from "../utils/heuristicClassifier";
import { resolveBotLanguage, BOT_UI_TRANSLATIONS } from "../utils/botI18n";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  actions?: ClassifierResult["actions"];
  suggestions?: string[];
}

interface ChatBotProps {
  onClose: () => void;
  isDesktop: boolean;
  isClosing?: boolean;
  onAnimationEnd?: () => void;
  origin?: { x: string; y: string };
  isDark?: boolean;
  language?: string;
  ui: any;
}

export function ChatBot({
  onClose,
  isDesktop,
  isClosing,
  onAnimationEnd,
  origin,
  isDark = false,
  language = "br",
  ui,
}: ChatBotProps) {
  const currentLang = useMemo(() => resolveBotLanguage(language), [language]);
  const botUi = useMemo(
    () => BOT_UI_TRANSLATIONS[currentLang] || BOT_UI_TRANSLATIONS.en,
    [currentLang]
  );

  const getInitialMessage = useCallback((): ChatMessage => {
    return {
      id: "welcome-msg",
      sender: "bot",
      text: botUi.welcomeMessage,
      timestamp: new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      suggestions: botUi.initialSuggestions,
    };
  }, [botUi]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // When language changes and only welcome message exists, update welcome message
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.id === "welcome-msg") {
        return [getInitialMessage()];
      }
      return prev;
    });
  }, [getInitialMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping, scrollToBottom]);

  // Focus input automatically on open
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = useCallback(
    (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: "user",
        text: trimmed,
        timestamp: new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);

      // Natural conversational cadence delay (380ms)
      setTimeout(() => {
        const result = classifyIntent(trimmed, currentLang);

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender: "bot",
          text: result.response,
          timestamp: new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }),
          actions: result.actions,
          suggestions: result.suggestions,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 380);
    },
    [isTyping, currentLang]
  );

  const handleClearHistory = useCallback(() => {
    setMessages([getInitialMessage()]);
    inputRef.current?.focus();
  }, [getInitialMessage]);

  const animClass = isClosing ? "animate-ipadAppClose" : "animate-ipadAppOpen";
  const panelBg = isDark ? "bg-stone-900" : "bg-aster-beige";
  const containerClass = isDesktop
    ? `detail-panel-desktop absolute inset-0 z-20 flex flex-col ${panelBg} overflow-hidden ${animClass} transition-colors duration-500`
    : `detail-panel absolute inset-0 z-30 ${panelBg} flex flex-col ${animClass} transition-colors duration-500`;

  return (
    <div
      className={containerClass}
      dir={botUi.isRtl ? "rtl" : "ltr"}
      style={{
        willChange: "transform, opacity",
        transformOrigin: origin ? `${origin.x} ${origin.y}` : "50% 50%",
      }}
      key="chatbot-panel"
      onAnimationEnd={onAnimationEnd}
    >
      {/* ── Header ── */}
      <div
        className={`shrink-0 flex items-center justify-between px-4 @tablet:px-8 py-3.5 border-b transition-colors duration-500 ${
          isDark
            ? "bg-stone-900/90 border-stone-800 text-stone-100 backdrop-blur-md"
            : "bg-aster-beige/90 border-aster-dark/[0.08] text-aster-dark backdrop-blur-md"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Back button (Mobile view) */}
          {!isDesktop && (
            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm ${
                isDark
                  ? "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  : "bg-aster-dark/10 text-aster-dark/70 hover:bg-aster-dark/20"
              }`}
              aria-label={ui?.back || "Voltar"}
            >
              {botUi.isRtl ? "→" : "←"}
            </button>
          )}

          {/* Bot Avatar with Glow */}
          <div className="relative">
            <div className="w-10 h-10 @tablet:w-11 @tablet:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-xl shadow-md shadow-indigo-500/20 select-none">
              🤖
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm @tablet:text-base tracking-tight leading-none">
                AsterBot
              </h2>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {botUi.statusOnline}
              </span>
            </div>
            <p
              className={`text-[11px] font-medium transition-colors duration-500 mt-0.5 ${
                isDark ? "text-stone-400" : "text-aster-dark/60"
              }`}
            >
              {botUi.assistantTitle}
            </p>
          </div>
        </div>

        {/* Clear chat / Close on desktop */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearHistory}
            title={botUi.clearButton}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? "bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                : "bg-aster-dark/[0.05] hover:bg-aster-dark/[0.1] text-aster-dark/60 hover:text-aster-dark"
            }`}
          >
            <span className="text-xs">🔄</span>
            <span className="hidden @tablet:inline">{botUi.clearButton}</span>
          </button>

          {isDesktop && (
            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm font-bold ${
                isDark
                  ? "bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
                  : "bg-aster-dark/[0.06] text-aster-dark/60 hover:text-aster-dark hover:bg-aster-dark/15"
              }`}
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Scroll Area ── */}
      <div
        className={`flex-1 overflow-y-auto px-4 @tablet:px-8 py-4 space-y-4 ${
          isDesktop ? "max-w-4xl mx-auto w-full" : "w-full"
        }`}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] @tablet:max-w-[75%] rounded-2xl px-4 py-3 transition-all ${
                  isUser
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/15"
                    : isDark
                    ? "bg-stone-800/95 border border-stone-700/60 text-stone-100 rounded-tl-sm shadow-sm"
                    : "bg-white/90 border border-aster-dark/[0.08] text-aster-dark rounded-tl-sm shadow-sm"
                }`}
              >
                {/* Message text with whitespace linebreaks */}
                <p className="text-xs @tablet:text-sm leading-relaxed whitespace-pre-wrap font-normal selection:bg-indigo-500 selection:text-white">
                  {msg.text}
                </p>

                {/* Action buttons (if any) */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-current/10">
                    {msg.actions.map((act) => (
                      <a
                        key={act.label}
                        href={act.url}
                        target={act.type === "download" ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        download={act.type === "download" ? true : undefined}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] @tablet:text-xs font-semibold transition-all duration-200 shadow-sm ${
                          isDark
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100"
                        }`}
                      >
                        {act.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span
                className={`text-[9px] @tablet:text-[10px] mt-1 px-1 transition-colors duration-500 ${
                  isDark ? "text-stone-500" : "text-aster-dark/40"
                }`}
              >
                {msg.timestamp}
              </span>

              {/* Suggestions chips right under bot response */}
              {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%] @tablet:max-w-[85%]">
                  {msg.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isTyping}
                      onClick={() => handleSendMessage(suggestion)}
                      className={`text-[11px] @tablet:text-xs px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer text-left ${
                        isDark
                          ? "bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-indigo-950/60 hover:border-indigo-500/50 hover:text-indigo-300"
                          : "bg-white/70 border-aster-dark/10 text-aster-dark/80 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm w-fit bg-stone-800/80 border border-stone-700/50 text-stone-300 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ── */}
      <div
        className={`shrink-0 px-4 @tablet:px-8 py-3 border-t transition-colors duration-500 ${
          isDark
            ? "bg-stone-900 border-stone-800"
            : "bg-aster-beige border-aster-dark/[0.08]"
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/30 ${
            isDesktop ? "max-w-4xl mx-auto w-full" : "w-full"
          } ${
            isDark
              ? "bg-stone-800/90 border-stone-700/80 focus-within:border-indigo-500/60"
              : "bg-white border-aster-dark/15 focus-within:border-indigo-500/60"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder={botUi.inputPlaceholder}
            className={`flex-1 px-3 py-1.5 text-xs @tablet:text-sm bg-transparent outline-none transition-colors duration-500 ${
              isDark
                ? "text-stone-100 placeholder:text-stone-500"
                : "text-aster-dark placeholder:text-aster-dark/40"
            }`}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              inputValue.trim() && !isTyping
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95"
                : isDark
                ? "bg-stone-700 text-stone-400"
                : "bg-aster-dark/10 text-aster-dark/40"
            }`}
            aria-label="Enviar"
          >
            <span className="-rotate-45 translate-x-0.5">🚀</span>
          </button>
        </form>
      </div>

      {/* Safe bottom area on mobile for floating home bar */}
      {!isDesktop && (
        <div className={`h-16 w-full shrink-0 transition-colors duration-500 ${panelBg}`}>
          <div
            className={`h-full w-full pointer-events-none transition-colors duration-500 ${
              isDark
                ? "bg-gradient-to-t from-black/80 to-transparent"
                : "bg-gradient-to-t from-black/10 to-transparent"
            }`}
          />
        </div>
      )}

      {/* iPad physical home button (desktop) */}
      {isDesktop && (
        <div className={`relative flex justify-center py-4 shrink-0 transition-colors duration-500 ${panelBg}`}>
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
              isDark
                ? "bg-gradient-to-t from-black/80 to-transparent"
                : "bg-gradient-to-t from-black/10 to-transparent"
            }`}
          />
          <button
            type="button"
            onClick={onClose}
            className={`home-btn relative z-10 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
              isDark
                ? "bg-stone-900/50 border border-stone-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] hover:bg-stone-800"
                : "bg-black/[0.02] border border-aster-dark/10 shadow-[inset_0_3px_6px_rgba(0,0,0,0.08)] hover:bg-black/[0.04]"
            }`}
            aria-label={ui?.homeButton || "Botão Home"}
          />
        </div>
      )}
    </div>
  );
}
