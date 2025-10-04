"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";
import { useProfileStore } from "@/lib/stores/profile";

interface HeaderConfig {
  mainPages: string[];
  getTitleFn: (pathname: string) => string;
  profileRoute: string;
  loginRoute: string;
}

interface AppHeaderProps {
  config: HeaderConfig;
}

export function AppHeader({ config }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useProfileStore();

  const isMainPage = config.mainPages.includes(pathname);
  const pageTitle = config.getTitleFn(pathname);

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
    router.push(config.loginRoute);
  };

  if (!isMainPage) {
    // Sub-page header with back button
    return (
      <div className="bg-white dark:bg-gray-950 border-b fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
        </div>
      </div>
    );
  }

  // Main page header with logo and avatar dropdown
  return (
    <div className="bg-white dark:bg-gray-950 border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between relative">
          <h1 className="text-lg font-semibold">{pageTitle}</h1>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/maidaan_black.png"
              alt="Maidaan"
              width={60}
              height={24}
              className="dark:hidden"
            />
            <Image
              src="/maidaan_white.png"
              alt="Maidaan"
              width={60}
              height={24}
              className="hidden dark:block"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                  <AvatarFallback>{profile ? getInitials(profile.name) : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(config.profileRoute)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
