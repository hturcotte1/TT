import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addTouch } from "@/lib/data";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface CreateTouchBody {
  contactId?: unknown;
  note?: unknown;
  nextTouchDate?: unknown;
}

export async function POST(request: Request) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateTouchBody;
  try {
    body = (await request.json()) as CreateTouchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const contactId =
    typeof body.contactId === "string" ? body.contactId.trim() : "";
  if (!contactId) {
    return NextResponse.json(
      { error: "Contact id is required" },
      { status: 400 }
    );
  }

  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (!note) {
    return NextResponse.json({ error: "Note is required" }, { status: 400 });
  }

  let nextTouchDate: string | null = null;
  if (typeof body.nextTouchDate === "string" && body.nextTouchDate.trim()) {
    nextTouchDate = body.nextTouchDate.trim();
    if (!DATE_RE.test(nextTouchDate)) {
      return NextResponse.json(
        { error: "Next touch date must be yyyy-mm-dd" },
        { status: 400 }
      );
    }
  }

  try {
    const touch = await addTouch({
      contactId,
      note,
      nextTouchDate,
      userId: user.id,
    });
    return NextResponse.json(touch);
  } catch {
    return NextResponse.json({ error: "Failed to add touch" }, { status: 500 });
  }
}
