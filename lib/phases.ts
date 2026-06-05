import { db } from "@/db";
import { phases } from "@/db/schema";
import { asc, gt } from "drizzle-orm";

export async function getAllPhases() {
  return db.select().from(phases).orderBy(asc(phases.sortOrder));
}

export async function getNextDeadline() {
  const now = new Date();
  const [next] = await db
    .select()
    .from(phases)
    .where(gt(phases.locksAt, now))
    .orderBy(asc(phases.locksAt))
    .limit(1);
  return next ?? null;
}
