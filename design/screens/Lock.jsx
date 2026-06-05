// Lock.jsx — Moment LOCK festif
// Le SEUL moment où le trio tricolore est lâché en force.
// Cadenas, confettis discrets, récap des picks, CTA partage X.

function LockArtboard() {
  return (
    <Frame>
      <PageHeader active="PICKS" countdown={{ d: 5, h: 18, m: 24 }} />

      <div style={{
        position: "relative",
        height: "calc(100% - 65px)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
      }}>
        {/* Confetti SVG layer — tricolore */}
        <ConfettiLayer />

        {/* LEFT — Big "LOCKED" statement */}
        <div style={{
          padding: "56px 56px 40px",
          position: "relative",
          zIndex: 2,
          display: "grid",
          alignContent: "center",
        }}>
          <SectionLabel num="✓">Verrouillé · 11 juin · 15:58:42 UTC</SectionLabel>

          {/* Padlock + tricolor underline */}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 18 }}>
            <BigLock />
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)",
              letterSpacing: 1.4, lineHeight: 1.6,
            }}>
              IMMUABLE<br/>
              JUSQU'AU<br/>
              <span style={{ color: "var(--paper-1)" }}>SCORING</span>
            </div>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
            fontSize: 112, lineHeight: 0.92, letterSpacing: -2,
            margin: "24px 0 0", color: "var(--paper-1)",
          }}>
            Lock’d in.<br/>
            <span style={{
              display: "inline-block",
              background: "linear-gradient(90deg, var(--canada) 0% 33%, var(--paper-1) 33% 67%, var(--mexico) 67% 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Que le<br/>meilleur gagne.
            </span>
          </h1>

          {/* Tricolor underline */}
          <div style={{
            marginTop: 28, height: 6, width: 280,
            background: "linear-gradient(90deg, var(--canada) 0% 33%, var(--paper-1) 33% 67%, var(--usa) 67% 100%)",
            borderRadius: 1,
          }} />

          {/* CTAs */}
          <div style={{ marginTop: 36, display: "flex", gap: 12 }}>
            <Btn kind="primary" size="lg" icon={<XIcon />}>
              Partager ma carte de picks
            </Btn>
            <Btn kind="ghost" size="lg">
              Voir le classement →
            </Btn>
          </div>
        </div>

        {/* RIGHT — récap card de picks (mode partageable) */}
        <div style={{
          padding: "56px 56px 40px 0",
          position: "relative",
          zIndex: 2,
          display: "grid",
          alignContent: "center",
        }}>
          <ShareCardPreview />
        </div>
      </div>
    </Frame>
  );
}

function BigLock() {
  return (
    <div style={{
      width: 92, height: 92, borderRadius: 14,
      background: "var(--ink-3)",
      border: "1px solid var(--line-strong)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 0 0 4px var(--ink-1), 0 0 0 1px var(--mexico)",
    }}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--mexico)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="10" rx="1.5" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    </div>
  );
}

/* Subtle confetti: tricolor squares scattered, no animation in static design */
function ConfettiLayer() {
  const pieces = React.useMemo(() => {
    const colors = ["var(--canada)", "var(--mexico)", "var(--usa)", "var(--gold)", "var(--paper-1)"];
    const arr = [];
    // Seeded-ish pseudo-random so it's stable
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: rand() * 100,
        y: rand() * 100,
        size: 4 + rand() * 8,
        rot: rand() * 360,
        color: colors[Math.floor(rand() * colors.length)],
        opacity: 0.25 + rand() * 0.45,
      });
    }
    return arr;
  }, []);
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
    }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size * 0.4,
          background: p.color,
          transform: `rotate(${p.rot}deg)`,
          opacity: p.opacity,
          borderRadius: 1,
        }} />
      ))}
    </div>
  );
}

/* Share card — la carte qui partira sur X */
function ShareCardPreview() {
  // Quelques picks notables pour la prévisualisation
  const picks = [
    { letter: "I", team: WC26.groups.I[0], note: "1er groupe I" },
    { letter: "D", team: WC26.groups.D[0], note: "1er groupe D" },
    { letter: "C", team: WC26.groups.C[0], note: "1er groupe C" },
    { letter: "J", team: WC26.groups.J[0], note: "1er groupe J" },
  ];

  return (
    <div style={{
      background: "var(--ink-2)",
      border: "1px solid var(--line-strong)",
      borderRadius: 14,
      padding: "26px 28px",
      display: "grid",
      gap: 18,
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark size={14} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.3,
          color: "var(--paper-3)",
        }}>
          @leo · CARTE DE PICKS
        </span>
      </div>

      {/* Big champion pick */}
      <div style={{
        padding: "18px 20px",
        background: "var(--ink-1)",
        border: "1px solid var(--canada)",
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%", width: 4,
          background: "var(--canada)",
        }} />
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--canada)",
          letterSpacing: 1.4,
        }}>
          🏆 CHAMPION DU MONDE
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 14, marginTop: 6,
        }}>
          <span style={{ fontSize: 36, lineHeight: 1 }}>🇫🇷</span>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: 40, lineHeight: 1, color: "var(--paper-1)",
            }}>
              France
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", marginTop: 4, letterSpacing: 0.4 }}>
              FRA · GROUPE I · NEW JERSEY 19/07
            </div>
          </div>
        </div>
      </div>

      {/* mini grid de quelques picks */}
      <div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-3)",
          letterSpacing: 1.3, marginBottom: 8,
        }}>
          MES TOPS DE GROUPES (4/12)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          {picks.map(p => (
            <div key={p.letter} style={{
              padding: "8px 10px",
              background: "var(--ink-1)",
              borderRadius: 6,
              border: "1px solid var(--line)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-4)" }}>
                GR.{p.letter}
              </span>
              <span style={{ fontSize: 16 }}>{p.team.flag}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-2)" }}>
                {p.team.code}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer KPIs */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        borderTop: "1px solid var(--line)",
        paddingTop: 14,
      }}>
        <Stat label="POULES" value="12/12" />
        <Stat label="3èmes BONUS" value="8/8" tone="var(--gold)" />
        <Stat label="MAX. POSSIBLE" value="247" tone="var(--mexico)" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "var(--paper-1)" }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.2,
        color: "var(--paper-3)",
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 22, lineHeight: 1.1, color: tone,
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { LockArtboard });
