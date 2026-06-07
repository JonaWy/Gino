import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/costs";
import type { MonthCostSummary } from "@/lib/costs";

export function MonthCostSummaryCard({
  summary,
}: {
  summary: MonthCostSummary;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{summary.monthLabel}</CardTitle>
        <Badge variant={summary.isFuture ? "secondary" : "outline"}>
          {summary.isFuture ? "Prognose" : "Ist"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-2xl font-semibold">
          {formatCurrency(summary.total)}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>
            {EXPENSE_CATEGORY_LABELS.tierarzt}:{" "}
            {formatCurrency(summary.tierarzt)}
          </span>
          <span>
            {EXPENSE_CATEGORY_LABELS.schmied}:{" "}
            {formatCurrency(summary.schmied)}
          </span>
          <span>
            {EXPENSE_CATEGORY_LABELS.turnier}:{" "}
            {formatCurrency(summary.turnier)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
