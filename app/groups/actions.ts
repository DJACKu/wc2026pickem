"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db, friendGroupMembers, friendGroups } from "@/db";
import { generateInviteCode, getFriendGroupByCode } from "@/lib/friend-groups";

const createSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export async function createFriendGroup(formData: FormData) {
  const user = await requireUser();
  const { name } = createSchema.parse({ name: formData.get("name") });

  // Try a few times in the unlikely case of code collision.
  let id: string | null = null;
  for (let attempt = 0; attempt < 5 && !id; attempt++) {
    const code = generateInviteCode();
    try {
      const [row] = await db
        .insert(friendGroups)
        .values({
          name,
          inviteCode: code,
          ownerId: user.id,
        })
        .returning({ id: friendGroups.id });
      id = row?.id ?? null;
    } catch (e: unknown) {
      // unique violation on invite_code → retry
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code?: string }).code === "23505"
      ) {
        continue;
      }
      throw e;
    }
  }
  if (!id) throw new Error("Impossible de générer un code d'invitation.");

  await db.insert(friendGroupMembers).values({
    groupId: id,
    userId: user.id,
  });

  revalidatePath("/groups");
  redirect(`/groups/${id}`);
}

const joinSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((s) => s.toUpperCase()),
});

export async function joinByCode(formData: FormData) {
  const user = await requireUser();
  const { code } = joinSchema.parse({ code: formData.get("code") });

  const group = await getFriendGroupByCode(code);
  if (!group) {
    throw new Error(`Aucun groupe trouvé pour le code « ${code} ».`);
  }
  await db
    .insert(friendGroupMembers)
    .values({ groupId: group.id, userId: user.id })
    .onConflictDoNothing();

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

const renameSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().trim().min(2).max(60),
});

export async function renameFriendGroup(input: z.infer<typeof renameSchema>) {
  const user = await requireUser();
  const { groupId, name } = renameSchema.parse(input);
  const [g] = await db
    .select()
    .from(friendGroups)
    .where(eq(friendGroups.id, groupId))
    .limit(1);
  if (!g) throw new Error("Groupe introuvable.");
  if (g.ownerId !== user.id)
    throw new Error("Seul le propriétaire peut renommer.");
  await db.update(friendGroups).set({ name }).where(eq(friendGroups.id, groupId));
  revalidatePath(`/groups/${groupId}`);
  return { ok: true as const };
}

const leaveSchema = z.object({ groupId: z.string().uuid() });

const deleteSchema = z.object({ groupId: z.string().uuid() });

export async function deleteFriendGroup(input: z.infer<typeof deleteSchema>) {
  const user = await requireUser();
  const { groupId } = deleteSchema.parse(input);
  const [g] = await db
    .select()
    .from(friendGroups)
    .where(eq(friendGroups.id, groupId))
    .limit(1);
  if (!g) throw new Error("Groupe introuvable.");
  if (g.ownerId !== user.id) {
    throw new Error("Seul le propriétaire peut supprimer le groupe.");
  }
  // friend_group_members cascade via FK ON DELETE CASCADE
  await db.delete(friendGroups).where(eq(friendGroups.id, groupId));
  revalidatePath("/groups");
  redirect("/groups");
}

export async function leaveFriendGroup(input: z.infer<typeof leaveSchema>) {
  const user = await requireUser();
  const { groupId } = leaveSchema.parse(input);

  const [g] = await db
    .select()
    .from(friendGroups)
    .where(eq(friendGroups.id, groupId))
    .limit(1);
  if (!g) throw new Error("Groupe introuvable.");
  if (g.ownerId === user.id) {
    throw new Error(
      "Tu es le propriétaire — supprime le groupe au lieu de le quitter.",
    );
  }

  await db
    .delete(friendGroupMembers)
    .where(
      and(
        eq(friendGroupMembers.groupId, groupId),
        eq(friendGroupMembers.userId, user.id),
      ),
    );

  revalidatePath("/groups");
  redirect("/groups");
}
