// Shared.jsx — atomic primitives reused across screens.
// Everything is attached to window so other Babel files can use it.

const { useState, useMemo } = React;

/* ============================================================
   Frame — chaque artboard est un mini-document avec son chrome
   ============================================================ */
function Frame({ children, padded = true }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--ink-1)",
        color: "var(--paper-1)",
        fontFamily: "var(--font-ui)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <NoiseOverlay />
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>
    </div>
  );
}

/* Subtle film grain — fait le "papier d'imprimerie" */
function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.035,
        mixBlendMode: "screen",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.65 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        backgroundSize: "220px 220px",
      }}
    />
  );
}

/* ============================================================
   Wordmark — "PICK'EM WC26" mode magazine sportif
   ============================================================ */
function Wordmark({ size = 18, mono = false }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: size * 0.35,
        lineHeight: 1,
        color: mono ? "currentColor" : "var(--paper-1)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: size * 1.45,
          letterSpacing: -0.02 * size,
        }}
      >
        Pick’em
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 500,
          fontSize: size * 0.62,
          letterSpacing: 0.12 * size,
          color: mono ? "currentColor" : "var(--paper-3)",
          transform: "translateY(-1px)",
        }}
      >
        WC26
      </span>
    </div>
  );
}

/* ============================================================
   Status pill — OUVERT, LOCK DANS …, LOCKÉ, SCORÉ
   ============================================================ */
function StatusPill({ status, children }) {
  const map = {
    open:     { fg: "var(--mexico)",  dot: "var(--mexico)",  label: "OUVERT" },
    closing:  { fg: "var(--canada)",  dot: "var(--canada)",  label: "LOCK IMMINENT" },
    locked:   { fg: "var(--paper-3)", dot: "var(--paper-3)", label: "LOCKÉ" },
    scored:   { fg: "var(--gold)",    dot: "var(--gold)",    label: "SCORÉ" },
    upcoming: { fg: "var(--paper-4)", dot: "var(--paper-4)", label: "À VENIR" },
  };
  const cfg = map[status] || map.upcoming;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: 1.2,
        color: cfg.fg,
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: cfg.dot,
          boxShadow:
            status === "open" || status === "closing"
              ? `0 0 0 3px ${cfg.dot}22`
              : "none",
        }}
      />
      {children || cfg.label}
    </span>
  );
}

/* ============================================================
   Avatar — pastille colorée + initiale (proxy avatar X)
   ============================================================ */
function Avatar({ name, handle, hue = 0, size = 32 }) {
  const initial = (name || handle || "?")[0].toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: `linear-gradient(135deg, oklch(0.55 0.13 ${hue}), oklch(0.35 0.10 ${hue + 30}))`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: size * 0.5,
        color: "var(--paper-1)",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {initial}
    </div>
  );
}

/* ============================================================
   TeamRow — drapeau emoji + code FIFA mono + nom FR
   Variants : default, qualified (liseré vert), best-third (pointillé)
   ============================================================ */
function TeamRow({ team, variant = "default", pos, draggable = false, dense = false }) {
  const isQualified = variant === "qualified";
  const isBestThird = variant === "best-third";
  const isEliminated = variant === "eliminated";

  let leftIndicator = null;
  if (variant === "qualified") {
    leftIndicator = (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 4,
          bottom: 4,
          width: 2,
          background: "var(--mexico)",
        }}
      />
    );
  } else if (variant === "best-third") {
    leftIndicator = (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 4,
          bottom: 4,
          width: 0,
          borderLeft: "2px dashed var(--gold)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: pos != null ? "20px auto 44px 1fr auto" : "auto 44px 1fr auto",
        alignItems: "center",
        gap: 10,
        padding: dense ? "7px 12px 7px 14px" : "10px 14px",
        background: "var(--ink-3)",
        borderRadius: 6,
        border: "1px solid var(--line)",
        cursor: draggable ? "grab" : "default",
        opacity: isEliminated ? 0.55 : 1,
      }}
    >
      {leftIndicator}

      {pos != null && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--paper-3)",
          }}
        >
          {pos}
        </span>
      )}

      <span style={{ fontSize: 18, lineHeight: 1 }}>{team.flag}</span>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: 0.6,
          color: "var(--paper-2)",
        }}
      >
        {team.code}
      </span>

      <span
        style={{
          fontSize: 13,
          color: "var(--paper-1)",
          fontWeight: 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {team.name}
      </span>

      {draggable && (
        <span
          aria-hidden="true"
          style={{
            color: "var(--paper-4)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: 1,
          }}
        >
          ⋮⋮
        </span>
      )}
    </div>
  );
}

/* ============================================================
   PageHeader — sticky-style top of each screen
   Wordmark · countdown global · avatar
   ============================================================ */
function PageHeader({ countdown = { d: 5, h: 18, m: 24 }, active = "PICKS", user = { name: "Léo", hue: 160 } }) {
  const links = ["PICKS", "BRACKET", "CLASSEMENT", "MES POTES"];
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 32,
        padding: "16px 32px",
        borderBottom: "1px solid var(--line)",
        background: "color-mix(in srgb, var(--ink-1) 80%, transparent)",
        backdropFilter: "blur(10px)",
        position: "relative",
      }}
    >
      <Wordmark size={16} />

      <nav style={{ display: "flex", gap: 24, marginLeft: 24 }}>
        {links.map((l) => (
          <span
            key={l}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: 1.3,
              color: active === l ? "var(--paper-1)" : "var(--paper-3)",
              borderBottom: active === l ? "1px solid var(--paper-1)" : "1px solid transparent",
              paddingBottom: 2,
              cursor: "pointer",
            }}
          >
            {l}
          </span>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Countdown bloc */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 14px",
          border: "1px solid var(--line-strong)",
          borderRadius: 999,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: 1.4,
            color: "var(--canada)",
            textTransform: "uppercase",
          }}
        >
          ● Lock dans
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--paper-1)",
            letterSpacing: 0.5,
          }}
        >
          {String(countdown.d).padStart(2, "0")}j&nbsp;
          {String(countdown.h).padStart(2, "0")}h&nbsp;
          {String(countdown.m).padStart(2, "0")}m
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={user.name} hue={user.hue} size={28} />
        <span style={{ fontSize: 13, color: "var(--paper-2)" }}>{user.name}</span>
      </div>
    </header>
  );
}

/* ============================================================
   Button primitives
   ============================================================ */
function Btn({ children, kind = "primary", size = "md", icon, style, ...rest }) {
  const sizes = {
    sm: { padding: "8px 14px", fontSize: 12 },
    md: { padding: "12px 18px", fontSize: 13 },
    lg: { padding: "16px 24px", fontSize: 14 },
  };
  const kinds = {
    primary: { background: "var(--paper-1)", color: "var(--ink-1)", border: "1px solid var(--paper-1)" },
    ghost:   { background: "transparent",    color: "var(--paper-1)", border: "1px solid var(--line-strong)" },
    danger:  { background: "var(--canada)",  color: "#fff",           border: "1px solid var(--canada)" },
    lock:    { background: "var(--mexico)",  color: "#0A2418",        border: "1px solid var(--mexico)" },
    x:       { background: "#000",           color: "#fff",           border: "1px solid #000" },
  };
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        borderRadius: 6,
        cursor: "pointer",
        ...sizes[size],
        ...kinds[kind],
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* ============================================================
   SectionLabel — petit label majuscule mono pour les chapitres
   ============================================================ */
function SectionLabel({ children, num }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        letterSpacing: 1.6,
        color: "var(--paper-3)",
        textTransform: "uppercase",
      }}
    >
      {num && <span style={{ color: "var(--paper-4)" }}>{num}</span>}
      <span>{children}</span>
    </div>
  );
}

/* ============================================================
   Editorial big title — italic serif
   ============================================================ */
function Display({ children, size = 56, style }) {
  return (
    <h1
      style={{
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: -0.012 * size,
        margin: 0,
        color: "var(--paper-1)",
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

/* expose to window so other Babel scripts can use */
Object.assign(window, {
  Frame, NoiseOverlay, Wordmark, StatusPill, Avatar, TeamRow,
  PageHeader, Btn, SectionLabel, Display,
});
