"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DevLoginButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function loginAs(user: "henry" | "marco") {
    setBusy(true);
    const res = await fetch("/api/auth/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button disabled={busy} onClick={() => loginAs("henry")}>
        Continue as Henry
      </Button>
      <Button disabled={busy} onClick={() => loginAs("marco")}>
        Continue as Marco
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Development login (NEXT_PUBLIC_DEV_AUTH=true)
      </p>
    </div>
  );
}
