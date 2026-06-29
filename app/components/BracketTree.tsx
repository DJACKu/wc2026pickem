import React from "react";
import { TeamFlag } from "@/components/ui/TeamFlag";

type MatchNode = {
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  realHomeTeamId?: string | null;
  realAwayTeamId?: string | null;
  winnerId?: string | null;
  status?: string;
  pickedWinnerId?: string | null;
  kickoffAt?: string | Date | null;
};

type BracketTreeProps = {
  teamsById: Record<string, any>;
  matchesByPhase: Record<string, any[]>;
  picksByPhase: Record<string, Record<string, string>>;
  onPick?: (phaseId: string, matchId: string, teamId: string) => void;
  readOnlyPhases?: Record<string, boolean>;
};

function MatchCard({
  match,
  teamsById,
  pickedWinnerId,
  onPick,
  readOnly,
}: {
  match: MatchNode;
  teamsById: Record<string, any>;
  pickedWinnerId?: string | null;
  onPick?: (teamId: string) => void;
  readOnly?: boolean;
}) {
  const home = match?.homeTeamId ? teamsById[match.homeTeamId] : null;
  const away = match?.awayTeamId ? teamsById[match.awayTeamId] : null;

  const isFinished = match?.status === "finished";
  const realWinnerId = match?.winnerId;

  const renderSide = (team: any, isHome: boolean) => {
    const isPicked = team && team.id === pickedWinnerId;
    
    // The user can only pick if the match is not readOnly, not finished, 
    // and the team they are clicking is actually the REAL team in the DB for this match.
    // (We fallback to match.homeTeamId if realHomeTeamId is undefined for R32).
    const realIdForSide = isHome 
      ? (match.realHomeTeamId !== undefined ? match.realHomeTeamId : match.homeTeamId)
      : (match.realAwayTeamId !== undefined ? match.realAwayTeamId : match.awayTeamId);
      
    const isRealTeam = team && team.id === realIdForSide;
    const canPick = !readOnly && team && onPick && !isFinished && isRealTeam;
    
    // Determine the colors based on whether the match is finished
    let bgColor = "bg-[var(--ink-2)]";
    let textColor = "var(--paper-4)";
    let opacity = 1;

    if (isFinished) {
      if (isPicked) {
        // Did they pick the actual winner?
        if (realWinnerId === pickedWinnerId) {
          bgColor = "bg-emerald-950/40"; // Correct pick!
          textColor = "#34d399"; // emerald-400
        } else {
          bgColor = "bg-red-950/40"; // Wrong pick!
          textColor = "#f87171"; // red-400
        }
      } else if (team && team.id === realWinnerId) {
        // This team won, but the user didn't pick it
        textColor = "var(--paper-2)";
      } else {
        // This team lost
        opacity = 0.5;
      }
    } else {
      // Not finished yet
      if (isPicked) {
        bgColor = "bg-[var(--ink-4)]";
        textColor = "var(--paper-1)";
      }
    }
    
    return (
      <div
        onClick={() => canPick && onPick(team.id)}
        className={`flex items-center gap-2 px-2 py-1.5 transition-colors ${bgColor} ${canPick ? "cursor-pointer hover:bg-[var(--ink-3)]" : ""}`}
        style={{
          borderBottom: isHome ? "1px solid var(--line)" : "none",
          opacity,
        }}
      >
        <TeamFlag code={team?.id} height={14} />
        <span
          className="text-[12px] truncate max-w-[90px] w-full font-medium"
          style={{ color: textColor }}
        >
          {team?.id ? team.nameFr : "TBD"}
        </span>
      </div>
    );
  };

  if (!match) return <div className="w-[140px] h-[52px] opacity-0" />;

  const kickoffDate = match.kickoffAt ? new Date(match.kickoffAt) : null;
  const matchStarted = kickoffDate ? kickoffDate.getTime() <= Date.now() : false;
  const matchReadOnly = readOnly || matchStarted;

  // Add a subtle border color if it was a finished match and the user made a pick
  let borderColor = pickedWinnerId ? "var(--paper-1)" : "var(--line)";
  let shadow = pickedWinnerId ? "0 0 10px rgba(255,255,255,0.1)" : "none";

  if (isFinished && pickedWinnerId) {
    if (pickedWinnerId === realWinnerId) {
      borderColor = "#34d399"; // Green border for win
      shadow = "0 0 8px rgba(52, 211, 153, 0.2)";
    } else {
      borderColor = "#f87171"; // Red border for loss
      shadow = "0 0 8px rgba(248, 113, 113, 0.2)";
    }
  }

  return (
    <div
      className="w-[140px] rounded-md overflow-hidden flex flex-col shrink-0 relative"
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        opacity: matchReadOnly && !isFinished ? 0.7 : 1,
      }}
    >
      {matchStarted && !readOnly && !isFinished && (
        <div className="absolute top-0 right-0 bg-[var(--ink-2)] px-1 rounded-bl text-[8px] z-10" style={{borderLeft: "1px solid var(--line)", borderBottom: "1px solid var(--line)"}}>
          🔒
        </div>
      )}
      {renderSide(home, true)}
      {renderSide(away, false)}
    </div>
  );
}

function RoundColumn({ matches, teamsById, picksByPhase, phaseId, className = "", onPick, readOnly }: any) {
  return (
    <div className={`flex flex-col justify-around h-full py-4 ${className}`}>
      {matches.map((m: any, i: number) => (
        <MatchCard
          key={m?.id || i}
          match={m}
          teamsById={teamsById}
          pickedWinnerId={picksByPhase?.[phaseId]?.[m?.id]}
          onPick={onPick ? (teamId: string) => onPick(phaseId, m.id, teamId) : undefined}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

export function BracketTree({ teamsById, matchesByPhase, picksByPhase, onPick, readOnlyPhases = {} }: BracketTreeProps) {
  const sortById = (matches: any[]) => {
    return [...matches].sort((a, b) => {
      const idA = parseInt(a.id.replace("fd-", "")) || 0;
      const idB = parseInt(b.id.replace("fd-", "")) || 0;
      return idA - idB;
    });
  };

  const getWinner = (m: any) => {
    return m?.winnerId; // Only propagate the REAL winner set by admin
  };

  const r32 = sortById(matchesByPhase["r32"] || []);
  
  const r16 = sortById(matchesByPhase["r16"] || []).map((m, i) => ({
    ...m,
    realHomeTeamId: m.homeTeamId,
    realAwayTeamId: m.awayTeamId,
    homeTeamId: getWinner(r32[i * 2]) || m.homeTeamId,
    awayTeamId: getWinner(r32[i * 2 + 1]) || m.awayTeamId,
  }));

  const qf = sortById(matchesByPhase["qf"] || []).map((m, i) => ({
    ...m,
    realHomeTeamId: m.homeTeamId,
    realAwayTeamId: m.awayTeamId,
    homeTeamId: getWinner(r16[i * 2]) || m.homeTeamId,
    awayTeamId: getWinner(r16[i * 2 + 1]) || m.awayTeamId,
  }));

  const sf = sortById(matchesByPhase["sf"] || []).map((m, i) => ({
    ...m,
    realHomeTeamId: m.homeTeamId,
    realAwayTeamId: m.awayTeamId,
    homeTeamId: getWinner(qf[i * 2]) || m.homeTeamId,
    awayTeamId: getWinner(qf[i * 2 + 1]) || m.awayTeamId,
  }));

  let finals = sortById(matchesByPhase["final"] || []);
  if (finals.length === 2 && sf.length === 2) {
    const sf0 = sf[0];
    const sf1 = sf[1];
    const sf0winner = getWinner(sf0);
    const sf1winner = getWinner(sf1);
    
    const sf0loser = sf0winner === sf0?.homeTeamId ? sf0?.awayTeamId : (sf0winner === sf0?.awayTeamId ? sf0?.homeTeamId : null);
    const sf1loser = sf1winner === sf1?.homeTeamId ? sf1?.awayTeamId : (sf1winner === sf1?.awayTeamId ? sf1?.homeTeamId : null);

    finals = [
      { ...finals[0], realHomeTeamId: finals[0].homeTeamId, realAwayTeamId: finals[0].awayTeamId, homeTeamId: sf0loser || finals[0].homeTeamId, awayTeamId: sf1loser || finals[0].awayTeamId }, // 3rd place
      { ...finals[1], realHomeTeamId: finals[1].homeTeamId, realAwayTeamId: finals[1].awayTeamId, homeTeamId: sf0winner || finals[1].homeTeamId, awayTeamId: sf1winner || finals[1].awayTeamId }, // final
    ];
  }

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
        <RoundColumn matches={leftR32} phaseId="r32" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["r32"]} />
        <RoundColumn matches={leftR16} phaseId="r16" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["r16"]} />
        <RoundColumn matches={leftQf} phaseId="qf" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["qf"]} />
        <RoundColumn matches={leftSf} phaseId="sf" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["sf"]} />

        {/* Center (Finals) */}
        <div className="flex flex-col justify-center items-center px-4 gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-[var(--paper-4)] mb-2 tracking-widest">🏆 FINALE</span>
            <MatchCard match={grandFinal} teamsById={teamsById} pickedWinnerId={picksByPhase?.["final"]?.[grandFinal?.id]} onPick={onPick ? (t) => onPick("final", grandFinal?.id, t) : undefined} readOnly={readOnlyPhases["final"]} />
          </div>
          <div className="flex flex-col items-center opacity-75 scale-90">
            <span className="text-[10px] font-mono text-[var(--paper-4)] mb-2 tracking-widest">3ÈME PLACE</span>
            <MatchCard match={thirdPlace} teamsById={teamsById} pickedWinnerId={picksByPhase?.["final"]?.[thirdPlace?.id]} onPick={onPick ? (t) => onPick("final", thirdPlace?.id, t) : undefined} readOnly={readOnlyPhases["final"]} />
          </div>
        </div>

        {/* Right Tree */}
        <RoundColumn matches={rightSf} phaseId="sf" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["sf"]} />
        <RoundColumn matches={rightQf} phaseId="qf" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["qf"]} />
        <RoundColumn matches={rightR16} phaseId="r16" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["r16"]} />
        <RoundColumn matches={rightR32} phaseId="r32" teamsById={teamsById} picksByPhase={picksByPhase} onPick={onPick} readOnly={readOnlyPhases["r32"]} />
      </div>
    </div>
  );
}
