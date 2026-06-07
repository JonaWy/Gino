"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, LogOut } from "lucide-react";
import {
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  isNavActive,
  isSecondaryRoute,
} from "@/lib/navigation";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = isSecondaryRoute(pathname);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
        aria-label="Hauptnavigation"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <item.icon
                  className={cn("size-5", active && "stroke-[2.5]")}
                  aria-hidden
                />
                <span className="truncate">
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
              moreActive
                ? "text-primary"
                : "text-muted-foreground active:text-foreground"
            )}
          >
            <LayoutGrid
              className={cn("size-5", moreActive && "stroke-[2.5]")}
              aria-hidden
            />
            <span>Mehr</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle className="font-serif text-lg">Weitere Bereiche</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {SECONDARY_NAV_ITEMS.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors active:bg-accent",
                    active
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "text-foreground"
                  )}
                >
                  <item.icon className="size-5" aria-hidden />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <form action={logout} className="border-t pt-4">
            <button
              type="submit"
              className="flex w-full min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium text-destructive active:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Abmelden
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
