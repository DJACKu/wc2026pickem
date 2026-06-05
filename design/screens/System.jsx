// System.jsx — Brand & tokens reference artboard

function SystemArtboard() {
  return (
    <Frame>
      <div style={{ padding: "48px 56px", display: "grid", gap: 40 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <SectionLabel num="00">Système de design</SectionLabel>
            <div style={{ marginTop: 14 }}>
              <Display size={64}>The pick’em<br/>almanac.</Display>
            </div>
            <p style={{
              maxWidth: 560, marginTop: 18, color: "var(--paper-2)",
              fontSize: 15, lineHeight: 1.55,
            }}>
              Un magazine de sport rencontre un pick'em esport.
              Encre chaude, typo éditoriale en italique,
              accents tricolores réservés aux moments forts.
              <em style={{ color: "var(--paper-3)" }}> Pas un site IA.</em>
            </p>
          </div>
          <Wordmark size={26} />
        </div>

        <Divider />

        {/* COLOR */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }}>
          <SectionLabel num="01">Palette</SectionLabel>
          <div style={{ display: "grid", gap: 28 }}>
            <SwatchRow
              title="Encre — fond"
              note="Warm-dark, pas du navy. Ton chaud légèrement brun."
              swatches={[
                { name: "ink-0",  hex: "#08070A", role: "deepest" },
                { name: "ink-1",  hex: "#0F0D0C", role: "page bg" },
                { name: "ink-2",  hex: "#16130F", role: "elevated" },
                { name: "ink-3",  hex: "#1F1A15", role: "card" },
                { name: "ink-4",  hex: "#2A231C", role: "hover" },
              ]}
            />
            <SwatchRow
              title="Papier — texte"
              note="Off-white légèrement chaud, façon papier journal."
              swatches={[
                { name: "paper-1", hex: "#F5EFE4", role: "primary" },
                { name: "paper-2", hex: "#C9C0B0", role: "secondary" },
                { name: "paper-3", hex: "#8A8174", role: "meta" },
                { name: "paper-4", hex: "#5B5347", role: "very muted" },
              ]}
            />
            <SwatchRow
              title="Tricolore WC26 — parcimonieux"
              note="Un seul accent par écran, le trio uniquement pour les moments « célébration »."
              swatches={[
                { name: "canada", hex: "#E8112D", role: "🇨🇦 deadline / finale" },
                { name: "mexico", hex: "#2EB872", role: "🇲🇽 LOCK / qualifié" },
                { name: "usa",    hex: "#2563EB", role: "🇺🇸 info / équipe" },
                { name: "gold",   hex: "#D4A547", role: "+ bonus 3èmes" },
              ]}
            />
          </div>
        </div>

        <Divider />

        {/* TYPE */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }}>
          <SectionLabel num="02">Typographie</SectionLabel>
          <div style={{ display: "grid", gap: 28 }}>
            <TypeSpec
              family="Instrument Serif — italic"
              role="Titres éditoriaux, chiffres-héros, citations"
              sample="Pick’em, lock’em, watch’em win."
              fontFamily="var(--font-display)"
              fontStyle="italic"
              size={42}
            />
            <TypeSpec
              family="Geist — sans"
              role="UI, navigation, corps de texte, noms d'équipes"
              sample="Phase de poules — 12 groupes, 8 meilleurs 3èmes."
              fontFamily="var(--font-ui)"
              fontStyle="normal"
              size={20}
            />
            <TypeSpec
              family="JetBrains Mono"
              role="Codes FIFA, scores, deadlines, métadonnées"
              sample="FRA · BRA · ARG · LOCK 11 JUIN 16:00 UTC · +37 PTS"
              fontFamily="var(--font-mono)"
              fontStyle="normal"
              size={13}
              letter={1}
            />
          </div>
        </div>

        <Divider />

        {/* COMPONENTS */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }}>
          <SectionLabel num="03">Composants</SectionLabel>
          <div style={{ display: "grid", gap: 24 }}>

            <ComponentBlock title="Status pills — état d'une phase">
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                <StatusPill status="open" />
                <StatusPill status="closing">LOCK DANS 03H 12M</StatusPill>
                <StatusPill status="locked" />
                <StatusPill status="scored" />
                <StatusPill status="upcoming" />
              </div>
            </ComponentBlock>

            <ComponentBlock title="Team row — drapeau · code · nom">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                <TeamRow team={WC26.groups.I[0]} pos={1} variant="qualified" />
                <TeamRow team={WC26.groups.I[1]} pos={2} variant="qualified" />
                <TeamRow team={WC26.groups.I[2]} pos={3} variant="best-third" />
                <TeamRow team={WC26.groups.I[3]} pos={4} variant="eliminated" />
              </div>
              <div style={{
                display: "flex", gap: 18, marginTop: 12,
                fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-3)",
                letterSpacing: 0.8,
              }}>
                <Legend dot="var(--mexico)" label="Qualifié (top 2)" />
                <Legend dot="var(--gold)" dashed label="Meilleur 3ème prédit" />
                <Legend dot="var(--paper-4)" label="Éliminé" />
              </div>
            </ComponentBlock>

            <ComponentBlock title="Boutons — LOCK est l'action héroïque du produit">
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Btn kind="lock" size="lg" icon={<LockIcon />}>Lock mes picks</Btn>
                <Btn kind="primary">Sauvegarder</Btn>
                <Btn kind="ghost">Annuler</Btn>
                <Btn kind="x" icon={<XIcon/>}>Continuer avec X</Btn>
              </div>
            </ComponentBlock>

          </div>
        </div>
      </div>
    </Frame>
  );
}

/* helpers */
function Divider() {
  return <div style={{ height: 1, background: "var(--line)" }} />;
}

function SwatchRow({ title, note, swatches }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
        <h3 style={{
          margin: 0, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500,
          color: "var(--paper-1)",
        }}>{title}</h3>
        <span style={{ fontSize: 12, color: "var(--paper-3)" }}>{note}</span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {swatches.map(s => (
          <div key={s.name} style={{
            width: 144, border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden",
            background: "var(--ink-2)",
          }}>
            <div style={{ height: 64, background: s.hex }} />
            <div style={{ padding: "8px 10px", display: "grid", gap: 2 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--paper-1)" }}>
                {s.name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--paper-3)" }}>
                {s.hex}
              </span>
              <span style={{ fontSize: 11, color: "var(--paper-3)", marginTop: 2 }}>
                {s.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeSpec({ family, role, sample, fontFamily, fontStyle, size, letter = 0 }) {
  return (
    <div style={{
      padding: "18px 20px",
      background: "var(--ink-2)",
      border: "1px solid var(--line)",
      borderRadius: 8,
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-3)", letterSpacing: 1 }}>
          {family.toUpperCase()}
        </span>
        <span style={{ fontSize: 12, color: "var(--paper-3)" }}>{role}</span>
      </div>
      <div style={{
        fontFamily, fontStyle, fontSize: size,
        color: "var(--paper-1)", letterSpacing: letter,
        lineHeight: 1.1,
      }}>
        {sample}
      </div>
    </div>
  );
}

function ComponentBlock({ title, children }) {
  return (
    <div style={{
      padding: "18px 20px",
      background: "var(--ink-2)",
      border: "1px solid var(--line)",
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: 1.2,
        color: "var(--paper-3)", marginBottom: 14, textTransform: "uppercase",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Legend({ dot, label, dashed }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 10, height: 2,
        background: dashed ? "transparent" : dot,
        borderTop: dashed ? `2px dashed ${dot}` : "none",
      }} />
      <span>{label}</span>
    </span>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 1200 1227" fill="currentColor">
      <path d="M714 519 1160 0H1054L668 451 359 0H0l468 681L0 1227h106l410-480 327 480h359L714 519Zm-145 170-48-68L145 79h160l305 437 48 69 396 567H895L569 689Z"/>
    </svg>
  );
}

Object.assign(window, { SystemArtboard, LockIcon, XIcon });
