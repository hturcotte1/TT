import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getChannelsWithMeta } from "@/lib/data";
import { AutoRefresh } from "@/components/auto-refresh";
import { PageHeader } from "@/components/page-header";
import { NewChannelDialog } from "./new-channel-dialog";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const user = await requireUser();
  const channels = await getChannelsWithMeta(user.id);
  if (channels.length > 0) {
    redirect(`/channels/${channels[0].id}`);
  }

  return (
    <div className="p-6 space-y-6">
      <AutoRefresh intervalMs={3000} />
      <PageHeader
        title="Channels"
        description="Messages between the two of you."
      />
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-16 text-center">
        <p className="text-sm font-medium">No channels yet</p>
        <p className="text-xs text-muted-foreground">
          Create the first channel to start the conversation.
        </p>
        <NewChannelDialog trigger="full" />
      </div>
    </div>
  );
}
