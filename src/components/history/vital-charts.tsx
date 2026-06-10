"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import type { VitalRecord } from "@/types/database";

const chartConfig = {
  weight_kg: { label: "Gewicht (kg)", color: "var(--chart-1)" },
  height_cm: { label: "Stockmaß (cm)", color: "var(--chart-2)" },
};

export function VitalCharts({ records }: { records: VitalRecord[] }) {
  const data = [...records]
    .sort(
      (a, b) =>
        parseISO(a.recorded_at).getTime() - parseISO(b.recorded_at).getTime()
    )
    .map((r) => ({
      date: format(parseISO(r.recorded_at), "dd.MM.yy"),
      weight_kg: r.weight_kg ? Number(r.weight_kg) : null,
      height_cm: r.height_cm ? Number(r.height_cm) : null,
    }));

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Vitalwerte erfasst.
      </p>
    );
  }

  const charts = [
    { key: "weight_kg" as const, title: "Gewicht" },
    { key: "height_cm" as const, title: "Stockmaß" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {charts.map((chart) => {
        const hasData = data.some((d) => d[chart.key] !== null);
        if (!hasData) return null;
        return (
          <div key={chart.key} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{chart.title}</h3>
            <ChartContainer config={chartConfig} className="h-44 w-full sm:h-48">
              <LineChart data={data} margin={{ left: -8, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey={chart.key}
                  stroke={`var(--color-${chart.key})`}
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: `var(--color-${chart.key})`,
                    stroke: `var(--color-${chart.key})`,
                  }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ChartContainer>
          </div>
        );
      })}
    </div>
  );
}
