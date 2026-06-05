import { flagSvgUrl } from "@/lib/flags";

export function TeamFlag({
  code,
  height = 14,
  className = "",
}: {
  code: string;
  height?: number;
  className?: string;
}) {
  const w = Math.round(height * 1.4);
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={flagSvgUrl(code)}
      alt=""
      aria-hidden
      width={w}
      height={height}
      className={className}
      style={{
        width: w,
        height,
        objectFit: "cover",
        borderRadius: 2,
        flexShrink: 0,
        display: "inline-block",
        verticalAlign: "middle",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
      }}
    />
  );
}
