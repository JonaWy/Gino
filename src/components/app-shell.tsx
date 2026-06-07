"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Separator } from "@/components/ui/separator";
import { getPageTitle } from "@/lib/navigation";

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const pageTitle = title ?? getPageTitle(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <SidebarTrigger className="hidden md:inline-flex" />
          <Separator
            orientation="vertical"
            className="hidden h-4 md:block"
          />
          <h1 className="font-serif text-base font-semibold tracking-wide md:text-sm md:font-medium md:text-muted-foreground">
            {pageTitle}
          </h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:gap-6 md:p-6 md:pb-6">
          {children}
        </main>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
