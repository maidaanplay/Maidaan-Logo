"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import CourtSelector from "@/components/court-selector";
import DateSelector from "@/components/date-selector";
import TimeSlots from "@/components/time-slots";
import { useVenueStore } from "@/lib/stores/venue";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import { formatDate } from "@/lib/time";

export default function PlayerBookSlotPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedVenue, loadVenueById } = useVenueStore();

  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load venue
  useEffect(() => {
    if (venueId && (!selectedVenue || selectedVenue.id !== venueId)) {
      loadVenueById(venueId);
    }
  }, [venueId, selectedVenue, loadVenueById]);

  // Set default court when venue loads
  useEffect(() => {
    if (selectedVenue?.courts?.[0] && !selectedCourt) {
      setSelectedCourt(selectedVenue.courts[0].id);
    }
  }, [selectedVenue, selectedCourt]);

  // Use booking slots hook
  const {
    timeSlots,
    isSlotBooked,
    isSlotDisabled,
    getMatchForSlot,
    isLoading: slotsLoading,
  } = useBookingSlots({
    venue: selectedVenue!,
    courtId: selectedCourt,
    selectedDate,
  });

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

    if (!match) {
      // Navigate to booking form
      router.push(`/players/venues/${venueId}/book/new?court=${selectedCourt}&date=${selectedDate.toISOString()}&time=${time}`);
    }
  };

  if (!selectedVenue || slotsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading available slots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <CourtSelector courts={courts} value={selectedCourt} onChange={setSelectedCourt} />

      <DateSelector
        date={formatDate(selectedDate)}
        onPrevious={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
        onNext={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
      />

      <TimeSlots
        timeSlots={timeSlots}
        isBooked={isSlotBooked}
        isDisabled={isSlotDisabled}
        onTimeClick={handleTimeClick}
      />
    </div>
  );
}
