// Profile.jsx — /u/[handle] · Profil public
// Post-lock : picks visibles, breakdown points par phase

function ProfileArtboard() {
  const phases = [
    { id: "groups", label: "Poules",       pts: 158, max: 247, done: true,  bar: 0.64 },
    { id: "r32",    label: "16es",         pts: 0,   max: 80,  done: false, bar: 0 },
    { id: "r16",    label: "8es",          pts: 0,   max: 64,  done: false, bar: 0 },
    { id: "qf",     label: "Quarts",       pts: 0,   max: 48,  done: false, bar: 0 },
    { id: "sf",     label: "Demies",       pts: 0,   max: 36,  done: false, bar: 0 },
    { id: "final",  label: "Finale",       pts: 0,   max: 40,  done: false, bar: 0 },
  ];

  // Picks notables : champion, 1ers de groupe
  const groupTops = [
    { letter: "A", team: WC26.groups.A[0], correct: true },
    { letter: "B", team: WC26.groups.B[0], correct: true },
    { letter: "C", team: WC26.groups.C[0], correct: true },
    { letter: "D", team: WC26.groups.D[0], correct: false },
    { letter: "E", team: WC26.groups.E[0], correct: true },
    { letter: "F", team: WC26.groups.F[0], correct: true },
    { letter: "G", team: WC26.groups.G[0], correct: false },
    { letter: "H", team: WC26.groups.H[0], correct: true },
    { letter: "I", team: WC26.groups.I[0], correct: true },
    { letter: "J", team: WC26.groups.J[0], correct: true },
    { letter: "K", team: WC26.groups.K[0], correct: true },
    { letter: "L", team: WC26.groups.L[0], correct: false },
  ];
  const correctCount = groupTops.filter(g => g.correct).length;

  return (
    <Frame>
      <PageHeader active="" countdown={{ d: 22, h: 6, m: 12 }} />

      {/* Hero — profil header */}
      <div style={{
        padding: "36px 56px 24px",
        borderBottom: "1px solid var(--line)",
      }}>
        <SectionLabel>Profil public · pickem.wc26/u/leo</SectionLabel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Avatar name="Léo" hue={160} size={96} />
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
                fontSize: 72, lineHeight: 0.95, margin: 0, color: "var(--paper-1)",
                letterSpacing: -1.2,
              }}>
                Léo
              </h1>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--paper-3)",
                marginTop: 6, letterSpacing: 0.4,
              }}>
                @leo · INSCRIT LE 4 JUIN · 🇫🇷
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 16 }}>
                <MiniKPI label="RANG" value="#10" />
                <MiniKPI label="GROUPES" value="2" />
                <MiniKPI label="POINTS" value="158" tone="var(--gold)" />
                <MiniKPI label="CHAMPION PARIÉ" value="🇫🇷 FRA" />
              </div>
            </div>
          </div>
          <Btn kind="x" size="sm" icon={<XIcon />}>Partager le profil</Btn>
        </div>
      </div>

      {/* Phases breakdown */}
      <div style={{ padding: "32px 56px 24px" }}>
        <SectionLabel num="P.1 — P.6">Points par phase</SectionLabel>
        <div style={{
          marginTop: 16,
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10,
        }}>
          {phases.map(ph => (
            <PhasePtsBar key={ph.id} phase={ph} />
          ))}
        </div>
      </div>

      {/* Group picks recap */}
      <div style={{ padding: "8px 56px 40px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <SectionLabel num="REC.">Tops de groupes prédits</SectionLabel>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mexico)", letterSpacing: 1,
            }}>
              ✓ {correctCount} / 12 EXACTS
            </span>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
          }}>
            {groupTops.map(g => (
              <div key={g.letter} style={{
                position: "relative",
                padding: "10px 12px 10px 14px",
                background: "var(--ink-3)",
                border: g.correct ? "1px solid var(--mexico)" : "1px solid var(--canada)",
                borderRadius: 6,
                display: "grid", gridTemplateColumns: "auto auto 1fr auto", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-4)",
                  letterSpacing: 0.8,
                }}>
                  {g.letter}
                </span>
                <span style={{ fontSize: 16 }}>{g.team.flag}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-2)" }}>
                  {g.team.code}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: g.correct ? "var(--mexico)" : "var(--canada)",
                  letterSpacing: 0.6,
                }}>
                  {g.correct ? "✓" : "✕"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <SectionLabel num="ACH.">Badges & faits d'armes</SectionLabel>
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <Badge icon="🎯" title="Madame Irma" sub="9/12 tops de groupes exacts" unlocked />
            <Badge icon="🥉" title="Le 3ème œil" sub="6/8 meilleurs 3èmes corrects" unlocked />
            <Badge icon="⚡" title="Premier locké" sub="Picks lockés &gt; 24h avant la deadline" />
            <Badge icon="👑" title="Royaume" sub="Champion correct (à débloquer)" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function MiniKPI({ label, value, tone = "var(--paper-1)" }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.4,
        color: "var(--paper-3)",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 28, lineHeight: 1, color: tone, marginTop: 2,
      }}>
        {value}
      </div>
    </div>
  );
}

function PhasePtsBar({ phase }) {
  const tone = phase.done ? "var(--mexico)" : "var(--paper-4)";
  return (
    <div style={{
      padding: "14px 14px 16px",
      background: "var(--ink-2)",
      border: "1px solid var(--line)",
      borderRadius: 8,
      display: "grid", gap: 8,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.2,
        color: "var(--paper-3)",
      }}>
        {phase.label.toUpperCase()}
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 34, lineHeight: 1, color: phase.done ? "var(--paper-1)" : "var(--paper-3)",
        }}>
          {phase.pts}
          <span style={{ fontSize: 14, color: "var(--paper-3)" }}> / {phase.max}</span>
        </div>
      </div>
      <div style={{
        height: 4, background: "var(--ink-1)", borderRadius: 2, overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0, width: `${phase.bar * 100}%`,
          background: tone, borderRadius: 2,
        }} />
      </div>
    </div>
  );
}

function Badge({ icon, title, sub, unlocked }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      background: unlocked ? "var(--ink-3)" : "var(--ink-2)",
      border: unlocked ? "1px solid var(--line-strong)" : "1px dashed var(--line)",
      borderRadius: 8,
      opacity: unlocked ? 1 : 0.55,
    }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, color: "var(--paper-1)", fontWeight: 500 }}>{title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--paper-3)", letterSpacing: 0.4 }}
             dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.2,
        color: unlocked ? "var(--mexico)" : "var(--paper-4)",
      }}>
        {unlocked ? "✓" : "·"}
      </span>
    </div>
  );
}

Object.assign(window, { ProfileArtboard });
