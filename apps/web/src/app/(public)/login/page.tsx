"use client";

import { useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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

      if (rememberMe) {
        localStorage.setItem("token", data.access_token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", data.access_token);
        localStorage.removeItem("token");
      }

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

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 16 }}>
          <div className="checkbox-wrapper" style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 18, height: 18, margin: 0, cursor: "pointer", accentColor: "var(--primary)" }}
            />
          </div>
          <label htmlFor="remember" style={{ margin: 0, fontSize: 13, cursor: "pointer", userSelect: "none" }}>
            Lembrar minha conta
          </label>
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