"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RelativeTime } from "@/components/relative-time";
import { StatusChip } from "@/components/status-chip";
import { formatTokens, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DailyCost, LlmEvent, SpendEvent } from "@/lib/types";

const BAR_FILL = "#2563EB";
const BAR_FILL_DIMMED = "#bfdbfe";

type ChipFilter =
  | { kind: "all" }
  | { kind: "error" }
  | { kind: "source"; source: string };

/** "2026-08-05" → "Aug 5" (parseISO keeps date-only strings in local time). */
function shortDay(isoDay: string): string {
  return format(parseISO(isoDay), "MMM d");
}

/** Compact USD for axis ticks: "$12", "$0.40", "$1.2k". */
function compactUsd(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  if (Number.isInteger(value)) return `$${value}`;
  if (value >= 10) return `$${Math.round(value)}`;
  return `$${value.toFixed(2)}`;
}

function CostTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">
        {typeof label === "string" ? shortDay(label) : label}
      </p>
      <p className="text-sm font-medium tabular-nums">
        {typeof value === "number" ? formatUsd(value) : "—"}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-xs text-muted-foreground pt-0.5">{label}</dt>
      <dd className="text-sm break-all">{children}</dd>
    </>
  );
}

const EM_DASH = "—";

export function SpendView({
  daily,
  events,
  sources,
}: {
  daily: DailyCost[];
  events: SpendEvent[];
  sources: string[];
}) {
  const [chip, setChip] = useState<ChipFilter>({ kind: "all" });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<LlmEvent | null>(null);

  // ask-helios always leads the source chips; other distinct sources follow.
  const sourceChips = useMemo(
    () => ["ask-helios", ...sources.filter((s) => s !== "ask-helios")],
    [sources]
  );

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (selectedDay && e.day !== selectedDay) return false;
        if (chip.kind === "error") return e.status === "error";
        if (chip.kind === "source") return e.source === chip.source;
        return true;
      }),
    [events, chip, selectedDay]
  );

  function toggleDay(date: string | undefined) {
    if (!date) return;
    setSelectedDay((current) => (current === date ? null : date));
  }

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm cursor-pointer transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border bg-card hover:bg-muted/50"
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Daily cost</p>
            <p className="text-xs text-muted-foreground">
              Last 14 days · click a bar to filter
            </p>
          </div>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={daily}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDay}
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="#737373"
                />
                <YAxis
                  tickFormatter={compactUsd}
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="#737373"
                  width={44}
                />
                <Tooltip
                  content={CostTooltip}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar
                  dataKey="cost"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={36}
                  isAnimationActive={false}
                  className="cursor-pointer"
                  onClick={(_, index) => toggleDay(daily[index]?.date)}
                >
                  {daily.map((d) => (
                    <Cell
                      key={d.date}
                      fill={
                        selectedDay && d.date !== selectedDay
                          ? BAR_FILL_DIMMED
                          : BAR_FILL
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={chipClass(chip.kind === "all")}
          onClick={() => setChip({ kind: "all" })}
        >
          All
        </button>
        {sourceChips.map((source) => (
          <button
            key={source}
            type="button"
            className={chipClass(
              chip.kind === "source" && chip.source === source
            )}
            onClick={() => setChip({ kind: "source", source })}
          >
            {source}
          </button>
        ))}
        <button
          type="button"
          className={chipClass(chip.kind === "error")}
          onClick={() => setChip({ kind: "error" })}
        >
          Error
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
          {selectedDay ? ` · ${shortDay(selectedDay)}` : ""}
          {events.length === 200 ? " · newest 200 shown" : ""}
        </p>
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No events match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedEvent(e)}
                  >
                    <TableCell>
                      <RelativeTime iso={e.occurred_at} />
                    </TableCell>
                    <TableCell>{e.source}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.model}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatTokens(e.tokens_in)} → {formatTokens(e.tokens_out)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatUsd(e.cost_usd)}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={e.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selectedEvent ? (
            <>
              <DialogHeader>
                <DialogTitle>Event details</DialogTitle>
              </DialogHeader>
              <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2">
                <DetailRow label="id">
                  <span className="font-mono text-xs">{selectedEvent.id}</span>
                </DetailRow>
                <DetailRow label="occurred_at">
                  {format(
                    new Date(selectedEvent.occurred_at),
                    "MMM d, yyyy HH:mm:ss"
                  )}{" "}
                  <RelativeTime iso={selectedEvent.occurred_at} />
                </DetailRow>
                <DetailRow label="source">{selectedEvent.source}</DetailRow>
                <DetailRow label="model">{selectedEvent.model}</DetailRow>
                <DetailRow label="tokens_in">
                  <span className="tabular-nums">
                    {selectedEvent.tokens_in.toLocaleString("en-US")}
                  </span>
                </DetailRow>
                <DetailRow label="tokens_out">
                  <span className="tabular-nums">
                    {selectedEvent.tokens_out.toLocaleString("en-US")}
                  </span>
                </DetailRow>
                <DetailRow label="cost_usd">
                  <span className="tabular-nums">
                    {formatUsd(selectedEvent.cost_usd)}
                  </span>
                </DetailRow>
                <DetailRow label="latency_ms">
                  {selectedEvent.latency_ms !== null ? (
                    <span className="tabular-nums">
                      {selectedEvent.latency_ms.toLocaleString("en-US")} ms
                    </span>
                  ) : (
                    EM_DASH
                  )}
                </DetailRow>
                <DetailRow label="status">
                  <StatusChip status={selectedEvent.status} />
                </DetailRow>
                <DetailRow label="input_ref">
                  {selectedEvent.input_ref ?? EM_DASH}
                </DetailRow>
                <DetailRow label="output_ref">
                  {selectedEvent.output_ref ?? EM_DASH}
                </DetailRow>
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
