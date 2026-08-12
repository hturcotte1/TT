"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LogTouchForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [nextTouchDate, setNextTouchDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/touches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          note: note.trim(),
          nextTouchDate: nextTouchDate || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to log touch");
      }
      setNote("");
      setNextTouchDate("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log touch");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="touch-note">Note</Label>
        <Textarea
          id="touch-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened?"
          rows={3}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="touch-next-date">Next touch date</Label>
        <Input
          id="touch-next-date"
          type="date"
          value={nextTouchDate}
          onChange={(e) => setNextTouchDate(e.target.value)}
          className="w-fit"
        />
        <p className="text-xs text-muted-foreground">
          Optional — moves the contact&apos;s next touch date forward.
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={saving || !note.trim()}>
        {saving ? "Logging…" : "Log touch"}
      </Button>
    </form>
  );
}
