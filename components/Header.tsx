import Link from "next/link";
import { auth } from "@/auth";
import { Wordmark } from "@/components/ui/Wordmark";
import { CountdownPill } from "./CountdownPill";
import { AuthButton } from "./AuthButton";
import { HeaderNav } from "./HeaderNav";

type NextPhase = {
  id: string;
  labelFr: string;
  locksAt: string;
};

export async function Header({ nextPhase }: { nextPhase: NextPhase | null }) {
  const session = await auth();
  const user = session?.user;

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "color-mix(in srgb, var(--ink-1) 80%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center gap-6 px-6 lg:px-10 h-16">
        <Link href="/" className="flex items-center">
          <Wordmark size={16} />
        </Link>

        <HeaderNav isAdmin={user?.isAdmin ?? false} />

        <div className="ml-auto flex items-center gap-3">
          {nextPhase && (
            <CountdownPill labelFr={nextPhase.labelFr} locksAt={nextPhase.locksAt} />
          )}
          <AuthButton
            user={
              user
                ? {
                    handle: user.handle ?? "",
                    name: user.name ?? user.handle ?? "",
                    avatarUrl: user.image ?? null,
                  }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}
