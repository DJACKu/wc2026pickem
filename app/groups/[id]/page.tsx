import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getFriendGroupMembersWithScores, isMember } from "@/lib/friend-groups";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { Avatar } from "@/components/ui/Avatar";
import { XIcon } from "@/components/ui/icons";
import { LeaveButton } from "./LeaveButton";
import { CopyCodeButton } from "./CopyCodeButton";

export const dynamic = "force-dynamic";

export default async function FriendGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const data = await getFriendGroupMembersWithScores(id, user.id);
  if (!data) notFound();

  const member = await isMember(id, user.id);
  if (!member) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-12 pb-16">
        <Display size={48}>{data.group.name}</Display>
        <p className="mt-4 text-[color:var(--paper-2)]">
          Tu n&rsquo;es pas membre de ce groupe.
        </p>
        <Link href="/groups" className="mt-6 inline-block btn btn-ghost btn-md">
          ← Mes groupes
        </Link>
      </div>
    );
  }

  const isOwner = data.group.ownerId === user.id;
  const lockedCount = 0; // wired in Bloc 4 when scoring lands
  const firstPts = data.members[0]?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      <div className="grid lg:grid-cols-[1fr,380px] gap-9 mb-7">
        <div>
          <Link
            href="/groups"
            className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)] hover:text-[color:var(--paper-1)]"
          >
            ← MES GROUPES
          </Link>
          <SectionLabel num={`G/${data.group.inviteCode.slice(-4)}`}>
            Groupe d&rsquo;amis
          </SectionLabel>
          <Display
            size={72}
            className="mt-3"
            style={{ fontSize: "clamp(40px, 7vw, 72px)" }}
          >
            {data.group.name}
          </Display>
          <div className="mt-5 flex items-center gap-4 flex-wrap">
            <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--paper-3)]">
              {data.members.length} MEMBRE{data.members.length > 1 ? "S" : ""} ·{" "}
              {lockedCount} LOCKÉ{lockedCount > 1 ? "S" : ""}
            </span>
            {!isOwner && (
              <LeaveButton groupId={data.group.id} />
            )}
          </div>
        </div>

        {/* Invite card */}
        <aside
          className="rounded-[12px] p-6 relative overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--line-strong)" }}
        >
          <span
            aria-hidden
            className="absolute top-0 left-0 right-0"
            style={{
              height: 3,
              background:
                "linear-gradient(90deg, var(--usa) 0% 33%, var(--paper-1) 33% 67%, var(--canada) 67% 100%)",
            }}
          />
          <SectionLabel num="+">Invite des potes</SectionLabel>
          <p className="mt-3 text-[13px] leading-[1.5] text-[color:var(--paper-2)]">
            Un seul lien, n&rsquo;importe qui peut rejoindre.
          </p>

          <div
            className="mt-4 px-4 py-3 rounded-md flex items-center justify-between gap-3"
            style={{
              background: "var(--ink-1)",
              border: "1px dashed var(--line-strong)",
            }}
          >
            <div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-[color:var(--paper-3)]">
                CODE
              </div>
              <div
                className="font-mono mt-1 font-medium"
                style={{ fontSize: 22, letterSpacing: 2, color: "var(--gold)" }}
              >
                {data.group.inviteCode}
              </div>
            </div>
            <CopyCodeButton code={data.group.inviteCode} />
          </div>

          <div className="mt-3.5 flex gap-2">
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(
                `Rejoins « ${data.group.name} » sur Pick'em WC26 → `,
              )}${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/g/${data.group.inviteCode}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-x btn-sm"
            >
              <XIcon />
              Partager
            </a>
          </div>

          <div
            className="mt-4 pt-3.5 font-mono text-[10px] tracking-[0.05em] truncate"
            style={{
              borderTop: "1px solid var(--line)",
              color: "var(--paper-4)",
            }}
          >
            {(process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^https?:\/\//, "")}/g/{data.group.inviteCode}
          </div>
        </aside>
      </div>

      {/* Members table */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
      >
        <div
          className="grid items-center px-5 py-3 font-mono text-[10px] tracking-[0.13em] uppercase"
          style={{
            gridTemplateColumns: "60px 1fr 140px 110px 110px",
            background: "var(--ink-1)",
            color: "var(--paper-3)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span>RANG</span>
          <span>JOUEUR</span>
          <span className="text-right">REJOINT LE</span>
          <span className="text-right">ÉCART AU 1er</span>
          <span className="text-right">POINTS</span>
        </div>

        {data.members.map((m, idx) => (
          <Row key={m.userId} m={m} alt={idx % 2 === 1} firstPts={firstPts} />
        ))}
      </div>
    </div>
  );
}

function Row({
  m,
  alt,
  firstPts,
}: {
  m: {
    rank: number;
    userId: string;
    handle: string;
    displayName: string | null;
    avatarUrl: string | null;
    total: number;
    isMe: boolean;
    isOwner: boolean;
    joinedAt: Date;
  };
  alt: boolean;
  firstPts: number;
}) {
  const name = m.displayName || m.handle;
  const gap = firstPts - m.total;
  const isLeader = m.rank === 1;
  return (
    <Link
      href={`/u/${m.handle}`}
      className="grid items-center px-5 py-3"
      style={{
        gridTemplateColumns: "60px 1fr 140px 110px 110px",
        background: m.isMe
          ? "var(--ink-3)"
          : alt
            ? "var(--ink-2)"
            : "transparent",
        borderBottom: "1px solid var(--line-soft)",
        borderLeft: m.isMe
          ? "2px solid var(--mexico)"
          : "2px solid transparent",
        color: "inherit",
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: 22,
          lineHeight: 1,
          color: isLeader ? "var(--gold)" : "var(--paper-1)",
        }}
      >
        {m.rank}
      </span>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={m.avatarUrl} name={name} size={32} />
        <div className="min-w-0">
          <div className="text-[14px] truncate text-[color:var(--paper-1)]">
            {name}
            {m.isMe && (
              <span
                className="font-mono ml-2 text-[9px] tracking-[0.1em]"
                style={{ color: "var(--mexico)" }}
              >
                · TOI
              </span>
            )}
            {m.isOwner && (
              <span
                className="font-mono ml-2 text-[9px] tracking-[0.1em]"
                style={{ color: "var(--gold)" }}
              >
                · OWNER
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] text-[color:var(--paper-3)] truncate">
            @{m.handle}
          </div>
        </div>
      </div>
      <span
        className="font-mono text-[11.5px] text-right text-[color:var(--paper-2)]"
        style={{ letterSpacing: 0.4 }}
      >
        {m.joinedAt.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })}
      </span>
      <span
        className="font-mono text-[12px] text-right"
        style={{ color: isLeader ? "var(--paper-3)" : "var(--paper-2)" }}
      >
        {isLeader ? "—" : `−${gap}`}
      </span>
      <span className="font-display text-[26px] leading-none text-right text-[color:var(--paper-1)]">
        {m.total}
      </span>
    </Link>
  );
}
