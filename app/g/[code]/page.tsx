import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, friendGroupMembers } from "@/db";
import { getFriendGroupByCode } from "@/lib/friend-groups";

export const dynamic = "force-dynamic";

export default async function InviteLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/g/${code}`)}`);
  }

  const group = await getFriendGroupByCode(code);
  if (!group) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-16 pb-16 text-center">
        <h1 className="font-display text-[56px] leading-none">Code invalide.</h1>
        <p className="mt-4 text-[color:var(--paper-2)]">
          Le code <code className="font-mono text-[color:var(--gold)]">{code}</code>{" "}
          ne correspond à aucun groupe.
        </p>
        <a href="/groups" className="mt-6 inline-block btn btn-primary btn-md">
          ← Voir mes groupes
        </a>
      </div>
    );
  }

  await db
    .insert(friendGroupMembers)
    .values({ groupId: group.id, userId: session.user!.id })
    .onConflictDoNothing();

  redirect(`/groups/${group.id}`);
}
