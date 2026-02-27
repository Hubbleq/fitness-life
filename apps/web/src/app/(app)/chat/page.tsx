"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../../lib/api";

type Message = { role: "user" | "bot"; text: string };

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!getToken()) router.push("/login"); }, [router]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const data = await apiFetch("/chat", { method: "POST", body: JSON.stringify({ message: userMsg }) });
      setMessages((prev) => [...prev, { role: "bot", text: data.message || "Sem resposta" }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "bot", text: err.message || "Erro no chat" }]);
    }
    setLoading(false);
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Assistente</span>
          <h1>Chat</h1>
          <p className="page-subtitle">Tire dúvidas rápidas sobre treino e dieta.</p>
        </div>
      </div>
      <div className="chat-page-body">
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0" }}>
            Envie uma mensagem para começar.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-page-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-page-bubble bot" style={{ opacity: 0.5 }}>Digitando...</div>}
      </div>
      <form className="chat-page-input" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua pergunta" />
        <button type="submit" disabled={loading}>Enviar</button>
      </form>
    </main>
  );
}