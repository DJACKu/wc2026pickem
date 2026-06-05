import Link from "next/link";
import { auth } from "@/auth";
import { getLeaderboardPage } from "@/lib/leaderboard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { Avatar } from "@/components/ui/Avatar";
import { SearchIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam ?? "0") || 0);
  const search = q?.trim() || undefined;

  const session = await auth();
  const { rows, total, pageSize } = await getLeaderboardPage({
    search,
    page,
    meId: session?.user?.id,
  });

  // Podium uniquement si on a au moins 3 joueurs ET qu'au moins l'un d'eux
  // a des points (sinon c'est plus utile d'afficher la table complète).
  const showPodium =
    page === 0 && !search && rows.length >= 3 && (rows[0]?.total ?? 0) > 0;
  const top3 = showPodium ? rows.slice(0, 3) : [];
  const rest = showPodium ? rows.slice(3) : rows;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = page * pageSize + 1;
  const rangeEnd = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
        <div>
          <SectionLabel num="GÉN.">Classement général</SectionLabel>
          <Display
            size={64}
            className="mt-3.5"
            style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
          >
            <span style={{ color: "var(--gold)" }}>{total}</span> joueurs.
            <br />
            Une seule place sur le podium.
          </Display>
        </div>

        <form className="flex items-center gap-3" action="/leaderboard" method="get">
          <label
            className="flex items-center gap-2 px-3 py-2 rounded-md min-w-[220px]"
            style={{
              background: "var(--ink-2)",
              border: "1px solid var(--line)",
            }}
          >
            <span style={{ color: "var(--paper-3)" }}>
              <SearchIcon />
            </span>
            <input
              name="q"
              defaultValue={search ?? ""}
              placeholder="Chercher @handle…"
              className="bg-transparent outline-none flex-1 text-[13px]"
              style={{ color: "var(--paper-1)" }}
            />
          </label>
          {search && (
            <Link href="/leaderboard" className="btn btn-ghost btn-sm">
              ✕
            </Link>
          )}
        </form>
      </div>

      {/* Podium */}
      {top3.length === 3 && (
        <div className="grid grid-cols-3 gap-3.5 items-end mb-7">
          <PodiumCard row={top3[1]} place="2nd" tone="var(--paper-2)" />
          <PodiumCard row={top3[0]} place="1st" tone="var(--gold)" highlight />
          <PodiumCard row={top3[2]} place="3rd" tone="var(--canada)" />
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
      >
        <div
          className="grid items-center px-5 py-3 font-mono text-[10px] tracking-[0.13em] uppercase"
          style={{
            gridTemplateColumns: "60px 1fr 100px 100px 110px",
            background: "var(--ink-1)",
            color: "var(--paper-3)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span>RANG</span>
          <span>JOUEUR</span>
          <span className="text-right">POULES</span>
          <span className="text-right">3èmes</span>
          <span className="text-right">TOTAL</span>
        </div>
        {rest.length === 0 ? (
          <div className="p-8 text-center text-[color:var(--paper-3)] text-[13px]">
            {search ? "Aucun joueur trouvé pour ce handle." : "Aucun joueur inscrit pour le moment."}
          </div>
        ) : (
          rest.map((r, idx) => <LeaderRow key={r.userId} row={r} alt={idx % 2 === 1} />)
        )}
      </div>

      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <span className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--paper-3)]">
          {total > 0 ? `${rangeStart} — ${rangeEnd} SUR ${total}` : "AUCUN RÉSULTAT"}
        </span>
        <div className="flex gap-2">
          <PageLink
            disabled={page === 0}
            href={`/leaderboard?${qs(search, page - 1)}`}
          >
            ←
          </PageLink>
          <PageLink
            disabled={page + 1 >= totalPages}
            href={`/leaderboard?${qs(search, page + 1)}`}
          >
            →
          </PageLink>
        </div>
      </div>
    </div>
  );
}

function qs(search: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 0) params.set("page", String(page));
  return params.toString();
}

function PageLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="btn btn-ghost btn-sm opacity-40 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="btn btn-ghost btn-sm">
      {children}
    </Link>
  );
}

function PodiumCard({
  row,
  place,
  tone,
  highlight,
}: {
  row: { rank: number; handle: string; displayName: string | null; avatarUrl: string | null; total: number; isMe: boolean };
  place: "1st" | "2nd" | "3rd";
  tone: string;
  highlight?: boolean;
}) {
  const height = highlight ? 250 : place === "2nd" ? 210 : 190;
  const placeLabel = place === "1st" ? "🥇 1er" : place === "2nd" ? "🥈 2e" : "🥉 3e";
  const name = row.displayName || row.handle;
  return (
    <Link
      href={`/u/${row.handle}`}
      className="block rounded-[12px] p-5 relative overflow-hidden"
      style={{
        background: highlight ? "var(--ink-3)" : "var(--ink-2)",
        border: highlight ? "1px solid var(--gold)" : "1px solid var(--line)",
        height,
        color: "inherit",
      }}
    >
      <div
        className="absolute font-display pointer-events-none"
        style={{
          right: -10,
          top: -28,
          fontSize: 180,
          lineHeight: 1,
          color: tone,
          opacity: 0.15,
        }}
      >
        {row.rank}
      </div>

      <div className="relative">
        <div
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: tone }}
        >
          {placeLabel}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Avatar src={row.avatarUrl} name={name} size={42} />
          <div className="min-w-0">
            <div className="font-display text-[26px] leading-none text-[color:var(--paper-1)] truncate">
              {name}
            </div>
            <div className="font-mono text-[11px] text-[color:var(--paper-3)] mt-1 truncate">
              @{row.handle} {row.isMe && <span style={{ color: "var(--mexico)" }}>· TOI</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between">
        <div>
          <div className="font-mono text-[9.5px] tracking-[0.12em] text-[color:var(--paper-3)]">
            POINTS
          </div>
          <div className="font-display text-[56px] leading-none text-[color:var(--paper-1)]">
            {row.total}
          </div>
        </div>
      </div>
    </Link>
  );
}

function LeaderRow({
  row,
  alt,
}: {
  row: {
    rank: number;
    userId: string;
    handle: string;
    displayName: string | null;
    avatarUrl: string | null;
    total: number;
    groupsPts: number;
    thirdsBonus: number;
    isMe: boolean;
  };
  alt: boolean;
}) {
  const name = row.displayName || row.handle;
  return (
    <Link
      href={`/u/${row.handle}`}
      className="grid items-center px-5 py-3"
      style={{
        gridTemplateColumns: "60px 1fr 100px 100px 110px",
        background: row.isMe
          ? "var(--ink-3)"
          : alt
            ? "var(--ink-2)"
            : "transparent",
        borderBottom: "1px solid var(--line-soft)",
        borderLeft: row.isMe
          ? "2px solid var(--mexico)"
          : "2px solid transparent",
        color: "inherit",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="font-display"
          style={{
            fontSize: 22,
            lineHeight: 1,
            color: row.isMe ? "var(--mexico)" : "var(--paper-1)",
            width: 28,
          }}
        >
          {row.rank}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--paper-4)" }}
        >
          —
        </span>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={row.avatarUrl} name={name} size={30} />
        <div className="min-w-0">
          <div className="text-[14px] truncate text-[color:var(--paper-1)]">
            {name}
            {row.isMe && (
              <span
                className="font-mono ml-2 text-[9px] tracking-[0.1em]"
                style={{ color: "var(--mexico)" }}
              >
                · TOI
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] text-[color:var(--paper-3)] truncate">
            @{row.handle}
          </div>
        </div>
      </div>
      <span className="font-mono text-[13px] text-right text-[color:var(--paper-2)]">
        {row.groupsPts}
      </span>
      <span
        className="font-mono text-[13px] text-right"
        style={{ color: "var(--gold)" }}
      >
        {row.thirdsBonus ? `+${row.thirdsBonus}` : "—"}
      </span>
      <span className="font-display text-[24px] leading-none text-right text-[color:var(--paper-1)]">
        {row.total}
      </span>
    </Link>
  );
}
