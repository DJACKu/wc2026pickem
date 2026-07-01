import { db, matches, teams } from "@/db";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { Display } from "@/components/ui/Display";
import { TeamFlag } from "@/components/ui/TeamFlag";
import { TodayNav } from "./TodayNav";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const allMatches = await db.select().from(matches).orderBy(asc(matches.kickoffAt));
  const allTeams = await db.select().from(teams);
  const teamsById = Object.fromEntries(allTeams.map(t => [t.id, t]));

  // Regroupe par Date US (America/New_York)
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });
  
  const matchesByDate = new Map<string, typeof allMatches>();
  for (const m of allMatches) {
    if (!m.kickoffAt) continue;
    // formatToParts donne "MM", "DD", "YYYY"
    const parts = formatter.formatToParts(m.kickoffAt);
    const mm = parts.find(p => p.type === "month")!.value;
    const dd = parts.find(p => p.type === "day")!.value;
    const yyyy = parts.find(p => p.type === "year")!.value;
    const usDate = `${yyyy}-${mm}-${dd}`;
    
    if (!matchesByDate.has(usDate)) matchesByDate.set(usDate, []);
    matchesByDate.get(usDate)!.push(m);
  }

  const sortedDates = Array.from(matchesByDate.keys()).sort();
  if (sortedDates.length === 0) {
    return <div className="p-10">Aucun match programmé.</div>;
  }

  // Trouver la date US courante
  const now = new Date();
  const nowParts = formatter.formatToParts(now);
  const nowUS = `${nowParts.find(p=>p.type==="year")!.value}-${nowParts.find(p=>p.type==="month")!.value}-${nowParts.find(p=>p.type==="day")!.value}`;

  let scrollTarget = nowUS;
  if (!matchesByDate.has(nowUS)) {
    scrollTarget = sortedDates.find(d => d >= nowUS) ?? sortedDates[sortedDates.length - 1];
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Display size={48} className="mb-8">Calendrier & Résultats</Display>
      
      <TodayNav sortedDates={sortedDates} initialTarget={scrollTarget} />

      {/* Matches List per Date */}
      <div>
        {sortedDates.map(date => {
          const dateObj = new Date(`${date}T12:00:00Z`);
          const dayMatches = matchesByDate.get(date) ?? [];
          
          return (
            <section key={date} id={`day-${date}`} className="mb-12 scroll-mt-32">
              <h2 className="font-mono text-[13px] text-[color:var(--paper-3)] uppercase tracking-widest mb-4">
                {dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <div className="grid gap-4">
        {dayMatches.map(m => {
          const h = m.homeTeamId ? teamsById[m.homeTeamId] : null;
          const a = m.awayTeamId ? teamsById[m.awayTeamId] : null;
          
          const isLive = m.status === "live";
          const isFinished = m.status === "finished";

          // Heure de Paris (FR)
          const frTime = m.kickoffAt ? new Intl.DateTimeFormat("fr-FR", {
            timeZone: "Europe/Paris",
            hour: "2-digit",
            minute: "2-digit",
          }).format(m.kickoffAt).replace(":", "h") : "TBD";

          return (
            <div key={m.id} className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6" style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}>
              
              {/* Infos Horaires & Statut */}
              <div className="flex flex-col items-start w-32 shrink-0">
                <span className="font-mono text-[16px] text-[color:var(--paper-1)] font-bold">{frTime}</span>
                <span className="font-mono text-[10px] tracking-widest text-[color:var(--paper-3)] uppercase mt-1">
                  {isLive ? <span style={{color: "var(--canada)"}}>● EN DIRECT</span> : isFinished ? "TERMINÉ" : "À VENIR"}
                </span>
                {(() => {
                  const groupLetter = h?.groupLetter ?? a?.groupLetter;
                  return groupLetter ? (
                    <span className="font-mono text-[10.5px] text-[color:var(--gold)] mt-2">Poule {groupLetter}</span>
                  ) : m.phaseId ? (
                    <span className="font-mono text-[10.5px] text-[color:var(--gold)] mt-2 uppercase">{m.phaseId}</span>
                  ) : null;
                })()}
              </div>

              {/* Equipes et Scores */}
              <div className="flex-1 flex flex-col gap-3 max-w-[320px] w-full mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {h ? <TeamFlag code={h.id} height={20} /> : <div className="w-[30px] h-[20px] bg-[var(--ink-3)] rounded" />}
                    <span className="font-bold text-[16px] text-[color:var(--paper-1)]">{h?.nameFr ?? m.homeTeamId ?? "À déterminer"}</span>
                  </div>
                  <span className="font-mono text-[22px] font-bold flex items-baseline gap-2" style={{ color: "var(--paper-1)" }}>
                    {m.homeScore ?? "-"}
                    {m.homePenaltyScore != null && (
                      <span className="text-[12px] text-[var(--paper-4)] font-normal">({m.homePenaltyScore} tab)</span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {a ? <TeamFlag code={a.id} height={20} /> : <div className="w-[30px] h-[20px] bg-[var(--ink-3)] rounded" />}
                    <span className="font-bold text-[16px] text-[color:var(--paper-1)]">{a?.nameFr ?? m.awayTeamId ?? "À déterminer"}</span>
                  </div>
                  <span className="font-mono text-[22px] font-bold flex items-baseline gap-2" style={{ color: "var(--paper-1)" }}>
                    {m.awayScore ?? "-"}
                    {m.awayPenaltyScore != null && (
                      <span className="text-[12px] text-[var(--paper-4)] font-normal">({m.awayPenaltyScore} tab)</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="hidden sm:block w-32 shrink-0" /> {/* Spacer */}

            </div>
          );
        })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
