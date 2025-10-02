import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Venue, Match } from '@/lib/data';
import { generateTimeSlots, categorizeTimeSlots, isPastTime } from '@/lib/time';

interface UseBookingSlotsProps {
  venue: Venue;
  courtId: string;
  selectedDate: Date;
}

export function useBookingSlots({ venue, courtId, selectedDate }: UseBookingSlotsProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch matches for the venue, court, and date
  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);

      try {
        const dateString = selectedDate.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('venue_id', venue.id)
          .eq('court_id', courtId)
          .eq('date', dateString)
          .neq('is_cancelled', true);

        if (error) throw error;

        setMatches(data || []);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (venue && courtId) {
      fetchMatches();
    }
  }, [venue, courtId, selectedDate]);

  // Generate all possible time slots
  const allTimeSlots = useMemo(() => {
    if (!venue) return [];
    return generateTimeSlots(venue);
  }, [venue]);

  // Categorize slots into Morning/Afternoon/Evening
  const categorizedSlots = useMemo(() => {
    if (!venue || allTimeSlots.length === 0) {
      return { Morning: [], Afternoon: [], Evening: [] };
    }
    return categorizeTimeSlots(allTimeSlots);
  }, [venue, allTimeSlots]);

  // Check if a specific time slot is booked
  const isSlotBooked = useCallback(
    (timeSlot: string): boolean => {
      return matches.some(match =>
        match.time_slots.includes(timeSlot) &&
        match.payment_status !== 'cancelled'
      );
    },
    [matches]
  );

  // Check if a slot is disabled (past time)
  const isSlotDisabled = useCallback(
    (timeSlot: string): boolean => {
      return isPastTime(selectedDate, timeSlot);
    },
    [selectedDate]
  );

  // Get match for a specific time slot
  const getMatchForSlot = useCallback(
    (timeSlot: string): Match | undefined => {
      return matches.find(match =>
        match.time_slots.includes(timeSlot) &&
        match.payment_status !== 'cancelled'
      );
    },
    [matches]
  );

  return {
    timeSlots: categorizedSlots,
    allTimeSlots,
    isSlotBooked,
    isSlotDisabled,
    getMatchForSlot,
    matches,
    isLoading,
  };
}
