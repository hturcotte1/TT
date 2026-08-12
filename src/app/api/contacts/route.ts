import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CONTACT_STATUSES } from "@/lib/constants";
import { createContact } from "@/lib/data";
import type { ContactStatus } from "@/lib/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface CreateContactBody {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  status?: unknown;
  nextTouchDate?: unknown;
  notes?: unknown;
}

/** Coerce an optional string field: trimmed string, or null when empty/absent. */
function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateContactBody;
  try {
    body = (await request.json()) as CreateContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const status = body.status ?? "lead";
  if (
    typeof status !== "string" ||
    !(CONTACT_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      { error: `Status must be one of: ${CONTACT_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const nextTouchDate = optionalString(body.nextTouchDate);
  if (nextTouchDate !== null && !DATE_RE.test(nextTouchDate)) {
    return NextResponse.json(
      { error: "Next touch date must be yyyy-mm-dd" },
      { status: 400 }
    );
  }

  try {
    const contact = await createContact({
      name,
      company: optionalString(body.company),
      email: optionalString(body.email),
      status: status as ContactStatus,
      nextTouchDate,
      notes: optionalString(body.notes),
      userId: user.id,
    });
    return NextResponse.json(contact);
  } catch {
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
