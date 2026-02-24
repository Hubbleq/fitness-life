"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

type Meal = {
  id: number;
  date: string;
  name: string;
  protein: number;
};

export default function MealsPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [protein, setProtein] = useState(0);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const easyMeals = [
    "Omelete com queijo",
    "Frango grelhado + arroz",
    "Atum com salada",
    "Iogurte grego + fruta",
    "Sanduíche integral com ovo",
    "Tapioca com frango desfiado",
  ];

  const loadMeals = async () => {
    try {
      const token = getToken();
      const query = date ? `?date=${date}` : "";
      const data = await apiFetch(`/fitness/meals${query}`, {
        headers: authHeader(token),
      });
      setMeals(data);
    } catch (err: any) {
      setMessage(err.message || "Erro ao carregar refeições");
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    loadMeals();
  }, [router]);

  const handleCreate = async () => {
    try {
      const token = getToken();
      await apiFetch("/fitness/meals", {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ date, name, protein: Number(protein) }),
      });
      setMessage("Refeição criada");
      resetForm();
      loadMeals();
    } catch (err: any) {
      setMessage(err.message || "Erro ao criar refeição");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setProtein(0);
  };

  const handleEdit = (meal: Meal) => {
    setEditingId(meal.id);
    setDate(meal.date);
    setName(meal.name);
    setProtein(meal.protein);
  };

  const handleUpdate = async () => {
    if (editingId == null) return;
    try {
      const token = getToken();
      await apiFetch(`/fitness/meals/${editingId}`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ date, name, protein: Number(protein) }),
      });
      setMessage("Refeição atualizada");
      resetForm();
      loadMeals();
    } catch (err: any) {
      setMessage(err.message || "Erro ao atualizar refeição");
    }
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Nutrição</span>
          <h1>Refeições</h1>
          <p className="page-subtitle">Registre suas refeições e acompanhe a proteína.</p>
        </div>
        <div className="page-actions">
          <div className="field">
            <label>Filtrar por data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button onClick={loadMeals}>Listar</button>
        </div>
      </div>

      <div className="form-section">
        <h3>{editingId ? "Editar refeição" : "Nova refeição"}</h3>
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
            <label>Proteína (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
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

      <div className="card">
        <h3>Refeições fáceis</h3>
        <div className="badge-row">
          {easyMeals.map((item) => (
            <span className="badge" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <ul className="list">
        {meals.map((meal) => (
          <li className="list-item" key={meal.id}>
            <span>
              {meal.date} - {meal.name}
            </span>
            <span className="list-actions">
              <span className="chip">{meal.protein}g proteína</span>
              <button className="btn-ghost" onClick={() => handleEdit(meal)}>
                Editar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}