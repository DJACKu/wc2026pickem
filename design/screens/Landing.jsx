// Landing.jsx — page d'accueil pré-login.
// Direction : magazine sport, gros titre éditorial, CTA login X, état du tournoi en sous-marquise.

function LandingArtboard() {
  return (
    <Frame>
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100%" }}>

        {/* Top strip — minimal, just wordmark + login */}
        <div style={{
          padding: "20px 40px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid var(--line)",
        }}>
          <Wordmark size={16} />
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 1.2 }}>
              ENTRE POTES · ZÉRO MAIL · ZÉRO ARGENT
            </span>
            <Btn kind="x" size="sm" icon={<XIcon />}>Continuer avec X</Btn>
          </div>
        </div>

        {/* Hero */}
        <div style={{
          padding: "56px 64px 0",
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr",
          gap: 64,
          alignContent: "start",
        }}>
          {/* LEFT — title */}
          <div>
            <SectionLabel num="ÉD. 01">Coupe du Monde 2026 · 🇨🇦 🇲🇽 🇺🇸</SectionLabel>

            <h1 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
              fontSize: 120, lineHeight: 0.92, letterSpacing: -2.2,
              margin: "24px 0 0", color: "var(--paper-1)",
              textWrap: "balance",
            }}>
              Picke ton<br/>
              <span style={{ color: "var(--paper-3)" }}>tournoi.</span><br/>
              Lock’em. <span style={{ color: "var(--canada)" }}>Suis</span>
              <br/>les autres tomber.
            </h1>

            <p style={{
              maxWidth: 460, marginTop: 28, color: "var(--paper-2)",
              fontSize: 16, lineHeight: 1.55,
            }}>
              Un pick'em façon esport pour la WC 2026, entre potes.
              Tu classes les poules, tu locks. Tu reviens voir ton classement
              après chaque phase. <em>Pas de mail, pas d'argent, pas de bullshit.</em>
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 32 }}>
              <Btn kind="primary" size="lg" icon={<XIcon />}>
                Continuer avec X
              </Btn>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)",
                letterSpacing: 1, maxWidth: 220, lineHeight: 1.4,
              }}>
                On lit ton handle, ton avatar — rien d'autre.
              </span>
            </div>
          </div>

          {/* RIGHT — état du tournoi en mode tableau noir */}
          <div style={{
            background: "var(--ink-2)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 24,
            alignSelf: "start",
          }}>
            <SectionLabel num="J−5">État du tournoi</SectionLabel>

            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <KPI label="Équipes engagées"  value="48" />
              <KPI label="Groupes"           value="12" />
              <KPI label="Matchs au total"   value="104" />
              <KPI label="Joueurs inscrits"  value="247" highlight />
            </div>

            <div style={{ height: 1, background: "var(--line)", margin: "20px 0" }} />

            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: 1.4,
              color: "var(--canada)", marginBottom: 8, textTransform: "uppercase",
            }}>
              ● Premier match
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: 28, lineHeight: 1, color: "var(--paper-1)",
            }}>
              MEX <span style={{ color: "var(--paper-3)" }}>vs</span> KOR
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--paper-2)", marginTop: 6 }}>
              11 JUIN · 17:00 CET · Estadio Azteca
            </div>

            {/* Countdown bloc, version XL */}
            <div style={{
              marginTop: 22, padding: "18px 16px",
              background: "var(--ink-3)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4,
              textAlign: "center",
            }}>
              {[
                { v: "05", l: "JOURS" },
                { v: "18", l: "HEURES" },
                { v: "24", l: "MIN" },
                { v: "07", l: "SEC" },
              ].map(c => (
                <div key={c.l}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontStyle: "italic",
                    fontSize: 32, lineHeight: 1, color: "var(--paper-1)",
                  }}>{c.v}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.4,
                    color: "var(--paper-3)", marginTop: 4,
                  }}>{c.l}</div>
                </div>
              ))}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.3,
              color: "var(--paper-3)", marginTop: 10, textAlign: "center",
            }}>
              AVANT LE LOCK DES POULES
            </div>
          </div>
        </div>

        {/* Bottom marquee — flux des activités */}
        <div style={{
          marginTop: 40,
          borderTop: "1px solid var(--line)",
          padding: "16px 40px",
          display: "flex", alignItems: "center", gap: 24,
          background: "var(--ink-0)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.4,
            color: "var(--paper-3)", textTransform: "uppercase",
            flexShrink: 0,
          }}>
            EN DIRECT ·
          </span>
          <div style={{ display: "flex", gap: 28, overflow: "hidden" }}>
            {[
              ["@kev",       "a locké ses picks"],
              ["@sasha",     "vient de rejoindre « Les potes »"],
              ["@marine.b",  "predit 🇫🇷 → champion"],
              ["@thom",      "a modifié son groupe G"],
              ["@yan_le_b",  "a locké ses picks"],
              ["@juju23",    "predit 🇦🇷 → champion"],
            ].map(([h, msg], i) => (
              <span key={i} style={{
                fontSize: 12, color: "var(--paper-2)",
                whiteSpace: "nowrap",
              }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--paper-1)" }}>{h}</span>
                <span style={{ color: "var(--paper-3)" }}> · {msg}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function KPI({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 13, color: "var(--paper-2)" }}>{label}</span>
      <span style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 26, lineHeight: 1,
        color: highlight ? "var(--mexico)" : "var(--paper-1)",
      }}>{value}</span>
    </div>
  );
}

Object.assign(window, { LandingArtboard });
