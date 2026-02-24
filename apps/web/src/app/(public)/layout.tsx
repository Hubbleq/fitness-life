export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-layout">
      <div className="auth-card auth-split">
        <aside className="auth-hero">
          <div className="hero-badge">Plano inteligente</div>
          <h2>Organize treino e dieta com recomendações reais.</h2>
          <p>
            Metas personalizadas, resumo diário e dicas rápidas para manter o foco.
          </p>
          <ul>
            <li>✔️ BMR e meta calórica automática</li>
            <li>✔️ Proteína ideal por objetivo</li>
            <li>✔️ Refeições fáceis e práticas</li>
            <li>✔️ Treinos por intensidade</li>
          </ul>
        </aside>
        <section className="auth-form">{children}</section>
      </div>
    </div>
  );
}