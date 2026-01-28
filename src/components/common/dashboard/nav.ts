export type NavItem = {
  href: string;
  label: string;
  icon: "overview" | "app" | "users" | "settings";
  badge?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const DASHBOARD_NAV: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "overview" },
      { href: "/blankPage", label: "Blank Page", icon: "app", badge: "New" },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin/users", label: "Users", icon: "users" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];