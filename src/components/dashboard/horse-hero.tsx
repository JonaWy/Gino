import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { computeHorseAge } from "@/lib/costs";
import type { Horse } from "@/types/database";

export function HorseHero({ horse }: { horse: Horse }) {
  const age = computeHorseAge(horse.birth_date);

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-0 sm:flex-row">
        <div className="relative h-48 w-full shrink-0 bg-muted sm:h-auto sm:w-48">
          {horse.image_url ? (
            <Image
              src={horse.image_url}
              alt={horse.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Avatar className="size-24">
                <AvatarFallback className="bg-primary/10 font-serif text-3xl text-primary">
                  {horse.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-6">
          <h2 className="font-serif text-3xl font-semibold tracking-wide">
            {horse.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {horse.breed && <Badge variant="secondary">{horse.breed}</Badge>}
            {age && <Badge variant="outline">{age}</Badge>}
            {horse.gender && <Badge variant="outline">{horse.gender}</Badge>}
            {horse.color && <Badge variant="outline">{horse.color}</Badge>}
          </div>
          {horse.notes && (
            <p className="text-sm text-muted-foreground">{horse.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
