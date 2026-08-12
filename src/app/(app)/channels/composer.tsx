"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Bottom composer. Enter sends, Shift+Enter inserts a newline. */
export function Composer({ channelId }: { channelId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, body: trimmed }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to send message");
      }
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="shrink-0 border-t border-border bg-card p-4">
      {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter during IME composition commits the conversion, not the
            // message (isComposing) — otherwise CJK input would send early.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Message… (Enter to send, Shift+Enter for a newline)"
          rows={2}
          className="min-h-9 flex-1 resize-none"
          aria-label="Message"
        />
        <Button type="submit" disabled={sending || body.trim().length === 0}>
          Send
        </Button>
      </form>
    </div>
  );
}
