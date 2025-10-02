"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/page-layout";
import AppFooter from "@/components/layout/app-footer";

export default function WelcomePage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light";
  const logoSrc = currentTheme === "dark" ? "/maidaan_white.png" : "/maidaan_black.png";

  return (
    <PageLayout
      footer={
        <AppFooter>
          <div className="space-y-3">
            <Link href="/login?role=player" className="block">
              <Button
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Continue as Player
              </Button>
            </Link>

            <Link href="/login?role=admin" className="block">
              <Button
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Continue as Admin
              </Button>
            </Link>
          </div>
        </AppFooter>
      }
    >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 p-4 pb-40">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 dark:opacity-5"></div>

        <Card className="w-full max-w-2xl shadow-2xl border-2 relative z-10 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="text-center space-y-6 pb-8 pt-10">
            <div className="flex justify-center mb-4">
              <div className="relative w-48 h-20 md:w-56 md:h-24">
                <Image
                  src={logoSrc}
                  alt="Maidaan Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="space-y-3">
              <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
                Welcome to Maidaan
              </CardTitle>
              <CardDescription className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Your premier platform for sports venue booking and match organization
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 md:px-10 pb-10">
            <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-6">
              Select your role to continue
            </p>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl">🏟️</div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Book Venues</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl">⚽</div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Organize Matches</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl">👥</div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Join Community</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
