import { ImageResponse } from "next/og";
import { asc, eq, sql } from "drizzle-orm";
import {
  db,
  groupPicks,
  scores,
  teams,
  users,
} from "@/db";
import { FIFA_TO_FLAG } from "@/lib/flags";

export const runtime = "edge";
export const alt = "Pick'em WC26 — Carte de picks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK_1 = "#0F0D0C";
const INK_2 = "#16130F";
const INK_3 = "#1F1A15";
const PAPER_1 = "#F5EFE4";
const PAPER_2 = "#C9C0B0";
const PAPER_3 = "#8A8174";
const PAPER_4 = "#5B5347";
const CANADA = "#E8112D";
const USA = "#2563EB";
const GOLD = "#D4A547";

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle).replace(/^@/, "");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.handle, handle))
    .limit(1);

  if (!user) {
    return new ImageResponse(<NotFoundCard handle={handle} />, size);
  }

  const [topPicks, totalRow] = await Promise.all([
    db
      .select({
        groupLetter: groupPicks.groupLetter,
        teamId: groupPicks.teamId,
        teamNameFr: teams.nameFr,
      })
      .from(groupPicks)
      .innerJoin(teams, eq(teams.id, groupPicks.teamId))
      .where(
        sql`${groupPicks.userId} = ${user.id} AND ${groupPicks.predictedPos} = 1`,
      )
      .orderBy(asc(groupPicks.groupLetter)),
    db
      .select({ s: sql<number>`COALESCE(SUM(${scores.points}), 0)::int` })
      .from(scores)
      .where(eq(scores.userId, user.id)),
  ]);

  const total = Number(totalRow[0]?.s ?? 0);
  const displayName = user.displayName || user.handle;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: INK_1,
          color: PAPER_1,
          display: "flex",
          flexDirection: "column",
          padding: 60,
        }}
      >
        {/* Top strip — wordmark + handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: 56,
                color: PAPER_1,
                lineHeight: 1,
              }}
            >
              Pick&rsquo;em
            </span>
            <span
              style={{
                fontFamily: "monospace",
                color: PAPER_3,
                fontSize: 22,
                letterSpacing: 4,
              }}
            >
              WC26
            </span>
          </div>
          <span
            style={{
              fontFamily: "monospace",
              color: PAPER_3,
              fontSize: 18,
              letterSpacing: 3,
            }}
          >
            @{handle.toUpperCase()} · CARTE DE PICKS
          </span>
        </div>

        {/* Hero: name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 50,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              letterSpacing: 4,
              color: PAPER_3,
              textTransform: "uppercase",
            }}
          >
            {topPicks.length}/12 tops de groupes prédits
          </span>
          <span
            style={{
              fontFamily: "serif",
              fontStyle: "italic",
              fontSize: 130,
              lineHeight: 1,
              color: PAPER_1,
              marginTop: 8,
            }}
          >
            {displayName}
          </span>
        </div>

        {/* Top picks grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            marginTop: 36,
          }}
        >
          {topPicks.slice(0, 8).map((p) => {
            const flag = FIFA_TO_FLAG[p.teamId] ?? "un";
            return (
              <div
                key={p.groupLetter}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: INK_3,
                  padding: "14px 20px",
                  borderRadius: 8,
                  border: `1px solid ${PAPER_4}33`,
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    color: PAPER_4,
                    fontSize: 16,
                    letterSpacing: 1,
                  }}
                >
                  GR.{p.groupLetter}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/w80/${flag}.png`}
                  width={40}
                  height={28}
                  alt=""
                  style={{ borderRadius: 3 }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    color: PAPER_2,
                    fontSize: 16,
                    letterSpacing: 1,
                  }}
                >
                  {p.teamId}
                </span>
                <span style={{ fontSize: 22, color: PAPER_1 }}>
                  {p.teamNameFr}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom: points + tricolor */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "monospace",
                color: PAPER_3,
                fontSize: 16,
                letterSpacing: 3,
              }}
            >
              POINTS TOTAL
            </span>
            <span
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: 110,
                color: total > 0 ? GOLD : PAPER_1,
                lineHeight: 1,
              }}
            >
              {total}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", height: 8, width: 300 }}>
              <div style={{ flex: 1, background: USA }} />
              <div style={{ flex: 1, background: PAPER_1 }} />
              <div style={{ flex: 1, background: CANADA }} />
            </div>
            <span
              style={{
                marginTop: 10,
                fontFamily: "monospace",
                color: PAPER_3,
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              COUPE DU MONDE · CANADA · MEXIQUE · USA
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function NotFoundCard({ handle }: { handle: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: INK_1,
        color: PAPER_1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <span
        style={{
          fontFamily: "serif",
          fontStyle: "italic",
          fontSize: 80,
          color: PAPER_1,
        }}
      >
        @{handle}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          color: PAPER_3,
          fontSize: 22,
          letterSpacing: 3,
          marginTop: 18,
        }}
      >
        PROFIL INTROUVABLE · PICK&rsquo;EM WC26
      </span>
    </div>
  );
}
