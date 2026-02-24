"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

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

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [message, setMessage] = useState("");

  const bmr = calculateBmr(sex, Number(weightKg), Number(heightCm), Number(age));
  const caloriesTarget = Math.round(bmr * activityMultiplier(activity) * goalFactor(goal));
  const proteinTarget = Math.round(Number(weightKg) * (goal === "maintain" ? 1.6 : 2.0));
  const goalLabel = goalOptions.find((opt) => opt.value === goal)?.label ?? "";

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const load = async () => {
      try {
        const data = await apiFetch("/fitness/profile", {
          headers: authHeader(token),
        });
        if (data) {
          setName(data.name || "");
          setSex(data.sex);
          setAge(data.age);
          setHeightCm(data.height_cm);
          setWeightKg(data.weight_kg);
          setActivity(data.activity_level);
          setGoal(data.goal);
        }
      } catch (err: any) {
        setMessage(err.message || "Erro ao carregar perfil");
      }
    };
    load();
  }, [router]);

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        setMessage("Informe seu nome completo");
        return;
      }
      const token = getToken();
      await apiFetch("/fitness/profile", {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({
          name,
          sex,
          age: Number(age),
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          activity_level: activity,
          goal,
        }),
      });
      setMessage("Perfil salvo com sucesso");
    } catch (err: any) {
      setMessage(err.message || "Erro ao salvar perfil");
    }
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Seu perfil</span>
          <h1>Perfil</h1>
          <p className="page-subtitle">Atualize seus dados para manter as metas corretas.</p>
        </div>
      </div>

      <div className="split-grid">
        <div className="form-section">
          <h3>Dados pessoais</h3>
          <div className="form-grid">
            <div>
              <label>Nome e sobrenome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
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
          <div className="form-actions">
            <button onClick={handleSave}>Salvar perfil</button>
          </div>
          {message ? <p className="form-message">{message}</p> : null}
        </div>

        <div className="surface-card highlight-card">
          <strong>Resumo do plano</strong>
          <ul className="summary-list">
            <li className="summary-item">
              <span>Objetivo</span>
              <strong>{goalLabel}</strong>
            </li>
            <li className="summary-item">
              <span>BMR estimado</span>
              <strong>{bmr} kcal</strong>
            </li>
            <li className="summary-item">
              <span>Meta diária</span>
              <strong>{caloriesTarget} kcal</strong>
            </li>
            <li className="summary-item">
              <span>Proteína sugerida</span>
              <strong>{proteinTarget} g</strong>
            </li>
          </ul>
          <p className="muted-note">
            Esses valores são uma base inicial. Ajuste no painel conforme sua rotina.
          </p>
          <div className="cta-row">
            <a className="btn secondary" href="/goals">
              Ajustar metas
            </a>
            <a className="btn secondary" href="/dashboard">
              Ver painel
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}