"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileStore } from "@/lib/stores/profile";

interface VenueHeaderProps {
  venueName: string;
  userInitials?: string;
  avatarSrc?: string;
}

export default function VenueHeader({ venueName, userInitials = "AD", avatarSrc }: VenueHeaderProps) {
  const router = useRouter();
  const { logout } = useProfileStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login?role=admin");
  };

  return (
    <div className="bg-white dark:bg-gray-950 border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between relative">
          <h1 className="text-xl font-bold">{venueName}</h1>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/maidaan_black.png"
              alt="Maidaan"
              width={80}
              height={32}
              className="dark:hidden"
            />
            <Image
              src="/maidaan_white.png"
              alt="Maidaan"
              width={80}
              height={32}
              className="hidden dark:block"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={avatarSrc} alt="User" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/admin/venue-profile")}>
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
