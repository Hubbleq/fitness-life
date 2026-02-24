"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState<string>("");
  const [workoutCards, setWorkoutCards] = useState<
    Array<{ title: string; focus: string; frequency: string; duration: string }>
  >([]);
  const [mealSuggestions, setMealSuggestions] = useState<string[]>([]);
  const [mealOfDay, setMealOfDay] = useState<string>("");
  const [workoutOfDay, setWorkoutOfDay] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [dayStats, setDayStats] = useState({
    date: "",
    proteinConsumed: null as number | null,
    proteinGoal: null as number | null,
  });
  const [planStats, setPlanStats] = useState({
    bmr: null as number | null,
    caloriesTarget: null as number | null,
    proteinTarget: null as number | null,
    proteinRemaining: null as number | null,
    workoutIntensity: "",
    weeklyGoal: null as number | null,
    workoutPlan: "",
  });
  const [weekStats, setWeekStats] = useState({
    weekStart: "",
    weekEnd: "",
    workoutsCount: null as number | null,
    workoutsGoal: null as number | null,
    totalMinutes: null as number | null,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const loadProfile = async () => {
      try {
        const profile = await apiFetch("/fitness/profile", {
          headers: authHeader(token),
        });
        setUserName(profile?.name || "");
      } catch {
        setUserName("");
      }
    };
    loadProfile();
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    handleFetch(today);
  }, [router]);

  const weekStartFromDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value + "T00:00:00");
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  };

  const handleFetch = async (selectedDate = date) => {
    try {
      setError("");
      const token = getToken();
      const data = await apiFetch(`/fitness/summary?date=${selectedDate}`, {
        headers: authHeader(token),
      });
      setDayStats({
        date: data.date,
        proteinConsumed: data.protein_consumed,
        proteinGoal: data.protein_goal,
      });
      const rec = await apiFetch(`/fitness/recommendations?date=${selectedDate}`, {
        headers: authHeader(token),
      });
      setPlanStats({
        bmr: rec.bmr,
        caloriesTarget: rec.calories_target,
        proteinTarget: rec.protein_target,
        proteinRemaining: rec.protein_remaining,
        workoutIntensity: rec.workout_intensity,
        weeklyGoal: rec.weekly_workouts_goal,
        workoutPlan: rec.workout_plan,
      });
      setWorkoutCards(buildWorkoutCards(rec.workout_intensity, rec.weekly_workouts_goal));
      setWorkoutOfDay(
        rec.workout_intensity.includes("Alto")
          ? "Treino de força (parte superior)"
          : "Treino funcional + cardio leve"
      );
      setMealSuggestions(
        rec.protein_remaining > 0
          ? [
              "Frango grelhado + legumes",
              "Iogurte grego + frutas",
              "Atum com salada",
            ]
          : ["Omelete leve + salada", "Sopa proteica", "Quinoa com legumes"]
      );
      setMealOfDay(
        rec.protein_remaining > 0
          ? "Frango grelhado + legumes"
          : "Omelete leve + salada"
      );
      const weekStart = weekStartFromDate(selectedDate);
      if (weekStart) {
        const week = await apiFetch(`/fitness/weekly-summary?week_start=${weekStart}`, {
          headers: authHeader(token),
        });
        setWeekStats({
          weekStart: week.week_start,
          weekEnd: week.week_end,
          workoutsCount: week.workouts_count,
          workoutsGoal: week.workouts_goal,
          totalMinutes: week.total_minutes,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados");
      setDayStats({ date: "", proteinConsumed: null, proteinGoal: null });
      setPlanStats({
        bmr: null,
        caloriesTarget: null,
        proteinTarget: null,
        proteinRemaining: null,
        workoutIntensity: "",
        weeklyGoal: null,
        workoutPlan: "",
      });
      setWeekStats({
        weekStart: "",
        weekEnd: "",
        workoutsCount: null,
        workoutsGoal: null,
        totalMinutes: null,
      });
      setWorkoutCards([]);
      setMealSuggestions([]);
      setMealOfDay("");
      setWorkoutOfDay("");
    }
  };

  const buildWorkoutCards = (intensity: string, weeklyGoal: number) => {
    const highIntensity = intensity.toLowerCase().includes("alto");
    const base = Math.max(2, Math.round(weeklyGoal / 2));
    const cardio = Math.max(1, weeklyGoal - base);
    return [
      {
        title: "Força base",
        focus: highIntensity ? "Hipertrofia + progressão" : "Full body + técnica",
        frequency: `${base}x por semana`,
        duration: highIntensity ? "50-70 min" : "40-55 min",
      },
      {
        title: "Cardio inteligente",
        focus: highIntensity ? "Zone 2 + intervalos curtos" : "Zone 2 + caminhada rápida",
        frequency: `${cardio}x por semana`,
        duration: highIntensity ? "20-30 min" : "25-40 min",
      },
      {
        title: "Mobilidade + core",
        focus: "Alongamento, postura e estabilidade",
        frequency: "2x por semana",
        duration: "15-25 min",
      },
    ];
  };

  const formatShortDate = (value: string) => {
    if (!value) return "--";
    return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatValue = (value: number | null, suffix = "") => {
    if (value == null || Number.isNaN(value)) return "--";
    return `${value}${suffix}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };


  const getStatusLabel = (current: number | null, goal: number | null) => {
    if (current == null || goal == null || goal === 0) return "Sem dados";
    if (current >= goal) return "Meta batida";
    if (current >= goal * 0.7) return "Quase la";
    return "Em progresso";
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Página inicial</span>
          <h1>Seu painel inteligente</h1>
          <p className="page-subtitle">
            Recomendações automáticas com base no seu perfil, objetivo e progresso.
          </p>
        </div>
        <div className="page-actions">
          <div className="field">
            <label>Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button onClick={() => handleFetch()}>Atualizar</button>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div className="dashboard-hero panel-anim">
            <div className="dashboard-hero-header">
              <div className="dashboard-hero-title">
                <span className="eyebrow">Hoje</span>
                <h2>Resumo diario</h2>
                <p className="dashboard-hero-sub">
                  {dayStats.date
                    ? `Atualizado em ${formatShortDate(dayStats.date)}`
                    : "Sem dados ainda"}
                </p>
              </div>
              <div className="cta-row">
                <a className="btn secondary" href="/meals">
                  Adicionar refeicao
                </a>
                <a className="btn secondary" href="/workouts">
                  Registrar treino
                </a>
              </div>
            </div>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Proteina consumida</span>
                <span className="data-value">{formatValue(dayStats.proteinConsumed, "g")}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Meta de proteina</span>
                <span className="data-value">{formatValue(dayStats.proteinGoal, "g")}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Meta calorica</span>
                <span className="data-value">{formatValue(planStats.caloriesTarget, " kcal")}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Proteina restante</span>
                <span className="data-value">{formatValue(planStats.proteinRemaining, "g")}</span>
              </div>
            </div>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">BMR estimado</span>
                <span className="data-value">{formatValue(planStats.bmr, " kcal")}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Intensidade</span>
                <span className="data-value">{planStats.workoutIntensity || "--"}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Meta semanal</span>
                <span className="data-value">
                  {planStats.weeklyGoal ? `${planStats.weeklyGoal} treinos` : "--"}
                </span>
              </div>
              <div className="data-item">
                <span className="data-label">Plano recomendado</span>
                <span className="data-value">
                  {planStats.workoutPlan ? planStats.workoutPlan : "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="section roomy panel-anim">
            <div className="section-head">
              <h2 className="section-title">Fichas de treino sugeridas</h2>
              <p className="section-subtitle">Sugestoes alinhadas ao seu objetivo da semana.</p>
            </div>
            <div className="workout-grid stagger">
              {workoutCards.length ? (
                workoutCards.map((card) => (
                  <div className="workout-card" key={card.title}>
                    <div className="kpi-row">
                      <span className="kpi-label">{card.title}</span>
                      <span className="kpi">{card.frequency}</span>
                    </div>
                    <p>{card.focus}</p>
                    <div className="kpi-row">
                      <span className="kpi-label">Duração</span>
                      <span className="kpi">{card.duration}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-card">
                  <strong>Sem recomendações ainda</strong>
                  <p>Complete seu perfil para liberar as fichas personalizadas.</p>
                </div>
              )}
            </div>
          </div>

          <div className="section roomy split-grid panel-anim">
            <div className="surface-card">
              <strong>Semana em andamento</strong>
              <p>
                {weekStats.weekStart
                  ? `Semana ${formatShortDate(weekStats.weekStart)} a ${formatShortDate(
                      weekStats.weekEnd
                    )}`
                  : "Selecione uma data para ver a semana."}
              </p>
              <div className="data-inline">
                <span>{formatValue(weekStats.workoutsCount)} treinos feitos</span>
                <span>Meta: {formatValue(weekStats.workoutsGoal)}</span>
                <span>{formatValue(weekStats.totalMinutes, " min")}</span>
              </div>
              <div className="cta-row">
                <a className="btn secondary" href="/meals">
                  Adicionar refeição
                </a>
                <a className="btn secondary" href="/workouts">
                  Registrar treino
                </a>
              </div>
            </div>
            <div className="surface-card">
              <div className="panel-stack">
                <div>
                  <strong>Treino do dia</strong>
                  <p>{workoutOfDay || "Sem sugestao por enquanto."}</p>
                </div>
                <div>
                  <strong>Refeicao sugerida</strong>
                  <p>{mealOfDay || "Sem sugestao por enquanto."}</p>
                  <div className="badge-row">
                    {mealSuggestions.map((item) => (
                      <span className="badge" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="dashboard-side panel-anim">
          <div className="side-card">
            <span className="eyebrow">Personalizado</span>
            <h3>
              {getGreeting()}
              {userName ? `, ${userName}` : ""}
            </h3>
            <p>
              {planStats.workoutIntensity
                ? `Foco atual: ${planStats.workoutIntensity.toLowerCase()} · Meta semanal: ${formatValue(
                    planStats.weeklyGoal
                  )}`
                : "Complete o perfil para gerar metas personalizadas."}
            </p>
            <img
              className="side-illustration"
              src="/images/dashboard-card-1.png"
              alt="Resumo Motion Lab"
            />
            <div className="status-row">
              <span className="status-chip">
                {getStatusLabel(weekStats.workoutsCount, weekStats.workoutsGoal)}
              </span>
              <span className="status-chip">
                {getStatusLabel(dayStats.proteinConsumed, dayStats.proteinGoal)}
              </span>
            </div>
          </div>
          <div className="side-card">
            <strong>Resumo rapido</strong>
            <div className="side-metrics">
              <div>
                <span className="metric-label">Treinos na semana</span>
                <span className="metric-value">
                  {formatValue(weekStats.workoutsCount)} / {formatValue(weekStats.workoutsGoal)}
                </span>
              </div>
              <div>
                <span className="metric-label">Minutos ativos</span>
                <span className="metric-value">{formatValue(weekStats.totalMinutes, " min")}</span>
              </div>
              <div>
                <span className="metric-label">Proteina restante</span>
                <span className="metric-value">{formatValue(planStats.proteinRemaining, "g")}</span>
              </div>
            </div>
          </div>
          <div className="side-card">
            <strong>Proximos passos</strong>
            <ul className="side-list">
              <li>Registrar refeicao e bater a meta de proteina.</li>
              <li>Adicionar pelo menos um treino ate o fim da semana.</li>
              <li>Revisar metas e ajustar o foco do mes.</li>
            </ul>
            <div className="cta-row">
              <a className="btn ghost" href="/profile">
                Ajustar perfil
              </a>
            </div>
          </div>
        </aside>
      </div>

      {error ? <p className="form-message">{error}</p> : null}
    </main>
  );
}