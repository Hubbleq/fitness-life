"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/api";

const steps = [
  {
    title: "Complete seu perfil",
    text: "Ajuste sexo, idade e objetivo para obter metas realistas.",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  {
    title: "Defina metas",
    text: "Calorias e proteína diárias alinhadas ao seu plano.",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    title: "Registre o dia",
    text: "Adicione refeições e treinos em poucos segundos.",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" />
      </svg>
    ),
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => { if (!getToken()) router.push("/login"); }, [router]);

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Bem-vindo</span>
          <h1>Onboarding rápido</h1>
          <p className="page-subtitle">Em 3 passos você já tem seu plano pronto.</p>
        </div>
        <div className="page-actions">
          <a className="btn" href="/profile">Completar perfil</a>
          <a className="btn secondary" href="/dashboard">Ir para o painel</a>
        </div>
      </div>
      <div className="feature-grid">
        {steps.map((step) => (
          <div className="feature-card" key={step.title}>
            <div className="goal-icon" style={{ marginBottom: 8 }}>{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
