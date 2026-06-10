"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createContact,
  deleteContact,
  updateContact,
} from "@/app/actions/extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALL_CONTACT_ROLES,
  CONTACT_ROLE_META,
  contactInitials,
} from "@/lib/contacts";
import { CONTACT_ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Contact, ContactRole } from "@/types/database";
import {
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

function ContactForm({
  horseId,
  role,
  contact,
  onDone,
  onSaved,
}: {
  horseId: string;
  role: ContactRole;
  contact?: Contact;
  onDone: () => void;
  onSaved: (contact: Contact) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!contact;

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    formData.set("role", role);
    if (contact) formData.set("id", contact.id);
    startTransition(async () => {
      const result = isEdit
        ? await updateContact(formData)
        : await createContact(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.contact) onSaved(result.contact);
      router.refresh();
      onDone();
      toast.success(isEdit ? "Kontakt aktualisiert" : "Kontakt angelegt");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`name-${role}`}>Name</Label>
        <Input
          id={`name-${role}`}
          name="name"
          required
          autoComplete="name"
          placeholder="Vor- und Nachname"
          defaultValue={contact?.name ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`phone-${role}`}>Telefon (optional)</Label>
        <Input
          id={`phone-${role}`}
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          defaultValue={contact?.phone ?? ""}
        />
      </div>
      {role !== "reiter" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`email-${role}`}>E-Mail (optional)</Label>
          <Input
            id={`email-${role}`}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={contact?.email ?? ""}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`notes-${role}`}>Notizen (optional)</Label>
        <Textarea
          id={`notes-${role}`}
          name="notes"
          rows={2}
          defaultValue={contact?.notes ?? ""}
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-10 w-full">
        {pending ? "Speichern…" : isEdit ? "Aktualisieren" : "Speichern"}
      </Button>
    </form>
  );
}

function ContactRow({
  contact,
  pending,
  onEdit,
  onDelete,
  embedded,
  showRole,
}: {
  contact: Contact;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  embedded?: boolean;
  showRole?: boolean;
}) {
  const meta = CONTACT_ROLE_META[contact.role];

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        embedded
          ? "py-1"
          : "rounded-lg border bg-card px-2 py-1.5"
      )}
    >
      <Avatar size="sm" className={cn("shrink-0", embedded ? "size-7" : "size-8")}>
        <AvatarFallback className={cn("text-xs", meta.avatar)}>
          {contactInitials(contact.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-sm font-medium">{contact.name}</p>
          {showRole && (
            <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
              {CONTACT_ROLE_LABELS[contact.role]}
            </Badge>
          )}
        </div>
        {(contact.phone || contact.email) && (
          <p className="truncate text-xs text-muted-foreground">
            {contact.phone ?? contact.email}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {contact.phone && (
          <Button
            size="icon-sm"
            variant="ghost"
            className={embedded ? "size-7" : "size-8"}
            render={<a href={`tel:${contact.phone}`} aria-label="Anrufen" />}
          >
            <Phone />
          </Button>
        )}
        {contact.email && (
          <Button
            size="icon-sm"
            variant="ghost"
            className={embedded ? "size-7" : "size-8"}
            render={
              <a href={`mailto:${contact.email}`} aria-label="E-Mail" />
            }
          >
            <Mail />
          </Button>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          className={embedded ? "size-7" : "size-8"}
          onClick={onEdit}
          aria-label="Bearbeiten"
        >
          <Pencil />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className={cn(
            "text-destructive",
            embedded ? "size-7" : "size-8"
          )}
          disabled={pending}
          onClick={onDelete}
          aria-label="Löschen"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function RoleContactCard({
  role,
  contacts,
  pending,
  onAdd,
  onEdit,
  onDelete,
}: {
  role: ContactRole;
  contacts: Contact[];
  pending: boolean;
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}) {
  const meta = CONTACT_ROLE_META[role];
  const RoleIcon = meta.icon;
  const label = CONTACT_ROLE_LABELS[role];

  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            meta.avatar
          )}
        >
          <RoleIcon className="size-3.5" />
        </div>
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium">{label}</h3>
        {contacts.length > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {contacts.length}
          </span>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-7 shrink-0"
          onClick={onAdd}
          aria-label={`${label} hinzufügen`}
        >
          <Plus />
        </Button>
      </div>

      {contacts.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-dashed px-2 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {label} hinzufügen
        </button>
      ) : (
        <div className="flex flex-col divide-y rounded-md border bg-muted/20 px-2">
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              pending={pending}
              embedded
              onEdit={() => onEdit(contact)}
              onDelete={() => onDelete(contact.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function ContactsSection({
  horseId,
  contacts: initialContacts,
}: {
  horseId: string;
  contacts: Contact[];
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<ContactRole>("reiter");
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  function handleSaved(contact: Contact) {
    setContacts((prev) => {
      const index = prev.findIndex((c) => c.id === contact.id);
      if (index === -1) return [...prev, contact];
      const next = [...prev];
      next[index] = contact;
      return next;
    });
  }

  function handleDeleted(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function openCreate(role: ContactRole) {
    setCreateRole(role);
    setCreateOpen(true);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteContact(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      handleDeleted(id);
      router.refresh();
      toast.success("Kontakt gelöscht");
    });
  }

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        CONTACT_ROLE_LABELS[c.role].toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const contactsByRole = useMemo(() => {
    const grouped = Object.fromEntries(
      ALL_CONTACT_ROLES.map((role) => [role, [] as Contact[]])
    ) as Record<ContactRole, Contact[]>;

    for (const contact of contacts) {
      grouped[contact.role].push(contact);
    }

    for (const role of ALL_CONTACT_ROLES) {
      grouped[role].sort((a, b) => a.name.localeCompare(b.name, "de"));
    }

    return grouped;
  }, [contacts]);

  const isSearching = searchQuery.trim().length > 0;
  const createRoleLabel = CONTACT_ROLE_LABELS[createRole];
  const editRoleLabel = editContact
    ? CONTACT_ROLE_LABELS[editContact.role]
    : createRoleLabel;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kontakte durchsuchen…"
            className="h-9 pl-8"
            aria-label="Kontakte durchsuchen"
          />
        </div>
        <Button
          className="h-9 shrink-0 gap-1 px-3"
          onClick={() => openCreate("reiter")}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Neu</span>
        </Button>
      </div>

      {isSearching ? (
        <div className="flex flex-col gap-2">
          {searchResults.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground">
              Keine Treffer für „{searchQuery.trim()}“
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 rounded-xl border bg-card p-2">
              {searchResults.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  pending={pending}
                  showRole
                  onEdit={() => setEditContact(contact)}
                  onDelete={() => handleDelete(contact.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ALL_CONTACT_ROLES.map((role) => (
            <RoleContactCard
              key={role}
              role={role}
              contacts={contactsByRole[role]}
              pending={pending}
              onAdd={() => openCreate(role)}
              onEdit={setEditContact}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer {createRoleLabel}</DialogTitle>
          </DialogHeader>
          <ContactForm
            horseId={horseId}
            role={createRole}
            onDone={() => setCreateOpen(false)}
            onSaved={handleSaved}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editContact}
        onOpenChange={(open) => !open && setEditContact(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editRoleLabel} bearbeiten</DialogTitle>
          </DialogHeader>
          {editContact && (
            <ContactForm
              horseId={horseId}
              role={editContact.role}
              contact={editContact}
              onDone={() => setEditContact(null)}
              onSaved={handleSaved}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
