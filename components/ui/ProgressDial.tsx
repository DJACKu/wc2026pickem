export function ProgressDial({
  filled,
  total,
  label,
  sub,
  size = 72,
}: {
  filled: number;
  total: number;
  label?: string;
  sub?: string;
  size?: number;
}) {
  const safeTotal = Math.max(1, total);
  const pct = Math.min(1, Math.max(0, filled / safeTotal));
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <div className="inline-flex items-center gap-3.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--ink-3)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--mexico)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-display italic text-[color:var(--paper-1)]"
          style={{ fontSize: size * 0.3, lineHeight: 1 }}
        >
          {filled}
          <span
            className="text-[color:var(--paper-3)]"
            style={{ fontSize: size * 0.17 }}
          >
            /{total}
          </span>
        </div>
      </div>
      {(label || sub) && (
        <div>
          {label && (
            <div className="font-mono text-[10.5px] tracking-[0.13em] uppercase text-[color:var(--paper-3)]">
              {label}
            </div>
          )}
          {sub && (
            <div className="text-[12px] text-[color:var(--paper-2)] mt-0.5">
              {sub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
