"use client";

import { useState, useTransition } from "react";
import {
  updateHorse,
  uploadHorseImage,
} from "@/app/actions/horses";
import { updateCostDefault } from "@/app/actions/extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { horseBreedOptions } from "@/lib/horse-breeds";
import { EXPENSE_CATEGORY_LABELS, horseGenderOptions } from "@/lib/labels";
import type { Horse, CostDefault } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

export function SettingsForm({
  horse,
  email,
  costDefaults,
}: {
  horse: Horse;
  email: string;
  costDefaults: CostDefault[];
}) {
  const [pending, startTransition] = useTransition();
  const [breed, setBreed] = useState(horse.breed ?? "");
  const [gender, setGender] = useState(horse.gender ?? "");
  const breedOptions = horseBreedOptions(horse.breed);
  const genderOptions = horseGenderOptions(horse.gender);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pferdeprofil</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(fd) =>
              startTransition(async () => {
                await updateHorse(fd);
              })
            }
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="id" value={horse.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={horse.name}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="breed">Rasse</Label>
                <input type="hidden" name="breed" value={breed} />
                <Select
                  value={breed || undefined}
                  onValueChange={(v) => setBreed(v ?? "")}
                >
                  <SelectTrigger id="breed" className="w-full">
                    <SelectValue placeholder="Rasse wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {breedOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="birth_date">Geburtsdatum</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  defaultValue={horse.birth_date ?? ""}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gender">Geschlecht</Label>
                <input type="hidden" name="gender" value={gender} />
                <Select
                  value={gender || undefined}
                  onValueChange={(v) => setGender(v ?? "")}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Geschlecht wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {genderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="color">Farbe</Label>
                <Input
                  id="color"
                  name="color"
                  defaultValue={horse.color ?? ""}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="chip_number">Chip-Nummer</Label>
                <Input
                  id="chip_number"
                  name="chip_number"
                  defaultValue={horse.chip_number ?? ""}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="passport_number">Pferdepass-Nr.</Label>
              <Input
                id="passport_number"
                name="passport_number"
                defaultValue={horse.passport_number ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={horse.notes ?? ""}
              />
            </div>
            <Button type="submit" disabled={pending}>
              Profil speichern
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profilbild</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {horse.image_url && (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg">
              <Image
                src={horse.image_url}
                alt={horse.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <form
            action={(fd) =>
              startTransition(async () => {
                await uploadHorseImage(fd);
              })
            }
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="horse_id" value={horse.id} />
            <Input name="file" type="file" accept="image/*" />
            <Button type="submit" variant="outline" disabled={pending}>
              Bild hochladen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kosten-Standardwerte</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(["tierarzt", "schmied", "turnier"] as const).map((cat) => {
            const existing = costDefaults.find((d) => d.category === cat);
            return (
              <form
                key={cat}
                action={(fd) =>
                  startTransition(async () => {
                    await updateCostDefault(fd);
                  })
                }
                className="flex items-end gap-4"
              >
                <input type="hidden" name="horse_id" value={horse.id} />
                <input type="hidden" name="category" value={cat} />
                <div className="flex flex-1 flex-col gap-2">
                  <Label>{EXPENSE_CATEGORY_LABELS[cat]}</Label>
                  <Input
                    name="default_amount"
                    type="number"
                    step="0.01"
                    defaultValue={existing?.default_amount ?? ""}
                    required
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" disabled={pending}>
                  Speichern
                </Button>
              </form>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Reiter, Tierärzte, Schmiede, Trainer und Physiotherapeuten werden
            unter{" "}
            <Link href="/kontakte" className="text-primary underline-offset-4 hover:underline">
              Kontakte
            </Link>{" "}
            verwaltet und können in Turnieren, Training, Gesundheit und Kalender
            ausgewählt werden.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Angemeldet als {email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
