"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { DASHBOARD_NAV, type NavItem } from "@/components/common/dashboard/nav";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  LayoutDashboard,
  Settings,
  AppWindow,
  Users,
  Menu,
  LogOut,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { ThemeToggle } from "@/components/common/theme-toggle";

function iconFor(key: NavItem["icon"]) {
  switch (key) {
    case "overview":
      return <LayoutDashboard className="h-4 w-4" />;
    case "settings":
      return <Settings className="h-4 w-4" />;
    case "app":
      return <AppWindow className="h-4 w-4" />;
    case "users":
      return <Users className="h-4 w-4" />;
    default:
      return null;
  }
}

function initialsFromEmail(email: string) {
  if (!email) return "U";
  const [name] = email.split("@");
  const parts = name.split(/[._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function flattenNav() {
  return DASHBOARD_NAV.flatMap((s) => s.items);
}

function getActiveHref(pathname: string) {
  const items = flattenNav();

  // Exact match first
  const exact = items.find((i) => i.href === pathname);
  if (exact) return exact.href;

  // Otherwise longest prefix match (excluding /dashboard)
  const prefixMatches = items
    .filter((i) => i.href !== "/dashboard" && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length);

  return prefixMatches[0]?.href ?? "/dashboard";
}

export function DashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const activeHref = React.useMemo(() => getActiveHref(pathname), [pathname]);

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Persist collapse state (optional but nice)
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("dashboard:sidebarCollapsed");
      if (raw === "1") setSidebarCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        "dashboard:sidebarCollapsed",
        sidebarCollapsed ? "1" : "0"
      );
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const initials = initialsFromEmail(userEmail);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop layout: sidebar hard-left, content fills the rest */}
      <div className="flex min-h-screen">
        {/* Desktop sidebar (hard-left, collapsible) */}
        <aside
          className={`hidden lg:flex lg:flex-col lg:border-r lg:bg-background transition-[width] duration-200 ease-out ${sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[280px]"
            }`}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-3">
            <BrandBlock collapsed={sidebarCollapsed} />
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            <div className="p-2">
              <NavList
                activeHref={activeHref}
                onNavigate={() => { }}
                collapsed={sidebarCollapsed}
              />
            </div>
          </ScrollArea>

          <Separator />
          <div className="p-3">
            {sidebarCollapsed ? (
              <div
                className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-muted text-xs text-muted-foreground"
                title="Replace nav routes with your app modules"
                aria-label="Boilerplate tip"
              >
                Tip
              </div>
            ) : (
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs font-medium">Boilerplate tip</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Replace nav routes with your app modules.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main column (topbar + content) */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              {/* Mobile menu */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Open menu">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] p-0">
                    <SheetHeader className="px-4 py-4">
                      <SheetTitle>Dashboard</SheetTitle>
                    </SheetHeader>
                    <Separator />
                    <ScrollArea className="h-[calc(100vh-88px)]">
                      <div className="p-3">
                        <BrandBlock />
                        <div className="mt-4">
                          <NavList
                            activeHref={activeHref}
                            onNavigate={() => { }}
                          />
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: sidebar collapse toggle */}
              <Button
                variant="outline"
                size="icon"
                className="hidden lg:inline-flex"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setSidebarCollapsed((v) => !v)}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>

              {/* Brand (mobile only, since desktop brand is in sidebar) */}
              <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
                <div className="h-9 w-9 rounded-2xl bg-primary" aria-hidden="true" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">SaaS Admin</p>
                  <p className="text-xs text-muted-foreground">Boilerplate</p>
                </div>
              </Link>

              {/* Search */}
              <div className="flex flex-1 items-center">
                <div className="relative w-full max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search… (placeholder)" className="h-9 pl-9" />
                  <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:block">
                    ⌘K
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-[160px] truncate text-xs sm:inline">
                        {userEmail}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs">Account</DropdownMenuLabel>
                    <div className="px-2 pb-2 text-xs text-muted-foreground">
                      {userEmail}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onSignOut}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content area */}
          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function BrandBlock({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${collapsed ? "w-full" : ""}`}>
      <div className="h-10 w-10 rounded-2xl bg-primary" aria-hidden="true" />
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-semibold">SaaS Admin</p>
          <p className="text-xs text-muted-foreground">Next.js + Supabase + Shadcn</p>
        </div>
      )}
    </div>
  );
}

function NavList({
  activeHref,
  onNavigate,
  collapsed,
}: {
  activeHref: string;
  onNavigate: () => void;
  collapsed?: boolean;
}) {
  return (
    <div className="space-y-4">
      {DASHBOARD_NAV.map((section, idx) => (
        <div key={section.title}>
          {!collapsed ? (
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {section.title}
            </div>
          ) : idx !== 0 ? (
            <Separator className="my-3" />
          ) : null}

          <nav className={`space-y-1 ${collapsed ? "pt-1" : ""}`}>
            {section.items.map((item) => {
              const active = item.href === activeHref;
              const base = "group w-full rounded-xl transition-colors flex items-center";
              const sizing = collapsed ? "justify-center px-2" : "justify-start gap-2 px-3";

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={`${base} ${sizing}`}
                  onClick={onNavigate}
                >
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    className="flex w-full items-center"
                  >
                    <span
                      className={`relative flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground group-hover:text-foreground ${collapsed ? "mx-auto" : ""
                        }`}
                    >
                      {iconFor(item.icon)}
                    </span>

                    {!collapsed && (
                      <>
                        <span className="ml-2 flex-1 truncate">{item.label}</span>

                        {item.badge && (
                          <Badge variant="secondary" className="text-[10px]">
                            {item.badge}
                          </Badge>
                        )}

                        {active && (
                          <span className="ml-2 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                        )}
                      </>
                    )}

                    {collapsed && active && (
                      <span
                        className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
