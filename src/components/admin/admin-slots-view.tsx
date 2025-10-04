"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TimeSlots from "@/components/time-slots";
import StatsCards from "@/components/stats-cards";
import DateSelector from "@/components/date-selector";
import CourtSelector from "@/components/court-selector";
import AppFooter from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import { formatDate, formatTimeRange } from "@/lib/time";

interface AdminSlotsViewProps {
  showDateSelector?: boolean;
  enableSelection?: boolean;
}

export function AdminSlotsView({ showDateSelector = true, enableSelection = false }: AdminSlotsViewProps) {
  const router = useRouter();
  const { profile, isLoading: profileLoading, loadCurrentUser } = useProfileStore();
  const { selectedVenue, loadAdminVenue } = useVenueStore();

  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  // Load current user on mount
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Load admin's venue when profile loads
  useEffect(() => {
    const loadVenue = async () => {
      if (profile && profile.profile_type === 'admin') {
        const venue = await loadAdminVenue(profile.id);

        // If no venue exists, create one
        if (!venue) {
          try {
            const response = await fetch('/api/venue/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminId: profile.id }),
            });

            if (response.ok) {
              const result = await response.json();
              // Reload the venue
              await loadAdminVenue(profile.id);
            }
          } catch (error) {
            console.error('Error creating venue:', error);
          }
        }
      }
    };

    loadVenue();
  }, [profile, loadAdminVenue]);

  // Set default court when venue loads
  useEffect(() => {
    if (selectedVenue?.courts?.[0] && !selectedCourt) {
      setSelectedCourt(selectedVenue.courts[0].id);
    }
  }, [selectedVenue, selectedCourt]);

  // Use booking slots hook
  const {
    timeSlots,
    allTimeSlots,
    isSlotBooked,
    isSlotDisabled,
    getMatchForSlot,
    matches,
    isLoading: slotsLoading,
  } = useBookingSlots({
    venue: selectedVenue!,
    courtId: selectedCourt,
    selectedDate,
  });

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMatches = matches.filter(m => m.date === today && m.payment_status === 'paid');

    return [
      { label: "Bookings", value: todayMatches.length },
      { label: "Revenue", value: `₹${todayMatches.reduce((sum, m) => sum + m.price, 0).toLocaleString()}` },
    ];
  }, [matches]);

  // Prepare courts for selector
  const courts = useMemo(() => {
    if (!selectedVenue?.courts) return [];

    return selectedVenue.courts.map(court => ({
      id: court.id,
      name: `${court.icon || ''} ${court.name}`,
    }));
  }, [selectedVenue]);

  // Handle time slot click
  const handleTimeClick = (time: string) => {
    const match = getMatchForSlot(time);
    const isPast = isSlotDisabled(time);
    const isBooked = isSlotBooked(time);

    // If selection is enabled (matches page)
    if (enableSelection && !isPast && !isBooked) {
      handleTimeSelection(time);
      return;
    }

    // If not in selection mode, navigate
    if (match) {
      // Navigate to match details if there's a booking
      router.push(`/admin/match/${match.id}`);
    } else if (!isPast) {
      // Navigate to booking page only for future unbooked slots
      router.push(`/admin/play/${selectedVenue?.id}?court=${selectedCourt}&date=${selectedDate.toISOString()}&time=${time}`);
    }
    // Do nothing for past unbooked slots
  };

  // Handle time slot selection with contiguous validation
  const handleTimeSelection = (time: string) => {
    if (selectedTimes.includes(time)) {
      // Deselect
      setSelectedTimes(selectedTimes.filter(t => t !== time));
      return;
    }

    // Add to selection
    const newSelection = [...selectedTimes, time].sort();

    // Validate contiguous selection
    if (!areTimeSlotsContiguous(newSelection)) {
      alert("Please select contiguous time slots only");
      return;
    }

    setSelectedTimes(newSelection);
  };

  // Check if time slots are contiguous
  const areTimeSlotsContiguous = (times: string[]): boolean => {
    if (times.length <= 1) return true;

    // Get all time slots in order
    const allSlots = [...allTimeSlots].sort();
    const indices = times.map(t => allSlots.indexOf(t));

    // Check if indices are consecutive
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        return false;
      }
    }

    return true;
  };

  // Handle booking
  const handleBooking = () => {
    if (selectedTimes.length === 0) return;

    router.push(
      `/admin/play/${selectedVenue?.id}?court=${selectedCourt}&date=${selectedDate.toISOString()}&time=${selectedTimes.join(',')}`
    );
  };

  // Redirect if not admin
  useEffect(() => {
    if (!profileLoading && (!profile || profile.profile_type !== 'admin')) {
      router.push('/login?role=admin');
    }
  }, [profile, profileLoading, router]);

  if (profileLoading) {
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
            <div className="text-lg font-medium">Loading admin dashboard...</div>
            <div className="text-sm text-gray-500">Checking authentication</div>
          </div>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="text-center space-y-6 max-w-md">
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
            <div className="text-lg font-medium">No authenticated user</div>
            <div className="text-sm text-gray-500">
              Please set up authentication or add test data to your Supabase database.
              <br /><br />
              See SETUP.md for instructions on running the schema and adding sample data.
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!selectedVenue || slotsLoading) {
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
            <div className="text-lg font-medium">Loading venue data...</div>
            <div className="text-sm text-gray-500">
              {!selectedVenue ? 'Fetching your venue' : 'Loading available slots'}
            </div>
          </div>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-6 py-6 ${enableSelection && selectedTimes.length > 0 ? 'pb-44' : ''}`}>
        <CourtSelector courts={courts} value={selectedCourt} onChange={setSelectedCourt} />

        <StatsCards stats={todayStats} />

        {showDateSelector && (
          <DateSelector
            date={formatDate(selectedDate)}
            onPrevious={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
            onNext={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
          />
        )}

        <TimeSlots
          timeSlots={timeSlots}
          isBooked={isSlotBooked}
          isDisabled={isSlotDisabled}
          onTimeClick={handleTimeClick}
          selectedTimes={selectedTimes}
        />
      </div>

      {/* Book Now Footer - shows when slots are selected */}
      {enableSelection && selectedTimes.length > 0 && (
        <AppFooter className="z-[60]">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Selected Slots</p>
                <p className="font-semibold">{formatTimeRange(selectedTimes)}</p>
              </div>
              <Button
                onClick={() => setSelectedTimes([])}
                variant="outline"
                size="sm"
                className="border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Clear
              </Button>
            </div>
            <Button
              onClick={handleBooking}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 dark:border-blue-600 shadow-lg"
              disabled={selectedTimes.length === 0}
            >
              Book Now ({selectedTimes.length} slot{selectedTimes.length > 1 ? 's' : ''})
            </Button>
          </div>
        </AppFooter>
      )}
    </>
  );
}
