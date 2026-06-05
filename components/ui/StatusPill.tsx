type Status = "open" | "closing" | "locked" | "scored" | "upcoming";

const map: Record<
  Status,
  { fg: string; dot: string; label: string; glow: boolean }
> = {
  open: { fg: "var(--mexico)", dot: "var(--mexico)", label: "OUVERT", glow: true },
  closing: { fg: "var(--canada)", dot: "var(--canada)", label: "LOCK IMMINENT", glow: true },
  locked: { fg: "var(--paper-3)", dot: "var(--paper-3)", label: "LOCKÉ", glow: false },
  scored: { fg: "var(--gold)", dot: "var(--gold)", label: "SCORÉ", glow: false },
  upcoming: { fg: "var(--paper-4)", dot: "var(--paper-4)", label: "À VENIR", glow: false },
};

export function StatusPill({
  status,
  children,
}: {
  status: Status;
  children?: React.ReactNode;
}) {
  const cfg = map[status];
  return (
    <span className="pill" style={{ color: cfg.fg }}>
      <span
        className="pill-dot"
        style={{
          background: cfg.dot,
          boxShadow: cfg.glow ? `0 0 0 3px ${cfg.dot}22` : "none",
        }}
      />
      {children ?? cfg.label}
    </span>
  );
}
