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
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [role, setRole] = useState<"admin" | "player">("player");
  const [showNameField, setShowNameField] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "admin" || roleParam === "player") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", name: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check if user profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', data.email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (existingProfile) {
        // Profile exists - check role match
        if (existingProfile.profile_type !== role) {
          setError(
            `This email is registered as a ${existingProfile.profile_type}. Please use the ${existingProfile.profile_type} login.`
          );
          setIsLoading(false);
          return;
        }

        // Send magic link
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
          },
        });

        if (signInError) throw signInError;

        setSuccess("Check your email for the magic link to sign in!");
      } else {
        // New user - need name
        if (!showNameField && !data.name) {
          setShowNameField(true);
          setIsLoading(false);
          return;
        }

        if (!data.name) {
          setError("Please enter your name");
          setIsLoading(false);
          return;
        }

        // Send magic link with user metadata
        const { error: signUpError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}&name=${encodeURIComponent(data.name)}`,
            data: {
              name: data.name,
              profile_type: role,
            }
          },
        });

        if (signUpError) throw signUpError;

        setSuccess("Check your email for the magic link to complete signup!");
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
            Enter your email to continue
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

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                  {success}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        {...field}
                        disabled={isLoading || !!success}
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
                          disabled={isLoading || !!success}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !!success}>
                {isLoading ? "Processing..." : success ? "Email Sent!" : showNameField ? "Create Account" : "Continue"}
              </Button>

              {success && (
                <p className="text-xs text-center text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              )}
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
