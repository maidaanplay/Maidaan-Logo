"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";
import { supabase } from "@/lib/supabase";
import { formatTimeRange, calculatePrice } from "@/lib/time";
import AppFooter from "@/components/layout/app-footer";

const bookingFormSchema = z.object({
  bookerName: z.string().min(1, "Name is required"),
  bookerContact: z
    .string()
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
  price: z.coerce.number().min(0, "Price must be positive"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function AdminBookingPage() {
  const router = useRouter();
  const { id: venueId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { profile } = useProfileStore();
  const { selectedVenue, loadVenueById } = useVenueStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);

  const courtId = searchParams.get("court");
  const dateString = searchParams.get("date");
  const timeSlot = searchParams.get("time");

  // Load venue if not already loaded
  useEffect(() => {
    if (venueId && (!selectedVenue || selectedVenue.id !== venueId)) {
      loadVenueById(venueId);
    }
  }, [venueId, selectedVenue, loadVenueById]);

  // Find selected court
  useEffect(() => {
    if (selectedVenue && courtId) {
      const court = selectedVenue.courts?.find((c) => c.id === courtId);
      setSelectedCourt(court);
    }
  }, [selectedVenue, courtId]);

  // Calculate initial price
  const calculatedPrice = useMemo(() => {
    if (!selectedVenue || !dateString || !timeSlot) return 0;
    const date = new Date(dateString);
    return calculatePrice(selectedVenue, [timeSlot], date);
  }, [selectedVenue, dateString, timeSlot]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      bookerName: "",
      bookerContact: "",
      price: calculatedPrice,
    },
  });

  // Update price when calculated price changes
  useEffect(() => {
    if (calculatedPrice > 0) {
      form.setValue("price", calculatedPrice);
    }
  }, [calculatedPrice, form]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!profile || !selectedVenue || !selectedCourt || !dateString || !timeSlot) {
      return;
    }

    setIsSubmitting(true);

    try {
      const date = new Date(dateString).toISOString().split('T')[0];

      const { error } = await supabase.from("matches").insert({
        venue_id: selectedVenue.id,
        court_id: selectedCourt.id,
        host_player_id: profile.id,
        booker_name: data.bookerName,
        booker_contact: data.bookerContact,
        date: date,
        time_slots: [timeSlot],
        sport_type: selectedCourt.sport_type,
        match_type: 'casual',
        match_status: 'upcoming',
        price: data.price,
        payment_status: 'paid',
        payment_method: 'cash',
      });

      if (error) throw error;

      // Success - redirect back to admin dashboard
      router.push("/admin");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedVenue || !selectedCourt || !dateString || !timeSlot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-6">
          <div className="relative w-48 h-20 mx-auto">
            <Image
              src="/maidaan_black.png"
              alt="Maidaan Logo"
              fill
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/maidaan_white.png"
              alt="Maidaan Logo"
              fill
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium">Loading booking details...</div>
            <div className="text-sm text-gray-500">Please wait</div>
          </div>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const selectedDate = new Date(dateString);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-44">
      {/* Header */}
      <header className="p-4 bg-white dark:bg-gray-900 sticky top-0 z-10 border-b">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowBackIcon sx={{ fontSize: 24 }} />
          </Button>
          <h1 className="text-xl font-bold">New Booking</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-4 space-y-6">
                {/* Booking Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedVenue.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        <span className="text-2xl">{selectedCourt.icon}</span>
                      </div>
                      <p className="font-medium">{selectedCourt.name}</p>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        <CalendarTodayIcon sx={{ fontSize: 24 }} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="font-medium">
                        {selectedDate.toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          weekday: 'short'
                        })}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        <AccessTimeIcon sx={{ fontSize: 24 }} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="font-medium tracking-wider">
                        {formatTimeRange([timeSlot])}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Booker Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Booker Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bookerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <PersonIcon sx={{ fontSize: 20 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                placeholder="e.g. John Doe"
                                className="pl-10 h-12"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bookerContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <PhoneIcon sx={{ fontSize: 20 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                placeholder="e.g. 9876543210"
                                type="tel"
                                className="pl-10 h-12"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AttachMoneyIcon sx={{ fontSize: 20 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="number"
                                placeholder="e.g. 1000"
                                className="pl-10 h-12"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Total</p>
              <p className="text-xl font-bold">
                ₹{form.watch("price")?.toLocaleString() || 0}
              </p>
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              size="lg"
              className="w-full h-12 text-lg font-bold"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? "Creating Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
