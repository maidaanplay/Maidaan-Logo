"use client";

import { usePathname } from "next/navigation";
import { Home, Trophy, User } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AppBottomNav } from "@/components/app-bottom-nav";

const mainPages = ["/players", "/players/play", "/players/profile"];

const navItems = [
  { href: "/players", label: "Home", icon: Home },
  { href: "/players/play", label: "Play", icon: Trophy },
  { href: "/players/profile", label: "Profile", icon: User },
];

const headerConfig = {
  mainPages,
  getTitleFn: (pathname: string) => {
    if (pathname === "/players/play") return "Matches";
    if (pathname === "/players/profile") return "Profile";
    if (pathname === "/players/profile/edit") return "Edit Profile";
    if (pathname.startsWith("/players/match/")) return "Match Details";
    if (pathname.includes("/venues/") && pathname.endsWith("/new")) return "New Booking";
    if (pathname.includes("/venues/") && pathname.includes("/book")) return "Book Court";
    if (pathname.includes("/venues/")) return "Venue Details";
    return "";
  },
  profileRoute: "/players/profile",
  loginRoute: "/login?role=player",
};

export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainPage = mainPages.includes(pathname);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader config={headerConfig} />
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 ${isMainPage ? "pb-20" : "pb-8"}`}>
        {children}
      </main>
      {isMainPage && <AppBottomNav items={navItems} />}
    </div>
  );
}
