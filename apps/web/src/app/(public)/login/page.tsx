"use client";

import { useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Preencha email e senha");
      return;
    }
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.access_token);
      setMessage("Login ok!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setMessage(err.message || "Erro ao logar");
    }
  };

  return (
    <main className="auth-main">
      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        Bem-vindo de volta!
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" style={{ width: "100%", marginTop: 8 }}>
          Entrar →
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 14, marginTop: 12 }}>
        Não tem conta?{" "}
        <a className="text-link" href="/register">
          Cadastre-se
        </a>
      </p>

      {message ? <p className="form-message">{message}</p> : null}
    </main>
  );
}