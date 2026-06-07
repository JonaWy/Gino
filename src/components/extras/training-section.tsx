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
import { ContactSelect } from "@/components/contact-select";
import {
  MobileListCard,
  MobileListRow,
} from "@/components/ui/mobile-list-card";
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
import { contactNameById } from "@/lib/contacts";
import type { Contact, TrainingLog } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

export function TrainingSection({
  horseId,
  logs,
  contacts,
}: {
  horseId: string;
  logs: TrainingLog[];
  contacts: Contact[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [riderContactId, setRiderContactId] = useState("");
  const [trainerContactId, setTrainerContactId] = useState("");

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    if (riderContactId) formData.set("rider_contact_id", riderContactId);
    if (trainerContactId) formData.set("trainer_contact_id", trainerContactId);
    startTransition(async () => {
      const result = await createTrainingLog(formData);
      if (!result?.error) {
        setOpen(false);
        setRiderContactId("");
        setTrainerContactId("");
      }
    });
  }

  function riderLabel(log: TrainingLog) {
    return (
      contactNameById(contacts, log.rider_contact_id) ??
      log.rider_name ??
      "–"
    );
  }

  function trainerLabel(log: TrainingLog) {
    return contactNameById(contacts, log.trainer_contact_id) ?? "–";
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button size="sm" className="w-full sm:w-auto sm:self-start">
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
            <ContactSelect
              contacts={contacts}
              role="reiter"
              value={riderContactId}
              onValueChange={setRiderContactId}
              label="Reiter"
              id="training-rider"
            />
            <ContactSelect
              contacts={contacts}
              role="trainer"
              value={trainerContactId}
              onValueChange={setTrainerContactId}
              label="Trainer"
              id="training-trainer"
            />
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
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {logs.map((l) => (
              <MobileListCard
                key={l.id}
                actions={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={pending}
                    className="text-destructive"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteTrainingLog(l.id);
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                }
              >
                <p className="font-medium">
                  {format(parseISO(l.date), "dd.MM.yyyy", { locale: de })}
                </p>
                <MobileListRow
                  label="Dauer"
                  value={
                    l.duration_minutes ? `${l.duration_minutes} min` : "–"
                  }
                />
                <MobileListRow label="Fokus" value={l.focus ?? "–"} />
                <MobileListRow label="Intensität" value={l.intensity ?? "–"} />
                <MobileListRow label="Reiter" value={riderLabel(l)} />
                <MobileListRow label="Trainer" value={trainerLabel(l)} />
              </MobileListCard>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Dauer</TableHead>
                  <TableHead>Fokus</TableHead>
                  <TableHead>Intensität</TableHead>
                  <TableHead>Reiter</TableHead>
                  <TableHead>Trainer</TableHead>
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
                    <TableCell>{riderLabel(l)}</TableCell>
                    <TableCell>{trainerLabel(l)}</TableCell>
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
        </>
      )}
    </div>
  );
}
