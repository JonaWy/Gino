"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Heart,
  Home,
  Trophy,
  Activity,
  Euro,
  FileText,
  Phone,
  Dumbbell,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logout } from "@/app/actions/auth";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/kalender", label: "Kalender", icon: Calendar },
  { href: "/turniere", label: "Turniere", icon: Trophy },
  { href: "/vitalwerte", label: "Vitalwerte", icon: Activity },
  { href: "/gesundheit", label: "Gesundheit", icon: Heart },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/kosten", label: "Kosten", icon: Euro },
  { href: "/dokumente", label: "Dokumente", icon: FileText },
  { href: "/kontakte", label: "Kontakte", icon: Phone },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="font-serif text-xl font-semibold tracking-wide text-primary">
            Gino
          </span>
          <span className="text-xs text-muted-foreground">
            Pferde-Management
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit">
                <LogOut />
                <span>Abmelden</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
