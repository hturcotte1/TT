import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { getContact } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { RelativeTime } from "@/components/relative-time";
import { StatusChip } from "@/components/status-chip";
import { ContactStatusSelect } from "../contact-status-select";
import { LogTouchForm } from "../log-touch-form";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const result = await getContact(id);
  if (!result) notFound();
  const { contact, touches } = result;

  const today = format(new Date(), "yyyy-MM-dd");
  const late =
    contact.next_touch_date !== null && contact.next_touch_date < today;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={contact.name}
        description={contact.company ?? undefined}
      />

      <div className="rounded-lg border border-border bg-card p-6">
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd>{contact.email ?? "—"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">Next touch date</dt>
            <dd
              className={cn(
                "whitespace-nowrap",
                late && "text-red-600 font-medium"
              )}
            >
              {contact.next_touch_date ?? "—"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="flex items-center gap-3">
              <StatusChip status={contact.status} />
              <ContactStatusSelect
                contactId={contact.id}
                status={contact.status}
              />
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">Notes</dt>
            <dd className="whitespace-pre-wrap">{contact.notes ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold">Touch log</h2>
          </div>
          {touches.length === 0 ? (
            <p className="px-6 py-8 text-center text-xs text-muted-foreground">
              No touches logged yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {touches.map((touch) => (
                <li key={touch.id} className="space-y-1 px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {touch.userName ?? "Unknown"}
                    </span>
                    <RelativeTime iso={touch.occurred_at} />
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{touch.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-fit rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Log a touch</h2>
          <LogTouchForm contactId={contact.id} />
        </div>
      </div>
    </div>
  );
}
