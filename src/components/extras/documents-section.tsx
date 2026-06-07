"use client";

import { useState, useTransition } from "react";
import { format, parseISO, isBefore, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { createDocument, deleteDocument } from "@/app/actions/extras";
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
import {
  MobileListCard,
  MobileListRow,
} from "@/components/ui/mobile-list-card";
import { DOCUMENT_TYPE_LABELS } from "@/lib/labels";
import type { Document, DocumentType } from "@/types/database";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export function DocumentsSection({
  horseId,
  documents,
}: {
  horseId: string;
  documents: Document[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DocumentType>("pferdepass");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    formData.set("type", type);
    startTransition(async () => {
      const result = await createDocument(formData);
      if (!result?.error) setOpen(false);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button size="sm" className="w-full sm:w-auto sm:self-start">
              <Plus />
              Dokument hochladen
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Dokument</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Typ</Label>
              <Select
                value={type}
                onValueChange={(v) => v && setType(v as DocumentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
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
              <Input id="title" name="title" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="file">Datei</Label>
              <Input id="file" name="file" type="file" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expires_at">Ablaufdatum</Label>
              <Input id="expires_at" name="expires_at" type="date" />
            </div>
            <Button type="submit" disabled={pending}>
              Hochladen
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Dokumente.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {documents.map((d) => {
              const expiring =
                d.expires_at &&
                isBefore(parseISO(d.expires_at), addDays(new Date(), 30));
              return (
                <MobileListCard
                  key={d.id}
                  actions={
                    <>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        render={
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <ExternalLink />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={pending}
                        className="text-destructive"
                        onClick={() =>
                          startTransition(async () => {
                            await deleteDocument(d.id);
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </>
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{d.title}</p>
                    {expiring && (
                      <Badge variant="destructive">Läuft ab</Badge>
                    )}
                  </div>
                  <MobileListRow
                    label="Typ"
                    value={DOCUMENT_TYPE_LABELS[d.type]}
                  />
                  <MobileListRow
                    label="Ablauf"
                    value={
                      d.expires_at
                        ? format(parseISO(d.expires_at), "dd.MM.yyyy", {
                            locale: de,
                          })
                        : "–"
                    }
                  />
                </MobileListCard>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Ablauf</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => {
                const expiring =
                  d.expires_at &&
                  isBefore(parseISO(d.expires_at), addDays(new Date(), 30));
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.title}</TableCell>
                    <TableCell>{DOCUMENT_TYPE_LABELS[d.type]}</TableCell>
                    <TableCell>
                      {d.expires_at
                        ? format(parseISO(d.expires_at), "dd.MM.yyyy", {
                            locale: de,
                          })
                        : "–"}
                    </TableCell>
                    <TableCell>
                      {expiring && (
                        <Badge variant="destructive">Läuft ab</Badge>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        render={
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <ExternalLink />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await deleteDocument(d.id);
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
        </>
      )}
    </div>
  );
}
