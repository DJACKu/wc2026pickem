"use client";

import { useState } from "react";
import { deleteFriendGroup } from "../actions";

export function DeleteButton({
  groupId,
  name,
}: {
  groupId: string;
  name: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        `Supprimer définitivement « ${name} » ? Tous les membres en sortent. Action irréversible.`,
      )
    )
      return;
    setPending(true);
    try {
      await deleteFriendGroup({ groupId });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="btn btn-ghost btn-sm"
      style={{ color: "var(--canada)", borderColor: "rgba(232, 17, 45, 0.3)" }}
    >
      {pending ? "…" : "Supprimer"}
    </button>
  );
}
