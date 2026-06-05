export function Display({
  children,
  size = 56,
  className = "",
  style,
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h1
      className={`font-display ${className}`}
      style={{
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: `${-0.012 * size}px`,
        margin: 0,
        color: "var(--paper-1)",
        textWrap: "balance" as React.CSSProperties["textWrap"],
        ...style,
      }}
    >
      {children}
    </h1>
  );
}
