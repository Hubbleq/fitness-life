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
  { value: "cut", label: "Perder gordura" },
  { value: "maintain", label: "Manter" },
  { value: "bulk", label: "Ganhar massa" },
];

const foodSuggestions = [
  "Omelete com queijo",
  "Frango grelhado + arroz",
  "Atum com salada",
  "Iogurte grego + fruta",
  "Sanduíche integral com ovo",
  "Tapioca com frango desfiado",
];

function calculateBmr(sex: string, weightKg: number, heightCm: number, age: number) {
  if (sex === "female") {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

function activityMultiplier(level: string) {
  const map: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };
  return map[level] ?? 1.2;
}

function goalFactor(goal: string) {
  const map: Record<string, number> = {
    cut: 0.8,
    maintain: 1.0,
    bulk: 1.1,
  };
  return map[goal] ?? 1.0;
}

function workoutRecommendation(goal: string, activity: string) {
  const weeklyBase: Record<string, number> = {
    sedentary: 2,
    light: 3,
    moderate: 4,
    active: 5,
    athlete: 6,
  };
  const weeklyGoal = (weeklyBase[activity] ?? 3) + (goal === "bulk" ? 1 : 0);

  if (goal === "cut") {
    return { intensity: "Moderado", plan: "3-5x/sem, cardio + força leve", weeklyGoal };
  }
  if (goal === "bulk") {
    return { intensity: "Alto (força)", plan: "4-6x/sem, foco em musculação", weeklyGoal };
  }
  return { intensity: "Moderado", plan: "3-4x/sem, equilíbrio cardio/força", weeklyGoal };
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [message, setMessage] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    setSummaryOpen(isMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Preencha email e senha");
      return;
    }
    if (!name.trim()) {
      setMessage("Informe seu nome completo");
      return;
    }
    if (password.length < 8) {
      setMessage("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("As senhas não conferem");
      return;
    }
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          sex,
          age: Number(age),
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          activity_level: activity,
          goal,
        }),
      });
      localStorage.setItem("token", data.access_token);
      setMessage("Cadastro ok!");
      window.location.href = "/onboarding";
    } catch (err: any) {
      setMessage(err.message || "Erro ao cadastrar");
    }
  };

  const bmr = calculateBmr(sex, Number(weightKg), Number(heightCm), Number(age));
  const caloriesTarget = Math.round(bmr * activityMultiplier(activity) * goalFactor(goal));
  const proteinTarget = Math.round(Number(weightKg) * (goal === "maintain" ? 1.6 : 2.0));
  const workout = workoutRecommendation(goal, activity);
  const goalText =
    goal === "cut"
      ? "Déficit leve para perder gordura"
      : goal === "bulk"
      ? "Superávit leve para ganhar massa"
      : "Manutenção para estabilidade";

  return (
    <main className="auth-main auth-compact">
      <div className="auth-header">
        <span className="eyebrow">Comece agora</span>
        <h1>Crie sua conta</h1>
        <p>Personalize seu plano e receba metas realistas para seu objetivo.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Conta</h3>
          <div className="form-grid">
            <div>
              <label>Nome e sobrenome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
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
            <div>
              <label>Confirmar senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="form-section">
          <h3>Perfil e meta</h3>
          <div className="form-grid">
            <div>
              <label>Sexo</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
            <div>
              <label>Idade</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Altura (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Peso (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Nível de atividade</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                {activityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Objetivo</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                {goalOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="form-actions compact-actions">
          <button type="submit">Cadastrar</button>
        </div>
        <details className="auth-summary" open={summaryOpen}>
          <summary>Resumo personalizado</summary>
          <img
            className="auth-illustration"
            src="/images/register-illustration.png"
            alt="Registro Motion Lab"
          />
          <div className="summary-grid">
            <div>
              <span>BMR</span>
              <strong>{bmr} kcal</strong>
            </div>
            <div>
              <span>Meta diária</span>
              <strong>{caloriesTarget} kcal</strong>
            </div>
            <div>
              <span>Proteína</span>
              <strong>{proteinTarget} g</strong>
            </div>
            <div>
              <span>Treinos/semana</span>
              <strong>{workout.weeklyGoal}</strong>
            </div>
          </div>
          <p className="summary-note">{workout.plan}</p>
          <p className="summary-note">{goalText}</p>
          <div className="badge-row">
            {foodSuggestions.map((item) => (
              <span className="badge" key={item}>
                {item}
              </span>
            ))}
          </div>
        </details>
      </form>

      <div className="cta-row">
        <a className="btn secondary" href="/login">
          Já tem conta? Entrar
        </a>
        <a className="btn ghost" href="/">
          Voltar para a home
        </a>
      </div>
      {message ? <p className="form-message">{message}</p> : null}
    </main>
  );
}