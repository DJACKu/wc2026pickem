"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { XIcon } from "@/components/ui/icons";

export function AuthButton({
  user,
}: {
  user: { handle: string; name: string; avatarUrl: string | null } | null;
}) {
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button
        type="button"
        className="btn btn-x btn-sm"
        onClick={() => signIn("twitter")}
      >
        <XIcon />
        <span>Continuer</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2.5 pr-3 pl-1 h-9 rounded-full"
        style={{ border: "1px solid var(--line)" }}
      >
        <Avatar src={user.avatarUrl} name={user.name} size={28} />
        <span className="text-[13px]" style={{ color: "var(--paper-2)" }}>
          @{user.handle}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-md py-1 z-50"
          style={{
            background: "var(--ink-2)",
            border: "1px solid var(--line-strong)",
            boxShadow: "0 12px 40px -16px rgba(0,0,0,0.6)",
          }}
          onMouseLeave={() => setOpen(false)}
        >
          <a
            href={`/u/${user.handle}`}
            className="block px-3.5 py-2 text-[13px] hover:bg-[color:var(--ink-3)]"
            style={{ color: "var(--paper-1)" }}
          >
            Mon profil
          </a>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-[color:var(--ink-3)]"
            style={{ color: "var(--canada)" }}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
