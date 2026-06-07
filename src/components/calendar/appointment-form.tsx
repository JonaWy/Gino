"use client";

import { useState, useTransition } from "react";
import { createAppointment, updateAppointment } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APPOINTMENT_TYPE_LABELS } from "@/lib/labels";
import type { Appointment, AppointmentType } from "@/types/database";
import { Plus } from "lucide-react";

interface AppointmentFormProps {
  horseId: string;
  appointment?: Appointment;
  defaultDate?: string;
  suggestedCost?: number | null;
}

export function AppointmentForm({
  horseId,
  appointment,
  defaultDate,
  suggestedCost,
}: AppointmentFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<AppointmentType>(
    appointment?.type ?? "training"
  );
  const isEdit = !!appointment;

  const defaultStartsAt = appointment?.starts_at
    ? appointment.starts_at.slice(0, 16)
    : defaultDate
      ? `${defaultDate}T09:00`
      : "";

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    formData.set("type", type);
    startTransition(async () => {
      const result = isEdit
        ? await updateAppointment(formData)
        : await createAppointment(formData);
      if (!result?.error) setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus />
            {isEdit ? "Bearbeiten" : "Neuer Termin"}
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Termin bearbeiten" : "Neuer Termin"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={appointment.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Typ</Label>
            <Select
              value={type}
              onValueChange={(v) => v && setType(v as AppointmentType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(APPOINTMENT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={appointment?.title ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="starts_at">Datum & Uhrzeit</Label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={defaultStartsAt}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              name="location"
              defaultValue={appointment?.location ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="estimated_cost">Geschätzte Kosten (€)</Label>
            <Input
              id="estimated_cost"
              name="estimated_cost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                appointment?.estimated_cost ??
                suggestedCost ??
                ""
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Notizen</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={appointment?.description ?? ""}
            />
          </div>
          <input type="hidden" name="all_day" value="false" />
          <Button type="submit" disabled={pending}>
            {pending ? "Speichern…" : "Speichern"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
