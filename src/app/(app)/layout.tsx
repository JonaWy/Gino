import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";
import { PwaInstallHint } from "@/components/pwa-install-hint";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <PwaRegister />
      <AppShell>
        <PwaInstallHint />
        {children}
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}
