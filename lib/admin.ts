import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }
  if (!session.user.isAdmin) {
    throw new Error("Accès admin requis.");
  }
  return session.user;
}
