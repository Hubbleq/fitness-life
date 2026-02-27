"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getToken, authHeader, apiFetch } from "../../lib/api";

const TypewriterText = ({ text, onType, onComplete }: { text: string; onType?: () => void; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const onTypeRef = useRef(onType);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onTypeRef.current = onType;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 2; // type slightly faster
      setDisplayedText(text.slice(0, i));
      if (onTypeRef.current) onTypeRef.current();

      if (i >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <>{displayedText}</>;
};

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z" />
      </svg>
    ),
  },
  {
    href: "/workouts",
    label: "Treinos",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M20.27 4.74a4.93 4.93 0 0 0-6.82 0l-.7.7-.71-.7a4.82 4.82 0 0 0-6.82 6.82l.71.7 6.82 6.82 6.82-6.82.7-.7a4.82 4.82 0 0 0 0-6.82zM7 13l-2-2h3l2-3 2 3h3l-2 2 1 3-3-1-3 1 1-3z" />
      </svg>
    ),
  },
  {
    href: "/meals",
    label: "Refeições",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
      </svg>
    ),
  },
  {
    href: "/goals",
    label: "Metas",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
  },
];

const moreNavItems = [
  {
    href: "/profile",
    label: "Perfil",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    )
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleChat = () => setChatOpen((v) => !v);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const userHasScrolledUpRef = useRef(false);

  const [chatMessages, setChatMessages] = useState<{ role: string; text: string; action?: any; typing?: boolean }[]>([
    { role: "bot", text: "Olá! Como posso ajudar hoje?", typing: false },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const scrollToBottom = () => {
    if (chatBodyRef.current && !userHasScrolledUpRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatLoading]);

  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 30;
    if (userHasScrolledUp !== isScrolledUp) {
      setUserHasScrolledUp(isScrolledUp);
    }
    userHasScrolledUpRef.current = isScrolledUp;
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Não autenticado");

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader(token) },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: data.message || "Sem resposta", action: data.suggested_action, typing: true }
      ]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "bot", text: "Erro ao conectar.", typing: true }]);
    }
    setChatLoading(false);
  };

  const handleAction = async (action: any) => {
    if (!action) return;
    setChatLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Não autenticado");

      const endpoint = action.type === "create_workout" ? "/fitness/workouts" : "/fitness/meals";

      await apiFetch(endpoint, {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify(action.payload)
      });

      setChatMessages((prev) => [...prev, {
        role: "bot",
        text: `Pronto! ${action.type === "create_workout" ? "Treino" : "Refeição"} salvo com sucesso no seu diário.`,
        typing: true
      }]);
    } catch (e) {
      setChatMessages((prev) => [...prev, { role: "bot", text: "Erro ao executar ação", typing: true }]);
    }
    setChatLoading(false);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="app-shell">
      <div className="app-layout">
        {/* Desktop Sidebar */}
        <aside className={sidebarOpen ? "app-sidebar" : "app-sidebar collapsed"}>
          <div className="sidebar-header">
            <div className="brand" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {sidebarOpen ? (
                <>
                  <img src="/images/fitness-hub.png" alt="Fitness Hub Logo" width="32" height="32" style={{ borderRadius: '8px', objectFit: 'contain' }} />
                  Fitness <span>Hub</span>
                </>
              ) : (
                <img src="/images/fitness-hub.png" alt="Fitness Hub Logo" width="32" height="32" style={{ borderRadius: '8px', objectFit: 'contain' }} />
              )}
            </div>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Alternar menu"
            >
              {sidebarOpen ? "‹" : "›"}
            </button>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  (pathname === item.href || pathname.startsWith(`${item.href}/`) ? "active" : "") + " nav-item-link"
                }
              >
                <div className="nav-icon-container">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
            {moreNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  (pathname === item.href || pathname.startsWith(`${item.href}/`) ? "active" : "") + " nav-item-link"
                }
              >
                <div className="nav-icon-container">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
              </a>
            ))}

            <a
              href="#"
              onClick={handleLogout}
              className="nav-item-link"
              style={{ marginTop: "auto", color: "var(--primary)" }}
            >
              <div className="nav-icon-container" style={{ color: "var(--primary)" }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
              </div>
              <span className="nav-label">Sair</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={sidebarOpen ? "app-content" : "app-content collapsed"}>
          {children}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                "bottom-nav-item" +
                (pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? " active"
                  : "")
              }
            >
              <div className="bottom-nav-icon">{item.icon}</div>
              <span>{item.label}</span>
            </a>
          ))}
          <a
            href="#"
            onClick={handleLogout}
            className="bottom-nav-item"
            style={{ color: "var(--primary)" }}
          >
            <div className="bottom-nav-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </div>
            <span>Sair</span>
          </a>
        </div>
      </nav>

      {/* Chat FAB */}
      <div className="chat-widget">
        <button
          className="chat-fab"
          onClick={toggleChat}
          aria-expanded={chatOpen}
          aria-label="Abrir assistente virtual"
        >
          <svg className="chat-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a8 8 0 0 0-6.78 12.28l-1.1 3.3a1 1 0 0 0 1.27 1.27l3.3-1.1A8 8 0 1 0 12 3Zm-3 6a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 9 9Zm6 0a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 15 9Zm-6.2 5.2a5.5 5.5 0 0 0 6.4 0 1 1 0 0 1 1.15 1.64 7.5 7.5 0 0 1-8.7 0 1 1 0 0 1 1.15-1.64Z" />
          </svg>
        </button>
        <div className={chatOpen ? "chat-panel open" : "chat-panel"}>
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10.833 2l2.167 6.666H20l-5.667 4 2.167 6.667-5.667-4-5.667 4 2.167-6.667-5.667-4h6.833L10.833 2z" />
                </svg>
              </div>
              <div>
                <strong>Assistente IA</strong>
                <span>Seu coach fitness inteligente</span>
              </div>
            </div>
            <button className="chat-close" onClick={toggleChat} aria-label="Fechar chat">
              ✕
            </button>
          </div>
          <div className="chat-body" ref={chatBodyRef} onScroll={handleScroll}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, alignSelf: m.role === "user" ? "flex-end" : "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
                    background: m.role === "user" ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.2)",
                    color: m.role === "user" ? "var(--text)" : "var(--primary)"
                  }}>
                    {m.role === "user" ? (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M10.833 2l2.167 6.666H20l-5.667 4 2.167 6.667-5.667-4-5.667 4 2.167-6.667-5.667-4h6.833L10.833 2z" /></svg>
                    )}
                  </div>
                  <div className={`chat-bubble ${m.role === "user" ? "user" : "bot"}`} style={{ margin: 0, maxWidth: "100%" }}>
                    {m.typing ? (
                      <TypewriterText
                        text={m.text}
                        onType={scrollToBottom}
                        onComplete={() => {
                          setChatMessages(msgs => msgs.map((msg, idx) => idx === i ? { ...msg, typing: false } : msg));
                        }}
                      />
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
                {/* Prompt Pills for the very first welcome message */}
                {i === 0 && m.role === "bot" && (
                  <div className="chat-prompts">
                    <button className="chat-prompt-pill" onClick={() => {
                      setChatInput("Monte um treino de peito");
                    }}>
                      Monte um treino de peito
                    </button>
                    <button className="chat-prompt-pill" onClick={() => {
                      setChatInput("Quantas calorias devo comer?");
                    }}>
                      Quantas calorias devo comer?
                    </button>
                    <button className="chat-prompt-pill" onClick={() => {
                      setChatInput("Dicas de pré-treino");
                    }}>
                      Dicas de pré-treino
                    </button>
                  </div>
                )}

                {m.action && (
                  <button
                    onClick={() => handleAction(m.action)}
                    style={{ marginTop: 6, marginLeft: m.role === "bot" ? 30 : 0, marginRight: m.role === "user" ? 30 : 0, fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--primary)", color: "#fff", border: "none", alignSelf: "flex-start", cursor: "pointer" }}
                  >
                    Confirmar {m.action.type === "create_workout" ? "Treino" : "Refeição"}
                  </button>
                )}
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
                  background: "rgba(239,68,68,0.2)", color: "var(--primary)"
                }}>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M10.833 2l2.167 6.666H20l-5.667 4 2.167 6.667-5.667-4-5.667 4 2.167-6.667-5.667-4h6.833L10.833 2z" /></svg>
                </div>
                <div className="chat-bubble bot typing-indicator" style={{ margin: 0 }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
          </div>
          <form className="chat-footer" onSubmit={handleChatSend}>
            <input
              type="text"
              placeholder="Pergunte algo sobre fitness..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={!chatInput.trim()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}