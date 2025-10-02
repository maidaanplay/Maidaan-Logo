"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/lib/stores/profile";
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [role, setRole] = useState<"admin" | "player">("player");
  const [showNameField, setShowNameField] = useState(false);
  const { setProfile } = useProfileStore();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "admin" || roleParam === "player") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", name: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    console.log("=== Form submitted ===");
    console.log("Form data:", data);

    setIsLoading(true);
    setError("");

    try {
      console.log("Checking phone:", data.phone);
      console.log("Role:", role);

      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from("profiles")
        .select("count");

      console.log("Test connection:", { testData, testError });

      // Check if profile exists via API
      console.log("Fetching profile from API...");
      const checkResponse = await fetch(`/api/profiles?phone=${data.phone}`);
      console.log("API response status:", checkResponse.status, checkResponse.ok);

      const checkResult = await checkResponse.json();
      console.log("Query result:", checkResult);

      if (!checkResponse.ok) {
        console.error("API returned error");
        throw new Error(checkResult.error || 'Failed to check profile');
      }

      const existingProfile = checkResult.profile;

      if (existingProfile) {
        console.log("Profile found:", existingProfile);
        console.log("Profile type:", existingProfile.profile_type);
        console.log("Expected role:", role);

        // Profile exists - check role and login
        if (existingProfile.profile_type !== role) {
          console.log("Role mismatch!");
          setError(
            `This number is registered as a ${existingProfile.profile_type}. Please use the ${existingProfile.profile_type} login.`
          );
          setIsLoading(false);
          return;
        }

        // Login
        console.log("Setting profile and redirecting...");
        setProfile(existingProfile);
        const redirectPath = role === "admin" ? "/admin" : "/players";
        console.log("Redirecting to:", redirectPath);

        // Use window.location for immediate redirect
        window.location.href = redirectPath;
      } else {
        console.log("No profile found");
        console.log("showNameField:", showNameField);
        console.log("data.name:", data.name);

        // Profile doesn't exist
        if (!showNameField && !data.name) {
          // Show name field
          console.log("Showing name field...");
          setShowNameField(true);
          setIsLoading(false);
          return;
        }

        // Create new profile
        if (!data.name) {
          setError("Please enter your name");
          setIsLoading(false);
          return;
        }

        console.log("Creating profile...");

        const userId = crypto.randomUUID();

        console.log("Creating profile via API with data:", {
          id: userId,
          contact_number: data.phone,
          profile_type: role,
          name: data.name,
        });

        const createResponse = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            contact_number: data.phone,
            profile_type: role,
            name: data.name,
          }),
        });

        const createResult = await createResponse.json();

        console.log("Insert result:", createResult);

        if (!createResponse.ok) {
          console.error("Profile creation failed:", createResult.error);
          throw new Error(createResult.error || 'Failed to create profile');
        }

        const newProfile = createResult.profile;
        console.log("Profile created successfully:", newProfile);

        // If admin, create a venue for them
        if (role === "admin") {
          try {
            await fetch('/api/venue/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminId: userId }),
            });
          } catch (venueError) {
            console.error('Error creating venue:', venueError);
            // Continue even if venue creation fails
          }
        }

        // Login with new profile
        setProfile(newProfile);
        const redirectPath = role === "admin" ? "/admin" : "/players";
        window.location.href = redirectPath;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to process login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {role === "admin" ? "Admin Portal" : "Player Portal"}
          </CardTitle>
          <CardDescription>
            Enter your phone number to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        type="tel"
                        maxLength={10}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showNameField && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : showNameField ? "Create Account" : "Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
