import Link from "next/link";
import { Calendar, Trophy, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    { href: "/kalender", label: "Termin hinzufügen", icon: Calendar },
    { href: "/turniere", label: "Turnier eintragen", icon: Trophy },
    { href: "/vitalwerte", label: "Vitalwert erfassen", icon: Activity },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            render={<Link href={action.href} />}
            variant="outline"
            size="sm"
          >
            <action.icon />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
