"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

export default function GoalsPage() {
  const router = useRouter();
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [water, setWater] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [hasGoals, setHasGoals] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      } catch { /* no goals yet */ }
    };
    load();
  }, [router]);

  const handleSave = async () => {
    if (!calories || !protein || !water) { setMessage("Preencha calorias, proteína e água"); return; }
    try {
      const token = getToken();
      const data = await apiFetch("/fitness/goals", {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ calories: Number(calories), protein: Number(protein), water_ml: Number(water) }),
      });
      setMessage(`Metas salvas: ${data.calories} kcal / ${data.protein}g / ${(data.water_ml / 1000).toFixed(1)}L`);
      setHasGoals(true);
      setShowForm(false);
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div className="surface-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="goal-icon" style={{
              width: 50, height: 50, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)", display: "grid", placeItems: "center", color: "var(--primary)"
            }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                Calorias Diárias
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
                {String(calories)} <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>kcal</span>
              </div>
            </div>
          </div>

          <div className="surface-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="goal-icon" style={{
              width: 50, height: 50, borderRadius: "50%", background: "rgba(37, 99, 235, 0.1)",
              border: "1px solid rgba(37, 99, 235, 0.2)", display: "grid", placeItems: "center", color: "#3b82f6"
            }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M20.27 4.74a4.93 4.93 0 0 0-6.82 0l-.7.7-.71-.7a4.82 4.82 0 0 0-6.82 6.82l.71.7 6.82 6.82 6.82-6.82.7-.7a4.82 4.82 0 0 0 0-6.82z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                Proteína Diária
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
                {String(protein)} <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>g</span>
              </div>
            </div>
          </div>

          <div className="surface-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="goal-icon" style={{
              width: 50, height: 50, borderRadius: "50%", background: "rgba(14, 165, 233, 0.1)",
              border: "1px solid rgba(14, 165, 233, 0.2)", display: "grid", placeItems: "center", color: "#0ea5e9"
            }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                Água Diária
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
                {String(water ? (Number(water) / 1000).toFixed(1) : 0)} <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>L</span>
              </div>
            </div>
          </div>
        </div>
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