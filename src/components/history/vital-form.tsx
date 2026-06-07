"use client";

import { useState, useTransition } from "react";
import { createVitalRecord } from "@/app/actions/vitals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function VitalForm({ horseId }: { horseId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    startTransition(async () => {
      const result = await createVitalRecord(formData);
      if (!result?.error) setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full sm:w-auto">
            <Plus />
            Vitalwert erfassen
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Vitalwert</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recorded_at">Datum</Label>
            <Input
              id="recorded_at"
              name="recorded_at"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="weight_kg">Gewicht (kg)</Label>
              <Input id="weight_kg" name="weight_kg" type="number" step="0.1" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="height_cm">Stockmaß (cm)</Label>
              <Input id="height_cm" name="height_cm" type="number" step="0.1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tournament_earnings_total">
                Turniergewinne gesamt (€)
              </Label>
              <Input
                id="tournament_earnings_total"
                name="tournament_earnings_total"
                type="number"
                step="0.01"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="estimated_value">Geschätzter Wert (€)</Label>
              <Input
                id="estimated_value"
                name="estimated_value"
                type="number"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <Button type="submit" disabled={pending}>
            Speichern
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
