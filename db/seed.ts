import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "./index";
import { teams, phases } from "./schema";
import { seedTeams, seedPhases } from "./seed-data";

async function main() {
  console.log("Seeding teams…");
  for (const t of seedTeams) {
    await db
      .insert(teams)
      .values(t)
      .onConflictDoUpdate({
        target: teams.id,
        set: {
          nameFr: t.nameFr,
          nameEn: t.nameEn,
          groupLetter: t.groupLetter,
          flagEmoji: t.flagEmoji,
        },
      });
  }
  console.log(`  → ${seedTeams.length} équipes`);

  console.log("Seeding phases…");
  for (const p of seedPhases) {
    await db
      .insert(phases)
      .values(p)
      .onConflictDoUpdate({
        target: phases.id,
        set: {
          labelFr: p.labelFr,
          opensAt: p.opensAt,
          locksAt: p.locksAt,
          sortOrder: p.sortOrder,
        },
      });
  }
  console.log(`  → ${seedPhases.length} phases`);

  console.log("✓ Seed terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
