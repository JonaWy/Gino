"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FileInput({
  id,
  name,
  accept,
  required,
  className,
}: {
  id?: string;
  name: string;
  accept?: string;
  required?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  return (
    <div
      className={cn(
        "flex min-h-8 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1",
        className
      )}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6 shrink-0 px-2 text-xs"
        onClick={() => inputRef.current?.click()}
      >
        Datei auswählen
      </Button>
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {fileName || "Keine Datei ausgewählt"}
      </span>
    </div>
  );
}
