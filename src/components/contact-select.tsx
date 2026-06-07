"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterContactsByRole } from "@/lib/contacts";
import { CONTACT_ROLE_LABELS } from "@/lib/labels";
import type { Contact, ContactRole } from "@/types/database";

export function ContactSelect({
  contacts,
  role,
  value,
  onValueChange,
  label,
  id,
}: {
  contacts: Contact[];
  role: ContactRole;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  id?: string;
}) {
  const options = filterContactsByRole(contacts, role);
  const roleLabel = CONTACT_ROLE_LABELS[role];

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Noch kein {roleLabel} angelegt.{" "}
          <Link href="/kontakte" className="text-primary underline-offset-4 hover:underline">
            Unter Kontakte hinzufügen
          </Link>
        </p>
      ) : (
        <Select value={value} onValueChange={(v) => onValueChange(v ?? "")}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={`${roleLabel} wählen`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.license_number ? ` (${c.license_number})` : ""}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
