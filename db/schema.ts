import {
  pgTable,
  pgEnum,
  uuid,
  text,
  char,
  boolean,
  timestamp,
  integer,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const phaseStatusEnum = pgEnum("phase_status", [
  "upcoming",
  "open",
  "locked",
  "scored",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    xId: text("x_id").notNull().unique(),
    handle: text("handle").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("users_handle_idx").on(t.handle)],
);

export const teams = pgTable("teams", {
  id: text("id").primaryKey(), // 'FRA', 'BRA', etc.
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  groupLetter: char("group_letter", { length: 1 }).notNull(),
  flagEmoji: text("flag_emoji"),
});

export const phases = pgTable("phases", {
  id: text("id").primaryKey(), // 'groups','r32','r16','qf','sf','final'
  labelFr: text("label_fr").notNull(),
  opensAt: timestamp("opens_at", { withTimezone: true }).notNull(),
  locksAt: timestamp("locks_at", { withTimezone: true }).notNull(),
  status: phaseStatusEnum("status").notNull().default("upcoming"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey(),
    phaseId: text("phase_id")
      .notNull()
      .references(() => phases.id),
    homeTeamId: text("home_team_id").references(() => teams.id),
    awayTeamId: text("away_team_id").references(() => teams.id),
    kickoffAt: timestamp("kickoff_at", { withTimezone: true }),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    winnerId: text("winner_id").references(() => teams.id),
    status: matchStatusEnum("status").notNull().default("scheduled"),
    manualOverride: boolean("manual_override").notNull().default(false),
  },
  (t) => [index("matches_phase_idx").on(t.phaseId)],
);

export const groupPicks = pgTable(
  "group_picks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupLetter: char("group_letter", { length: 1 }).notNull(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    predictedPos: integer("predicted_pos").notNull(), // 1..4
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.groupLetter, t.predictedPos] }),
    index("group_picks_user_idx").on(t.userId),
  ],
);

export const thirdPlacePicks = pgTable(
  "third_place_picks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.teamId] })],
);

export const matchPicks = pgTable(
  "match_picks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id),
    predictedWinnerId: text("predicted_winner_id")
      .notNull()
      .references(() => teams.id),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.matchId] }),
    index("match_picks_match_idx").on(t.matchId),
  ],
);

export const pickLocks = pgTable(
  "pick_locks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    phaseId: text("phase_id")
      .notNull()
      .references(() => phases.id),
    lockedAt: timestamp("locked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.phaseId] })],
);

export const scores = pgTable(
  "scores",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    phaseId: text("phase_id")
      .notNull()
      .references(() => phases.id),
    points: integer("points").notNull().default(0),
    details: jsonb("details"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.phaseId] }),
    index("scores_phase_points_idx").on(t.phaseId, t.points),
  ],
);

export const friendGroups = pgTable("friend_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const friendGroupMembers = pgTable(
  "friend_group_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => friendGroups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.userId] }),
    index("friend_group_members_user_idx").on(t.userId),
  ],
);

export const resultsGroupStandings = pgTable(
  "results_group_standings",
  {
    groupLetter: char("group_letter", { length: 1 }).notNull(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    finalPos: integer("final_pos").notNull(),
    isBestThird: boolean("is_best_third").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.groupLetter, t.finalPos] })],
);

// Types
export type User = typeof users.$inferSelect;
export type Phase = typeof phases.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Match = typeof matches.$inferSelect;
