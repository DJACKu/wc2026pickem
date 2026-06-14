"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import type { Match, Team } from "@/db/schema";
import { GROUP_LETTERS } from "@/db/seed-data";
import { Display } from "@/components/ui/Display";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProgressDial } from "@/components/ui/ProgressDial";
import { StatusPill } from "@/components/ui/StatusPill";
import { TeamFlag } from "@/components/ui/TeamFlag";
import { CheckIcon, LockIcon } from "@/components/ui/icons";
import { formatPhaseDeadline } from "@/lib/format";
import {
  lockGroupsPhase,
  saveGroupOrder,
  toggleThirdPick,
  unlockGroupsPhase,
} from "./actions";

type Props = {
  teamsById: Record<string, Team>;
  initialOrders: Record<string, string[]>;
  initialThirds: string[];
  deadlinePassed: boolean;
  deadline: string;
  userLocked: boolean;
  initialSavedGroupsCount: number;
  startedGroups: string[];
  matchesByGroup: Record<string, Match[]>;
};

export function GroupsPicker({
  teamsById,
  initialOrders,
  initialThirds,
  deadlinePassed,
  deadline,
  userLocked,
  initialSavedGroupsCount,
  startedGroups,
  matchesByGroup,
}: Props) {
  const globalReadOnly = deadlinePassed || userLocked;
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [thirds, setThirds] = useState<Set<string>>(new Set(initialThirds));
  const [savedGroups, setSavedGroups] = useState<Set<string>>(
    () =>
      new Set(
        GROUP_LETTERS.filter((l) => {
          const u = initialOrders[l];
          // Approximate: if user had a saved 4-uple, the page passes savedGroupsCount
          return initialSavedGroupsCount > 0 && u && u.length === 4;
        }),
      ),
  );
  const [error, setError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (savedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [savedAt]);

  // Real-time polling
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 20000);
    return () => clearInterval(id);
  }, [router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(letter: string, event: DragEndEvent) {
    if (globalReadOnly || startedGroups.includes(letter)) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const old = orders[letter] ?? [];
    const oldIdx = old.indexOf(String(active.id));
    const newIdx = old.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;

    const next = arrayMove(old, oldIdx, newIdx);
    const oldThird = old[2];
    const newThird = next[2];

    setOrders((o) => ({ ...o, [letter]: next }));
    if (oldThird !== newThird && oldThird) {
      setThirds((s) => {
        const ns = new Set(s);
        ns.delete(oldThird);
        return ns;
      });
    }

    void saveGroupOrder({ groupLetter: letter, teamIds: next })
      .then(() => {
        setSavedAt(Date.now());
        setSavedGroups((s) => {
          const ns = new Set(s);
          ns.add(letter);
          return ns;
        });
      })
      .catch((e: unknown) => {
        setError(humanize(e));
        setOrders((o) => ({ ...o, [letter]: old }));
      });
  }

  function onToggleThird(teamId: string, checked: boolean) {
    const team = teamsById[teamId];
    if (globalReadOnly || (team && startedGroups.includes(team.groupLetter))) return;
    if (checked && thirds.size >= 8) {
      setError("Tu as déjà 8 meilleurs 3èmes — décoches-en un d'abord.");
      return;
    }
    setThirds((s) => {
      const next = new Set(s);
      if (checked) next.add(teamId);
      else next.delete(teamId);
      return next;
    });
    void toggleThirdPick({ teamId, checked })
      .then(() => setSavedAt(Date.now()))
      .catch((e: unknown) => {
        setError(humanize(e));
        setThirds((s) => {
          const next = new Set(s);
          if (checked) next.delete(teamId);
          else next.add(teamId);
          return next;
        });
      });
  }

  async function handleLock() {
    setError(null);
    setLocking(true);
    try {
      await Promise.all(
        GROUP_LETTERS.filter((l) => !startedGroups.includes(l)).map((l) =>
          saveGroupOrder({ groupLetter: l, teamIds: orders[l] }),
        ),
      );
      await lockGroupsPhase();
      router.push("/picks");
      router.refresh();
    } catch (e: unknown) {
      setError(humanize(e));
      setLocking(false);
    }
  }

  async function handleUnlock() {
    setError(null);
    try {
      await unlockGroupsPhase();
      router.refresh();
    } catch (e: unknown) {
      setError(humanize(e));
    }
  }

  const thirdsCount = thirds.size;
  const savedCount = savedGroups.size;
  const canLock = thirdsCount === 8 && !locking;

  const autosaveMsg = useMemo(() => {
    if (!savedAt) return globalReadOnly ? null : "EN ATTENTE";
    const sec = Math.max(1, Math.floor((now - savedAt) / 1000));
    if (sec < 60) return `IL Y A ${sec}S`;
    const min = Math.floor(sec / 60);
    return `IL Y A ${min}M`;
  }, [savedAt, now, globalReadOnly]);

  return (
    <>
      {/* Header band */}
      <div
        className="px-6 lg:px-10 py-4 flex items-center justify-between gap-6 flex-wrap"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-4">
          <StatusPill status={globalReadOnly ? "locked" : "open"}>
            {deadlinePassed
              ? "DEADLINE PASSÉE"
              : userLocked
                ? "TES PICKS SONT LOCKÉS"
                : "12 GROUPES À ORDONNER"}
          </StatusPill>
        </div>
        <div className="flex items-center gap-4">
          {!globalReadOnly && (
            <span
              className="font-mono text-[11px] tracking-[0.1em]"
              style={{ color: savedAt ? "var(--mexico)" : "var(--paper-3)" }}
            >
              ● AUTOSAVE · {autosaveMsg}
            </span>
          )}
          {userLocked && !deadlinePassed && (
            <button
              type="button"
              onClick={handleUnlock}
              className="btn btn-ghost btn-sm"
            >
              ← Modifier mes picks
            </button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-10 pt-8 pb-3">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <Display size={56} style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
              Ordonne les{" "}
              <span style={{ color: "var(--canada)" }}>12 poules</span>.
              <br />
              <span style={{ color: "var(--paper-3)" }}>
                Glisse les équipes — 1er en haut, éliminé en bas.
              </span>
            </Display>
          </div>
          <ProgressDial
            filled={savedCount}
            total={12}
            label="GROUPES ORDONNÉS"
            sub={
              savedCount === 12
                ? "Tout est en place."
                : `Plus que ${12 - savedCount}.`
            }
          />
        </div>
      </div>

      {error && (
        <div
          className="mx-6 lg:mx-10 mt-3 p-3 rounded-md text-[13px] flex items-start gap-3"
          style={{
            background: "var(--ink-3)",
            border: "1px solid var(--canada)",
          }}
        >
          <span style={{ color: "var(--canada)" }}>⚠</span>
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ color: "var(--paper-3)" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Groups grid 4×3 */}
      <div className="px-6 lg:px-10 mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {GROUP_LETTERS.map((letter) => {
          const isGroupReadOnly = globalReadOnly || startedGroups.includes(letter);
          return (
            <GroupCard
              key={letter}
              letter={letter}
              orderIds={orders[letter] ?? []}
              teamsById={teamsById}
              readOnly={isGroupReadOnly}
              saved={savedGroups.has(letter)}
              sensors={sensors}
              onDragEnd={(e) => handleDragEnd(letter, e)}
              matches={matchesByGroup[letter] ?? []}
              hasStarted={startedGroups.includes(letter)}
            />
          );
        })}
      </div>

      {/* 8 best 3rds panel */}
      <section className="px-6 lg:px-10 mt-10">
        <div
          className="rounded-[12px] p-6 lg:p-7 grid lg:grid-cols-[1.1fr,2fr] gap-8"
          style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
        >
          <div>
            <SectionLabel num="BONUS">8 meilleurs 3èmes</SectionLabel>
            <Display size={36} className="mt-3.5">
              Coche les 8 qui passent.
            </Display>
            <p className="text-[13px] leading-[1.55] mt-3 text-[color:var(--paper-2)] max-w-[360px]">
              Parmi tes 12 troisièmes, sélectionne les{" "}
              <strong style={{ color: "var(--gold)" }}>8 meilleurs</strong> —
              ceux qui se qualifient pour le R32 selon le format réel.{" "}
              <em className="text-[color:var(--paper-3)]">+2 pts par 3ème correct.</em>
            </p>
            <div
              className="mt-4 px-3.5 py-2.5 rounded-md flex items-center gap-3 w-fit"
              style={{ border: "1px dashed var(--line-strong)" }}
            >
              <span
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)" }}
              >
                SÉLECTIONNÉS
              </span>
              <span className="font-display text-[28px] leading-none text-[color:var(--paper-1)]">
                {thirdsCount}{" "}
                <span className="text-[18px] text-[color:var(--paper-3)]">/ 8</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {GROUP_LETTERS.map((letter) => {
              const teamId = orders[letter]?.[2];
              if (!teamId) return null;
              const t = teamsById[teamId];
              const checked = thirds.has(teamId);
              const isTeamReadOnly = globalReadOnly || (t && startedGroups.includes(t.groupLetter));
              return (
                <label
                  key={letter}
                  className={`relative grid items-center gap-2.5 rounded-md ${
                    isTeamReadOnly ? "cursor-default" : "cursor-pointer"
                  }`}
                  style={{
                    gridTemplateColumns: "auto auto auto 1fr auto",
                    padding: "10px 12px 10px 14px",
                    background: checked ? "var(--ink-3)" : "var(--ink-1)",
                    border: checked
                      ? "1px solid var(--gold)"
                      : "1px solid var(--line)",
                    opacity: checked ? 1 : 0.6,
                  }}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    disabled={isTeamReadOnly}
                    onChange={(e) => onToggleThird(teamId, e.target.checked)}
                  />
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: "var(--paper-4)", letterSpacing: 0.8 }}
                  >
                    GR.{letter}
                  </span>
                  {t ? <TeamFlag code={t.id} height={14} /> : <span />}
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--paper-2)" }}>
                    {t?.id}
                  </span>
                  <span className="text-[12px] truncate text-[color:var(--paper-1)]">
                    {t?.nameFr}
                  </span>
                  <span
                    className="inline-flex items-center justify-center rounded-[4px] flex-shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      border: `1.5px solid ${checked ? "var(--gold)" : "var(--paper-4)"}`,
                      background: checked ? "var(--gold)" : "transparent",
                      color: "var(--ink-1)",
                    }}
                  >
                    {checked && <CheckIcon size={11} />}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Bottom lock strip */}
        {!globalReadOnly && (
          <div
            className="mt-6 mb-12 px-6 py-5 rounded-[10px] flex flex-wrap items-center justify-between gap-4"
            style={{
              background: "var(--ink-3)",
              border: "1px solid var(--line-strong)",
            }}
          >
            <div>
              <div className="font-mono text-[10.5px] tracking-[0.13em] text-[color:var(--paper-3)]">
                QUAND TU LOCKES, TES PICKS DEVIENNENT IMMUABLES.
              </div>
              <div className="text-[14px] text-[color:var(--paper-2)] mt-1">
                Tu peux modifier autant que tu veux jusqu&apos;au{" "}
                <strong className="text-[color:var(--paper-1)]">
                  {formatPhaseDeadline(deadline)}
                </strong>
                .
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="font-mono text-[10px] tracking-[0.12em] text-[color:var(--paper-3)]">
                  3ÈMES COCHÉS
                </div>
                <div
                  className="font-display"
                  style={{ fontSize: 30, lineHeight: 1, color: canLock ? "var(--mexico)" : "var(--paper-1)" }}
                >
                  {thirdsCount}{" "}
                  <span className="text-[14px] text-[color:var(--paper-3)]">/ 8</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLock}
                disabled={!canLock}
                className="btn btn-lock btn-lg disabled:opacity-50"
              >
                <LockIcon />
                {locking ? "LOCK…" : "Lock mes 12 poules"}
              </button>
            </div>
          </div>
        )}

        {userLocked && (
          <div
            className="mt-6 mb-12 p-5 rounded-md flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
          >
            <div>
              <div className="font-mono text-[10.5px] tracking-[0.13em] text-[color:var(--paper-3)]">
                ✓ TU AS LOCKÉ TES PICKS
              </div>
              <div className="text-[14px] text-[color:var(--paper-2)] mt-1">
                {`Tu peux encore les modifier en demandant de débloquer.`}
              </div>
            </div>
            <button
              type="button"
              onClick={handleUnlock}
              className="btn btn-ghost btn-md"
            >
              ← Modifier mes picks
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function GroupCard({
  letter,
  orderIds,
  teamsById,
  readOnly,
  saved,
  sensors,
  onDragEnd,
  matches,
  hasStarted,
}: {
  letter: string;
  orderIds: string[];
  teamsById: Record<string, Team>;
  readOnly: boolean;
  saved: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  matches: Match[];
  hasStarted: boolean;
}) {
  return (
    <div
      className="rounded-[10px] p-3.5"
      style={{
        background: "var(--ink-2)",
        border: "1px solid var(--line)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-[0.12em] text-[color:var(--paper-3)]">
            POULE
          </span>
          <span
            className="font-display"
            style={{
              fontSize: 26,
              lineHeight: 1,
              color: saved ? "var(--paper-1)" : "var(--canada)",
            }}
          >
            {letter}
          </span>
        </div>
        <span
          className="font-mono text-[10px] tracking-[0.1em]"
          style={{ color: saved ? "var(--mexico)" : "var(--paper-4)" }}
        >
          {hasStarted ? "🔒 EN DIRECT" : saved ? "✓ OK" : "⋮⋮ DÉPLACE"}
        </span>
      </div>

      {matches.length > 0 && (
        <div className="mb-3 p-2 rounded flex flex-col gap-1.5" style={{ background: "var(--ink-1)", border: "1px solid var(--line-strong)" }}>
          {matches.slice(0, 6).map((m) => {
            const h = teamsById[m.homeTeamId!];
            const a = teamsById[m.awayTeamId!];
            if (!h || !a) return null;
            return (
              <div key={m.id} className="flex items-center justify-between font-mono text-[10px] text-[color:var(--paper-2)]">
                <span className="flex items-center gap-1.5">
                  <TeamFlag code={h.id} height={10} /> {h.id}
                </span>
                <span className="font-bold text-[color:var(--paper-1)]">
                  {m.homeScore ?? "-"} : {m.awayScore ?? "-"}
                </span>
                <span className="flex items-center gap-1.5">
                  {a.id} <TeamFlag code={a.id} height={10} />
                </span>
              </div>
            );
          })}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          <div className="grid gap-1.5">
            {orderIds.map((id, idx) => {
              const liveStandings = computeLiveStandings(orderIds, matches);
              const hasScores = matches.some(m => m.homeScore != null);
              const livePos = hasScores ? liveStandings.indexOf(id) + 1 : null;
              
              return (
                <SortableTeamRow
                  key={id}
                  id={id}
                  team={teamsById[id]}
                  position={idx + 1}
                  readOnly={readOnly}
                  livePos={livePos}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div
        className="mt-2.5 pt-2 flex items-center justify-between font-mono text-[9px] tracking-[0.08em]"
        style={{ borderTop: "1px solid var(--line)", color: "var(--paper-4)" }}
      >
        <span>1·2 QUALIF</span>
        <span style={{ color: "var(--gold)" }}>3 BONUS</span>
        <span>4 ÉLIM</span>
      </div>
    </div>
  );
}

function SortableTeamRow({
  id,
  team,
  position,
  readOnly,
  livePos,
}: {
  id: string;
  team: Team | undefined;
  position: number;
  readOnly: boolean;
  livePos?: number | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: readOnly });

  const variant: "qualified" | "best-third" | "eliminated" =
    position <= 2 ? "qualified" : position === 3 ? "best-third" : "eliminated";

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "var(--ink-3)",
    borderColor: isDragging ? "var(--paper-3)" : "var(--line)",
    opacity: variant === "eliminated" ? 0.55 : 1,
    position: "relative",
    gridTemplateColumns: "20px auto 44px 1fr auto",
    padding: "7px 12px 7px 14px",
    zIndex: isDragging ? 10 : "auto",
  };

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
      ref={setNodeRef}
      style={style}
      className="grid items-center gap-2.5 rounded-md border"
    >
      {leftBar}
      <span className="font-mono text-[11px] text-[color:var(--paper-3)]">
        {position}
      </span>
      {team ? <TeamFlag code={team.id} height={14} /> : <span />}
      <span
        className="font-mono"
        style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--paper-2)" }}
      >
        {team?.id}
      </span>
      <span className="text-[13px] truncate text-[color:var(--paper-1)]">
        {team?.nameFr}
      </span>
      {!readOnly ? (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Réordonner"
          className="font-mono touch-none cursor-grab active:cursor-grabbing flex justify-end"
          style={{ fontSize: 10, letterSpacing: 1, color: "var(--paper-4)" }}
        >
          ⋮⋮
        </button>
      ) : livePos != null ? (
        <span
          className="font-mono text-[10px] flex items-center justify-end font-bold"
          style={{ color: livePos === position ? "var(--mexico)" : "var(--canada)" }}
        >
          {livePos === position ? "✓" : `RÉEL ${livePos}${livePos === 1 ? "er" : "e"}`}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}

function computeLiveStandings(teamIds: string[], matches: Match[]): string[] {
  if (matches.length === 0) return teamIds;
  const stats = Object.fromEntries(teamIds.map(id => [id, { pts: 0, gd: 0, gs: 0 }]));
  for (const m of matches) {
    if (m.homeScore == null || m.awayScore == null) continue;
    const h = stats[m.homeTeamId!];
    const a = stats[m.awayTeamId!];
    if (!h || !a) continue;
    h.gs += m.homeScore;
    a.gs += m.awayScore;
    h.gd += (m.homeScore - m.awayScore);
    a.gd += (m.awayScore - m.homeScore);
    if (m.homeScore > m.awayScore) h.pts += 3;
    else if (m.homeScore < m.awayScore) a.pts += 3;
    else { h.pts += 1; a.pts += 1; }
  }
  return [...teamIds].sort((a, b) => {
    const stA = stats[a];
    const stB = stats[b];
    if (stA.pts !== stB.pts) return stB.pts - stA.pts;
    if (stA.gd !== stB.gd) return stB.gd - stA.gd;
    if (stA.gs !== stB.gs) return stB.gs - stA.gs;
    return 0;
  });
}

function humanize(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
