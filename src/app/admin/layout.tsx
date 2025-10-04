"use client";

import { usePathname } from "next/navigation";
import { Home, CalendarDays, BarChart3 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AppBottomNav } from "@/components/app-bottom-nav";

const mainPages = ["/admin", "/admin/play", "/admin/stats"];

const navItems = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/play", label: "Matches", icon: CalendarDays },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
];

const headerConfig = {
  mainPages,
  getTitleFn: (pathname: string) => {
    if (pathname === "/admin/play") return "Matches";
    if (pathname === "/admin/venue-profile") return "Venue Profile";
    if (pathname.startsWith("/admin/match/")) return "Match Details";
    if (pathname.startsWith("/admin/play/") && pathname.endsWith("/new")) return "New Booking";
    if (pathname === "/admin/stats") return "Statistics";
    if (pathname.startsWith("/admin/stats/")) return "Daily Summary";
    return "";
  },
  profileRoute: "/admin/venue-profile",
  loginRoute: "/login?role=admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainPage = mainPages.includes(pathname);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader config={headerConfig} />
      <main className={`max-w-md mx-auto px-4 pt-16 ${isMainPage ? "pb-20" : "pb-8"}`}>
        {children}
      </main>
      {isMainPage && <AppBottomNav items={navItems} />}
    </div>
  );
}
