"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

function ProgressRing({ percent, label, sub }: { percent: number; label: string; sub: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percent, 100) / 100) * c;
  return (
    <div className="progress-ring-item">
      <div className="progress-ring">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle className="progress-ring-bg" cx="45" cy="45" r={r} />
          <circle
            className="progress-ring-fill"
            cx="45" cy="45" r={r}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="progress-ring-text">{Math.round(percent)}%</div>
      </div>
      <label>{label}</label>
      <span className="ring-sub">{sub}</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [dayStats, setDayStats] = useState({
    date: "",
    proteinConsumed: null as number | null,
    proteinGoal: null as number | null,
    waterConsumed: null as number | null,
    waterGoal: null as number | null,
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
    if (!token) { router.push("/login"); return; }
    const loadProfile = async () => {
      try {
        const p = await apiFetch("/fitness/profile", { headers: authHeader(token) });
        setUserName(p?.name || "");
      } catch { setUserName(""); }
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
      const data = await apiFetch(`/fitness/summary?date=${selectedDate}`, { headers: authHeader(token) });
      setDayStats({
        date: data.date,
        proteinConsumed: data.protein_consumed,
        proteinGoal: data.protein_goal,
        waterConsumed: data.water_consumed,
        waterGoal: data.water_goal
      });

      const rec = await apiFetch(`/fitness/recommendations?date=${selectedDate}`, { headers: authHeader(token) });
      setPlanStats({
        bmr: rec.bmr, caloriesTarget: rec.calories_target, proteinTarget: rec.protein_target,
        proteinRemaining: rec.protein_remaining, workoutIntensity: rec.workout_intensity,
        weeklyGoal: rec.weekly_workouts_goal, workoutPlan: rec.workout_plan,
      });

      const weekStart = weekStartFromDate(selectedDate);
      if (weekStart) {
        const week = await apiFetch(`/fitness/weekly-summary?week_start=${weekStart}`, { headers: authHeader(token) });
        setWeekStats({
          weekStart: week.week_start, weekEnd: week.week_end,
          workoutsCount: week.workouts_count, workoutsGoal: week.workouts_goal,
          totalMinutes: week.total_minutes,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados");
      setDayStats({ date: "", proteinConsumed: null, proteinGoal: null, waterConsumed: null, waterGoal: null });
      setPlanStats({ bmr: null, caloriesTarget: null, proteinTarget: null, proteinRemaining: null, workoutIntensity: "", weeklyGoal: null, workoutPlan: "" });
      setWeekStats({ weekStart: "", weekEnd: "", workoutsCount: null, workoutsGoal: null, totalMinutes: null });
    }
  };

  const changeDate = (dir: number) => {
    if (!date) return;
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + dir);
    const next = d.toISOString().slice(0, 10);
    setDate(next);
    handleFetch(next);
  };

  const formatShortDate = (v: string) => {
    if (!v) return "--";
    return new Date(`${v}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  };

  const fv = (v: number | null, s = "") => (v == null || Number.isNaN(v)) ? "--" : `${v}${s}`;

  const caloriePercent = planStats.caloriesTarget && dayStats.proteinConsumed != null
    ? Math.round(((dayStats.proteinConsumed * 30) / planStats.caloriesTarget) * 100) : 0;
  const proteinPercent = planStats.proteinTarget && dayStats.proteinConsumed != null
    ? Math.round((dayStats.proteinConsumed / planStats.proteinTarget) * 100) : 0;
  const waterPercent = dayStats.waterGoal && dayStats.waterConsumed != null
    ? Math.round((dayStats.waterConsumed / dayStats.waterGoal) * 100) : 0;

  const handleAddWater = async () => {
    try {
      const token = getToken();
      await apiFetch("/fitness/water", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ date, amount_ml: 250 })
      });
      // Fetch specifically current day again
      handleFetch(date);
    } catch (err: any) {
      setError(err.message || "Erro ao registrar água");
    }
  };

  return (
    <main className="fade-in">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-banner-bg">
          <img src="/images/hero-fitness.jpg" alt="" />
          <div />
        </div>
        <div className="hero-banner-content">
          <span className="eyebrow">SEU RESUMO</span>
          <h1>Olá, {userName || "Usuário"}</h1>
          <p className="page-subtitle">Continue firme na sua jornada fitness</p>
        </div>
      </div>

      {/* BMR Card */}
      <div className="stat-pills" style={{ marginBottom: 16 }}>
        <div className="stat-pill">
          <div className="stat-pill-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
          </div>
          <div>
            <div className="stat-pill-label">TAXA METABÓLICA BASAL</div>
            <div className="stat-pill-value">{fv(planStats.bmr)}</div>
            <div className="stat-pill-label">kcal/dia</div>
          </div>
        </div>
        <div className="stat-pill" style={{ justifyContent: "flex-end", textAlign: "right" }}>
          <div>
            <div className="stat-pill-label">{fv(planStats.proteinTarget, "g")} · {fv(planStats.caloriesTarget, " kcal")}</div>
            <div style={{ color: "var(--primary)", fontWeight: 700, fontSize: 14 }}>
              {planStats.workoutIntensity || "Cutting"}
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="date-nav" style={{ marginBottom: 16 }}>
        <button onClick={() => changeDate(-1)}>‹</button>
        <div className="date-nav-label">
          <strong>{date === new Date().toISOString().slice(0, 10) ? "Hoje" : formatShortDate(date)}</strong>
          <span>{formatShortDate(date)}</span>
        </div>
        <button onClick={() => changeDate(1)}>›</button>
      </div>

      {/* Progress Rings */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, color: "var(--text-muted)" }}>
          PROGRESSO DO DIA
        </h2>
        <div className="progress-rings">
          <ProgressRing percent={caloriePercent} label="Calorias" sub={`${fv(dayStats.proteinConsumed != null ? dayStats.proteinConsumed * 30 : null)}/${fv(planStats.caloriesTarget)}`} />
          <ProgressRing percent={proteinPercent} label="Proteína" sub={`${fv(dayStats.proteinConsumed, "g")}/${fv(planStats.proteinTarget, "g")}`} />
          <ProgressRing percent={waterPercent} label="Água" sub={`${fv(dayStats.waterConsumed, "ml")}/${fv(dayStats.waterGoal, "ml")}`} />
        </div>
      </div>

      {/* Stat Pills */}
      <div className="stat-pills" style={{ marginBottom: 16 }}>
        <div className="stat-pill">
          <div className="stat-pill-icon">
            <svg viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" /></svg>
          </div>
          <div>
            <div className="stat-pill-value">--</div>
            <div className="stat-pill-label">kcal queimadas</div>
          </div>
        </div>
        <div className="stat-pill" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="stat-pill-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" /></svg>
            </div>
            <div>
              <div className="stat-pill-value" style={{ color: "#3b82f6" }}>{fv(dayStats.waterConsumed, " ml")}</div>
              <div className="stat-pill-label">consumidos hoje</div>
            </div>
          </div>
          <button onClick={handleAddWater} style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3b82f6", width: "100%", padding: "10px", borderRadius: "10px", fontWeight: 600, transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"} onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"}>
            + Copo de 250ml
          </button>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="dashboard-layout" style={{ marginBottom: 16 }}>
        <div className="dashboard-main">
          <div className="surface-card">
            <strong>Semana em andamento</strong>
            <p>
              {weekStats.weekStart
                ? `${formatShortDate(weekStats.weekStart)} a ${formatShortDate(weekStats.weekEnd)}`
                : "Selecione uma data para ver a semana."}
            </p>
            <div className="data-inline">
              <span>{fv(weekStats.workoutsCount)} treinos feitos</span>
              <span>Meta: {fv(weekStats.workoutsGoal)}</span>
              <span>{fv(weekStats.totalMinutes, " min")}</span>
            </div>

            {/* Weekly Progress Chart */}
            <div style={{ display: "flex", gap: 6, marginTop: 16, marginBottom: 20 }}>
              {Array.from({ length: Math.max(weekStats.workoutsGoal || 3, weekStats.workoutsCount || 0, 1) }).map((_, i) => (
                <div key={i} style={{
                  height: 10, flex: 1, borderRadius: 6,
                  background: i < (weekStats.workoutsCount || 0) ? "var(--primary)" : "rgba(255,255,255,0.06)",
                  boxShadow: i < (weekStats.workoutsCount || 0) ? "0 0 10px rgba(239, 68, 68, 0.3)" : "none",
                  transition: "all 0.3s ease"
                }} />
              ))}
            </div>

            <div className="cta-row">
              <a className="btn secondary" href="/meals">Adicionar refeição</a>
              <a className="btn secondary" href="/workouts">Registrar treino</a>
            </div>
          </div>
        </div>
        <div className="dashboard-side">
          <div className="side-card">
            <strong>Resumo rápido</strong>
            <div className="side-metrics">
              <div>
                <span className="metric-label">Treinos na semana</span>
                <span className="metric-value">{fv(weekStats.workoutsCount)} / {fv(weekStats.workoutsGoal)}</span>
              </div>
              <div>
                <span className="metric-label">Minutos ativos</span>
                <span className="metric-value">{fv(weekStats.totalMinutes, " min")}</span>
              </div>
              <div>
                <span className="metric-label">Proteína restante</span>
                <span className="metric-value">{fv(planStats.proteinRemaining, "g")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="form-message">{error}</p> : null}
    </main>
  );
}