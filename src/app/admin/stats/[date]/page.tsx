"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import TimeSlots from "@/components/time-slots";
import PageHeader from "@/components/page-header";
import StatsCards from "@/components/stats-cards";
import DateSelector from "@/components/date-selector";
import CourtSelector from "@/components/court-selector";

// Mock data for time slots
const timeSlots = {
  Morning: ["06:00-07:00", "07:00-08:00", "08:00-09:00"],
  Afternoon: ["12:00-13:00", "13:00-14:00", "14:00-15:00"],
  Evening: ["17:00-18:00", "18:00-19:00", "19:00-20:00"],
};

const bookedSlots = ["07:00-08:00", "17:00-18:00"];

// Mock data for courts with sports
const courts = [
  { id: "basketball-court-1", name: "🏀 Basketball - Court 1", sport: "basketball" },
  { id: "basketball-court-2", name: "🏀 Basketball - Court 2", sport: "basketball" },
  { id: "volleyball-court-1", name: "🏐 Volleyball - Court 1", sport: "volleyball" },
  { id: "badminton-court-1", name: "🏸 Badminton - Court 1", sport: "badminton" },
  { id: "badminton-court-2", name: "🏸 Badminton - Court 2", sport: "badminton" },
  { id: "football-field-1", name: "⚽ Football - Field 1", sport: "football" },
];

export default function DailySummaryPage() {
  const params = useParams();
  const date = decodeURIComponent(params.date as string);

  const [selectedCourt, setSelectedCourt] = useState("basketball-court-1");

  const isBooked = (time: string) => bookedSlots.includes(time);
  const isDisabled = (time: string) => false; // Admin can interact with all slots

  const handleTimeClick = (time: string) => {
    if (isBooked(time)) {
      console.log("Navigate to match details for", time);
      // TODO: Navigate to match detail page
    } else {
      console.log("View booking details for", time);
      // TODO: Show booking details
    }
  };

  const stats = [
    { label: "Bookings", value: 2 },
    { label: "Revenue", value: "₹2,500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-6">
      <PageHeader title="Daily Summary" showBackButton />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <CourtSelector courts={courts} value={selectedCourt} onChange={setSelectedCourt} />

        <StatsCards stats={stats} />

        <DateSelector date={date} />

        <TimeSlots
          timeSlots={timeSlots}
          isBooked={isBooked}
          isDisabled={isDisabled}
          onTimeClick={handleTimeClick}
        />
      </div>
    </div>
  );
}
