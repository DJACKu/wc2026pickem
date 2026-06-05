import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Accepts both numeric X ids (stable, preferred) and @handles (convenience),
// case-insensitive, leading "@" stripped.
const adminIdentifiers = new Set(
  (process.env.ADMIN_X_IDS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean),
);

function isAdminFor(xId: string, handle: string): boolean {
  return (
    adminIdentifiers.has(xId.toLowerCase()) ||
    adminIdentifiers.has(handle.toLowerCase())
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ profile }) {
      // Twitter OAuth 2.0 profile shape: { data: { id, username, name, profile_image_url } }
      const data = (profile as { data?: Record<string, unknown> })?.data ?? profile;
      const xId = String((data as Record<string, unknown>)?.id ?? "");
      if (!xId) return false;

      const username = String(
        (data as Record<string, unknown>)?.username ?? "",
      );
      const name = (data as Record<string, unknown>)?.name as string | undefined;
      const avatar = (data as Record<string, unknown>)?.profile_image_url as
        | string
        | undefined;

      const shouldBeAdmin = isAdminFor(xId, username);

      await db
        .insert(users)
        .values({
          xId,
          handle: username,
          displayName: name ?? null,
          avatarUrl: avatar ?? null,
          isAdmin: shouldBeAdmin,
        })
        .onConflictDoUpdate({
          target: users.xId,
          set: {
            handle: username,
            displayName: name ?? null,
            avatarUrl: avatar ?? null,
            ...(shouldBeAdmin ? { isAdmin: true } : {}),
          },
        });

      return true;
    },

    async jwt({ token, profile }) {
      // On the first sign-in, populate the token from the freshly-upserted user.
      if (profile) {
        const data = (profile as { data?: Record<string, unknown> })?.data ?? profile;
        const xId = String((data as Record<string, unknown>)?.id ?? "");
        if (xId) {
          const [u] = await db
            .select({ id: users.id, handle: users.handle, isAdmin: users.isAdmin })
            .from(users)
            .where(eq(users.xId, xId))
            .limit(1);
          if (u) {
            token.uid = u.id;
            token.handle = u.handle;
            token.isAdmin = u.isAdmin;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      if (typeof token.handle === "string") session.user.handle = token.handle;
      session.user.isAdmin = Boolean(token.isAdmin);
      return session;
    },
  },
});
