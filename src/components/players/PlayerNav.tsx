"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Trophy, User } from "lucide-react";

export function PlayerNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/players",
      label: "Home",
      icon: Home,
    },
    {
      href: "/players/play",
      label: "Play",
      icon: Trophy,
    },
    {
      href: "/players/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-gray-950">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/players");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
