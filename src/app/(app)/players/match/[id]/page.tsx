"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ShareIcon from '@mui/icons-material/Share';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/lib/stores/profile";
import { MatchVenueInfo } from "@/components/match/match-venue-info";
import { MatchCourtDateTime } from "@/components/match/match-court-datetime";
import { MatchPlayersList } from "@/components/match/match-players-list";
import { MatchPayment } from "@/components/match/match-payment";
import { MatchShareSheet } from "@/components/match/match-share-sheet";
import AppFooter from "@/components/layout/app-footer";

interface Match {
  id: string;
  venue_id: string;
  court_id: string;
  host_player_id: string;
  booker_name: string;
  booker_contact: string;
  date: string;
  time_slots: string[];
  sport_type: string;
  match_type: string;
  match_status: 'upcoming' | 'played';
  price: number;
  payment_status: 'pending' | 'paid';
  is_recurring: boolean;
  recurring_config: any;
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
  owner_admin_id: string;
}

export default function PlayerMatchDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { profile } = useProfileStore();
  const [match, setMatch] = useState<Match | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const isMatchOwner = profile?.id === match?.host_player_id;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/match/${id}` : '';

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

        const { data: venueData, error: venueError} = await supabase
          .from("venues")
          .select("id, name, location, owner_admin_id")
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

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const { error } = await supabase
        .from("matches")
        .update({ is_cancelled: true })
        .eq("id", match!.id);

      if (error) throw error;

      setMatch({ ...match!, is_cancelled: true });
      alert("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling:", error);
      alert("Failed to cancel booking");
    }
  };

  const handleShare = () => {
    setShareSheetOpen(true);
  };

  const handleJoin = () => {
    // TODO: Implement join workflow
    alert("Join functionality coming soon!");
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
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const matchDate = new Date(match.date);
  const isAdminOwned = venue.owner_admin_id === match.host_player_id;

  const footerButtons = (
    <div className="flex gap-3">
      {!match.is_cancelled && (
        <>
          {isMatchOwner ? (
            <>
              <Button
                onClick={handleCancel}
                variant="destructive"
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 h-12"
              >
                <ShareIcon sx={{ fontSize: 20 }} className="mr-2" />
                Share
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleJoin}
                className="flex-1 h-12 bg-primary"
              >
                Join Match
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 h-12"
              >
                <ShareIcon sx={{ fontSize: 20 }} className="mr-2" />
                Share
              </Button>
            </>
          )}
        </>
      )}
      {match.is_cancelled && (
        <div className="w-full text-center py-2">
          <p className="text-destructive font-semibold">This match has been cancelled</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-32 space-y-6">
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

      {/* Booker Info */}
      <Card>
        <CardHeader>
          <CardTitle>Booked By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              <PersonIcon sx={{ fontSize: 24 }} />
            </div>
            <p className="font-medium">{match.booker_name}</p>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              <PhoneIcon sx={{ fontSize: 24 }} />
            </div>
            <p className="font-medium">{match.booker_contact}</p>
          </div>
        </CardContent>
      </Card>

      {/* Players Section - Only show if not admin-owned */}
      {!isAdminOwned && (
        <MatchPlayersList
          bookerName={match.booker_name}
          playersList={match.players_list || []}
        />
      )}

      {/* Payment */}
      <MatchPayment price={match.price} paymentStatus={match.payment_status} />

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
