"use client";

import { signIn } from "next-auth/react";
import { XIcon } from "@/components/ui/icons";

export function SignInButton({
  size = "lg",
  children = "Continuer avec X",
}: {
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`btn btn-primary btn-${size}`}
      onClick={() => signIn("twitter")}
    >
      <XIcon />
      {children}
    </button>
  );
}
