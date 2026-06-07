import { AppShell } from "@/components/app-shell";
import { HorseSetup } from "@/components/horse-setup";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import { PwaInstallHint } from "@/components/pwa-install-hint";
import { getOrCreateHorse } from "@/lib/horse";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const horse = await getOrCreateHorse();

  return (
    <TooltipProvider>
      <PwaRegister />
      <AppShell>
        <PwaInstallHint />
        {horse ? children : <HorseSetup />}
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}
