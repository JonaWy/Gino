"use client";

import { useState, useTransition } from "react";
import { createHorse } from "@/app/actions/horses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HORSE_BREEDS } from "@/lib/horse-breeds";

export function HorseSetup() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [breed, setBreed] = useState("");

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Dein Pferd</CardTitle>
          <CardDescription>
            Lege dein Pferd an, um Gino zu nutzen. Du kannst die Daten später
            jederzeit in den Einstellungen ändern.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={(formData) =>
              startTransition(async () => {
                setError(null);
                if (breed) formData.set("breed", breed);
                const result = await createHorse(formData);
                if (result?.error) setError(result.error);
              })
            }
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name des Pferdes</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue="Gino"
                placeholder="z. B. Gino"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="breed">Rasse (optional)</Label>
              <Select
                value={breed || undefined}
                onValueChange={(v) => setBreed(v ?? "")}
              >
                <SelectTrigger id="breed" className="w-full">
                  <SelectValue placeholder="Rasse wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {HORSE_BREEDS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Wird angelegt…" : "Pferd anlegen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
