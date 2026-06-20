"use client";

import { useTransition, useState } from "react";

export function SyncButton({
  action,
  label,
  loadingLabel,
  successLabel,
}: {
  action: () => Promise<void>;
  label: string;
  loadingLabel: string;
  successLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  return (
    <button
      className="btn btn-primary btn-md"
      type="button"
      onClick={() => {
        setSuccess(false);
        startTransition(async () => {
          await action();
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        });
      }}
      disabled={isPending}
    >
      {isPending ? loadingLabel : success ? successLabel : label}
    </button>
  );
}
