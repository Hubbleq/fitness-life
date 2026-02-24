"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/api";

const steps = [
  {
    title: "Complete seu perfil",
    text: "Ajuste sexo, idade e objetivo para obter metas realistas.",
  },
  {
    title: "Defina metas",
    text: "Calorias e proteína diárias alinhadas ao seu plano.",
  },
  {
    title: "Registre o dia",
    text: "Adicione refeições e treinos em poucos segundos.",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) router.push("/login");
  }, [router]);

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Bem-vindo</span>
          <h1>Onboarding rápido</h1>
          <p className="page-subtitle">
            Em 3 passos você já tem seu plano pronto para começar hoje.
          </p>
          <img
            className="onboarding-illustration"
            src="/images/onboarding-steps.png"
            alt="Etapas do Motion Lab"
          />
        </div>
        <div className="page-actions">
          <a className="btn" href="/profile">
            Completar perfil
          </a>
          <a className="btn secondary" href="/dashboard">
            Ir para o painel
          </a>
        </div>
      </div>

      <div className="feature-grid">
        {steps.map((step) => (
          <div className="feature-card" key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
