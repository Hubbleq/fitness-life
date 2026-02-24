const highlights = [
  "Plano diário em minutos",
  "Metas ajustadas por objetivo",
  "Recomendações por perfil",
  "Checklist simples de treino",
] as const;

const heroStats = [
  { label: "Tempo médio", value: "3 min" },
  { label: "Visão semanal", value: "Tudo em um painel" },
  { label: "Rotina", value: "Resultados consistentes" },
] as const;

const features = [
  {
    title: "Metas claras",
    text: "Defina calorias e proteína com ajustes automáticos por objetivo.",
  },
  {
    title: "Registro fácil",
    text: "Refeições e treinos em poucos campos, sem fricção.",
  },
  {
    title: "Resumo inteligente",
    text: "Acompanhe dia e semana com indicadores simples.",
  },
  {
    title: "Pronto para começar",
    text: "Fluxo guiado para novos usuários, sem configurações complexas.",
  },
] as const;

export default function MarketingPage() {
  return (
    <main className="marketing-main">
      <section className="hero-grid">
        <div className="stagger hero-copy">
          <span className="eyebrow">Motion Lab</span>
          <h1 className="hero-title">
            Treino e dieta organizados para você manter o foco todos os dias.
          </h1>
          <p className="page-subtitle">
            Um painel simples para criar metas, registrar refeições e acompanhar resultados em tempo real.
          </p>
          <div className="cta-row">
            <a className="btn" href="/login">
              Entrar
            </a>
            <a className="btn secondary" href="/register">
              Criar conta
            </a>
          </div>
          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-header">
            <h3>Seu dia em 3 passos</h3>
            <p>Controle tudo sem perder tempo.</p>
          </div>
          <div className="hero-visual">
            <img src="/images/hero.jpg" alt="Painel Motion Lab" />
          </div>
          <ol className="hero-steps">
            <li>
              <span className="step-badge">1</span>
              Atualize perfil e objetivos.
            </li>
            <li>
              <span className="step-badge">2</span>
              Registre refeições e treinos.
            </li>
            <li>
              <span className="step-badge">3</span>
              Acompanhe o resumo diário.
            </li>
          </ol>
          <div className="hero-tags">
            {highlights.map((item) => (
              <span className="badge" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="section-head">
          <span className="eyebrow">Tudo em um lugar</span>
          <h2 className="section-title">Feito para iniciantes e consistentes</h2>
          <p className="page-subtitle">
            Uma interface que guia você do primeiro cadastro até o hábito diário.
          </p>
        </div>
        <div className="feature-grid stagger">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
        <div className="marketing-visual">
          <img src="/images/app-preview.png" alt="Preview do Motion Lab" />
        </div>
      </section>
    </main>
  );
}
