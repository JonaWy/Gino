"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallHint() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  return (
    <Alert>
      <Download />
      <AlertTitle>App installieren</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>
          Füge Gino zum Startbildschirm hinzu für schnellen Zugriff.
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
              await deferredPrompt.prompt();
              setDeferredPrompt(null);
            }}
          >
            Installieren
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            <X />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
