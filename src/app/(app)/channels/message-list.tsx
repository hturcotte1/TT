"use client";

import { useEffect, useRef } from "react";
import { RelativeTime } from "@/components/relative-time";
import type { MessageItem } from "@/lib/types";

/** Message rows with auto-scroll to the bottom whenever a new message lands —
 *  unless the reader has scrolled up into history, which is left undisturbed. */
export function MessageList({ messages }: { messages: MessageItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const lastMessageId =
    messages.length > 0 ? messages[messages.length - 1].id : null;

  useEffect(() => {
    const el = containerRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [lastMessageId]);

  function onScroll() {
    const el = containerRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="min-h-0 flex-1 overflow-y-auto p-4"
    >
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No messages yet. Say hello.
        </p>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">
                  {message.authorName}
                </span>
                <RelativeTime iso={message.created_at} />
              </div>
              <p className="mt-0.5 text-sm whitespace-pre-wrap">
                {message.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
