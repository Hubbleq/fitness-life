"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

type Meal = { id: number; date: string; name: string; protein: number };

export default function MealsPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState("");
  const [protein, setProtein] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadMeals = async () => {
    try {
      const token = getToken();
      const query = date ? `?date=${date}` : "";
      const data = await apiFetch(`/fitness/meals${query}`, { headers: authHeader(token) });
      setMeals(data);
    } catch (err: any) { setMessage(err.message || "Erro ao carregar refeições"); }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    loadMeals();
  }, [router]);

  const resetForm = () => { setEditingId(null); setName(""); setProtein(0); setShowForm(false); };

  const handleCreate = async () => {
    try {
      const token = getToken();
      await apiFetch("/fitness/meals", {
        method: "POST", headers: authHeader(token),
        body: JSON.stringify({ date, name, protein: Number(protein) }),
      });
      setMessage("Refeição criada com sucesso!");
      setTimeout(() => setMessage(""), 3000);
      resetForm();
      loadMeals();
    } catch (err: any) { setMessage(`Erro: ${err.message || "Falha ao criar refeição"}`); }
  };

  const handleEdit = (meal: Meal) => {
    setEditingId(meal.id); setDate(meal.date); setName(meal.name); setProtein(meal.protein); setShowForm(true); setMessage("");
  };

  const handleUpdate = async () => {
    if (editingId == null) return;
    try {
      const token = getToken();
      await apiFetch(`/fitness/meals/${editingId}`, {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ date, name, protein: Number(protein) }),
      });
      setMessage("Refeição atualizada com sucesso!");
      setTimeout(() => setMessage(""), 3000);
      resetForm();
      loadMeals();
    } catch (err: any) { setMessage(`Erro: ${err.message || "Falha ao atualizar refeição"}`); }
  };

  const handleDelete = async () => {
    if (editingId == null) return;
    if (!confirm("Tem certeza que deseja apagar esta refeição?")) return;
    try {
      const token = getToken();
      await apiFetch(`/fitness/meals/${editingId}`, {
        method: "DELETE", headers: authHeader(token),
      });
      setMessage("Refeição excluída com sucesso");
      resetForm();
      loadMeals();
    } catch (err: any) { setMessage(err.message || "Erro ao excluir refeição"); }
  };

  const handleSuggestAI = async () => {
    setMessage("");
    setIsGenerating(true);
    try {
      const token = getToken();
      const data = await apiFetch("/fitness/ai/suggest-meal", {
        method: "POST", headers: authHeader(token),
        body: JSON.stringify({ input: "Sugira uma refeição simples e nutritiva" })
      });

      setIsGenerating(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setDate(data.date);
        setName(data.name);
        setProtein(data.protein);
        setShowForm(true);
      }, 1500);

    } catch (err: any) {
      setIsGenerating(false);
      setMessage(`Erro da IA: ${err.message || "Não foi possível gerar a sugestão"}`);
    }
  };

  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCalories = Math.round(totalProtein * 4 + meals.length * 350);

  return (
    <main className="fade-in">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-banner-bg">
          <img src="/images/meals-header.jpg" alt="" />
          <div />
        </div>
        <div className="hero-banner-content">
          <span className="eyebrow">NUTRIÇÃO</span>
          <h1>Refeições</h1>
          <p className="page-subtitle">Gerencie sua alimentação diária</p>
        </div>
        <div className="hero-banner-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
          <button onClick={() => setShowForm(true)}>+ Adicionar</button>
          <button onClick={handleSuggestAI} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
            </svg>
            Sugerir com IA
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row" style={{ marginBottom: 20 }}>
        <div className="stat-box">
          <div className="stat-box-value">{totalCalories}kcal</div>
          <div className="stat-box-label">total</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-value">{totalProtein}g</div>
          <div className="stat-box-label">proteína</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-value">{meals.length}</div>
          <div className="stat-box-label">refeições</div>
        </div>
      </div>

      {/* Full Screen Modals */}
      {isGenerating && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="spinner" style={{ width: 40, height: 40, border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <h3 style={{ marginTop: 24, letterSpacing: "0.5px" }}>O Chef IA está preparando...</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>Buscando ingredientes nutritivos e baratos.</p>
        </div>
      )}

      {showSuccess && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, animation: "fadeUp 0.3s ease" }}>
          <div style={{ background: "#22c55e", width: 60, height: 60, borderRadius: "50%", display: "grid", placeItems: "center" }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
          <h3 style={{ marginTop: 24, letterSpacing: "0.5px" }}>Refeição Gerada!</h3>
        </div>
      )}

      {message && (
        <div style={{ background: message.includes("Erro") ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)", color: message.includes("Erro") ? "#ef4444" : "#22c55e", padding: "12px 16px", borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${message.includes("Erro") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}` }}>
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && !isGenerating && !showSuccess && (
        <div className="form-section fade-in" style={{ marginBottom: 20 }}>
          <h3>{editingId ? "Editar refeição" : "Nova refeição"}</h3>
          <div className="form-grid">
            <div><label>Data</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><label>Nome</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Café da manhã" /></div>
            <div><label>Proteína (g)</label><input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} /></div>
          </div>
          <div className="form-actions" style={{ display: "flex", gap: 10 }}>
            {editingId ? (
              <>
                <button onClick={handleUpdate}>Salvar</button>
                <button onClick={handleDelete} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "none" }}>Excluir</button>
                <button className="btn-ghost" onClick={resetForm}>Cancelar</button>
              </>
            ) : (
              <>
                <button onClick={handleCreate}>Adicionar</button>
                <button className="btn-ghost" onClick={resetForm}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}

      {message ? <p className="form-message">{message}</p> : null}

      {/* Meal List */}
      <div style={{ display: "grid", gap: 12 }}>
        {meals.length ? meals.map((meal) => (
          <div className="meal-card" key={meal.id}>
            <div className="meal-icon">
              <svg viewBox="0 0 24 24">
                <path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
              </svg>
            </div>
            <div className="meal-info">
              <div className="meal-name">{meal.name || "Refeição"}</div>
              <div className="meal-meta">{meal.date} · {meal.protein}g proteína</div>
            </div>
            <button className="btn-ghost" onClick={() => handleEdit(meal)}>Editar</button>
          </div>
        )) : (
          <div className="surface-card">
            <strong>Nenhuma refeição registrada</strong>
            <p>Adicione refeições para acompanhar sua nutrição.</p>
          </div>
        )}
      </div>
    </main>
  );
}