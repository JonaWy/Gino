"use client";

import { useState, useTransition } from "react";
import { createTournament } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactSelect } from "@/components/contact-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Contact } from "@/types/database";
import { Plus } from "lucide-react";

export function TournamentForm({
  horseId,
  contacts,
}: {
  horseId: string;
  contacts: Contact[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [contactId, setContactId] = useState("");

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    if (contactId) formData.set("contact_id", contactId);
    startTransition(async () => {
      const result = await createTournament(formData);
      if (!result?.error) {
        setOpen(false);
        setContactId("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full sm:w-auto">
            <Plus />
            Turnier eintragen
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Turnier</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Turniername</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Datum</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Ort</Label>
            <Input id="location" name="location" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="discipline">Disziplin</Label>
            <Input id="discipline" name="discipline" placeholder="Dressur, Springen…" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rating">Bewertung</Label>
            <Input id="rating" name="rating" placeholder="z.B. 8,2" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="placement">Platzierung</Label>
            <Input id="placement" name="placement" type="number" min="1" />
          </div>
          <ContactSelect
            contacts={contacts}
            role="reiter"
            value={contactId}
            onValueChange={setContactId}
            label="Reiter"
            id="tournament-rider"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="prize_money">Preisgeld (€)</Label>
            <Input id="prize_money" name="prize_money" type="number" step="0.01" min="0" />
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
