import Link from "next/link";
import type { ChannelListItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NewChannelDialog } from "./new-channel-dialog";

/**
 * Left panel: all channels with unread badges. The active channel never
 * shows a badge — viewing it means reading it (the read marker is updated
 * by the page render).
 */
export function ChannelList({
  channels,
  activeId,
}: {
  channels: ChannelListItem[];
  activeId: string;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border pr-2 pl-4">
        <h2 className="text-sm font-semibold">Channels</h2>
        <NewChannelDialog />
      </div>
      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {channels.map((channel) => {
          const active = channel.id === activeId;
          return (
            <Link
              key={channel.id}
              href={`/channels/${channel.id}`}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                active && "bg-muted font-medium"
              )}
            >
              <span className="truncate">
                <span className="text-muted-foreground">#</span> {channel.name}
              </span>
              {channel.unreadCount > 0 && !active ? (
                <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none font-medium text-primary-foreground">
                  {channel.unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
