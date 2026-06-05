"use client";

import { useState } from "react";
import { leaveFriendGroup } from "../actions";

export function LeaveButton({ groupId }: { groupId: string }) {
  const [pending, setPending] = useState(false);

  async function handleLeave() {
    if (
      !window.confirm("Quitter ce groupe ? Tu pourras toujours le rejoindre avec le code.")
    )
      return;
    setPending(true);
    try {
      await leaveFriendGroup({ groupId });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLeave}
      disabled={pending}
      className="btn btn-ghost btn-sm"
    >
      {pending ? "…" : "Quitter"}
    </button>
  );
}
