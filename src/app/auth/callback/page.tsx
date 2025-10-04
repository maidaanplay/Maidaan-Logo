"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/lib/stores/profile";

// Prevent static generation for this dynamic route
export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const { setProfile } = useProfileStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          setError("No session found. Please try logging in again.");
          return;
        }

        const user = session.user;
        const role = searchParams.get("role") || "player";
        const name = searchParams.get("name");

        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (existingProfile) {
          // Profile exists, set it and redirect
          setProfile(existingProfile);
          const redirectPath = existingProfile.profile_type === "admin" ? "/admin" : "/players";
          router.push(redirectPath);
        } else {
          // New user - create profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: name || user.user_metadata?.name || user.email?.split('@')[0],
              profile_type: role as 'admin' | 'player',
              contact_number: user.phone || '',
              points: 0,
              streak: 0,
              matches: [],
              friends_list: []
            })
            .select()
            .single();

          if (createError) throw createError;

          // If admin, create venue
          if (role === "admin") {
            try {
              await fetch('/api/venue/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: user.id }),
              });
            } catch (venueError) {
              console.error('Error creating venue:', venueError);
            }
          }

          setProfile(newProfile);
          const redirectPath = role === "admin" ? "/admin" : "/players";
          router.push(redirectPath);
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message || "Authentication failed");
      }
    };

    handleCallback();
  }, [router, searchParams, setProfile]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700 dark:text-gray-300">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
