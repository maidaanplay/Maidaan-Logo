"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push("/admin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <CheckCircle className="h-24 w-24 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            The slot has been successfully booked.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Redirecting to home in 3 seconds...
          </p>
          <Button
            onClick={() => router.push("/admin")}
            size="lg"
            className="w-full"
          >
            Go to Home Now
          </Button>
        </div>
      </div>
    </div>
  );
}
