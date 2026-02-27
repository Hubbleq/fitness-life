export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-layout">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="auth-logo-icon" style={{
            width: 56,
            height: 56,
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.53 10.11l-6.64-6.64M5.26 21.04l-2.6-2.6a1.5 1.5 0 0 1 0-2.12l1.64-1.64M18.66 8.24l2.6-2.6a1.5 1.5 0 0 0 0-2.12l-1.64-1.64a1.5 1.5 0 0 0-2.12 0l-2.6 2.6M5.26 21.04l4.24-4.24M18.66 8.24l-4.24 4.24" />
              <line x1="8.58" y1="11.41" x2="11.41" y2="8.58" />
              <line x1="12.58" y1="15.41" x2="15.41" y2="12.58" />
            </svg>
          </div>
          <div className="auth-logo-text" style={{ fontSize: 32, marginBottom: 8 }}>
            Fitness <span style={{ color: "var(--primary)" }}>Hub</span>
          </div>
        </div>
        <section className="auth-form">{children}</section>
      </div>
    </div>
  );
}