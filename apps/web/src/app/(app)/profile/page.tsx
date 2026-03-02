"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authHeader, getToken } from "../../../lib/api";

const activityOptions = [
  { value: "sedentary", label: "Sedentário" },
  { value: "light", label: "Leve (1-3x/sem)" },
  { value: "moderate", label: "Moderado (3-5x/sem)" },
  { value: "active", label: "Ativo (6-7x/sem)" },
  { value: "athlete", label: "Atleta" },
];

const goalOptions = [
  { value: "cut", label: "Perder gordura" },
  { value: "maintain", label: "Manter" },
  { value: "bulk", label: "Ganhar massa" },
];

const healthPredefinedTags = [
  "Diabetes", "Hipertensão", "Dor na Lombar", "Problemas Cardíacos", "Asma",
  "Gravidez", "Lactante", "Intolerância à Lactose", "Alergia a Glúten",
  "Dor nos Joelhos", "Dor nos Ombros", "Colesterol Alto"
];

function calculateBmr(sex: string, weightKg: number, heightCm: number, age: number) {
  if (sex === "female") return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

function activityMultiplier(level: string) {
  const map: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };
  return map[level] ?? 1.2;
}

function goalFactor(goal: string) {
  const map: Record<string, number> = { cut: 0.8, maintain: 1.0, bulk: 1.1 };
  return map[goal] ?? 1.0;
}

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");

  const [selectedHealthTags, setSelectedHealthTags] = useState<string[]>([]);
  const [otherHealthConditions, setOtherHealthConditions] = useState("");

  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bmr = calculateBmr(sex, Number(weightKg), Number(heightCm), Number(age));
  const caloriesTarget = Math.round(bmr * activityMultiplier(activity) * goalFactor(goal));
  const proteinTarget = Math.round(Number(weightKg) * (goal === "maintain" ? 1.6 : 2.0));
  const goalLabel = goalOptions.find((o) => o.value === goal)?.label ?? "";

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    const load = async () => {
      try {
        const data = await apiFetch("/fitness/profile", { headers: authHeader(token) });
        if (data) {
          setName(data.name || ""); setSex(data.sex); setAge(data.age);
          setHeightCm(data.height_cm); setWeightKg(data.weight_kg);
          setActivity(data.activity_level); setGoal(data.goal);

          if (data.health_conditions) {
            const parsed = data.health_conditions.split(",").map((s: string) => s.trim());
            const matchedTags = parsed.filter((p: string) => healthPredefinedTags.includes(p));
            const unmatched = parsed.filter((p: string) => !healthPredefinedTags.includes(p));
            setSelectedHealthTags(matchedTags);
            setOtherHealthConditions(unmatched.join(", "));
          }

          setAvatarUrl(data.avatar_url || null);
        }
      } catch (err: any) { setMessage(err.message || "Erro ao carregar perfil"); }
    };
    load();
  }, [router]);

  const handleSave = async () => {
    if (!name.trim()) { setMessage("Informe seu nome"); return; }
    try {
      const finalHealthConditions = [...selectedHealthTags, otherHealthConditions.trim()].filter(Boolean).join(", ");

      const token = getToken();
      await apiFetch("/fitness/profile", {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({
          name, sex, age: Number(age), height_cm: Number(heightCm), weight_kg: Number(weightKg),
          activity_level: activity, goal, avatar_url: avatarUrl,
          health_conditions: finalHealthConditions || undefined
        }),
      });
      setMessage("Perfil salvo com sucesso");
    } catch (err: any) { setMessage(err.message || "Erro ao salvar perfil"); }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.8));
      };
      if (ev.target?.result) img.src = ev.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="fade-in profile-page-wrapper">
      <div className="profile-header surface-card glow-neon-sm" style={{ backdropFilter: "blur(20px)", background: "rgba(17, 17, 17, 0.6)", marginBottom: 24 }}>
        <div className="profile-avatar-container" style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 0" }}>
          <div
            className="avatar-circle enhanced-avatar"
            onClick={handleAvatarClick}
            title="Alterar foto de perfil"
            style={{
              width: 100, height: 100, borderRadius: "50%", cursor: "pointer",
              overflow: "hidden", position: "relative", border: "2px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}
          >
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: "none" }} />
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span className="avatar-text" style={{ fontSize: 32 }}>{name ? name.substring(0, 2).toUpperCase() : "FL"}</span>
            )}
            <div className="avatar-hover-overlay" style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s ease", color: "#fff", backdropFilter: "blur(2px)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: 4 }}><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><circle cx="12" cy="12" r="3.2" /></svg>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Alterar</span>
            </div>
          </div>
          <div>
            <span className="eyebrow" style={{ color: "var(--primary)" }}>Configurações de Conta</span>
            <h1 style={{ fontSize: 28, margin: "4px 0 8px" }}>{name || "Seu Perfil"}</h1>
            <p className="page-subtitle" style={{ margin: 0, fontSize: 14 }}>Personalize suas informações biológicas e métricas de atividade.</p>
          </div>
        </div>
      </div>

      <div className="split-grid" style={{ gap: 24 }}>
        <div className="form-section surface-card" style={{ padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12 }}>Dados Pessoais</h3>

          <h4 className="profile-section-title" style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 0 }}>Biológico</h4>
          <div className="form-grid" style={{ marginBottom: 32, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            <div className="input-group">
              <label>Sexo</label>
              <select className="premium-input" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
            <div className="input-group"><label>Idade (anos)</label><input className="premium-input" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
            <div className="input-group"><label>Altura (cm)</label><input className="premium-input" type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} /></div>
            <div className="input-group"><label>Peso (kg)</label><input className="premium-input" type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} /></div>
          </div>

          <h4 className="profile-section-title" style={{ fontSize: 14, color: "var(--text-muted)" }}>Objetivos</h4>
          <div className="form-grid" style={{ gridTemplateColumns: "1fr", gap: 16 }}>
            <div className="input-group"><label>Nome de exibição</label><input className="premium-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="input-group">
                <label>Nível de Atividade</label>
                <select className="premium-input" value={activity} onChange={(e) => setActivity(e.target.value)}>
                  {activityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Principal Objetivo</label>
                <select className="premium-input" value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {goalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 8 }}>
              <label>Condições de Saúde e Restrições</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "8px 0 16px" }}>
                {healthPredefinedTags.map(tag => {
                  const isSelected = selectedHealthTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedHealthTags(prev =>
                          isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                        background: isSelected ? "rgba(239, 68, 68, 0.1)" : "transparent",
                        color: isSelected ? "var(--primary)" : "var(--text-muted)",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Outras observações:</label>
              <textarea
                className="premium-input"
                value={otherHealthConditions}
                onChange={(e) => setOtherHealthConditions(e.target.value)}
                placeholder="Ex: Cirurgia recente, Remédios..."
                style={{ minHeight: "80px", resize: "vertical", padding: "12px", width: "100%" }}
              />
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>A IA adaptará vigorosamente as recomendações com base no que foi informado.</span>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
            {message ? <span className="form-message fade-in" style={{ fontSize: 13, color: message.includes("Erro") ? "var(--error)" : "var(--success)" }}>{message}</span> : <span />}
            <button className="btn-save-profile" onClick={handleSave} style={{ alignSelf: "flex-end", padding: "10px 24px", fontSize: 14 }}>
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="surface-card highlight-card glow-neon-sm" style={{ backdropFilter: "blur(20px)", background: "rgba(17, 17, 17, 0.6)", alignSelf: "start", position: "sticky", top: 24, padding: 24 }}>
          <strong style={{ fontSize: 18, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12, display: "block" }}>Resumo Diário</strong>
          <ul className="summary-list" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <li className="summary-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Metabolismo Basal</span>
              <strong style={{ fontSize: 16 }}>{bmr} kcal</strong>
            </li>
            <li className="summary-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Meta de Proteína</span>
              <strong style={{ fontSize: 16 }}>{proteinTarget} g</strong>
            </li>
            <li className="summary-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Foco do Plano</span>
              <strong style={{ fontSize: 14, background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: 4 }}>{goalLabel}</strong>
            </li>
            <li className="summary-item" style={{
              background: "rgba(239, 68, 68, 0.08)", padding: 16, borderRadius: 12,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              border: "1px solid rgba(239, 68, 68, 0.2)", marginTop: 8
            }}>
              <span style={{ color: "var(--primary)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Alvo Calórico Total</span>
              <strong style={{ fontSize: 32, color: "#fff", lineHeight: 1 }}>{caloriesTarget} <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}>kcal/dia</span></strong>
            </li>
          </ul>
          <p className="muted-note" style={{ textAlign: "center", margin: "16px 0", fontSize: 12 }}>Esses valores são recalibrados automaticamente ao salvar.</p>
          <div className="cta-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <a className="btn secondary" href="/goals" style={{ padding: "10px 0", fontSize: 13, textAlign: "center" }}>Ajustar Macros</a>
            <a className="btn secondary" href="/dashboard" style={{ padding: "10px 0", fontSize: 13, textAlign: "center", background: "rgba(255,255,255,0.1)" }}>Voltar ao Painel</a>
          </div>
        </div>
      </div>
    </main>
  );
}