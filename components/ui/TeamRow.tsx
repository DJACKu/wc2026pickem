type Variant = "default" | "qualified" | "best-third" | "eliminated";

export function TeamRow({
  team,
  pos,
  variant = "default",
  dense = false,
  dragHandle,
}: {
  team: { id: string; nameFr: string; flagEmoji?: string | null };
  pos?: number;
  variant?: Variant;
  dense?: boolean;
  dragHandle?: React.ReactNode;
}) {
  const eliminated = variant === "eliminated";

  const leftBar =
    variant === "qualified" ? (
      <span
        aria-hidden
        className="absolute left-0 top-1 bottom-1 w-[2px]"
        style={{ background: "var(--mexico)" }}
      />
    ) : variant === "best-third" ? (
      <span
        aria-hidden
        className="absolute left-0 top-1 bottom-1"
        style={{ borderLeft: "2px dashed var(--gold)", width: 0 }}
      />
    ) : null;

  return (
    <div
      className="relative grid items-center gap-2.5 rounded-md border"
      style={{
        gridTemplateColumns:
          pos != null
            ? "20px auto 44px 1fr auto"
            : "auto 44px 1fr auto",
        padding: dense ? "7px 12px 7px 14px" : "10px 14px",
        background: "var(--ink-3)",
        borderColor: "var(--line)",
        opacity: eliminated ? 0.55 : 1,
      }}
    >
      {leftBar}

      {pos != null && (
        <span className="font-mono text-[11px] text-[color:var(--paper-3)]">
          {pos}
        </span>
      )}

      <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
        {team.flagEmoji ?? "·"}
      </span>

      <span
        className="font-mono"
        style={{
          fontSize: 11,
          letterSpacing: 0.6,
          color: "var(--paper-2)",
        }}
      >
        {team.id}
      </span>

      <span className="text-[13px] text-[color:var(--paper-1)] truncate">
        {team.nameFr}
      </span>

      {dragHandle ?? <span />}
    </div>
  );
}
