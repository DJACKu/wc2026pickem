import React from "react";
import { TeamFlag } from "@/components/ui/TeamFlag";

type MatchNode = {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  pickedWinnerId?: string | null;
};

type BracketTreeProps = {
  teamsById: Record<string, any>;
  matchesByPhase: Record<string, any[]>;
  picksByPhase: Record<string, Record<string, string>>;
};

function MatchCard({
  match,
  teamsById,
  pickedWinnerId,
}: {
  match: MatchNode;
  teamsById: Record<string, any>;
  pickedWinnerId?: string | null;
}) {
  const home = match?.homeTeamId ? teamsById[match.homeTeamId] : null;
  const away = match?.awayTeamId ? teamsById[match.awayTeamId] : null;

  const renderSide = (team: any, isHome: boolean) => {
    const isPicked = team && team.id === pickedWinnerId;
    return (
      <div
        className={`flex items-center gap-2 px-2 py-1.5 transition-colors ${
          isPicked ? "bg-[var(--ink-4)]" : "bg-[var(--ink-2)]"
        }`}
        style={{
          borderBottom: isHome ? "1px solid var(--line)" : "none",
        }}
      >
        <TeamFlag code={team?.id} height={14} />
        <span
          className="text-[12px] truncate max-w-[90px] w-full font-medium"
          style={{
            color: isPicked ? "var(--paper-1)" : "var(--paper-4)",
          }}
        >
          {team?.id ? team.nameFr : "TBD"}
        </span>
      </div>
    );
  };

  if (!match) return <div className="w-[140px] h-[52px] opacity-0" />;

  return (
    <div
      className="w-[140px] rounded-md overflow-hidden flex flex-col shrink-0 relative"
      style={{
        border: pickedWinnerId ? "1px solid var(--paper-1)" : "1px solid var(--line)",
        boxShadow: pickedWinnerId ? "0 0 10px rgba(255,255,255,0.1)" : "none",
      }}
    >
      {renderSide(home, true)}
      {renderSide(away, false)}
    </div>
  );
}

function RoundColumn({ matches, teamsById, picksByPhase, phaseId, className = "" }: any) {
  return (
    <div className={`flex flex-col justify-around h-full py-4 ${className}`}>
      {matches.map((m: any, i: number) => (
        <MatchCard
          key={m?.id || i}
          match={m}
          teamsById={teamsById}
          pickedWinnerId={picksByPhase?.[phaseId]?.[m?.id]}
        />
      ))}
    </div>
  );
}

export function BracketTree({ teamsById, matchesByPhase, picksByPhase }: BracketTreeProps) {
  const r32 = matchesByPhase["r32"] || [];
  const r16 = matchesByPhase["r16"] || [];
  const qf = matchesByPhase["qf"] || [];
  const sf = matchesByPhase["sf"] || [];
  const finals = matchesByPhase["final"] || [];

  // Left side
  const leftR32 = r32.slice(0, 8);
  const leftR16 = r16.slice(0, 4);
  const leftQf = qf.slice(0, 2);
  const leftSf = sf.slice(0, 1);

  // Right side
  const rightR32 = r32.slice(8, 16);
  const rightR16 = r16.slice(4, 8);
  const rightQf = qf.slice(2, 4);
  const rightSf = sf.slice(1, 2);

  // Finals
  const thirdPlace = finals[0];
  const grandFinal = finals[1];

  return (
    <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
      <div 
        className="min-w-[1000px] flex items-stretch justify-between px-2"
        style={{ height: "640px" }}
      >
        {/* Left Tree */}
        <RoundColumn matches={leftR32} phaseId="r32" teamsById={teamsById} picksByPhase={picksByPhase} />
        <RoundColumn matches={leftR16} phaseId="r16" teamsById={teamsById} picksByPhase={picksByPhase} />
        <RoundColumn matches={leftQf} phaseId="qf" teamsById={teamsById} picksByPhase={picksByPhase} />
        <RoundColumn matches={leftSf} phaseId="sf" teamsById={teamsById} picksByPhase={picksByPhase} />

        {/* Center (Finals) */}
        <div className="flex flex-col justify-center items-center px-4 gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-[var(--paper-4)] mb-2 tracking-widest">🏆 FINALE</span>
            <MatchCard match={grandFinal} teamsById={teamsById} pickedWinnerId={picksByPhase?.["final"]?.[grandFinal?.id]} />
          </div>
          <div className="flex flex-col items-center opacity-75 scale-90">
            <span className="text-[10px] font-mono text-[var(--paper-4)] mb-2 tracking-widest">3ÈME PLACE</span>
            <MatchCard match={thirdPlace} teamsById={teamsById} pickedWinnerId={picksByPhase?.["final"]?.[thirdPlace?.id]} />
          </div>
        </div>

        {/* Right Tree */}
        <RoundColumn matches={rightSf} phaseId="sf" teamsById={teamsById} picksByPhase={picksByPhase} />
        <RoundColumn matches={rightQf} phaseId="qf" teamsById={teamsById} picksByPhase={picksByPhase} />
        <RoundColumn matches={rightR16} phaseId="r16" teamsById={teamsById} picksByPhase={picksByPhase} />
        <RoundColumn matches={rightR32} phaseId="r32" teamsById={teamsById} picksByPhase={picksByPhase} />
      </div>
    </div>
  );
}
