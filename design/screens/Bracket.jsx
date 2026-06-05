// Bracket.jsx — /picks/r32 · arbre KO
// Lecture seule + mode pick (tap = vainqueur)

function BracketArtboard() {
  // R32 → R16 → QF → SF → Final
  // 16 matchs R32, on en représente 8 (haut) + 8 (bas), affichage condensé
  // Pour la maquette : on remplit avec quelques affiches plausibles top 2 par groupe
  const r32 = [
    [WC26.groups.A[0], WC26.groups.B[1]], // A1 vs B2
    [WC26.groups.C[0], WC26.groups.D[1]],
    [WC26.groups.E[0], WC26.groups.F[1]],
    [WC26.groups.G[0], WC26.groups.H[1]],
    [WC26.groups.I[0], WC26.groups.J[1]],
    [WC26.groups.K[0], WC26.groups.L[1]],
    [WC26.groups.B[0], WC26.groups.A[1]],
    [WC26.groups.D[0], WC26.groups.C[1]],
  ];

  // picks indices : which side the user picked
  const picks = [0, 0, 1, 0, 0, 1, 0, 1]; // 0 = home, 1 = away

  return (
    <Frame>
      <PageHeader active="BRACKET" countdown={{ d: 22, h: 6, m: 12 }} />

      <div style={{
        padding: "16px 56px",
        borderBottom: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 1 }}>
            BRACKET · PHASES 2 → 6
          </span>
          <span style={{ color: "var(--paper-4)" }}>/</span>
          <StatusPill status="upcoming">OUVERTURE APRÈS LES POULES</StatusPill>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["R32", "R16", "QF", "SF", "FINAL"].map((p, i) => (
            <span key={p} style={{
              fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1.2,
              padding: "5px 10px", borderRadius: 4,
              background: i === 0 ? "var(--paper-1)" : "transparent",
              color: i === 0 ? "var(--ink-1)" : "var(--paper-3)",
              border: i === 0 ? "1px solid var(--paper-1)" : "1px solid var(--line)",
            }}>{p}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 56px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <SectionLabel num="P.2">Phase R32 — 16es</SectionLabel>
          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
            fontSize: 56, lineHeight: 0.95, margin: "14px 0 0", color: "var(--paper-1)",
          }}>
            16 matchs. <span style={{ color: "var(--paper-3)" }}>16 tap.</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--paper-2)", marginTop: 10, maxWidth: 460 }}>
            Le bracket complet est consultable, mais seuls les R32 sont éditables pour cette phase. +5 pts par vainqueur correct.
          </p>
        </div>
        <ProgressDial filled={8} total={16} label="MATCHS" />
      </div>

      {/* Bracket grid */}
      <div style={{
        padding: "0 56px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1.4fr 1fr 1fr 1fr 1fr",
        gap: 16,
        alignItems: "stretch",
      }}>
        {/* LEFT side: R32 */}
        <div style={{ display: "grid", gap: 12 }}>
          <RoundLabel label="R32" />
          {r32.slice(0, 4).map((m, i) => (
            <BracketMatch key={i} home={m[0]} away={m[1]} pickedSide={picks[i]} />
          ))}
        </div>
        {/* R16 left placeholders */}
        <div style={{ display: "grid", gap: 32, alignContent: "center" }}>
          <RoundLabel label="R16" />
          {[0, 1].map(i => <BracketPlaceholder key={i} />)}
        </div>
        {/* QF left */}
        <div style={{ display: "grid", gap: 32, alignContent: "center" }}>
          <RoundLabel label="QUART" />
          <BracketPlaceholder />
        </div>
        {/* SF left */}
        <div style={{ display: "grid", alignContent: "center" }}>
          <RoundLabel label="DEMIE" />
          <BracketPlaceholder />
        </div>
        {/* FINAL center */}
        <div style={{ display: "grid", alignContent: "center", gap: 12 }}>
          <RoundLabel label="FINALE" highlight />
          <FinalSlot />
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-3)",
            letterSpacing: 1.4, textAlign: "center", marginTop: 4,
          }}>
            19 JUILLET · METLIFE NJ
          </div>
        </div>
        {/* SF right */}
        <div style={{ display: "grid", alignContent: "center" }}>
          <RoundLabel label="DEMIE" />
          <BracketPlaceholder />
        </div>
        {/* QF right */}
        <div style={{ display: "grid", gap: 32, alignContent: "center" }}>
          <RoundLabel label="QUART" />
          <BracketPlaceholder />
        </div>
        {/* R16 right */}
        <div style={{ display: "grid", gap: 32, alignContent: "center" }}>
          <RoundLabel label="R16" />
          {[0, 1].map(i => <BracketPlaceholder key={i} />)}
        </div>
        {/* R32 right */}
        <div style={{ display: "grid", gap: 12 }}>
          <RoundLabel label="R32" />
          {r32.slice(4, 8).map((m, i) => (
            <BracketMatch key={i} home={m[0]} away={m[1]} pickedSide={picks[i + 4]} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "32px 56px" }}>
        <div style={{
          padding: "18px 24px",
          background: "var(--ink-2)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{
            fontSize: 13, color: "var(--paper-2)",
          }}>
            Les R16 / quarts / demies / finale s'ouvrent automatiquement quand la phase précédente est terminée.
          </div>
          <Btn kind="ghost" size="sm">Voir mes points par phase</Btn>
        </div>
      </div>
    </Frame>
  );
}

function RoundLabel({ label, highlight }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.6,
      color: highlight ? "var(--canada)" : "var(--paper-4)",
      textTransform: "uppercase", textAlign: "center",
    }}>
      {label}
    </div>
  );
}

function BracketMatch({ home, away, pickedSide }) {
  return (
    <div style={{
      background: "var(--ink-2)",
      border: "1px solid var(--line)",
      borderRadius: 6,
      overflow: "hidden",
    }}>
      <MatchSide team={home} picked={pickedSide === 0} />
      <div style={{ height: 1, background: "var(--line)" }} />
      <MatchSide team={away} picked={pickedSide === 1} />
    </div>
  );
}

function MatchSide({ team, picked }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto auto 1fr auto",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      background: picked ? "var(--ink-3)" : "transparent",
      borderLeft: picked ? "2px solid var(--mexico)" : "2px solid transparent",
    }}>
      <span style={{ fontSize: 16 }}>{team.flag}</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.5,
        color: picked ? "var(--paper-1)" : "var(--paper-3)",
      }}>
        {team.code}
      </span>
      <span style={{
        fontSize: 11, color: picked ? "var(--paper-1)" : "var(--paper-2)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {team.name}
      </span>
      {picked && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mexico)", letterSpacing: 0.8 }}>
          ✓
        </span>
      )}
    </div>
  );
}

function BracketPlaceholder() {
  return (
    <div style={{
      background: "var(--ink-2)",
      border: "1px dashed var(--line-strong)",
      borderRadius: 6,
      padding: "12px 10px",
      display: "grid", gap: 6,
      opacity: 0.7,
    }}>
      <div style={{ height: 14, background: "var(--ink-3)", borderRadius: 3 }} />
      <div style={{ height: 14, background: "var(--ink-3)", borderRadius: 3 }} />
    </div>
  );
}

function FinalSlot() {
  return (
    <div style={{
      background: "var(--ink-2)",
      border: "1px solid var(--canada)",
      borderRadius: 10,
      padding: "16px 14px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, var(--canada) 0% 33%, var(--paper-1) 33% 67%, var(--mexico) 67% 100%)",
      }} />
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.4,
        color: "var(--canada)", marginTop: 6,
      }}>
        🏆 CHAMPION
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 32, lineHeight: 1, color: "var(--paper-1)", margin: "10px 0 4px",
      }}>
        🇫🇷
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-1)",
        letterSpacing: 0.6,
      }}>
        FRA · France
      </div>
      <div style={{
        marginTop: 10,
        fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--paper-3)",
        letterSpacing: 1.3,
      }}>
        + 30 PTS SI CORRECT
      </div>
    </div>
  );
}

Object.assign(window, { BracketArtboard });
