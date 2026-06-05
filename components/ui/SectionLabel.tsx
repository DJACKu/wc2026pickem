export function SectionLabel({
  num,
  children,
}: {
  num?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="font-mono inline-flex items-center gap-2.5 text-[0.65rem] tracking-[0.13em] uppercase text-[color:var(--paper-3)]">
      {num && <span className="text-[color:var(--paper-4)]">{num}</span>}
      <span>{children}</span>
    </div>
  );
}
