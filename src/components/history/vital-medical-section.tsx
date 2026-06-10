"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { createDocument, deleteDocument } from "@/app/actions/extras";
import {
  createHorseCondition,
  deleteHorseCondition,
  updateHorseCondition,
} from "@/app/actions/vitals";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import type { Document, DocumentType, HorseCondition } from "@/types/database";
import {
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  ScanLine,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const NONE = "__none__";

function documentTitle(
  documents: Document[],
  id: string | null
): string | null {
  if (!id) return null;
  return documents.find((d) => d.id === id)?.title ?? null;
}

function ConditionForm({
  horseId,
  condition,
  reports,
  xRays,
  onDone,
}: {
  horseId: string;
  condition?: HorseCondition;
  reports: Document[];
  xRays: Document[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reportId, setReportId] = useState(
    condition?.report_document_id ?? ""
  );
  const [xrayId, setXrayId] = useState(condition?.xray_document_id ?? "");
  const isEdit = !!condition;

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    if (condition) formData.set("id", condition.id);
    formData.set("report_document_id", reportId);
    formData.set("xray_document_id", xrayId);

    startTransition(async () => {
      const result = isEdit
        ? await updateHorseCondition(formData)
        : await createHorseCondition(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      onDone();
      toast.success(isEdit ? "Krankheit aktualisiert" : "Krankheit hinzugefügt");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="condition-name">Krankheit / Beschwerde</Label>
        <Input
          id="condition-name"
          name="name"
          required
          defaultValue={condition?.name ?? ""}
          placeholder="z. B. Hufrehe"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="condition-notes">Notizen (optional)</Label>
        <Textarea
          id="condition-notes"
          name="notes"
          rows={2}
          defaultValue={condition?.notes ?? ""}
          placeholder="Symptome, Behandlung, Verlauf…"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Arztbericht verknüpfen</Label>
        <Select
          value={reportId || undefined}
          onValueChange={(v) => setReportId(v === NONE ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kein Arztbericht" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={NONE}>Kein Arztbericht</SelectItem>
              {reports.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Röntgenbefund verknüpfen</Label>
        <Select
          value={xrayId || undefined}
          onValueChange={(v) => setXrayId(v === NONE ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kein Röntgenbefund" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={NONE}>Kein Röntgenbefund</SelectItem>
              {xRays.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Speichern…" : isEdit ? "Aktualisieren" : "Hinzufügen"}
      </Button>
    </form>
  );
}

function KnownConditionsCard({
  horseId,
  conditions,
  reports,
  xRays,
}: {
  horseId: string;
  conditions: HorseCondition[];
  reports: Document[];
  xRays: Document[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCondition, setEditCondition] = useState<HorseCondition | null>(
    null
  );
  const [pending, startTransition] = useTransition();
  const allDocs = [...reports, ...xRays];

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteHorseCondition(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success("Krankheit entfernt");
    });
  }

  function docUrl(id: string | null) {
    if (!id) return null;
    return allDocs.find((d) => d.id === id)?.file_url ?? null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="size-4 text-muted-foreground" />
            Bekannte Krankheiten
          </CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline" className="shrink-0">
                  <Plus />
                  Hinzufügen
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Krankheit hinzufügen</DialogTitle>
              </DialogHeader>
              <ConditionForm
                horseId={horseId}
                reports={reports}
                xRays={xRays}
                onDone={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {conditions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Krankheiten erfasst. Lege Einträge an und verknüpfe sie
            optional mit Arztberichten oder Röntgenbefunden.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {conditions.map((condition) => {
              const reportTitle = documentTitle(
                reports,
                condition.report_document_id
              );
              const xrayTitle = documentTitle(
                xRays,
                condition.xray_document_id
              );
              const reportUrl = docUrl(condition.report_document_id);
              const xrayUrl = docUrl(condition.xray_document_id);

              return (
                <li
                  key={condition.id}
                  className="flex flex-col gap-2 rounded-lg border bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{condition.name}</p>
                    {condition.notes && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {condition.notes}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {reportTitle && reportUrl && (
                        <Badge variant="secondary" className="gap-1 pr-1">
                          <FileText className="size-3" />
                          {reportTitle}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="size-5"
                            render={
                              <a
                                href={reportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Arztbericht öffnen"
                              />
                            }
                          >
                            <ExternalLink className="size-3" />
                          </Button>
                        </Badge>
                      )}
                      {xrayTitle && xrayUrl && (
                        <Badge variant="outline" className="gap-1 pr-1">
                          <ScanLine className="size-3" />
                          {xrayTitle}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="size-5"
                            render={
                              <a
                                href={xrayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Röntgenbefund öffnen"
                              />
                            }
                          >
                            <ExternalLink className="size-3" />
                          </Button>
                        </Badge>
                      )}
                      {!reportTitle && !xrayTitle && (
                        <span className="text-xs text-muted-foreground">
                          Keine Dokumente verknüpft
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 self-end sm:self-start">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditCondition(condition)}
                      aria-label="Bearbeiten"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={pending}
                      onClick={() => handleDelete(condition.id)}
                      aria-label="Löschen"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog
        open={!!editCondition}
        onOpenChange={(open) => !open && setEditCondition(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Krankheit bearbeiten</DialogTitle>
          </DialogHeader>
          {editCondition && (
            <ConditionForm
              key={editCondition.id}
              horseId={horseId}
              condition={editCondition}
              reports={reports}
              xRays={xRays}
              onDone={() => setEditCondition(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function MedicalDocumentsCard({
  horseId,
  type,
  title,
  description,
  documents,
  icon: Icon,
}: {
  horseId: string;
  type: DocumentType;
  title: string;
  description: string;
  documents: Document[];
  icon: typeof FileText;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("horse_id", horseId);
    formData.set("type", type);
    startTransition(async () => {
      const result = await createDocument(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
      toast.success("Dokument gespeichert");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDocument(id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success("Dokument gelöscht");
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              {title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline" className="shrink-0">
                  <Plus />
                  Hochladen
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{title} hochladen</DialogTitle>
              </DialogHeader>
              <form
                key={`${type}-${open}`}
                action={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`title-${type}`}>Titel</Label>
                  <Input
                    id={`title-${type}`}
                    name="title"
                    required
                    placeholder="z. B. Befund vom 07.06.2026"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`file-${type}`}>Datei</Label>
                  <FileInput
                    id={`file-${type}`}
                    name="file"
                    accept="image/*,.pdf"
                    required
                  />
                </div>
                <Button type="submit" disabled={pending}>
                  {pending ? "Wird hochgeladen…" : "Speichern"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Einträge.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(doc.created_at), "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  render={
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Öffnen"
                    />
                  }
                >
                  <ExternalLink />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={pending}
                  onClick={() => handleDelete(doc.id)}
                  aria-label="Löschen"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function VitalMedicalSection({
  horseId,
  conditions,
  reports,
  xRays,
}: {
  horseId: string;
  conditions: HorseCondition[];
  reports: Document[];
  xRays: Document[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Gesundheitsunterlagen</h3>
      <KnownConditionsCard
        horseId={horseId}
        conditions={conditions}
        reports={reports}
        xRays={xRays}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <MedicalDocumentsCard
          horseId={horseId}
          type="arztbericht"
          title="Arztberichte"
          description="Befunde und Berichte vom Tierarzt"
          documents={reports}
          icon={FileText}
        />
        <MedicalDocumentsCard
          horseId={horseId}
          type="roentgen"
          title="Röntgenbefunde"
          description="Röntgenbilder und radiologische Befunde"
          documents={xRays}
          icon={ScanLine}
        />
      </div>
    </div>
  );
}
