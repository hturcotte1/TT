import { NextResponse } from "next/server";
import { insertLlmEvent, type IngestEventInput } from "@/lib/data";

/**
 * Machine ingest endpoint for llm_events. Deliberately NOT behind
 * requireUser: callers authenticate with "Authorization: Bearer <INGEST_TOKEN>".
 */

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const token = process.env.INGEST_TOKEN;
  const header = request.headers.get("authorization");
  if (!token || header !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return bad("Invalid JSON body");
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return bad("Body must be a JSON object");
  }
  const body = raw as Record<string, unknown>;

  // Required fields.
  const source = typeof body.source === "string" ? body.source.trim() : "";
  if (!source) {
    return bad("source is required and must be a non-empty string");
  }
  const model = typeof body.model === "string" ? body.model.trim() : "";
  if (!model) {
    return bad("model is required and must be a non-empty string");
  }

  // Optional fields; unknown extra fields are ignored (only the keys below
  // are copied into the insert input).
  const input: IngestEventInput = { source, model };

  if (body.tokens_in !== undefined) {
    if (
      typeof body.tokens_in !== "number" ||
      !Number.isInteger(body.tokens_in) ||
      body.tokens_in < 0
    ) {
      return bad("tokens_in must be a non-negative integer");
    }
    input.tokens_in = body.tokens_in;
  }

  if (body.tokens_out !== undefined) {
    if (
      typeof body.tokens_out !== "number" ||
      !Number.isInteger(body.tokens_out) ||
      body.tokens_out < 0
    ) {
      return bad("tokens_out must be a non-negative integer");
    }
    input.tokens_out = body.tokens_out;
  }

  if (body.cost_usd !== undefined) {
    if (
      typeof body.cost_usd !== "number" ||
      !Number.isFinite(body.cost_usd) ||
      body.cost_usd < 0
    ) {
      return bad("cost_usd must be a finite number >= 0");
    }
    input.cost_usd = body.cost_usd;
  }

  if (body.latency_ms !== undefined) {
    if (body.latency_ms === null) {
      input.latency_ms = null;
    } else if (
      typeof body.latency_ms !== "number" ||
      !Number.isInteger(body.latency_ms) ||
      body.latency_ms < 0
    ) {
      return bad("latency_ms must be a non-negative integer or null");
    } else {
      input.latency_ms = body.latency_ms;
    }
  }

  if (body.status !== undefined) {
    if (body.status !== "ok" && body.status !== "error") {
      return bad('status must be "ok" or "error"');
    }
    input.status = body.status;
  }

  if (body.occurred_at !== undefined) {
    if (
      typeof body.occurred_at !== "string" ||
      Number.isNaN(new Date(body.occurred_at).getTime())
    ) {
      return bad("occurred_at must be a valid ISO date string");
    }
    input.occurred_at = body.occurred_at;
  }

  if (body.input_ref !== undefined) {
    if (body.input_ref !== null && typeof body.input_ref !== "string") {
      return bad("input_ref must be a string or null");
    }
    input.input_ref = body.input_ref;
  }

  if (body.output_ref !== undefined) {
    if (body.output_ref !== null && typeof body.output_ref !== "string") {
      return bad("output_ref must be a string or null");
    }
    input.output_ref = body.output_ref;
  }

  try {
    const event = await insertLlmEvent(input);
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to insert event" },
      { status: 500 }
    );
  }
}
