"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../../lib/api";

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) router.push("/login");
  }, [router]);

  const handleSend = async () => {
    try {
      const data = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });
      setResponse(data.message || "Sem resposta");
    } catch (err: any) {
      setResponse(err.message || "Erro no chat");
    }
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

      <div className="chat-shell">
        <div className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta"
          />
          <button onClick={handleSend}>Enviar</button>
        </div>
        <div className="chat-response">{response || "Aguardando sua mensagem."}</div>
      </div>
    </main>
  );
}