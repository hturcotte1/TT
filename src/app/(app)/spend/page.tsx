import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getSpendData } from "@/lib/data";
import { formatUsd } from "@/lib/format";
import { SpendView } from "./spend-view";

export const dynamic = "force-dynamic";

export default async function SpendPage() {
  await requireUser();
  const { summary, daily, events, sources } = await getSpendData();

  const totals = [
    { label: "Today", value: summary.costToday },
    { label: "Last 7 days", value: summary.cost7d },
    { label: "Total", value: summary.costTotal },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Spend" />

      <div className="grid gap-4 sm:grid-cols-3">
        {totals.map((t) => (
          <Card key={t.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatUsd(t.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SpendView daily={daily} events={events} sources={sources} />
    </div>
  );
}
