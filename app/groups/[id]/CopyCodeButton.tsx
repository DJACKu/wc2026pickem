"use client";

import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${baseUrl}/g/${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-primary btn-sm"
    >
      {copied ? "Copié ✓" : "Copier"}
    </button>
  );
}
