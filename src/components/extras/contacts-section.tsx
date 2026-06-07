"use client";

import { useState, useTransition } from "react";
import { createContact, deleteContact } from "@/app/actions/extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CONTACT_ROLE_LABELS } from "@/lib/labels";
import type { Contact, ContactRole } from "@/types/database";
import { Plus, Phone, Trash2 } from "lucide-react";

export function ContactsSection({
  horseId,
  contacts,
}: {
  horseId: string;
  contacts: Contact[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<ContactRole>("tierarzt");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    formData.set("role", role);
    startTransition(async () => {
      const result = await createContact(formData);
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
              Kontakt hinzufügen
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuer Kontakt</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Rolle</Label>
              <Select
                value={role}
                onValueChange={(v) => v && setRole(v as ContactRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(CONTACT_ROLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <Button type="submit" disabled={pending}>
              Speichern
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Kontakte.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {CONTACT_ROLE_LABELS[c.role]}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteContact(c.id);
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </CardHeader>
              <CardContent>
                {c.phone && (
                  <Button
                    render={<a href={`tel:${c.phone}`} />}
                    variant="outline"
                    size="sm"
                  >
                    <Phone />
                    {c.phone}
                  </Button>
                )}
                {c.email && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {c.email}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
