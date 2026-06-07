"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({
  action,
  submitLabel,
  minPasswordLength,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
  minPasswordLength?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          const result = await action(formData);
          if (result && "error" in result && result.error) {
            setError(result.error);
          }
        })
      }
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={minPasswordLength}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Bitte warten…" : submitLabel}
      </Button>
    </form>
  );
}
