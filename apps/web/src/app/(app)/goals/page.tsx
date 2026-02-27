"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function GoalsPage() {
  const router = useRouter();
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [water, setWater] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [hasGoals, setHasGoals] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    const load = async () => {
      try {
        const data = await apiFetch("/fitness/goals", { headers: authHeader(token) });
        if (data && data.calories) {
          setCalories(data.calories);
          setProtein(data.protein);
          setWater(data.water_ml || "");
          setHasGoals(true);
        }
        try {
          const summaryData = await apiFetch(`/fitness/summary?date=${new Date().toISOString().split('T')[0]}`, { headers: authHeader(token) });
          setSummary(summaryData);
        } catch { /* ignore summary errors */ }

        try {
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 6);
          const weeklyResponse = await apiFetch(`/fitness/weekly-summary?week_start=${weekStart.toISOString().split('T')[0]}`, { headers: authHeader(token) });

          if (weeklyResponse && weeklyResponse.chart_data) {
            const formatted = weeklyResponse.chart_data.map((d: any) => ({
              ...d,
              shortDate: new Date(d.date).toLocaleDateString("pt-BR", { weekday: 'short' }).replace('.', '')
            }));
            setWeeklyData(formatted);
          }
        } catch { /* ignore weekly errors */ }
      } catch { /* no goals yet */ }
    };

    load();
  }, [router]);

  // Helper for Circular Progress
  const CircularProgress = ({ value, max, color, icon, label, unit }: any) => {
    const isNaNGuard = (val: number) => isNaN(val) ? 0 : val;
    const safeMax = isNaNGuard(max) || 1;
    const safeValue = isNaNGuard(value);

    let percentage = Math.round((safeValue / safeMax) * 100);
    if (percentage > 100) percentage = 100;

    // SVG properties
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="surface-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", gap: 16 }}>
        <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
            <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", color }}>
            {icon}
            <span style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: "var(--text)" }}>{percentage}%</span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
            <span style={{ color }}>{safeValue}</span> <span style={{ color: "var(--text-muted)", fontSize: 12 }}>/ {safeMax} {unit}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!calories || !protein || !water) { setMessage("Preencha calorias, proteína e água"); return; }
    try {
      const token = getToken();
      const data = await apiFetch("/fitness/goals", {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ calories: Number(calories), protein: Number(protein), water_ml: Number(water) }),
      });
      setMessage(`Metas salvas. Recarregando progresso...`);
      setHasGoals(true);
      setShowForm(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) { setMessage(err.message || "Erro ao salvar metas"); }
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="goal-icon" style={{ width: 36, height: 36 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <h1>Metas</h1>
            <p className="page-subtitle">Defina e acompanhe seus objetivos diários</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}>
          {hasGoals ? "Editar metas" : "+ Definir metas"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="form-section" style={{ marginBottom: 20 }}>
          <h3>{hasGoals ? "Atualizar metas" : "Defina suas metas diárias"}</h3>
          <div className="form-grid">
            <div>
              <label>Calorias diárias (kcal)</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 2200" />
            </div>
            <div>
              <label>Proteína diária (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 150" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Água diária (ml)</label>
              <input type="number" value={water} onChange={(e) => setWater(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 2500" />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleSave}>Salvar</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {message && <p className="form-message">{message}</p>}

      {/* Current Goals Display */}
      {hasGoals ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>

            <CircularProgress
              value={summary?.calories_consumed || 0} max={calories}
              color="#ef4444" label="Calorias" unit="kcal"
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" /></svg>}
            />

            <CircularProgress
              value={summary?.protein_consumed || 0} max={protein}
              color="#3b82f6" label="Proteína" unit="g"
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.27 4.74a4.93 4.93 0 0 0-6.82 0l-.7.7-.71-.7a4.82 4.82 0 0 0-6.82 6.82l.71.7 6.82 6.82 6.82-6.82.7-.7a4.82 4.82 0 0 0 0-6.82z" /></svg>}
            />

            <CircularProgress
              value={(summary?.water_consumed || 0) / 1000} max={Number(water || 0) / 1000}
              color="#0ea5e9" label="Água" unit="L"
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" /></svg>}
            />

          </div>

          {/* Charts Section */}
          {weeklyData.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 32 }}>
              <div className="surface-card">
                <h3 style={{ marginBottom: 16 }}>Calorias (Últimos 7 dias)</h3>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="shortDate" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                        formatter={(val: number) => [`${val} kcal`, 'Calorias']}
                      />
                      <Area type="monotone" dataKey="calories" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCals)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="surface-card">
                <h3 style={{ marginBottom: 16 }}>Minutos de Treino</h3>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="shortDate" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                        formatter={(val: number) => [`${val} min`, 'Treino']}
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      />
                      <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </>
      ) : (
        <div className="surface-card" style={{ textAlign: "center", padding: 40 }}>
          <div className="goal-icon" style={{ width: 48, height: 48, margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
          <strong style={{ display: "block", marginBottom: 8 }}>Nenhuma meta definida</strong>
          <p>Defina metas diárias de calorias e proteína para acompanhar seu progresso.</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>
            Definir metas
          </button>
        </div>
      )}
    </main>
  );
}