"use client";

import { useState, useTransition } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { de } from "date-fns/locale";
import {
  createHealthRecord,
  deleteHealthRecord,
} from "@/app/actions/extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HEALTH_RECORD_TYPE_LABELS } from "@/lib/labels";
import type { HealthRecord, HealthRecordType } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

export function HealthSection({
  horseId,
  records,
}: {
  horseId: string;
  records: HealthRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<HealthRecordType>("impfung");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    formData.set("type", type);
    startTransition(async () => {
      const result = await createHealthRecord(formData);
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
              Eintrag hinzufügen
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gesundheitseintrag</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Typ</Label>
              <Select
                value={type}
                onValueChange={(v) => v && setType(v as HealthRecordType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(HEALTH_RECORD_TYPE_LABELS).map(
                      ([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="product_name">Produkt / Behandlung</Label>
              <Input id="product_name" name="product_name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="next_due_date">Nächste Fälligkeit</Label>
              <Input id="next_due_date" name="next_due_date" type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vet_name">Tierarzt</Label>
              <Input id="vet_name" name="vet_name" />
            </div>
            <Button type="submit" disabled={pending}>
              Speichern
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Einträge.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Nächste Fälligkeit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => {
                const overdue =
                  r.next_due_date &&
                  isBefore(parseISO(r.next_due_date), new Date());
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      {HEALTH_RECORD_TYPE_LABELS[r.type]}
                    </TableCell>
                    <TableCell>{r.product_name ?? "–"}</TableCell>
                    <TableCell>
                      {format(parseISO(r.date), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell>
                      {r.next_due_date
                        ? format(parseISO(r.next_due_date), "dd.MM.yyyy", {
                            locale: de,
                          })
                        : "–"}
                    </TableCell>
                    <TableCell>
                      {overdue ? (
                        <Badge variant="destructive">Überfällig</Badge>
                      ) : r.next_due_date ? (
                        <Badge variant="secondary">Geplant</Badge>
                      ) : (
                        "–"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await deleteHealthRecord(r.id);
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
