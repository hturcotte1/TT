import Link from "next/link";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { getContacts } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { RelativeTime } from "@/components/relative-time";
import { StatusChip } from "@/components/status-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewContactDialog } from "./new-contact-dialog";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  await requireUser();
  const contacts = await getContacts();
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Outreach"
        description="Contacts and follow-ups, overdue first."
      >
        <NewContactDialog />
      </PageHeader>
      <div className="rounded-lg border border-border bg-card">
        {contacts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium">No contacts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add the first contact to start tracking outreach.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last touch</TableHead>
                <TableHead>Next touch</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => {
                const late =
                  contact.next_touch_date !== null &&
                  contact.next_touch_date < today;
                return (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Link
                        href={`/outreach/${contact.id}`}
                        className="font-medium hover:underline"
                      >
                        {contact.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.company ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={contact.status} />
                    </TableCell>
                    <TableCell>
                      {contact.lastTouchAt ? (
                        <RelativeTime iso={contact.lastTouchAt} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.next_touch_date ? (
                        <span
                          className={cn(
                            "whitespace-nowrap",
                            late && "text-red-600 font-medium"
                          )}
                        >
                          {contact.next_touch_date}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-64">
                      <p className="truncate text-xs text-muted-foreground">
                        {contact.notes ?? ""}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
