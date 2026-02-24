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
      <div className="auth-header">
        <span className="eyebrow">Bem-vindo de volta</span>
        <h1>Entrar</h1>
        <p>Acesse seus treinos, metas e refeições em um só lugar.</p>
        <img
          className="auth-illustration"
          src="/images/login-illustration.png"
          alt="Login Motion Lab"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit">Entrar</button>
      </form>
      <div className="cta-row">
        <a className="btn secondary" href="/register">
          Criar conta
        </a>
        <a className="btn ghost" href="/">
          Voltar para a home
        </a>
      </div>
      {message ? <p className="form-message">{message}</p> : null}
    </main>
  );
}