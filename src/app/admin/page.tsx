"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Home, Calendar, BarChart3 } from "lucide-react";
import TimeSlots from "@/components/time-slots";
import VenueHeader from "@/components/venue-header";
import StatsCards from "@/components/stats-cards";
import DateSelector from "@/components/date-selector";
import BottomNav from "@/components/bottom-nav";
import CourtSelector from "@/components/court-selector";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";
import { useBookingSlots } from "@/hooks/use-booking-slots";
import { formatDate } from "@/lib/time";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "book", label: "Book", icon: Calendar },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

export default function AdminPage() {
  const router = useRouter();
  const { profile, isLoading: profileLoading, loadCurrentUser } = useProfileStore();
  const { selectedVenue, loadAdminVenue } = useVenueStore();

  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("home");

  // Load current user on mount
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Load admin's venue when profile loads
  useEffect(() => {
    if (profile && profile.profile_type === 'admin') {
      loadAdminVenue(profile.id);
    }
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

    if (match) {
      router.push(`/admin/match/${match.id}`);
    } else {
      // Navigate to booking page
      router.push(`/admin/play/${selectedVenue?.id}?court=${selectedCourt}&date=${selectedDate.toISOString()}&time=${time}`);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "stats") {
      router.push("/admin/stats");
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <VenueHeader venueName={selectedVenue.name} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <CourtSelector courts={courts} value={selectedCourt} onChange={setSelectedCourt} />

        <StatsCards stats={todayStats} />

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

      <BottomNav items={navItems} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
