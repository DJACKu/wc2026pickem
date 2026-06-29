"use client";

import { useState } from "react";
import type { Match, Phase, Team } from "@/db/schema";
import { GroupsPicker } from "@/app/picks/groups/GroupsPicker";
import { BracketTree } from "@/app/components/BracketTree";

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

      <div className="mt-6">
        {tab === "groups" && (
          <div className="opacity-90 pointer-events-none">
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
          <div className="opacity-90 pointer-events-none bg-[var(--ink-2)] rounded-lg p-4 border border-[var(--line)]">
            <BracketTree 
              teamsById={teamsById} 
              matchesByPhase={koMatchesByPhase} 
              picksByPhase={koPicksByPhase} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
