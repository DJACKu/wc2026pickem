"use client";

import { useState } from "react";
import type { Match, Phase, Team } from "@/db/schema";
import { BracketTree } from "@/app/components/BracketTree";
import { saveMatchPick, lockKoPhase, unlockKoPhase } from "./actions";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LockIcon } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

type Props = {
  teamsById: Record<string, Team>;
  koPhases: Phase[];
  koMatchesByPhase: Record<string, Match[]>;
  initialPicksByPhase: Record<string, Record<string, string>>;
  readOnlyPhases: Record<string, boolean>;
  userLockedPhases: Record<string, boolean>;
};

export function BracketTreePicker({
  teamsById,
  koPhases,
  koMatchesByPhase,
  initialPicksByPhase,
  readOnlyPhases,
  userLockedPhases,
}: Props) {
  const router = useRouter();
  const [picks, setPicks] = useState(initialPicksByPhase);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePick = async (phaseId: string, matchId: string, teamId: string) => {
    if (readOnlyPhases[phaseId]) return;

    // Optimistic update
    setPicks((prev) => ({
      ...prev,
      [phaseId]: {
        ...(prev[phaseId] || {}),
        [matchId]: teamId,
      },
    }));
    setErrorMsg("");
    setSaving(true);

    try {
      await saveMatchPick({ phaseId: phaseId as any, matchId, winnerId: teamId });
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de sauvegarde.");
      // Revert on failure
      setPicks(initialPicksByPhase);
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async (phaseId: string) => {
    if (!confirm("Es-tu sûr de vouloir verrouiller tes picks pour cette phase ? C'est définitif !")) return;
    setSaving(true);
    try {
      await lockKoPhase({ phaseId: phaseId as any });
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de lock.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async (phaseId: string) => {
    if (!confirm("Es-tu sûr de vouloir déverrouiller tes picks ? Tu pourras à nouveau les modifier avant la deadline.")) return;
    setSaving(true);
    try {
      await unlockKoPhase({ phaseId: phaseId as any });
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de déverrouillage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Controls & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--ink-2)] p-4 rounded-md border border-[var(--line)]">
        <div className="flex flex-col gap-1">
          <SectionLabel num="PICKER">Ton Bracket de Phase Finale</SectionLabel>
          <div className="text-[12px] text-[var(--paper-3)]">
            Sélectionne les vainqueurs pour les phases ouvertes. Les phases à venir ou passées sont en lecture seule.
          </div>
        </div>
        
        {/* Render Lock buttons for open phases */}
        <div className="flex items-center gap-3">
          {koPhases.map(phase => {
            const isReadOnly = readOnlyPhases[phase.id];
            const isLocked = userLockedPhases[phase.id];
            const isPast = new Date(phase.locksAt).getTime() <= Date.now();
            
            if (isPast) return null; // Don't show lock button for past phases

            const matches = koMatchesByPhase[phase.id] || [];
            const picksCount = Object.keys(picks[phase.id] || {}).length;
            const canLock = picksCount === matches.length && matches.length > 0;

            return (
              <div key={phase.id} className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest text-[var(--paper-4)] uppercase">
                  {phase.labelFr}:
                </span>
                {isLocked ? (
                  <button
                    onClick={() => handleUnlock(phase.id)}
                    disabled={saving}
                    className="font-mono text-[11px] tracking-[0.12em] inline-flex items-center gap-1.5 text-[var(--mexico)] border border-[var(--mexico)] px-2 py-1 rounded hover:bg-[var(--mexico)] hover:text-black transition-colors"
                    title="Cliquer pour déverrouiller"
                  >
                    <LockIcon size={12} />
                    LOCKÉ
                  </button>
                ) : (
                  <button
                    onClick={() => handleLock(phase.id)}
                    disabled={!canLock || saving}
                    className="btn btn-primary btn-sm"
                    style={{ opacity: canLock && !saving ? 1 : 0.5 }}
                  >
                    LOCK {phase.id.toUpperCase()} ({picksCount}/{matches.length})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-900/20 text-red-400 p-3 rounded text-sm border border-red-900/50">
          {errorMsg}
        </div>
      )}

      {/* Tree */}
      <div className="bg-[var(--ink-2)] rounded-lg p-4 border border-[var(--line)] w-full overflow-hidden">
        <BracketTree 
          teamsById={teamsById} 
          matchesByPhase={koMatchesByPhase} 
          picksByPhase={picks} 
          onPick={handlePick}
          readOnlyPhases={readOnlyPhases}
        />
      </div>
    </div>
  );
}
