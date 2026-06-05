function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export function Avatar({
  src,
  name,
  size = 32,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{
          width: size,
          height: size,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      />
    );
  }
  const initial = (name || "?")[0]!.toUpperCase();
  const hue = hueFromString(name || "x");
  return (
    <span
      aria-hidden
      className="font-display italic inline-flex items-center justify-center rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, oklch(0.55 0.13 ${hue}), oklch(0.35 0.10 ${hue + 30}))`,
        fontSize: size * 0.5,
        color: "var(--paper-1)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {initial}
    </span>
  );
}
