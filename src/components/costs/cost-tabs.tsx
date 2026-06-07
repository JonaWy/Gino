"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/costs";
import type { MonthCostSummary, CategoryStats } from "@/lib/costs";

const chartConfig = {
  tierarzt: { label: "Tierarzt", color: "hsl(var(--chart-1))" },
  schmied: { label: "Schmied", color: "hsl(var(--chart-2))" },
  turnier: { label: "Turnier", color: "hsl(var(--chart-3))" },
};

export function CostTabs({
  summaries,
  stats,
  yearSpent,
  yearPlanned,
}: {
  summaries: MonthCostSummary[];
  stats: CategoryStats[];
  yearSpent: number;
  yearPlanned: number;
}) {
  const forecast = summaries.filter((s) => s.isFuture && s.total > 0);
  const history = summaries.filter((s) => !s.isFuture && s.total > 0);

  return (
    <Tabs defaultValue="prognose">
      <TabsList className="w-full overflow-x-auto">
        <TabsTrigger value="prognose" className="min-w-[5.5rem]">
          Prognose
        </TabsTrigger>
        <TabsTrigger value="historie" className="min-w-[5.5rem]">
          Historie
        </TabsTrigger>
        <TabsTrigger value="durchschnitte" className="min-w-[6.5rem]">
          Durchschnitte
        </TabsTrigger>
      </TabsList>

      <TabsContent value="prognose" className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jahresübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} bisher:{" "}
              <strong>{formatCurrency(yearSpent)}</strong> ausgegeben,{" "}
              <strong>{formatCurrency(yearPlanned)}</strong> geplant
            </p>
          </CardContent>
        </Card>
        {forecast.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-56 w-full sm:h-72">
            <BarChart data={forecast} margin={{ left: -8, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `${v}€`} width={40} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="tierarzt" stackId="a" fill="var(--color-tierarzt)" />
              <Bar dataKey="schmied" stackId="a" fill="var(--color-schmied)" />
              <Bar dataKey="turnier" stackId="a" fill="var(--color-turnier)" />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keine geplanten Kosten in der Zukunft.
          </p>
        )}
      </TabsContent>

      <TabsContent value="historie" className="flex flex-col gap-4">
        {history.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-56 w-full sm:h-72">
            <BarChart data={history} margin={{ left: -8, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `${v}€`} width={40} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="tierarzt" stackId="a" fill="var(--color-tierarzt)" />
              <Bar dataKey="schmied" stackId="a" fill="var(--color-schmied)" />
              <Bar dataKey="turnier" stackId="a" fill="var(--color-turnier)" />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            Noch keine Ausgaben-Historie vorhanden.
          </p>
        )}
      </TabsContent>

      <TabsContent value="durchschnitte">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.category}>
              <CardHeader>
                <CardTitle className="text-base">
                  {EXPENSE_CATEGORY_LABELS[s.category]}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p>
                  Ø{" "}
                  <strong>
                    {s.count > 0 ? formatCurrency(s.average) : "–"}
                  </strong>
                  /Besuch
                </p>
                <p className="text-muted-foreground">
                  {s.count} Einträge · Min {formatCurrency(s.min)} · Max{" "}
                  {formatCurrency(s.max)}
                </p>
                <p className="text-muted-foreground">
                  Gesamt: {formatCurrency(s.total)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
