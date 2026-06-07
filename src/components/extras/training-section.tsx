"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import {
  createTrainingLog,
  deleteTrainingLog,
} from "@/app/actions/extras";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TrainingLog } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

export function TrainingSection({
  horseId,
  logs,
}: {
  horseId: string;
  logs: TrainingLog[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    startTransition(async () => {
      const result = await createTrainingLog(formData);
      if (!result?.error) setOpen(false);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button size="sm" className="self-start">
              <Plus />
              Training eintragen
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trainingseinheit</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration_minutes">Dauer (Minuten)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="focus">Fokus</Label>
              <Input
                id="focus"
                name="focus"
                placeholder="Technik, Ausritt, Bodenarbeit…"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="intensity">Intensität</Label>
              <Input
                id="intensity"
                name="intensity"
                placeholder="leicht, mittel, intensiv"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rider_name">Reiter</Label>
              <Input id="rider_name" name="rider_name" />
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

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Trainings.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Dauer</TableHead>
                <TableHead>Fokus</TableHead>
                <TableHead>Intensität</TableHead>
                <TableHead>Reiter</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    {format(parseISO(l.date), "dd.MM.yyyy", { locale: de })}
                  </TableCell>
                  <TableCell>
                    {l.duration_minutes ? `${l.duration_minutes} min` : "–"}
                  </TableCell>
                  <TableCell>{l.focus ?? "–"}</TableCell>
                  <TableCell>{l.intensity ?? "–"}</TableCell>
                  <TableCell>{l.rider_name ?? "–"}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteTrainingLog(l.id);
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
