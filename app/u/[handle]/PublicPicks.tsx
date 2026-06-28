"use client";

import { useState } from "react";
import type { Match, Phase, Team } from "@/db/schema";
import { GroupsPicker } from "@/app/picks/groups/GroupsPicker";
import { BracketPicker } from "@/app/picks/[phase]/BracketPicker";

type Props = {
  teamsById: Record<string, Team>;
  groupsData: {
    initialOrders: Record<string, string[]>;
    initialThirds: string[];
    deadline: string;
    startedGroups: string[];
    matchesByGroup: Record<string, Match[]>;
  };
  koPhases: Phase[];
  koMatchesByPhase: Record<string, Match[]>;
  koPicksByPhase: Record<string, Record<string, string>>;
};

export function PublicPicks({
  teamsById,
  groupsData,
  koPhases,
  koMatchesByPhase,
  koPicksByPhase,
}: Props) {
  const [tab, setTab] = useState<"groups" | "ko">("groups");

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b" style={{ borderColor: "var(--line)" }}>
        <button
          onClick={() => setTab("groups")}
          className={`pb-3 font-mono text-[11px] tracking-[0.1em] transition-colors ${
            tab === "groups" ? "text-[color:var(--mexico)] border-b-2" : "text-[color:var(--paper-3)]"
          }`}
          style={{ borderBottomColor: tab === "groups" ? "var(--mexico)" : "transparent" }}
        >
          PHASE DE POULES
        </button>
        <button
          onClick={() => setTab("ko")}
          className={`pb-3 font-mono text-[11px] tracking-[0.1em] transition-colors ${
            tab === "ko" ? "text-[color:var(--mexico)] border-b-2" : "text-[color:var(--paper-3)]"
          }`}
          style={{ borderBottomColor: tab === "ko" ? "var(--mexico)" : "transparent" }}
        >
          PHASE FINALE
        </button>
      </div>

      <div className="mt-6" style={{ pointerEvents: "none" }}>
        {tab === "groups" && (
          <div className="opacity-90">
            <GroupsPicker
              teamsById={teamsById}
              initialOrders={groupsData.initialOrders}
              initialThirds={groupsData.initialThirds}
              deadlinePassed={true}
              deadline={groupsData.deadline}
              userLocked={true}
              initialSavedGroupsCount={12}
              startedGroups={groupsData.startedGroups}
              matchesByGroup={groupsData.matchesByGroup}
            />
          </div>
        )}

        {tab === "ko" && (
          <div className="flex flex-col gap-12 opacity-90">
            {koPhases.map((phase) => {
              const matches = koMatchesByPhase[phase.id] || [];
              if (matches.length === 0) return null;
              return (
                <div key={phase.id}>
                  <BracketPicker
                    phaseId={phase.id}
                    labelFr={phase.labelFr}
                    info={undefined}
                    matches={matches.map(m => ({
                      id: m.id,
                      homeTeamId: m.homeTeamId,
                      awayTeamId: m.awayTeamId,
                      kickoffAt: m.kickoffAt ? m.kickoffAt.toISOString() : null,
                    }))}
                    teamsById={teamsById}
                    initialPicks={koPicksByPhase[phase.id] || {}}
                    deadlinePassed={true}
                    userLocked={true}
                    deadline={phase.locksAt.toISOString()}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
