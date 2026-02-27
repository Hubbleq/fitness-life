"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

type WorkoutExercise = {
  id?: number;
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  weight_kg?: number | null;
};

type Workout = {
  id: number;
  date: string;
  name: string;
  duration: number;
  cardio_minutes?: number | null;
  is_completed: boolean;
  exercises: WorkoutExercise[];
};

function StatusIcon({ active, onClick }: { active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      width: 44, height: 24, borderRadius: 12,
      background: active ? "rgba(34, 197, 94, 0.3)" : "rgba(255,255,255,0.08)",
      border: `1.5px solid ${active ? "#22c55e" : "rgba(255,255,255,0.12)"}`,
      display: "flex", alignItems: "center", padding: 2,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.25s ease", flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: active ? "#22c55e" : "rgba(255,255,255,0.2)",
        transform: active ? "translateX(20px)" : "translateX(0)",
        transition: "all 0.25s ease",
        boxShadow: active ? "0 0 8px rgba(34, 197, 94, 0.5)" : "none",
      }} />
    </div>
  );
}

function ExerciseRow({ ex }: { ex: WorkoutExercise }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0" }}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)",
        minWidth: 60, textTransform: "uppercase", marginTop: 2,
      }}>{ex.muscle_group}</span>
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 13, color: "var(--text)", display: "block" }}>{ex.name}</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {Array.from({ length: ex.sets }).map((_, i) => (
            <span key={i} style={{
              padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: "rgba(255,255,255,0.06)", color: "var(--text-muted)",
            }}>
              {ex.reps} {ex.weight_kg ? `× ${ex.weight_kg}kg` : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(0);
  const [cardioMinutes, setCardioMinutes] = useState(0);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const loadWorkouts = async () => {
    try {
      const token = getToken();
      const query = date ? `?date=${date}` : "";
      const data = await apiFetch(`/fitness/workouts${query}`, { headers: authHeader(token) });
      setWorkouts(data);
    } catch (err: any) { setMessage(err.message || "Erro ao carregar treinos"); }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    loadWorkouts();
  }, [router]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDuration(0);
    setCardioMinutes(0);
    setExercises([]);
    setShowForm(false);
  };

  const handleCreate = async () => {
    try {
      const token = getToken();
      await apiFetch("/fitness/workouts", {
        method: "POST", headers: authHeader(token),
        body: JSON.stringify({
          date, name, duration: Number(duration), cardio_minutes: Number(cardioMinutes), is_completed: isCompleted, exercises
        }),
      });
      setMessage("Treino criado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
      resetForm(); loadWorkouts();
    } catch (err: any) { setMessage(`Erro: ${err.message || "Falha ao criar treino"}`); }
  };

  const handleEdit = (w: Workout) => {
    setEditingId(w.id);
    setDate(w.date);
    setName(w.name);
    setDuration(w.duration);
    setCardioMinutes(w.cardio_minutes || 0);
    setIsCompleted(w.is_completed || false);
    setExercises(w.exercises || []);
    setShowForm(true);
    setMessage(""); // Clear message when opening
  };

  const handleUpdate = async () => {
    if (editingId == null) return;
    try {
      const token = getToken();
      await apiFetch(`/fitness/workouts/${editingId}`, {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({
          date, name, duration: Number(duration), cardio_minutes: Number(cardioMinutes), is_completed: isCompleted, exercises
        }),
      });
      setMessage("Treino atualizado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
      resetForm(); loadWorkouts();
    } catch (err: any) { setMessage(`Erro: ${err.message || "Falha ao atualizar treino"}`); }
  };

  const handleDelete = async () => {
    if (editingId == null) return;
    if (!confirm("Tem certeza que deseja apagar este treino?")) return;
    try {
      const token = getToken();
      await apiFetch(`/fitness/workouts/${editingId}`, {
        method: "DELETE", headers: authHeader(token),
      });
      setMessage("Treino excluído com sucesso");
      resetForm(); loadWorkouts();
    } catch (err: any) { setMessage(err.message || "Erro ao excluir treino"); }
  };

  const toggleWorkoutCompletion = async (w: Workout) => {
    try {
      const token = getToken();
      await apiFetch(`/fitness/workouts/${w.id}/toggle`, {
        method: "PATCH", headers: authHeader(token),
      });
      loadWorkouts();
    } catch (err: any) { setMessage(`Erro ao alterar status: ${err.message}`); }
  };

  const handleSuggestAI = async () => {
    setMessage("");
    setIsGenerating(true);
    try {
      const token = getToken();
      const data = await apiFetch("/fitness/ai/suggest-workout", {
        method: "POST", headers: authHeader(token),
        body: JSON.stringify({ input: "Sugira um bom treino de acordo com meu perfil e evite músculos treinados recentemente." })
      });

      setIsGenerating(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setDate(data.date);
        setName(data.name);
        setDuration(data.duration);
        setCardioMinutes(data.cardio_minutes || 0);
        setIsCompleted(false);
        setExercises(data.exercises || []);
        setShowForm(true);
      }, 1500); // 1.5s success animation

    } catch (err: any) {
      setIsGenerating(false);
      setMessage(`Erro da IA: ${err.message || "Não foi possível gerar a sugestão"}`);
    }
  };

  const addExercise = () => setExercises([...exercises, { name: "", muscle_group: "", sets: 3, reps: "10-12", weight_kg: null }]);
  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const newEx = [...exercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setExercises(newEx);
  };
  const removeExercise = (index: number) => setExercises(exercises.filter((_, i) => i !== index));

  return (
    <main className="fade-in">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-banner-bg">
          <img src="/images/workouts-header.jpg" alt="" />
          <div />
        </div>
        <div className="hero-banner-content">
          <span className="eyebrow">TREINAMENTO</span>
          <h1>Treinos</h1>
          <p className="page-subtitle">{workouts.length} concluídos</p>
        </div>
        <div className="hero-banner-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
          <button onClick={() => setShowForm(true)}>+ Novo treino</button>
          <button onClick={handleSuggestAI} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
            </svg>
            Sugerir com IA
          </button>
        </div>
      </div>

      {/* Full Screen Modals */}
      {isGenerating && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="spinner" style={{ width: 40, height: 40, border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <h3 style={{ marginTop: 24, letterSpacing: "0.5px" }}>A IA está analisando seu perfil...</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>Buscando seu histórico para montar a melhor rotina.</p>
        </div>
      )}

      {showSuccess && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, animation: "fadeUp 0.3s ease" }}>
          <div style={{ background: "#22c55e", width: 60, height: 60, borderRadius: "50%", display: "grid", placeItems: "center" }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
          <h3 style={{ marginTop: 24, letterSpacing: "0.5px" }}>Treino Gerado!</h3>
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
          <h3>{editingId ? "Editar treino" : "Novo treino"}</h3>
          <div className="form-grid">
            <div><label>Data</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><label>Nome do Treino</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Treino de Peito" /></div>
            <div><label>Duração Total (min)</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></div>
            <div><label>Cardio Opcional (min)</label><input type="number" value={cardioMinutes} onChange={(e) => setCardioMinutes(Number(e.target.value))} /></div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ margin: 0 }}>Exercícios</label>
              <button className="btn-ghost" onClick={addExercise} style={{ padding: '4px 8px', fontSize: 13 }}>+ Adicionar Exercício</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {exercises.map((ex, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) minmax(100px, 2fr) 60px 80px 80px 36px',
                  gap: 8, alignItems: 'center', background: "rgba(255,255,255,0.02)", padding: 8, borderRadius: 6
                }}>
                  <input placeholder="Músculo" value={ex.muscle_group} onChange={(e) => updateExercise(idx, "muscle_group", e.target.value)} />
                  <input placeholder="Ex: Supino Reto" value={ex.name} onChange={(e) => updateExercise(idx, "name", e.target.value)} />
                  <input type="number" placeholder="Séries" value={ex.sets || ""} onChange={(e) => updateExercise(idx, "sets", Number(e.target.value))} />
                  <input placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(idx, "reps", e.target.value)} />
                  <input type="number" placeholder="Carga(kg)" value={ex.weight_kg || ""} onChange={(e) => updateExercise(idx, "weight_kg", Number(e.target.value))} />
                  <button onClick={() => removeExercise(idx)} style={{ padding: 0, height: 36, display: 'grid', placeItems: 'center', background: 'rgba(239,68,68,0.1)', color: 'red', borderRadius: 4 }}>✕</button>
                </div>
              ))}
              {exercises.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 12 }}>Nenhum exercício adicionado.</p>}
            </div>
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

      {/* User-created workouts from API */}
      <div style={{ display: "grid", gap: 16 }}>
        {workouts.map((card) => (
          <div key={card.id} style={{
            background: "var(--surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius)", padding: "20px 22px",
            animation: "fadeUp 0.4s ease both",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <StatusIcon active={card.is_completed} onClick={() => toggleWorkoutCompletion(card)} />
                <div style={{ opacity: card.is_completed ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  <strong style={{ fontSize: 15, color: "var(--text)", textDecoration: card.is_completed ? "line-through" : "none" }}>{card.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    Musculação · {card.duration} min {card.cardio_minutes ? ` (+${card.cardio_minutes} min Cardio)` : ''}
                  </div>
                </div>
              </div>
              <button className="btn-ghost" onClick={() => handleEdit(card)}>Editar</button>
            </div>

            {/* Exercises */}
            {(card.exercises && card.exercises.length > 0) && (
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 8 }}>
                {card.exercises.map((ex, idx) => (
                  <ExerciseRow key={`${card.id}-${idx}`} ex={ex} />
                ))}
              </div>
            )}

            {/* Cardio fallback row */}
            {card.cardio_minutes ? (
              <div style={{ borderTop: card.exercises && card.exercises.length > 0 ? "none" : "1px solid var(--border-subtle)", paddingTop: card.exercises && card.exercises.length > 0 ? 0 : 8 }}>
                <ExerciseRow ex={{ name: "Sessão de Cardio", muscle_group: "CARDIO", sets: 1, reps: `${card.cardio_minutes} minutos` }} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </main >
  );
}