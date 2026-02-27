"use client";

import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div style={{ background: "#0c0c0c", minHeight: "100vh", color: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-title-m { font-size: clamp(36px, 5vw, 56px); font-weight: 800; line-height: 1.1; letter-spacing: -1px; margin: 16px 0 24px; }
        .hero-title-m span { color: #ef4444; }
        .hero-subtitle-m { font-size: 18px; color: #a1a1aa; line-height: 1.5; margin-bottom: 40px; max-width: 480px; }
        .btn-red { background: #ef4444; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 0 20px rgba(239,68,68,0.4); border: 1px solid #ef4444; transition: all 0.2s; cursor: pointer; }
        .btn-red:hover { background: #dc2626; box-shadow: 0 0 30px rgba(239,68,68,0.6); }
        .btn-outline { background: transparent; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; cursor: pointer; }
        .btn-outline:hover { background: rgba(255,255,255,0.05); }
        .stat-block { background: transparent; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; flex: 1; min-width: 140px; }
        .stat-label { font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
        .stat-val { font-size: 14px; font-weight: 600; color: #e4e4e7; }
        .hero-right-card { background: #18181b; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .hero-step { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; font-size: 14px; color: #d4d4d8; }
        .hero-step-num { width: 26px; height: 26px; border-radius: 50%; background: rgba(239,68,68,0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .pill-badge { font-size: 11px; padding: 6px 14px; border-radius: 100px; border: 1px solid rgba(239,68,68,0.2); color: rgba(239,68,68,0.8); background: transparent; display: inline-block; }
        
        .section-eyebrow { font-size: 11px; font-weight: 700; color: #ef4444; text-transform: uppercase; letter-spacing: 2px; }
        .section-title { font-size: clamp(28px, 4vw, 36px); font-weight: 800; margin: 12px 0 16px; }
        .section-subtitle { font-size: 16px; color: #a1a1aa; max-width: 600px; margin: 0 auto; }
        
        .bento-card { background: #121214; border: 1px solid rgba(255,255,255,0.03); border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 16px; transition: transform 0.2s, border-color 0.2s; }
        .bento-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.08); }
        .bento-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(239,68,68,0.05); color: #ef4444; display: flex; align-items: center; justify-content: center; }
        .bento-card h3 { font-size: 18px; font-weight: 700; margin: 0; }
        .bento-card p { font-size: 14px; color: #71717a; line-height: 1.5; margin: 0; }
        
        .func-card { background: #121214; border: 1px solid rgba(255,255,255,0.03); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s; }
        .func-card:hover { transform: translateY(-4px); }
        .func-img { width: 100%; height: 220px; object-fit: cover; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .func-content { padding: 24px; position: relative; }
        .func-icon-float { position: absolute; top: -22px; left: 24px; width: 44px; height: 44px; background: #270c0c; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .func-content h3 { font-size: 18px; font-weight: 700; margin: 12px 0 8px; }
        .func-content p { font-size: 14px; color: #71717a; line-height: 1.5; margin: 0; }

        @media (max-width: 900px) {
          .hero-grid-m { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}} />

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.53 10.11l-6.64-6.64M5.26 21.04l-2.6-2.6a1.5 1.5 0 0 1 0-2.12l1.64-1.64M18.66 8.24l2.6-2.6a1.5 1.5 0 0 0 0-2.12l-1.64-1.64a1.5 1.5 0 0 0-2.12 0l-2.6 2.6M5.26 21.04l4.24-4.24M18.66 8.24l-4.24 4.24" />
            <line x1="8.58" y1="11.41" x2="11.41" y2="8.58" />
            <line x1="12.58" y1="15.41" x2="15.41" y2="12.58" />
          </svg>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Fitness <span style={{ color: "white" }}>Hub</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/login" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Entrar</Link>
          <Link href="/register" style={{ background: "#ef4444", color: "white", textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Criar conta</Link>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 120px' }}>

        {/* HERO SECTION */}
        <section className="hero-grid-m" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 120 }}>
          <div>
            <span className="section-eyebrow">FITNESS HUB</span>
            <h1 className="hero-title-m">
              Treino e dieta organizados para você manter o <span>foco todos os dias.</span>
            </h1>
            <p className="hero-subtitle-m">
              Um painel simples para criar metas, registrar refeições e acompanhar resultados em tempo real.
            </p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
              <Link href="/register" className="btn-red">
                Começar agora <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/login" className="btn-outline">Entrar</Link>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div className="stat-block">
                <span className="stat-label">Tempo médio</span>
                <span className="stat-val">3 min</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">Visão semanal</span>
                <span className="stat-val">Tudo em um painel</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">Rotina</span>
                <span className="stat-val">Resultados consistentes</span>
              </div>
            </div>
          </div>
          <div className="hero-right-card">
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0' }}>Seu dia em 3 passos</h3>
            <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>Controle tudo sem perder tempo.</p>

            <img src="/images/lading-hero.jfif" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }} alt="App screen" />

            <div className="hero-step"><div className="hero-step-num">1</div>Atualize perfil e objetivos.</div>
            <div className="hero-step"><div className="hero-step-num">2</div>Registre refeições e treinos.</div>
            <div className="hero-step"><div className="hero-step-num">3</div>Acompanhe o resumo diário.</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
              <span className="pill-badge">Plano diário em minutos</span>
              <span className="pill-badge">Metas ajustadas por objetivo</span>
              <span className="pill-badge">Recomendações por perfil</span>
              <span className="pill-badge">Checklist simples de treino</span>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section style={{ textAlign: 'center', marginBottom: 160 }}>
          <span className="section-eyebrow">TUDO EM UM LUGAR</span>
          <h2 className="section-title">Feito para iniciantes e consistentes</h2>
          <p className="section-subtitle" style={{ marginBottom: 64 }}>Uma interface que guia você do primeiro cadastro até o hábito diário.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, textAlign: 'left' }}>

            <div className="bento-card">
              <div className="bento-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
              </div>
              <div>
                <h3>Metas claras</h3>
                <p>Defina calorias e proteína com ajustes automáticos por objetivo.</p>
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div>
                <h3>Registro fácil</h3>
                <p>Refeições e treinos em poucos campos, sem fricção.</p>
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /><line x1="15" y1="21" x2="15" y2="9" /></svg>
              </div>
              <div>
                <h3>Resumo inteligente</h3>
                <p>Acompanhe dia e semana com indicadores simples.</p>
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <div>
                <h3>Pronto para começar</h3>
                <p>Fluxo guiado para novos usuários, sem complexidade.</p>
              </div>
            </div>

          </div>
        </section>

        {/* FUNCIONALIDADES */}
        <section style={{ textAlign: 'center', marginBottom: 160 }}>
          <span className="section-eyebrow">FUNCIONALIDADES</span>
          <h2 className="section-title">Controle total da sua rotina</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, textAlign: 'left', marginTop: 64 }}>

            <div className="func-card">
              <img src="/images/workouts-header.jpg" alt="Treino" className="func-img" />
              <div className="func-content">
                <div className="func-icon-float">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.53 10.11l-6.64-6.64M5.26 21.04l-2.6-2.6a1.5 1.5 0 0 1 0-2.12l1.64-1.64M18.66 8.24l2.6-2.6a1.5 1.5 0 0 0 0-2.12l-1.64-1.64a1.5 1.5 0 0 0-2.12 0l-2.6 2.6M5.26 21.04l4.24-4.24M18.66 8.24l-4.24 4.24" /><line x1="8.58" y1="11.41" x2="11.41" y2="8.58" /><line x1="12.58" y1="15.41" x2="15.41" y2="12.58" /></svg>
                </div>
                <h3>Treinos inteligentes</h3>
                <p>Registre séries, cargas e acompanhe a evolução muscular.</p>
              </div>
            </div>

            <div className="func-card">
              <img src="/images/meals.jfif" alt="Nutrição" className="func-img" />
              <div className="func-content">
                <div className="func-icon-float">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-45deg)" }}>
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                    <path d="M7 2v20" />
                    <circle cx="17" cy="6" r="4" />
                    <path d="M17 10v12" />
                  </svg>
                </div>
                <h3>Nutrição planejada</h3>
                <p>Monte refeições equilibradas com sugestões da IA.</p>
              </div>
            </div>

            <div className="func-card">
              <img src="/images/tracking.jfif" alt="Evolução" className="func-img" />
              <div className="func-content">
                <div className="func-icon-float">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                </div>
                <h3>Progressão visual</h3>
                <p>Gráficos de evolução de peso e volume de treino.</p>
              </div>
            </div>

          </div>
        </section>

        {/* CTA BOTTOM */}
        <section style={{ textAlign: 'center', margin: '0 auto', maxWidth: 600, padding: '80px 0' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 32px', boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)' }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <h2 className="section-title" style={{ fontSize: 32 }}>Comece sua transformação <span style={{ color: '#ef4444' }}>agora</span></h2>
          <p className="section-subtitle" style={{ marginBottom: 40 }}>Cadastre-se em menos de 2 minutos e tenha seu plano fitness personalizado.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link href="/register" className="btn-red" style={{ fontSize: 15, padding: '16px 36px', width: 'fit-content' }}>
              Criar conta grátis <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>

      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.53 10.11l-6.64-6.64M5.26 21.04l-2.6-2.6a1.5 1.5 0 0 1 0-2.12l1.64-1.64M18.66 8.24l2.6-2.6a1.5 1.5 0 0 0 0-2.12l-1.64-1.64a1.5 1.5 0 0 0-2.12 0l-2.6 2.6M5.26 21.04l4.24-4.24M18.66 8.24l-4.24 4.24" />
            <line x1="8.58" y1="11.41" x2="11.41" y2="8.58" />
            <line x1="12.58" y1="15.41" x2="15.41" y2="12.58" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Fitness Hub</span>
        </div>
        <div style={{ fontSize: 11, color: '#71717a' }}>
          &copy; 2026 Fitness Hub. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
