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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  CONTACT_ROLE_META,
  countContactsByRole,
  contactInitials,
  OTHER_CONTACT_ROLES,
  PERSON_CONTACT_ROLES,
} from "@/lib/contacts";
import { CONTACT_ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Contact, ContactRole } from "@/types/database";
import { Mail, MoreHorizontal, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
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
  const meta = CONTACT_ROLE_META[role];
  const RoleIcon = meta.icon;

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
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            meta.avatar
          )}
        >
          <RoleIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium">{CONTACT_ROLE_LABELS[role]}</p>
          <p className="text-xs text-muted-foreground">
            {role === "reiter"
              ? "Name reicht – Telefon optional"
              : "Name und Kontaktdaten"}
          </p>
        </div>
      </div>
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
          placeholder="+49 …"
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
            inputMode="email"
            placeholder="name@beispiel.de"
            defaultValue={contact?.email ?? ""}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`notes-${role}`}>Notizen (optional)</Label>
        <Textarea
          id={`notes-${role}`}
          name="notes"
          rows={3}
          placeholder="z. B. Erreichbarkeit, Besonderheiten…"
          defaultValue={contact?.notes ?? ""}
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-11 w-full">
        {pending ? "Speichern…" : isEdit ? "Aktualisieren" : "Speichern"}
      </Button>
    </form>
  );
}

function ContactCard({
  contact,
  pending,
  onDelete,
  onEdit,
}: {
  contact: Contact;
  pending: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const meta = CONTACT_ROLE_META[contact.role];

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-l-4 bg-card p-4 shadow-sm transition-colors hover:bg-accent/30",
        meta.accent
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar size="lg" className="size-11">
          <AvatarFallback className={cn("font-medium", meta.avatar)}>
            {contactInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium leading-tight">{contact.name}</h3>
          <p className="text-xs text-muted-foreground">
            {CONTACT_ROLE_LABELS[contact.role]}
          </p>
          {contact.license_number && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lizenz {contact.license_number}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-9"
            onClick={onEdit}
            aria-label={`${contact.name} bearbeiten`}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-9 text-destructive"
            disabled={pending}
            onClick={onDelete}
            aria-label={`${contact.name} löschen`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {(contact.phone || contact.email || contact.notes) && (
        <div className="flex flex-col gap-2 border-t pt-3">
          {contact.phone && (
            <Button
              render={<a href={`tel:${contact.phone}`} />}
              variant="outline"
              className="min-h-11 w-full justify-start gap-2"
            >
              <Phone className="size-4 shrink-0" />
              <span className="truncate">{contact.phone}</span>
            </Button>
          )}
          {contact.email && (
            <Button
              render={<a href={`mailto:${contact.email}`} />}
              variant="outline"
              className="min-h-11 w-full justify-start gap-2"
            >
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </Button>
          )}
          {contact.notes && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {contact.notes}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function ContactEmptyState({
  roleLabel,
  onAdd,
}: {
  roleLabel: string;
  onAdd: () => void;
}) {
  return (
    <Empty className="border bg-muted/20 py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plus />
        </EmptyMedia>
        <EmptyTitle>Noch kein {roleLabel}</EmptyTitle>
        <EmptyDescription>
          Lege {roleLabel === "Reiter" ? "einen Reiter" : `einen ${roleLabel}`}{" "}
          an – danach kannst du ihn in Turnieren, Training und Terminen
          auswählen.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAdd} className="min-h-11 w-full sm:w-auto">
          <Plus />
          {roleLabel} hinzufügen
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function ContactRoleList({
  horseId,
  role,
  contacts,
  searchQuery,
  onSaved,
  onDeleted,
}: {
  horseId: string;
  role: ContactRole;
  contacts: Contact[];
  searchQuery: string;
  onSaved: (contact: Contact) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [pending, startTransition] = useTransition();
  const roleLabel = CONTACT_ROLE_LABELS[role];
  const meta = CONTACT_ROLE_META[role];
  const RoleIcon = meta.icon;

  const filtered = useMemo(() => {
    const byRole = contacts.filter((c) => c.role === role);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byRole;
    return byRole.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
    );
  }, [contacts, role, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full",
              meta.avatar
            )}
          >
            <RoleIcon className="size-4" />
          </span>
          <span>
            {filtered.length}{" "}
            {filtered.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button className="min-h-11 w-full sm:w-auto">
                <Plus />
                {roleLabel} hinzufügen
              </Button>
            }
          />
          <DialogContent className="max-h-[min(90dvh,640px)] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neuer {roleLabel}</DialogTitle>
            </DialogHeader>
            <ContactForm
              horseId={horseId}
              role={role}
              onDone={() => setCreateOpen(false)}
              onSaved={onSaved}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={!!editContact}
        onOpenChange={(open) => !open && setEditContact(null)}
      >
        <DialogContent className="max-h-[min(90dvh,640px)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{roleLabel} bearbeiten</DialogTitle>
          </DialogHeader>
          {editContact && (
            <ContactForm
              horseId={horseId}
              role={role}
              contact={editContact}
              onDone={() => setEditContact(null)}
              onSaved={onSaved}
            />
          )}
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        searchQuery.trim() ? (
          <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            Keine Treffer für „{searchQuery.trim()}“
          </p>
        ) : (
          <ContactEmptyState
            roleLabel={roleLabel}
            onAdd={() => setCreateOpen(true)}
          />
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              pending={pending}
              onEdit={() => setEditContact(c)}
              onDelete={() =>
                startTransition(async () => {
                  const result = await deleteContact(c.id);
                  if (result?.error) {
                    toast.error(result.error);
                    return;
                  }
                  onDeleted(c.id);
                  router.refresh();
                  toast.success("Kontakt gelöscht");
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContactsSection({
  horseId,
  contacts: initialContacts,
}: {
  horseId: string;
  contacts: Contact[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("reiter");

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

  const otherContacts = contacts.filter((c) =>
    OTHER_CONTACT_ROLES.includes(
      c.role as (typeof OTHER_CONTACT_ROLES)[number]
    )
  );

  const totalPersonContacts = PERSON_CONTACT_ROLES.reduce(
    (sum, role) => sum + countContactsByRole(contacts, role),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-2.5 py-1">
            {totalPersonContacts} Personen
          </Badge>
          <Badge variant="outline" className="px-2.5 py-1">
            {otherContacts.length} Weitere
          </Badge>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen…"
            className="min-h-11 pl-9"
            aria-label="Kontakte durchsuchen"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="inline-flex h-auto min-w-full w-max gap-1 p-1 sm:min-w-0 sm:w-full">
            {PERSON_CONTACT_ROLES.map((role) => {
              const count = countContactsByRole(contacts, role);
              const RoleIcon = CONTACT_ROLE_META[role].icon;
              return (
                <TabsTrigger
                  key={role}
                  value={role}
                  className="min-h-10 shrink-0 gap-1.5 px-3 py-2 text-xs sm:flex-1 sm:text-sm"
                >
                  <RoleIcon className="size-3.5 shrink-0 sm:size-4" />
                  <span className="truncate">{CONTACT_ROLE_LABELS[role]}</span>
                  {count > 0 && (
                    <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
            <TabsTrigger
              value="weitere"
              className="min-h-10 shrink-0 gap-1.5 px-3 py-2 text-xs sm:flex-1 sm:text-sm"
            >
              <MoreHorizontal className="size-3.5 shrink-0 sm:size-4" />
              <span>Weitere</span>
              {otherContacts.length > 0 && (
                <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                  {otherContacts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {PERSON_CONTACT_ROLES.map((role) => (
          <TabsContent key={role} value={role} keepMounted className="mt-4">
            <ContactRoleList
              horseId={horseId}
              role={role}
              contacts={contacts}
              searchQuery={searchQuery}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
            />
          </TabsContent>
        ))}

        <TabsContent value="weitere" keepMounted className="mt-4">
          <div className="flex flex-col gap-8">
            {OTHER_CONTACT_ROLES.map((role) => (
              <section key={role} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  {(() => {
                    const RoleIcon = CONTACT_ROLE_META[role].icon;
                    return (
                      <RoleIcon className="size-4 text-muted-foreground" />
                    );
                  })()}
                  <h3 className="text-sm font-medium">
                    {CONTACT_ROLE_LABELS[role]}
                  </h3>
                </div>
                <ContactRoleList
                  horseId={horseId}
                  role={role}
                  contacts={otherContacts}
                  searchQuery={searchQuery}
                  onSaved={handleSaved}
                  onDeleted={handleDeleted}
                />
              </section>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
