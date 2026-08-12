import Link from "next/link";
import { Hash } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getActivities, getChannelsWithMeta } from "@/lib/data";
import type { ActivityItem, ChannelListItem } from "@/lib/types";
import { AutoRefresh } from "@/components/auto-refresh";
import { ObjectIcon } from "@/components/object-icon";
import { PageHeader } from "@/components/page-header";
import { RelativeTime } from "@/components/relative-time";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireUser();
  const [channels, activities] = await Promise.all([
    getChannelsWithMeta(user.id),
    getActivities(50),
  ]);

  return (
    <div className="p-6 space-y-6">
      <AutoRefresh intervalMs={3000} />
      <PageHeader title="Home" description="What is happening across TT" />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-lg border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-medium">
            Channels
          </h2>
          {channels.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No channels yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {channels.map((channel) => (
                <ChannelRow key={channel.id} channel={channel} />
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2 rounded-lg border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-medium">
            Activity
          </h2>
          {activities.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No activity yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function ChannelRow({ channel }: { channel: ChannelListItem }) {
  return (
    <li>
      <Link
        href={`/channels/${channel.id}`}
        className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50"
      >
        <Hash className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{channel.name}</span>
            {channel.unreadCount > 0 ? (
              <span className="rounded-full bg-primary px-2 text-xs leading-5 text-primary-foreground">
                {channel.unreadCount}
              </span>
            ) : null}
          </div>
          {channel.latestMessage ? (
            <p className="truncate text-xs text-muted-foreground">
              {channel.latestMessage.authorName}: {channel.latestMessage.body}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No messages yet</p>
          )}
        </div>
        {channel.latestMessage ? (
          <RelativeTime iso={channel.latestMessage.created_at} />
        ) : null}
      </Link>
    </li>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <ObjectIcon objectType={activity.object_type} className="shrink-0" />
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium">{activity.userName ?? "System"}</span>{" "}
        <span className="text-muted-foreground">{activity.verb}</span>{" "}
        <span className="font-medium">{activity.object_label}</span>
      </p>
      <RelativeTime iso={activity.created_at} />
    </li>
  );
}
