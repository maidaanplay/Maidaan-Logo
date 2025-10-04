"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
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
  price: z.number().min(0, "Price must be positive"),
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
  const timeParam = searchParams.get("time");

  // Parse time slots - can be comma-separated for multiple slots
  const timeSlots = useMemo(() => {
    if (!timeParam) return [];
    return timeParam.split(',').map(t => t.trim());
  }, [timeParam]);

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
    if (!selectedVenue || !dateString || timeSlots.length === 0) return 0;
    const date = new Date(dateString);
    return calculatePrice(selectedVenue, timeSlots, date);
  }, [selectedVenue, dateString, timeSlots]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onChange", // Validate on every change
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
    if (!profile || !selectedVenue || !selectedCourt || !dateString || timeSlots.length === 0) {
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
        time_slots: timeSlots,
        sport_type: selectedCourt.sport_type,
        match_type: 'casual',
        match_status: 'upcoming',
        price: data.price,
        payment_status: 'pending',
      });

      if (error) throw error;

      // Success - redirect to success page
      router.push("/admin/booking-success");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!selectedVenue || !selectedCourt || !dateString || timeSlots.length === 0) {
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
    <div className="py-6 pb-44 space-y-6">
        <h2 className="text-2xl font-bold">
          Confirm Booking
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
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
                        {formatTimeRange(timeSlots)}
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
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>

      {/* Fixed Footer */}
      <AppFooter>
        <div className="flex flex-col gap-3 w-full">
          <div className="w-full flex justify-between items-center gap-4">
            <p className="text-muted-foreground font-medium whitespace-nowrap">Total Amount</p>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">₹</span>
              <Input
                type="number"
                value={form.watch("price") || 0}
                onChange={(e) => form.setValue("price", parseFloat(e.target.value) || 0)}
                className="w-20 h-9 text-center text-lg font-bold text-primary border-2 border-primary/30 focus:border-primary px-1"
              />
            </div>
          </div>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 dark:border-blue-600 shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!form.formState.isValid || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Booking...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </AppFooter>
    </div>
  );
}
