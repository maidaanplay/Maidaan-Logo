"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileStore } from "@/lib/stores/profile";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, loadCurrentUser } = useProfileStore();
  const isPlayerRoute = pathname?.startsWith("/players");

  // Load profile on mount
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login?role=player");
  };

  return (
    <div className="min-h-screen bg-background">
      {!isPlayerRoute && (
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Maidaan</h1>
            <ThemeToggle />
          </div>
        </header>
      )}
      <main className={isPlayerRoute ? "" : "container mx-auto px-4 py-8"}>{children}</main>
    </div>
  );
}
