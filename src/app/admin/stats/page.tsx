"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import DailySummaryCard from "@/components/daily-summary-card";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";
import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/data";

interface DailySummary {
  date: string;
  dateString: string;
  bookingCount: number;
  revenue: number;
}

export default function StatsPage() {
  const router = useRouter();
  const { profile, loadCurrentUser } = useProfileStore();
  const { selectedVenue, loadAdminVenue } = useVenueStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile and venue
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (profile && profile.profile_type === 'admin') {
      loadAdminVenue(profile.id);
    }
  }, [profile, loadAdminVenue]);

  // Fetch all matches for the venue (last 30 days)
  useEffect(() => {
    const fetchMatches = async () => {
      if (!selectedVenue) return;

      setIsLoading(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('venue_id', selectedVenue.id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .eq('payment_status', 'paid')
          .order('date', { ascending: false });

        if (error) throw error;
        setMatches(data || []);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [selectedVenue]);

  // Group matches by date and calculate daily summaries
  const dailySummaries = useMemo(() => {
    const summaryMap = new Map<string, DailySummary>();

    matches.forEach(match => {
      const date = new Date(match.date);
      const dateKey = match.date;

      // Format: "27 Sep Saturday"
      const dateString = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        weekday: 'long'
      });

      if (summaryMap.has(dateKey)) {
        const summary = summaryMap.get(dateKey)!;
        summary.bookingCount += 1;
        summary.revenue += match.price;
      } else {
        summaryMap.set(dateKey, {
          date: dateKey,
          dateString,
          bookingCount: 1,
          revenue: match.price,
        });
      }
    });

    // Convert to array and sort by date (newest first)
    return Array.from(summaryMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7); // Show last 7 days
  }, [matches]);


  const handleDailySummaryClick = (date: string) => {
    router.push(`/admin/stats/${encodeURIComponent(date)}`);
  };

  // Calculate overall stats
  const totalBookings = dailySummaries.reduce((sum, day) => sum + day.bookingCount, 0);
  const totalRevenue = dailySummaries.reduce((sum, day) => sum + day.revenue, 0);

  const stats = [
    { label: "Total Bookings", value: totalBookings },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
  ];

  if (isLoading || !selectedVenue) {
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
            <div className="text-lg font-medium">Loading statistics...</div>
            <div className="text-sm text-gray-500">Fetching booking data</div>
          </div>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6 py-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Statistics
          </h2>
          <p className="text-sm text-muted-foreground">
            Overview of bookings and revenue (Last 7 days)
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 p-4 rounded-lg border"
            >
              <div className="flex items-center gap-2 mb-2">
                {index % 2 === 0 ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                )}
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Daily Summaries */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Daily Breakdown</h3>
          {dailySummaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No bookings in the last 7 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailySummaries.map((summary, index) => (
                <DailySummaryCard
                  key={index}
                  date={summary.dateString}
                  bookingCount={summary.bookingCount}
                  revenue={summary.revenue}
                  onClick={() => handleDailySummaryClick(summary.date)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
