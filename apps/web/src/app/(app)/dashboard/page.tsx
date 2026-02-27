"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function ProgressRing({ percent, label, sub }: { percent: number; label: string; sub: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const targetOffset = c - (Math.min(percent, 100) / 100) * c;
  const [offset, setOffset] = useState(c);

  useEffect(() => {
    const timer = setTimeout(() => setOffset(targetOffset), 150);
    return () => clearTimeout(timer);
  }, [targetOffset]);

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
    chartData: [] as { date: string; minutes: number }[],
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

      const weekStart = weekStartFromDate(selectedDate);
      const [data, rec, week] = await Promise.all([
        apiFetch(`/fitness/summary?date=${selectedDate}`, { headers: authHeader(token) }),
        apiFetch(`/fitness/recommendations?date=${selectedDate}`, { headers: authHeader(token) }),
        weekStart ? apiFetch(`/fitness/weekly-summary?week_start=${weekStart}`, { headers: authHeader(token) }) : Promise.resolve(null)
      ]);

      setDayStats({
        date: data.date,
        proteinConsumed: data.protein_consumed,
        proteinGoal: data.protein_goal,
        waterConsumed: data.water_consumed,
        waterGoal: data.water_goal
      });

      setPlanStats({
        bmr: rec.bmr, caloriesTarget: rec.calories_target, proteinTarget: rec.protein_target,
        proteinRemaining: rec.protein_remaining, workoutIntensity: rec.workout_intensity,
        weeklyGoal: rec.weekly_workouts_goal, workoutPlan: rec.workout_plan,
      });

      if (week) {
        setWeekStats({
          weekStart: week.week_start, weekEnd: week.week_end,
          workoutsCount: week.workouts_count, workoutsGoal: week.workouts_goal,
          totalMinutes: week.total_minutes,
          chartData: week.chart_data || [],
        });
      } else {
        setWeekStats({ weekStart: "", weekEnd: "", workoutsCount: null, workoutsGoal: null, totalMinutes: null, chartData: [] });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados");
      setDayStats({ date: "", proteinConsumed: null, proteinGoal: null, waterConsumed: null, waterGoal: null });
      setPlanStats({ bmr: null, caloriesTarget: null, proteinTarget: null, proteinRemaining: null, workoutIntensity: "", weeklyGoal: null, workoutPlan: "" });
      setWeekStats({ weekStart: "", weekEnd: "", workoutsCount: null, workoutsGoal: null, totalMinutes: null, chartData: [] });
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

      {/* Hero Metric */}
      <div className="surface-card glow-neon-sm" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px" }}>
        <div>
          <span className="eyebrow">CALORIAS RESTANTES</span>
          <div style={{ fontSize: 40, fontWeight: 800, color: "var(--primary)", lineHeight: 1.1, marginTop: 4 }}>
            {fv((planStats.caloriesTarget || 0) - ((dayStats.proteinConsumed || 0) * 30))}
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>de {fv(planStats.caloriesTarget)} diárias</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{fv(planStats.proteinRemaining, "g")}</div>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Proteína Restante</span>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginTop: 8 }}>{planStats.workoutIntensity || "Treino"}</div>
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

      {/* Premium Quick Actions */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
        Ações Rápidas
      </h2>
      <div className="quick-actions-row">
        <a href="/workouts" className="quick-action-card">
          <div className="quick-action-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43 1.43-1.43L8.43 11 12 14.57 8.43 18.14 7 16.71 5.57 18.14 7.71 20.28 9.14 21.71 10.57 20.28l1.43 1.43 1.43-1.43-1.43-1.43L15.57 15.28l3.57 3.57 1.43-1.43-1.43-1.43z" />
            </svg>
          </div>
          <div className="quick-action-text">
            <span className="quick-action-label">Treinar</span>
            <span className="quick-action-sub">Registrar treino</span>
          </div>
        </a>

        <a href="/meals" className="quick-action-card">
          <div className="quick-action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
            </svg>
          </div>
          <div className="quick-action-text">
            <span className="quick-action-label">Refeição</span>
            <span className="quick-action-sub">Adicionar macros</span>
          </div>
        </a>

        <button onClick={handleAddWater} className="quick-action-card" style={{ textAlign: "left" }}>
          <div className="quick-action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
            </svg>
          </div>
          <div className="quick-action-text">
            <span className="quick-action-label">Beber Água</span>
            <span className="quick-action-sub">Copão de +250ml</span>
          </div>
        </button>
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
            <div style={{ width: "100%", height: 260, marginTop: 16, marginBottom: 20 }}>
              {weekStats.chartData && weekStats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekStats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(val) => {
                        const d = new Date(val + "T00:00:00");
                        const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                        return days[d.getDay()];
                      }}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                      formatter={(val: number) => [`${val} min`, "Treino"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#111" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12 }}>
                  Sem dados de treino para gráfico
                </div>
              )}
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