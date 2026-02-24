"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

type Workout = {
  id: number;
  date: string;
  name: string;
  duration: number;
};

type WorkoutCard = {
  title: string;
  focus: string;
  frequency: string;
  duration: string;
};

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  note?: string;
};

type MuscleSplitCard = {
  title: string;
  focus: string;
  frequency: string;
  duration: string;
  exercises: Exercise[];
};

const muscleSplits: MuscleSplitCard[] = [
  {
    title: "Peito + triceps",
    focus: "Supino, crucifixo, paralelas",
    frequency: "1-2x/sem",
    duration: "45-70 min",
    exercises: [
      { name: "Supino reto", sets: "4", reps: "8-12" },
      { name: "Supino inclinado", sets: "3", reps: "10-12" },
      { name: "Crucifixo", sets: "3", reps: "12-15" },
      { name: "Triceps pulley", sets: "3", reps: "10-12" },
      { name: "Mergulho", sets: "3", reps: "8-10" },
    ],
  },
  {
    title: "Costas + biceps",
    focus: "Remadas, puxadas, rosca",
    frequency: "1-2x/sem",
    duration: "45-70 min",
    exercises: [
      { name: "Puxada na barra", sets: "4", reps: "8-12" },
      { name: "Remada curvada", sets: "3", reps: "8-10" },
      { name: "Remada baixa", sets: "3", reps: "10-12" },
      { name: "Rosca direta", sets: "3", reps: "10-12" },
      { name: "Rosca alternada", sets: "3", reps: "10-12" },
    ],
  },
  {
    title: "Quad isolado",
    focus: "Agachamento, cadeira extensora",
    frequency: "1x/sem",
    duration: "40-60 min",
    exercises: [
      { name: "Agachamento", sets: "4", reps: "8-10" },
      { name: "Leg press", sets: "3", reps: "10-12" },
      { name: "Cadeira extensora", sets: "3", reps: "12-15" },
      { name: "Avanco", sets: "3", reps: "10-12" },
    ],
  },
  {
    title: "Posterior / perna completa",
    focus: "Stiff, levantamento terra, gluteos",
    frequency: "1x/sem",
    duration: "45-70 min",
    exercises: [
      { name: "Levantamento terra", sets: "4", reps: "6-8" },
      { name: "Stiff", sets: "3", reps: "8-10" },
      { name: "Mesa flexora", sets: "3", reps: "10-12" },
      { name: "Glute bridge", sets: "3", reps: "12-15" },
      { name: "Panturrilha", sets: "3", reps: "12-15" },
    ],
  },
  {
    title: "Ombro isolado",
    focus: "Desenvolvimento, elevacoes",
    frequency: "1x/sem",
    duration: "35-55 min",
    exercises: [
      { name: "Desenvolvimento", sets: "4", reps: "8-12" },
      { name: "Elevacao lateral", sets: "3", reps: "12-15" },
      { name: "Elevacao frontal", sets: "3", reps: "10-12" },
      { name: "Crucifixo inverso", sets: "3", reps: "12-15" },
    ],
  },
  {
    title: "Abdomen ou antebraco",
    focus: "Core, prancha, flexao de punho",
    frequency: "2x/sem",
    duration: "20-30 min",
    exercises: [
      { name: "Prancha", sets: "3", reps: "40-60s" },
      { name: "Abdominal infra", sets: "3", reps: "12-15" },
      { name: "Abdominal obliquo", sets: "3", reps: "12-15" },
      { name: "Flexao de punho", sets: "3", reps: "12-15", note: "antebraco" },
    ],
  },
];

export default function WorkoutsPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [workoutCards, setWorkoutCards] = useState<WorkoutCard[]>([]);
  const [mealSuggestions, setMealSuggestions] = useState<string[]>([]);
  const [mealOfDay, setMealOfDay] = useState<string>("");
  const [workoutOfDay, setWorkoutOfDay] = useState<string>("");

  const loadWorkouts = async () => {
    try {
      const token = getToken();
      const query = date ? `?date=${date}` : "";
      const data = await apiFetch(`/fitness/workouts${query}`, {
        headers: authHeader(token),
      });
      setWorkouts(data);
    } catch (err: any) {
      setMessage(err.message || "Erro ao carregar treinos");
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const loadRecommendations = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const rec = await apiFetch(`/fitness/recommendations?date=${today}`, {
          headers: authHeader(token),
        });
        const highIntensity = rec.workout_intensity.toLowerCase().includes("alto");
        const base = Math.max(2, Math.round(rec.weekly_workouts_goal / 2));
        const cardio = Math.max(1, rec.weekly_workouts_goal - base);
        setWorkoutCards([
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
        ]);
        setWorkoutOfDay(
          rec.workout_intensity.includes("Alto")
            ? "Treino de forca (parte superior)"
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
      } catch (err: any) {
        setWorkoutCards([]);
        setMealSuggestions([]);
        setMealOfDay("");
        setWorkoutOfDay("");
      }
    };
    loadWorkouts();
    loadRecommendations();
  }, [router]);

  const formatWorkoutDate = (value: string) => {
    if (!value) return { day: "", label: "" };
    const dateObj = new Date(`${value}T00:00:00`);
    const day = dateObj.toLocaleDateString("pt-BR", { weekday: "long" });
    const label = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return {
      day: day.charAt(0).toUpperCase() + day.slice(1),
      label,
    };
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDuration(0);
  };

  const handleCreate = async () => {
    try {
      const token = getToken();
      await apiFetch("/fitness/workouts", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ date, name, duration: Number(duration) }),
      });
      setMessage("Treino criado");
      resetForm();
      loadWorkouts();
    } catch (err: any) {
      setMessage(err.message || "Erro ao criar treino");
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingId(workout.id);
    setDate(workout.date);
    setName(workout.name);
    setDuration(workout.duration);
  };

  const handleUpdate = async () => {
    if (editingId == null) return;
    try {
      const token = getToken();
      await apiFetch(`/fitness/workouts/${editingId}`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ date, name, duration: Number(duration) }),
      });
      setMessage("Treino atualizado");
      resetForm();
      loadWorkouts();
    } catch (err: any) {
      setMessage(err.message || "Erro ao atualizar treino");
    }
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Rotina</span>
          <h1>Treinos</h1>
          <p className="page-subtitle">Registre seus treinos para acompanhar a consistência.</p>
        </div>
        <div className="page-actions">
          <div className="field">
            <label>Filtrar por data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button onClick={loadWorkouts}>Listar</button>
        </div>
      </div>

      <div className="form-section">
        <h3>{editingId ? "Editar treino" : "Novo treino"}</h3>
        <div className="form-grid">
          <div>
            <label>Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Duração (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="form-actions">
          {editingId ? (
            <>
              <button onClick={handleUpdate}>Salvar alterações</button>
              <button className="btn-ghost" onClick={resetForm} type="button">
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={handleCreate}>Adicionar</button>
          )}
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}

      <div className="section">
        <h2 className="section-title">Fichas sugeridas pelo seu perfil</h2>
        <div className="workout-grid">
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
              <strong>Sem sugestões ainda</strong>
              <p>Complete o perfil para liberar as fichas personalizadas.</p>
            </div>
          )}
        </div>
      </div>

      <div className="section content-grid">
        <div className="surface-card">
          <strong>Treino do dia</strong>
          <p>{workoutOfDay || "Sem sugestao por enquanto."}</p>
        </div>
        <div className="surface-card">
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

      <div className="section">
        <h2 className="section-title">Fichas completas por grupo muscular</h2>
        <div className="workout-grid">
          {muscleSplits.map((card) => (
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
              <details className="workout-details">
                <summary>Ver ficha detalhada</summary>
                <ul className="workout-exercises">
                  {card.exercises.map((exercise) => (
                    <li key={`${card.title}-${exercise.name}`}>
                      <span className="exercise-name">{exercise.name}</span>
                      <span className="exercise-meta">
                        {exercise.sets} x {exercise.reps}
                        {exercise.note ? ` · ${exercise.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Historico de treinos</h2>
        <div className="workout-log">
          {workouts.length ? (
            workouts.map((workout) => {
              const { day, label } = formatWorkoutDate(workout.date);
              return (
                <div className="workout-entry" key={workout.id}>
                  <div className="workout-date">
                    <span className="workout-day">{day}</span>
                    <span className="workout-date-label">{label}</span>
                  </div>
                  <div className="workout-info">
                    <strong>{workout.name || "Treino registrado"}</strong>
                    <div className="workout-meta">
                      <span className="chip">{workout.duration} min</span>
                      <span className="chip subtle">Sessao concluida</span>
                    </div>
                  </div>
                  <div className="workout-actions">
                    <button className="btn-ghost" onClick={() => handleEdit(workout)}>
                      Editar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="surface-card">
              <strong>Nenhum treino registrado</strong>
              <p>Adicione treinos para acompanhar sua consistencia.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}