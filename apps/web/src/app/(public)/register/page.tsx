"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const activityOptions = [
  { value: "sedentary", label: "Sedentário" },
  { value: "light", label: "Leve (1-3x/sem)" },
  { value: "moderate", label: "Moderado (3-5x/sem)" },
  { value: "active", label: "Ativo (6-7x/sem)" },
  { value: "athlete", label: "Atleta" },
];

const goalOptions = [
  { value: "cut", label: "Perder Gordura (Cutting)" },
  { value: "maintain", label: "Manter Peso" },
  { value: "bulk", label: "Ganhar Massa (Bulking)" },
];

function calculateBmr(sex: string, weightKg: number, heightCm: number, age: number) {
  if (sex === "female") {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

function activityMultiplier(level: string) {
  const map: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };
  return map[level] ?? 1.2;
}

function goalFactor(goal: string) {
  const map: Record<string, number> = { cut: 0.8, maintain: 1.0, bulk: 1.1 };
  return map[goal] ?? 1.0;
}

function workoutRecommendation(goal: string, activity: string) {
  const weeklyBase: Record<string, number> = { sedentary: 2, light: 3, moderate: 4, active: 5, athlete: 6 };
  const weeklyGoal = (weeklyBase[activity] ?? 3) + (goal === "bulk" ? 1 : 0);
  if (goal === "cut") return { intensity: "Moderado", plan: "3-5x/sem, cardio + força leve", weeklyGoal };
  if (goal === "bulk") return { intensity: "Alto (força)", plan: "4-6x/sem, foco em musculação", weeklyGoal };
  return { intensity: "Moderado", plan: "3-4x/sem, equilíbrio cardio/força", weeklyGoal };
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [message, setMessage] = useState("");

  const bmr = calculateBmr(sex, weightKg, heightCm, age);
  const caloriesTarget = Math.round(bmr * activityMultiplier(activity) * goalFactor(goal));
  const proteinTarget = Math.round(weightKg * (goal === "maintain" ? 1.6 : 2.0));
  const workout = workoutRecommendation(goal, activity);

  let waterTarget = 2000;
  if (age <= 30) waterTarget = Math.round(40 * weightKg);
  else if (age <= 55) waterTarget = Math.round(35 * weightKg);
  else if (age <= 65) waterTarget = Math.round(30 * weightKg);
  else waterTarget = Math.round(25 * weightKg);

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage("Preencha email e senha");
      return;
    }
    if (!name.trim()) {
      setMessage("Informe seu nome");
      return;
    }
    if (password.length < 8) {
      setMessage("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name, email, password, sex,
          age: Number(age), height_cm: Number(heightCm), weight_kg: Number(weightKg),
          activity_level: activity, goal,
        }),
      });
      localStorage.setItem("token", data.access_token);
      setMessage("Cadastro ok!");
      window.location.href = "/onboarding";
    } catch (err: any) {
      setMessage(err.message || "Erro ao cadastrar");
    }
  };

  return (
    <main className="auth-main">
      {/* Step Indicator */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
        {[1, 2].map((s) => (
          <div
            key={s}
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: s <= step ? "var(--primary)" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s ease",
              boxShadow: s <= step ? "0 0 8px var(--primary-glow)" : "none",
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="auth-header" style={{ textAlign: "center" }}>
            <p className="eyebrow">Passo 1 de 2</p>
            <h1>Crie sua conta</h1>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label>Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div>
              <label>Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>
          </div>
          <button onClick={() => setStep(2)} style={{ width: "100%", marginTop: 8 }}>
            Próximo →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="auth-header" style={{ textAlign: "center" }}>
            <p className="eyebrow">Passo 2 de 2</p>
            <h1>Seus dados</h1>
          </div>
          <div className="form-grid">
            <div>
              <label>Idade</label>
              <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>
            <div>
              <label>Peso (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Altura (cm)</label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
            </div>
            <div>
              <label>Sexo</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
            <div>
              <label>Atividade</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                {activityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Objetivo</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                {goalOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TMB Preview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              padding: 16,
              borderRadius: "var(--radius)",
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              marginTop: 4,
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>TMB</span>
              <strong style={{ display: "block", color: "var(--primary)", fontSize: 16, fontWeight: 800 }}>{bmr} kcal</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Meta</span>
              <strong style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{caloriesTarget} kcal</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Proteína</span>
              <strong style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{proteinTarget}g</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Treinos</span>
              <strong style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{workout.weeklyGoal}x/sem</strong>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Água Estimada</span>
              <strong style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{(waterTarget / 1000).toFixed(1)} Litros</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>
              ← Voltar
            </button>
            <button onClick={handleSubmit} style={{ flex: 2 }}>
              Cadastrar
            </button>
          </div>
        </>
      )}

      <p style={{ textAlign: "center", fontSize: 14, marginTop: 12 }}>
        Já tem conta?{" "}
        <a className="text-link" href="/login">
          Entrar
        </a>
      </p>

      {message ? <p className="form-message">{message}</p> : null}
    </main>
  );
}