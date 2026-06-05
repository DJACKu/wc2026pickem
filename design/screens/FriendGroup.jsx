// FriendGroup.jsx — /groups/[id] · Le classement d'un groupe d'amis
// Le code d'invitation est mis en valeur (le moment social clé).

function FriendGroupArtboard() {
  const members = [
    { rank: 1,  handle: "kev",        name: "Kevin",      pts: 171, hue: 15,  delta: "▲ 1", lock: "11/06 14:22" },
    { rank: 2,  handle: "marine.b",   name: "Marine",     pts: 168, hue: 280, delta: "▼ 1", lock: "11/06 15:01" },
    { rank: 3,  handle: "leo",        name: "Léo",        pts: 158, hue: 160, delta: "▲ 2", lock: "11/06 15:58", me: true },
    { rank: 4,  handle: "thom",       name: "Thomas",     pts: 154, hue: 40,  delta: "—",   lock: "11/06 12:44" },
    { rank: 5,  handle: "sasha",      name: "Sasha",      pts: 149, hue: 340, delta: "▼ 2", lock: "11/06 09:15" },
    { rank: 6,  handle: "juju23",     name: "Julien",     pts: 147, hue: 200, delta: "▲ 3", lock: "11/06 11:30" },
    { rank: 7,  handle: "clemd",      name: "Clémence",   pts: 134, hue: 320, delta: "▼ 1", lock: "11/06 13:48" },
    { rank: 8,  handle: "yan_le_b",   name: "Yann",       pts: 128, hue: 220, delta: "—",   lock: "10/06 22:11" },
    { rank: 9,  handle: "antho",      name: "Anthony",    pts: 0,   hue: 95,  delta: "—",   lock: "—", pending: true },
  ];

  return (
    <Frame>
      <PageHeader active="MES POTES" countdown={{ d: 22, h: 6, m: 12 }} />

      <div style={{ padding: "36px 56px 28px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 36 }}>
        {/* LEFT — group header */}
        <div>
          <SectionLabel num="GR.07">Mes potes</SectionLabel>
          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
            fontSize: 72, lineHeight: 0.95, margin: "12px 0 0", color: "var(--paper-1)",
            letterSpacing: -1.4,
          }}>
            Le Groupe<br/>des Mecs Sûrs<br/>de Rien.
          </h1>
          <div style={{ display: "flex", gap: 18, marginTop: 24, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 1 }}>
              9 MEMBRES · 8 LOCKÉS · 1 EN ATTENTE
            </span>
            <Btn kind="ghost" size="sm">Renommer</Btn>
            <Btn kind="ghost" size="sm">Quitter</Btn>
          </div>
        </div>

        {/* RIGHT — invite card */}
        <div style={{
          padding: "22px 24px",
          background: "var(--ink-2)",
          border: "1px solid var(--line-strong)",
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* tricolor band top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, var(--canada) 0% 33%, var(--paper-1) 33% 67%, var(--mexico) 67% 100%)",
          }} />
          <SectionLabel num="+">Invite des potes</SectionLabel>
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--paper-2)", lineHeight: 1.5 }}>
            Un seul lien, n'importe qui peut rejoindre. Le code expire le 27 juin.
          </div>

          <div style={{
            marginTop: 18,
            padding: "16px 18px",
            background: "var(--ink-1)",
            border: "1px dashed var(--line-strong)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.4,
                color: "var(--paper-3)",
              }}>
                CODE D'INVITATION
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500,
                color: "var(--gold)", letterSpacing: 2, marginTop: 4,
              }}>
                WC26-K3X9
              </div>
            </div>
            <Btn kind="primary" size="sm">Copier</Btn>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn kind="x" size="sm" icon={<XIcon />}>Partager</Btn>
            <Btn kind="ghost" size="sm">Lien direct</Btn>
          </div>

          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)",
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-4)",
            letterSpacing: 0.6,
          }}>
            pickem.wc26/g/WC26-K3X9
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: "0 56px 40px" }}>
        <div style={{
          background: "var(--ink-2)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 140px 110px 110px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--ink-1)",
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.4,
            color: "var(--paper-3)", textTransform: "uppercase",
          }}>
            <span>RANG</span>
            <span>JOUEUR</span>
            <span style={{ textAlign: "right" }}>LOCKÉ LE</span>
            <span style={{ textAlign: "right" }}>ÉCART AU 1er</span>
            <span style={{ textAlign: "right" }}>POINTS</span>
          </div>

          {members.map((m, i) => (
            <FriendRow key={m.handle} m={m} alt={i % 2 === 1} firstPts={members[0].pts} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function FriendRow({ m, alt, firstPts }) {
  const gap = firstPts - m.pts;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 140px 110px 110px",
      alignItems: "center",
      padding: "12px 20px",
      background: m.me ? "var(--ink-3)" : (alt ? "var(--ink-2)" : "transparent"),
      borderBottom: "1px solid var(--line-soft)",
      borderLeft: m.me ? "2px solid var(--mexico)" : "2px solid transparent",
      opacity: m.pending ? 0.55 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 22, lineHeight: 1, color: m.rank === 1 ? "var(--gold)" : "var(--paper-1)",
          width: 26,
        }}>
          {m.rank}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.6,
          color: m.delta.startsWith("▲") ? "var(--mexico)"
               : m.delta.startsWith("▼") ? "var(--canada)"
               : "var(--paper-4)",
        }}>
          {m.delta}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={m.name} hue={m.hue} size={32} />
        <div>
          <div style={{ fontSize: 14, color: "var(--paper-1)" }}>
            {m.name}
            {m.me && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--mexico)", letterSpacing: 1, marginLeft: 6 }}>· TOI</span>}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)" }}>
            @{m.handle}
          </div>
        </div>
      </div>

      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: m.pending ? "var(--canada)" : "var(--paper-2)", textAlign: "right", letterSpacing: 0.4 }}>
        {m.pending ? "PAS ENCORE LOCKÉ" : m.lock}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: m.rank === 1 ? "var(--paper-3)" : "var(--paper-2)", textAlign: "right" }}>
        {m.rank === 1 ? "—" : `−${gap}`}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 26, lineHeight: 1, textAlign: "right",
        color: m.pending ? "var(--paper-4)" : "var(--paper-1)",
      }}>
        {m.pts}
      </span>
    </div>
  );
}

Object.assign(window, { FriendGroupArtboard });
