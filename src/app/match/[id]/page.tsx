"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ShareIcon from '@mui/icons-material/Share';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { MatchVenueInfo } from "@/components/match/match-venue-info";
import { MatchCourtDateTime } from "@/components/match/match-court-datetime";
import { MatchShareSheet } from "@/components/match/match-share-sheet";
import AppFooter from "@/components/layout/app-footer";
import { PublicHeader } from "@/components/layout/public-header";

interface Match {
  id: string;
  venue_id: string;
  court_id: string;
  booker_name: string;
  date: string;
  time_slots: string[];
  sport_type: string;
  match_type: string;
  match_status: 'upcoming' | 'played';
  is_recurring: boolean;
  is_cancelled: boolean;
  players_list: any[];
}

interface Court {
  id: string;
  name: string;
  icon: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
}

export default function PublicMatchDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const loadMatchDetails = async () => {
      try {
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .eq("id", id)
          .single();

        if (matchError) throw matchError;
        setMatch(matchData);

        const { data: courtData, error: courtError } = await supabase
          .from("courts")
          .select("id, name, icon")
          .eq("id", matchData.court_id)
          .single();

        if (courtError) throw courtError;
        setCourt(courtData);

        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("id, name, location")
          .eq("id", matchData.venue_id)
          .single();

        if (venueError) throw venueError;
        setVenue(venueData);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading match details:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      loadMatchDetails();
    }
  }, [id]);

  const handleShare = () => {
    setShareSheetOpen(true);
  };

  const handleJoin = () => {
    router.push("/login");
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
          <div className="text-lg font-medium">Loading match details...</div>
        </div>
      </div>
    );
  }

  if (!match || !court || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Match not found</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const matchDate = new Date(match.date);

  const footerButtons = (
    <div className="flex gap-3">
      <Button onClick={handleJoin} className="flex-1 h-12 bg-primary">
        Join Match
      </Button>
      <Button onClick={handleShare} variant="outline" className="flex-1 h-12">
        <ShareIcon sx={{ fontSize: 20 }} className="mr-2" />
        Share
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6 pb-32">
        {/* Venue Name */}
        <MatchVenueInfo venueName={venue.name} venueLocation={venue.location} />

        {/* Court, Sport, Date & Time */}
        <MatchCourtDateTime
          court={court}
          sportType={match.sport_type}
          date={matchDate}
          timeSlots={match.time_slots}
          isRecurring={match.is_recurring}
        />

        {/* Match Type */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Match Type</p>
                <p className="font-semibold text-lg capitalize">{match.match_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold">Join the Match!</h3>
              <p className="text-muted-foreground">
                Download the Maidaan app to join this match and find more games near you.
              </p>
              <Button onClick={handleJoin} className="w-full h-12 mt-2">
                Get the App
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Share Sheet */}
      <MatchShareSheet
        isOpen={shareSheetOpen}
        onOpenChange={setShareSheetOpen}
        shareUrl={shareUrl}
      />

      {/* Fixed Footer */}
      <AppFooter>
        {footerButtons}
      </AppFooter>
    </div>
  );
}
