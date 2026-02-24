"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Perfil" },
  { href: "/goals", label: "Metas" },
  { href: "/meals", label: "Refeições" },
  { href: "/workouts", label: "Treinos" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleChat = () => {
    setChatOpen((value) => !value);
  };
  return (
    <div className="app-shell">
      <div className="app-layout">
        <aside className={sidebarOpen ? "app-sidebar" : "app-sidebar collapsed"}>
          <div className="sidebar-header">
            <div className="brand">Motion Lab</div>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Alternar menu"
            >
              {sidebarOpen ? "⟨" : "⟩"}
            </button>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "active"
                    : ""
                }
              >
                <span className="nav-dot" />
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>
        <div className={sidebarOpen ? "app-content" : "app-content collapsed"}>
          {children}
        </div>
      </div>
      <div className="chat-widget">
        <button
          className="chat-fab"
          onClick={toggleChat}
          aria-expanded={chatOpen}
          aria-label="Abrir assistente virtual"
        >
          <svg
            className="chat-icon"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <path
              d="M12 3a8 8 0 0 0-6.78 12.28l-1.1 3.3a1 1 0 0 0 1.27 1.27l3.3-1.1A8 8 0 1 0 12 3Zm-3 6a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 9 9Zm6 0a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 15 9Zm-6.2 5.2a5.5 5.5 0 0 0 6.4 0 1 1 0 0 1 1.15 1.64 7.5 7.5 0 0 1-8.7 0 1 1 0 0 1 1.15-1.64Z"
            />
          </svg>
        </button>
        <div className={chatOpen ? "chat-panel open" : "chat-panel"}>
          <div className="chat-header">
            <div>
              <strong>Assistente Fitness</strong>
              <span>online</span>
            </div>
            <button className="chat-close" onClick={toggleChat} aria-label="Fechar chat">
              ✕
            </button>
          </div>
          <div className="chat-body">
            <div className="chat-bubble bot">
              Oi! Posso sugerir um treino ou refeicao para hoje?
            </div>
            <div className="chat-bubble user">Quero um treino rapido.</div>
            <div className="chat-bubble bot">
              Sugestao: 20 min de cardio leve + 15 min de core.
            </div>
          </div>
          <form className="chat-footer" onSubmit={(event) => event.preventDefault()}>
            <input type="text" placeholder="Digite sua mensagem" />
            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}