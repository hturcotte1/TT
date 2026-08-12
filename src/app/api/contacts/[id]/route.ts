import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CONTACT_STATUSES } from "@/lib/constants";
import { updateContactStatus } from "@/lib/data";
import type { ContactStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  if (
    typeof status !== "string" ||
    !(CONTACT_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      { error: `Status must be one of: ${CONTACT_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const contact = await updateContactStatus({
      contactId: id,
      status: status as ContactStatus,
      userId: user.id,
    });
    return NextResponse.json(contact);
  } catch {
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}
