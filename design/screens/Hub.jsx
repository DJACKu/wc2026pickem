// Hub.jsx — /picks · cartes par phase

function HubArtboard() {
  return (
    <Frame>
      <PageHeader active="PICKS" countdown={{ d: 5, h: 18, m: 24 }} />

      <div style={{ padding: "40px 56px 48px" }}>

        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
          <div>
            <SectionLabel num="J−5">Tes picks</SectionLabel>
            <h1 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
              fontSize: 72, lineHeight: 0.95, letterSpacing: -1.4,
              margin: "14px 0 0", color: "var(--paper-1)",
            }}>
              Six phases.<br/>Une seule chance par phase.
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: 1.4,
              color: "var(--paper-3)", textTransform: "uppercase",
            }}>
              TON SCORE TOTAL
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: 64, lineHeight: 1, color: "var(--paper-1)",
            }}>
              0<span style={{ color: "var(--paper-3)", fontSize: 28 }}> / 247</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 0.8 }}>
              CLASSEMENT GÉNÉRAL — N/A
            </div>
          </div>
        </div>

        {/* Phases grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}>
          {[
            { ...WC26.phases[0], status: "open",     hero: true,  cta: "Continuer",  detail: "47 / 48 équipes positionnées · 7 / 8 meilleurs 3èmes", pts: "MAX 247 PTS" },
            { ...WC26.phases[1], status: "upcoming", hero: false, cta: "Verrouillé",  detail: "S'ouvre après le dernier match des poules",          pts: "MAX 80 PTS" },
            { ...WC26.phases[2], status: "upcoming", hero: false, cta: "Verrouillé",  detail: "8 vainqueurs à choisir",                              pts: "MAX 64 PTS" },
            { ...WC26.phases[3], status: "upcoming", hero: false, cta: "Verrouillé",  detail: "4 vainqueurs à choisir",                              pts: "MAX 48 PTS" },
            { ...WC26.phases[4], status: "upcoming", hero: false, cta: "Verrouillé",  detail: "2 finalistes",                                        pts: "MAX 36 PTS" },
            { ...WC26.phases[5], status: "upcoming", hero: false, cta: "Verrouillé",  detail: "Petite finale + Champion du monde",                   pts: "MAX 40 PTS" },
          ].map((p, i) => (
            <PhaseCard key={p.id} idx={i + 1} phase={p} />
          ))}
        </div>

      </div>
    </Frame>
  );
}

function PhaseCard({ idx, phase }) {
  const isOpen = phase.status === "open";
  const tone = isOpen ? "var(--mexico)" : "var(--paper-4)";

  return (
    <div style={{
      position: "relative",
      padding: "22px 22px 20px",
      background: isOpen ? "var(--ink-3)" : "var(--ink-2)",
      border: `1px solid ${isOpen ? "var(--line-strong)" : "var(--line)"}`,
      borderRadius: 10,
      display: "grid",
      gap: 16,
      minHeight: 240,
      gridTemplateRows: "auto 1fr auto",
    }}>
      {/* top: status pill + index */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusPill status={phase.status}>
          {isOpen ? "OUVERT" : "VERROUILLÉ"}
        </StatusPill>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--paper-4)",
          letterSpacing: 1,
        }}>
          {String(idx).padStart(2, "0")} / 06
        </span>
      </div>

      {/* main: phase title + dates */}
      <div>
        <h3 style={{
          fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
          fontSize: 32, lineHeight: 1, margin: 0,
          color: isOpen ? "var(--paper-1)" : "var(--paper-2)",
        }}>
          {phase.label}
        </h3>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)",
          marginTop: 8, letterSpacing: 0.4,
        }}>
          {phase.dates}
        </div>
        <p style={{
          fontSize: 12.5, color: isOpen ? "var(--paper-2)" : "var(--paper-3)",
          marginTop: 14, lineHeight: 1.5,
        }}>
          {phase.detail}
        </p>
      </div>

      {/* footer: lock countdown + CTA */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid var(--line)",
        paddingTop: 14,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--paper-4)", letterSpacing: 1.4 }}>
            LOCK · {phase.lock}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: tone, letterSpacing: 1, marginTop: 4 }}>
            {phase.pts}
          </div>
        </div>
        {isOpen ? (
          <Btn kind="primary" size="sm">{phase.cta} →</Btn>
        ) : (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-4)",
            letterSpacing: 1.2, display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <LockIcon />
            {phase.cta}
          </span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HubArtboard });
