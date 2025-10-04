"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileStore } from "@/lib/stores/profile";
import { supabase } from "@/lib/supabase";
import { formatTimeRange } from "@/lib/time";

interface Match {
  id: string;
  venue_id: string;
  court_id: string;
  booker_name: string;
  date: string;
  time_slots: string[];
  sport_type: string;
  match_status: 'upcoming' | 'played';
  price: number;
  payment_status: 'pending' | 'paid';
  is_cancelled: boolean;
  venue?: {
    name: string;
    location: string;
  };
  court?: {
    name: string;
    icon: string;
  };
}

export default function PlayPage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all matches where the player is the host
        const { data: matchData, error } = await supabase
          .from("matches")
          .select(`
            *,
            venue:venues(name, location),
            court:courts(name, icon)
          `)
          .eq("host_player_id", profile.id)
          .order("date", { ascending: false })
          .order("time_slots", { ascending: false });

        if (error) throw error;

        setMatches(matchData || []);
      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [profile]);

  const upcomingMatches = matches.filter(
    (m) => m.match_status === 'upcoming' && !m.is_cancelled
  );

  const playedMatches = matches.filter(
    (m) => m.match_status === 'played'
  );

  const cancelledMatches = matches.filter(
    (m) => m.is_cancelled
  );

  const handleMatchClick = (matchId: string) => {
    router.push(`/players/match/${matchId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
            <div className="text-lg font-medium">Loading your matches...</div>
            <div className="text-sm text-gray-500">Please wait</div>
          </div>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const MatchCard = ({ match }: { match: Match }) => {
    const matchDate = new Date(match.date);

    return (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
        onClick={() => handleMatchClick(match.id)}
      >
        <div className="flex gap-4 p-4">
          {/* Venue Image - Placeholder with icon */}
          <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {match.court?.icon ? (
              <span className="text-4xl">{match.court.icon}</span>
            ) : (
              <Image
                src="/maidaan_black.png"
                alt="Venue"
                width={80}
                height={80}
                className="object-cover dark:hidden"
              />
            )}
          </div>

          {/* Match Details */}
          <div className="flex-1 space-y-1">
            {/* Sport Icon and Name */}
            <div className="flex items-center gap-2">
              {match.court?.icon && <span className="text-xl">{match.court.icon}</span>}
              <span className="font-semibold uppercase text-sm text-primary capitalize">
                {match.sport_type}
              </span>
            </div>

            {/* Date & Time */}
            <div className="text-sm text-muted-foreground">
              {matchDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: '2-digit',
                weekday: 'short'
              })} {formatTimeRange(match.time_slots)}
            </div>

            {/* Venue Name - Most Prominent */}
            <div className="font-bold text-lg pt-1">
              {match.venue?.name}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 space-y-4">
      <div className="relative w-32 h-32 mx-auto opacity-20">
        <Image
          src="/maidaan_black.png"
          alt="No matches"
          fill
          className="object-contain dark:hidden"
        />
        <Image
          src="/maidaan_white.png"
          alt="No matches"
          fill
          className="object-contain hidden dark:block"
        />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            My Matches {upcomingMatches.length > 0 && `(${upcomingMatches.length})`}
          </TabsTrigger>
          <TabsTrigger value="played">
            Open {playedMatches.length > 0 && `(${playedMatches.length})`}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Challenges {cancelledMatches.length > 0 && `(${cancelledMatches.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <EmptyState message="No matches yet. Book a venue to get started!" />
          )}
        </TabsContent>

        <TabsContent value="played" className="space-y-4 mt-4">
          {playedMatches.length > 0 ? (
            playedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <EmptyState message="No open matches yet." />
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4 mt-4">
          {cancelledMatches.length > 0 ? (
            cancelledMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <EmptyState message="No challenges yet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
