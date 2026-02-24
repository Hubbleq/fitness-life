"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

export default function GoalsPage() {
  const router = useRouter();
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(120);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const load = async () => {
      try {
        const data = await apiFetch("/fitness/goals", {
          headers: authHeader(token),
        });
        if (data) {
          setCalories(data.calories);
          setProtein(data.protein);
        }
      } catch (err: any) {
        setMessage(err.message || "Erro ao buscar metas");
      }
    };
    load();
  }, [router]);

  const handleSave = async () => {
    try {
      const token = getToken();
      const data = await apiFetch("/fitness/goals", {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ calories: Number(calories), protein: Number(protein) }),
      });
      setMessage(`Metas salvas: ${data.calories} kcal / ${data.protein}g`);
    } catch (err: any) {
      setMessage(err.message || "Erro ao salvar metas");
    }
  };

  return (
    <main className="fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Planejamento</span>
          <h1>Metas</h1>
          <p className="page-subtitle">Ajuste calorias e proteína de acordo com o seu objetivo.</p>
        </div>
      </div>

      <div className="form-section">
        <h3>Metas diárias</h3>
        <div className="form-grid">
          <div>
            <label>Calorias</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
            />
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
        <button onClick={handleSave}>Salvar</button>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
    </main>
  );
}