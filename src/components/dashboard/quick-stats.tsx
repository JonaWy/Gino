import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/costs";
import { Scale, Ruler, Trophy, TrendingUp, Euro } from "lucide-react";

interface QuickStatsProps {
  weight: number | null;
  height: number | null;
  tournamentEarnings: number;
  estimatedValue: number | null;
  monthForecast: number;
}

export function QuickStats({
  weight,
  height,
  tournamentEarnings,
  estimatedValue,
  monthForecast,
}: QuickStatsProps) {
  const stats = [
    {
      label: "Gewicht",
      value: weight ? `${weight} kg` : "–",
      icon: Scale,
    },
    {
      label: "Stockmaß",
      value: height ? `${height} cm` : "–",
      icon: Ruler,
    },
    {
      label: "Turniergewinne",
      value: formatCurrency(tournamentEarnings),
      icon: Trophy,
    },
    {
      label: "Geschätzter Wert",
      value: estimatedValue ? formatCurrency(estimatedValue) : "–",
      icon: TrendingUp,
    },
    {
      label: "Kosten (Monat)",
      value: formatCurrency(monthForecast),
      icon: Euro,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
