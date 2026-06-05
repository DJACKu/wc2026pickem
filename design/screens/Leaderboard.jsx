// Leaderboard.jsx — /leaderboard
// Classement général : podium + tableau dense

function LeaderboardArtboard() {
  // Top 3 podium + reste du classement
  const top3 = [
    { rank: 1, handle: "marine.b",  name: "Marine",   pts: 184, hue: 280, delta: "▲ 3", country: "🇫🇷" },
    { rank: 2, handle: "yan_le_b",  name: "Yann",     pts: 176, hue: 220, delta: "▲ 1", country: "🇫🇷" },
    { rank: 3, handle: "kev",       name: "Kevin",    pts: 171, hue: 15,  delta: "▼ 2", country: "🇫🇷" },
  ];
  const rest = [
    { rank: 4,  handle: "sasha",     name: "Sasha",      pts: 168, hue: 340, delta: "▲ 5",  country: "🇫🇷" },
    { rank: 5,  handle: "juju23",    name: "Julien",     pts: 162, hue: 200, delta: "—",    country: "🇫🇷" },
    { rank: 6,  handle: "thom",      name: "Thomas",     pts: 158, hue: 40,  delta: "▼ 1",  country: "🇫🇷" },
    { rank: 7,  handle: "clemd",     name: "Clémence",   pts: 154, hue: 320, delta: "▲ 2",  country: "🇫🇷" },
    { rank: 8,  handle: "alice_m",   name: "Alice",      pts: 149, hue: 5,   delta: "▼ 4",  country: "🇫🇷" },
    { rank: 9,  handle: "lou",       name: "Lou",        pts: 147, hue: 50,  delta: "▲ 6",  country: "🇫🇷" },
    { rank: 10, handle: "leo",       name: "Léo",        pts: 143, hue: 160, delta: "▼ 1",  country: "🇫🇷", me: true },
    { rank: 11, handle: "antho",     name: "Anthony",    pts: 141, hue: 95,  delta: "—",    country: "🇧🇪" },
    { rank: 12, handle: "vincent.k", name: "Vincent",    pts: 138, hue: 180, delta: "▼ 2",  country: "🇫🇷" },
    { rank: 13, handle: "pauline.r", name: "Pauline",    pts: 134, hue: 110, delta: "▲ 1",  country: "🇫🇷" },
    { rank: 14, handle: "maxoo",     name: "Maxence",    pts: 130, hue: 25,  delta: "—",    country: "🇫🇷" },
  ];

  return (
    <Frame>
      <PageHeader active="CLASSEMENT" countdown={{ d: 22, h: 6, m: 12 }} />

      <div style={{ padding: "36px 56px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <SectionLabel num="GÉN.">Classement général · phase de poules scorée</SectionLabel>
            <h1 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
              fontSize: 64, lineHeight: 0.95, margin: "14px 0 0", color: "var(--paper-1)",
            }}>
              <span style={{ color: "var(--gold)" }}>247</span> joueurs.<br/>
              Une seule place sur le podium.
            </h1>
          </div>
          {/* search + filters */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px",
              background: "var(--ink-2)",
              border: "1px solid var(--line)",
              borderRadius: 6,
              minWidth: 220,
            }}>
              <SearchIcon />
              <input placeholder="Chercher @handle…" style={{
                background: "transparent", border: "none", outline: "none",
                color: "var(--paper-1)", fontSize: 13, flex: 1,
                fontFamily: "var(--font-ui)",
              }} />
            </div>
            <Btn kind="ghost" size="sm">Phase ▾</Btn>
          </div>
        </div>
      </div>

      {/* Podium */}
      <div style={{
        padding: "16px 56px 28px",
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr 1fr",
        gap: 14,
        alignItems: "end",
      }}>
        <PodiumCard p={top3[1]} place="2nd" tone="var(--paper-2)" height={210} />
        <PodiumCard p={top3[0]} place="1st" tone="var(--gold)"    height={250} highlight />
        <PodiumCard p={top3[2]} place="3rd" tone="var(--canada)"  height={190} />
      </div>

      {/* Table */}
      <div style={{ padding: "0 56px 40px" }}>
        <div style={{
          background: "var(--ink-2)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          overflow: "hidden",
        }}>
          {/* header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 100px 100px 110px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--ink-1)",
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.4,
            color: "var(--paper-3)", textTransform: "uppercase",
          }}>
            <span>RANG</span>
            <span>JOUEUR</span>
            <span style={{ textAlign: "right" }}>POULES</span>
            <span style={{ textAlign: "right" }}>3èmes</span>
            <span style={{ textAlign: "right" }}>TOTAL</span>
          </div>
          {rest.map((p, i) => (
            <LeaderRow key={p.handle} p={p} alt={i % 2 === 1} />
          ))}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 14,
          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.8,
          color: "var(--paper-3)",
        }}>
          <span>4 — 14 SUR 247</span>
          <div style={{ display: "flex", gap: 4 }}>
            <Btn kind="ghost" size="sm">←</Btn>
            <Btn kind="ghost" size="sm">→</Btn>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function PodiumCard({ p, place, tone, height, highlight }) {
  return (
    <div style={{
      background: highlight ? "var(--ink-3)" : "var(--ink-2)",
      border: highlight ? "1px solid var(--gold)" : "1px solid var(--line)",
      borderRadius: 12,
      padding: "22px 20px 18px",
      position: "relative",
      height,
      display: "grid",
      alignContent: "space-between",
      overflow: "hidden",
    }}>
      {/* big rank number bg */}
      <div style={{
        position: "absolute",
        right: -10, top: -28,
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 180, lineHeight: 1, color: tone,
        opacity: 0.15,
        pointerEvents: "none",
      }}>
        {p.rank}
      </div>

      <div style={{ position: "relative" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.4,
          color: tone, textTransform: "uppercase",
        }}>
          {place === "1st" ? "🥇 1er" : place === "2nd" ? "🥈 2e" : "🥉 3e"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <Avatar name={p.name} hue={p.hue} size={42} />
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: 28, lineHeight: 1, color: "var(--paper-1)",
            }}>
              {p.name}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)",
              letterSpacing: 0.4, marginTop: 4,
            }}>
              @{p.handle} {p.country}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.2,
            color: "var(--paper-3)",
          }}>
            POINTS
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: 56, lineHeight: 1, color: "var(--paper-1)",
          }}>
            {p.pts}
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: tone,
          letterSpacing: 0.6,
        }}>
          {p.delta}
        </div>
      </div>
    </div>
  );
}

function LeaderRow({ p, alt }) {
  const me = p.me;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 100px 100px 110px",
      alignItems: "center",
      padding: "12px 20px",
      background: me ? "var(--ink-3)" : (alt ? "var(--ink-2)" : "transparent"),
      borderBottom: "1px solid var(--line-soft)",
      borderLeft: me ? "2px solid var(--mexico)" : "2px solid transparent",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 22, lineHeight: 1, color: me ? "var(--mexico)" : "var(--paper-1)",
          width: 28,
        }}>
          {p.rank}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.6,
          color: p.delta.startsWith("▲") ? "var(--mexico)"
               : p.delta.startsWith("▼") ? "var(--canada)"
               : "var(--paper-4)",
        }}>
          {p.delta}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={p.name} hue={p.hue} size={30} />
        <div>
          <div style={{ fontSize: 14, color: "var(--paper-1)" }}>
            {p.name} {me && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--mexico)", letterSpacing: 1, marginLeft: 6 }}>· TOI</span>}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)" }}>
            @{p.handle} {p.country}
          </div>
        </div>
      </div>

      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--paper-2)", textAlign: "right" }}>
        {Math.round(p.pts * 0.78)}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--gold)", textAlign: "right" }}>
        +{Math.round(p.pts * 0.12)}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 24, lineHeight: 1, textAlign: "right",
        color: me ? "var(--paper-1)" : "var(--paper-1)",
      }}>
        {p.pts}
      </span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--paper-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

Object.assign(window, { LeaderboardArtboard });
