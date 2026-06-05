// PicksGroups.jsx — /picks/groups · LE gros morceau
// 12 GroupCards drag & drop, panneau "8 meilleurs 3èmes", LOCK final.

function PicksGroupsArtboard() {
  // Pour la maquette, on simule des picks : chaque groupe a un ordre prédéfini.
  // Position 1, 2, 3, 4 dans l'ordre stocké → pour montrer les styles de chaque rang.
  const allGroups = Object.entries(WC26.groups);

  // Liste des 8 meilleurs 3èmes "candidats" (= les 3èmes prédits dans chaque groupe)
  const thirdsCandidates = allGroups.map(([letter, teams]) => ({ letter, team: teams[2] }));
  const bestThirdLetters = new Set(["B", "C", "F", "G", "H", "J", "K", "L"]); // 8 sur 12, fictif

  return (
    <Frame>
      <PageHeader active="PICKS" countdown={{ d: 5, h: 18, m: 24 }} />

      {/* Sub-header — fil d'Ariane + status + autosave */}
      <div style={{
        padding: "16px 56px",
        borderBottom: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 1 }}>
            PICKS · PHASE 1 — POULES
          </span>
          <span style={{ color: "var(--paper-4)" }}>/</span>
          <StatusPill status="open">12 GROUPES À ORDONNER</StatusPill>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mexico)", letterSpacing: 1 }}>
            ● AUTOSAVE · IL Y A 3S
          </span>
          <Btn kind="ghost" size="sm">Réinitialiser</Btn>
          <Btn kind="lock" size="sm" icon={<LockIcon />}>Lock mes picks</Btn>
        </div>
      </div>

      {/* Title row */}
      <div style={{ padding: "32px 56px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
            fontSize: 56, lineHeight: 0.95, margin: 0, color: "var(--paper-1)",
            letterSpacing: -1,
          }}>
            Ordonne les <span style={{ color: "var(--canada)" }}>12 poules</span>.<br/>
            <span style={{ color: "var(--paper-3)" }}>Glisse les équipes — 1er en haut, éliminé en bas.</span>
          </h1>
        </div>
        <ProgressDial filled={11} total={12} label="GROUPES" />
      </div>

      {/* Groups grid — 4×3 */}
      <div style={{
        padding: "0 56px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
      }}>
        {allGroups.map(([letter, teams], i) => (
          <GroupCard
            key={letter}
            letter={letter}
            teams={teams}
            active={i === 8}
            done={i !== 8}
          />
        ))}
      </div>

      {/* Best 3rds bonus panel */}
      <div style={{ padding: "40px 56px 56px" }}>
        <div style={{
          background: "var(--ink-2)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "26px 28px",
          display: "grid",
          gridTemplateColumns: "1.1fr 2fr",
          gap: 32,
        }}>
          <div>
            <SectionLabel num="BONUS">8 meilleurs 3èmes</SectionLabel>
            <h2 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
              fontSize: 36, lineHeight: 1, margin: "14px 0 12px", color: "var(--paper-1)",
            }}>
              Coche les 8 qui passent.
            </h2>
            <p style={{ fontSize: 13, color: "var(--paper-2)", lineHeight: 1.55, maxWidth: 360 }}>
              Parmi tes 12 troisièmes, sélectionne les <strong style={{ color: "var(--gold)" }}>8 meilleurs</strong> —
              ceux qui se qualifient pour le R32 selon le format réel.
              <em style={{ color: "var(--paper-3)" }}> +2 pts par 3ème correct.</em>
            </p>
            <div style={{
              marginTop: 18, padding: "10px 14px",
              border: "1px dashed var(--line-strong)", borderRadius: 8,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1,
                color: "var(--gold)",
              }}>
                SÉLECTIONNÉS
              </span>
              <span style={{
                fontFamily: "var(--font-display)", fontStyle: "italic",
                fontSize: 28, lineHeight: 1, color: "var(--paper-1)",
              }}>
                8 <span style={{ color: "var(--paper-3)", fontSize: 18 }}>/ 8</span>
              </span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}>
            {thirdsCandidates.map(({ letter, team }) => {
              const picked = bestThirdLetters.has(letter);
              return (
                <div key={letter} style={{
                  position: "relative",
                  padding: "10px 12px 10px 14px",
                  background: picked ? "var(--ink-3)" : "var(--ink-1)",
                  border: picked ? "1px solid var(--gold)" : "1px solid var(--line)",
                  borderRadius: 6,
                  display: "grid",
                  gridTemplateColumns: "auto auto auto 1fr auto",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  opacity: picked ? 1 : 0.55,
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-4)",
                    letterSpacing: 0.8,
                  }}>
                    GR.{letter}
                  </span>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{team.flag}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-2)" }}>
                    {team.code}
                  </span>
                  <span style={{
                    fontSize: 12, color: "var(--paper-1)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {team.name}
                  </span>
                  <Checkbox checked={picked} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom LOCK strip */}
        <div style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 28px",
          background: "var(--ink-3)",
          border: "1px solid var(--line-strong)",
          borderRadius: 10,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: 1.3, color: "var(--paper-3)" }}>
              QUAND TU LOCKES, TES PICKS DEVIENNENT IMMUABLES.
            </div>
            <div style={{ fontSize: 14, color: "var(--paper-2)", marginTop: 4 }}>
              Tu peux modifier autant que tu veux jusqu'au <strong style={{ color: "var(--paper-1)" }}>11 juin · 16:00 UTC</strong>.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 0.8 }}>
              MAX POSSIBLE
            </span>
            <span style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: 32, lineHeight: 1, color: "var(--paper-1)",
            }}>
              247 <span style={{ fontSize: 16, color: "var(--paper-3)" }}>PTS</span>
            </span>
            <Btn kind="lock" size="lg" icon={<LockIcon />}>Lock mes 12 poules</Btn>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ============================================================
   GroupCard — l'unité de drag & drop
   ============================================================ */
function GroupCard({ letter, teams, active = false, done = false }) {
  return (
    <div style={{
      background: active ? "var(--ink-3)" : "var(--ink-2)",
      border: active
        ? "1px solid var(--paper-3)"
        : "1px solid var(--line)",
      borderRadius: 10,
      padding: "14px 14px 12px",
      position: "relative",
      boxShadow: active ? "0 12px 40px -16px rgba(0,0,0,0.6)" : "none",
    }}>
      {/* head : letter + status */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.2,
            color: "var(--paper-3)",
          }}>
            POULE
          </span>
          <span style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: 26, lineHeight: 1, color: active ? "var(--canada)" : "var(--paper-1)",
          }}>
            {letter}
          </span>
        </div>
        {done && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mexico)", letterSpacing: 1 }}>
            ✓ OK
          </span>
        )}
        {active && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--canada)", letterSpacing: 1 }}>
            ⋮⋮ DÉPLACE
          </span>
        )}
      </div>

      {/* rows */}
      <div style={{ display: "grid", gap: 6 }}>
        {teams.map((team, i) => {
          const variant =
            i < 2 ? "qualified" : i === 2 ? "best-third" : "eliminated";
          return (
            <TeamRow
              key={team.code}
              team={team}
              pos={i + 1}
              variant={variant}
              draggable={active}
              dense
            />
          );
        })}
      </div>

      {/* footer mini legend */}
      <div style={{
        marginTop: 10, paddingTop: 8,
        borderTop: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.8,
        color: "var(--paper-4)",
      }}>
        <span>1·2 QUALIF</span>
        <span style={{ color: "var(--gold)" }}>3 BONUS</span>
        <span>4 ÉLIM</span>
      </div>
    </div>
  );
}

/* ============================================================
   ProgressDial — petit indicateur de progression circulaire
   ============================================================ */
function ProgressDial({ filled, total, label }) {
  const pct = filled / total;
  const circumference = 2 * Math.PI * 28;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <svg viewBox="0 0 72 72" width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="36" cy="36" r="28" stroke="var(--ink-3)" strokeWidth="6" fill="none" />
          <circle
            cx="36" cy="36" r="28"
            stroke="var(--mexico)" strokeWidth="6" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 22, lineHeight: 1, color: "var(--paper-1)",
        }}>
          {filled}<span style={{ fontSize: 12, color: "var(--paper-3)" }}>/{total}</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--paper-3)", letterSpacing: 1.3 }}>
          {label} ORDONNÉS
        </div>
        <div style={{ fontSize: 12, color: "var(--paper-2)", marginTop: 2 }}>
          Plus qu'un, et c'est plié.
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked }) {
  return (
    <span style={{
      width: 16, height: 16,
      borderRadius: 4,
      border: `1.5px solid ${checked ? "var(--gold)" : "var(--paper-4)"}`,
      background: checked ? "var(--gold)" : "transparent",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {checked && (
        <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="var(--ink-1)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.5 5 9l4.5-6" />
        </svg>
      )}
    </span>
  );
}

Object.assign(window, { PicksGroupsArtboard });
