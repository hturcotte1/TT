import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getChannel,
  getChannelsWithMeta,
  getMessages,
  markChannelRead,
} from "@/lib/data";
import { AutoRefresh } from "@/components/auto-refresh";
import { ChannelList } from "../channel-list";
import { Composer } from "../composer";
import { MessageList } from "../message-list";

export const dynamic = "force-dynamic";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const channel = await getChannel(id);
  if (!channel) notFound();

  const messages = await getMessages(id);
  // Viewing means reading: update the read marker after loading the messages.
  // The 3s AutoRefresh re-runs this while the channel stays open (intended).
  await markChannelRead(id, user.id);
  // Fetched after the read marker so the sidebar unread counts are accurate.
  const channels = await getChannelsWithMeta(user.id);

  return (
    <div className="flex h-screen">
      <AutoRefresh intervalMs={3000} />
      <ChannelList channels={channels} activeId={channel.id} />
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center border-b border-border bg-card px-4">
          <h1 className="text-sm font-semibold">
            <span className="text-muted-foreground">#</span> {channel.name}
          </h1>
        </header>
        <MessageList messages={messages} />
        <Composer channelId={channel.id} />
      </section>
    </div>
  );
}
