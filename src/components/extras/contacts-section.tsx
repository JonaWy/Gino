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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALL_CONTACT_ROLES,
  CONTACT_ROLE_META,
  CONTACTS_PAGE_SIZE,
  countContactsByRole,
  contactInitials,
} from "@/lib/contacts";
import { CONTACT_ROLE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Contact, ContactRole } from "@/types/database";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const SHORT_ROLE_LABELS: Partial<Record<ContactRole, string>> = {
  physiotherapeut: "Physio",
  sonstiges: "Sonst.",
};

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
}: {
  contact: Contact;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = CONTACT_ROLE_META[contact.role];

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5">
      <Avatar size="sm" className="size-8 shrink-0">
        <AvatarFallback className={cn("text-xs", meta.avatar)}>
          {contactInitials(contact.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{contact.name}</p>
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
            className="size-8"
            render={<a href={`tel:${contact.phone}`} aria-label="Anrufen" />}
          >
            <Phone />
          </Button>
        )}
        {contact.email && (
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-8"
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
          className="size-8"
          onClick={onEdit}
          aria-label="Bearbeiten"
        >
          <Pencil />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-8 text-destructive"
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

function RoleButton({
  role,
  active,
  count,
  onClick,
  compact,
}: {
  role: ContactRole;
  active: boolean;
  count: number;
  onClick: () => void;
  compact?: boolean;
}) {
  const meta = CONTACT_ROLE_META[role];
  const RoleIcon = meta.icon;
  const label = SHORT_ROLE_LABELS[role] ?? CONTACT_ROLE_LABELS[role];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border transition-colors",
        compact
          ? "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 py-2 text-center"
          : "flex min-h-10 w-full flex-row items-center gap-2 px-3 py-2 text-left",
        active
          ? "border-primary/40 bg-primary/5 text-primary"
          : "bg-card hover:bg-accent/50"
      )}
    >
      <RoleIcon className="size-4 shrink-0" />
      <span
        className={cn(
          "font-medium leading-tight",
          compact ? "text-[10px] leading-none" : "flex-1 truncate text-sm"
        )}
      >
        {label}
      </span>
      {count > 0 && (
        <span
          className={cn(
            "shrink-0 tabular-nums text-muted-foreground",
            compact ? "text-[9px]" : "text-xs"
          )}
        >
          {count}
        </span>
      )}
    </button>
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
  const [activeRole, setActiveRole] = useState<ContactRole>("reiter");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  useEffect(() => {
    setPage(0);
  }, [activeRole, searchQuery]);

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

  const filtered = useMemo(() => {
    const byRole = contacts.filter((c) => c.role === activeRole);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byRole;
    return byRole.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [contacts, activeRole, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CONTACTS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(
    safePage * CONTACTS_PAGE_SIZE,
    (safePage + 1) * CONTACTS_PAGE_SIZE
  );

  const roleLabel = CONTACT_ROLE_LABELS[activeRole];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      {/* Mobile: 4×2 Rollen-Grid – alles sichtbar, kein Scroll */}
      <div className="grid shrink-0 grid-cols-4 gap-1.5 md:hidden">
        {ALL_CONTACT_ROLES.map((role) => (
          <RoleButton
            key={role}
            role={role}
            compact
            active={activeRole === role}
            count={countContactsByRole(contacts, role)}
            onClick={() => setActiveRole(role)}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        {/* Desktop: feste Rollen-Spalte */}
        <nav
          className="hidden w-36 shrink-0 flex-col gap-1 md:flex"
          aria-label="Kontaktrollen"
        >
          {ALL_CONTACT_ROLES.map((role) => (
            <RoleButton
              key={role}
              role={role}
              active={activeRole === role}
              count={countContactsByRole(contacts, role)}
              onClick={() => setActiveRole(role)}
            />
          ))}
        </nav>

        {/* Inhaltsbereich – feste Höhe, Pagination statt Scroll */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          <div className="flex shrink-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suchen…"
                className="h-9 pl-8"
                aria-label="Kontakte durchsuchen"
              />
            </div>
            <Button
              className="h-9 shrink-0 gap-1 px-3"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Neu</span>
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? `Keine Treffer für „${searchQuery.trim()}“`
                    : `Noch kein ${roleLabel}`}
                </p>
                {!searchQuery.trim() && (
                  <Button
                    size="sm"
                    className="h-9"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus />
                    {roleLabel} hinzufügen
                  </Button>
                )}
              </div>
            ) : (
              paginated.map((c) => (
                <ContactRow
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
                      handleDeleted(c.id);
                      router.refresh();
                      toast.success("Kontakt gelöscht");
                    })
                  }
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex shrink-0 items-center justify-between border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft />
                Zurück
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {safePage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={safePage >= totalPages - 1}
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
              >
                Weiter
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer {roleLabel}</DialogTitle>
          </DialogHeader>
          <ContactForm
            horseId={horseId}
            role={activeRole}
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
            <DialogTitle>{roleLabel} bearbeiten</DialogTitle>
          </DialogHeader>
          {editContact && (
            <ContactForm
              horseId={horseId}
              role={activeRole}
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
