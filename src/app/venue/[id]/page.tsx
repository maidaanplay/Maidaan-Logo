"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ShareIcon from '@mui/icons-material/Share';
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { VenueHeader } from "@/components/venue/venue-header";
import { VenueDescription } from "@/components/venue/venue-description";
import { VenueOperatingHours } from "@/components/venue/venue-operating-hours";
import { VenueAmenities } from "@/components/venue/venue-amenities";
import { VenueCourtsList } from "@/components/venue/venue-courts-list";
import { VenueShareSheet } from "@/components/venue/venue-share-sheet";
import AppFooter from "@/components/layout/app-footer";
import { PublicHeader } from "@/components/layout/public-header";

interface Venue {
  id: string;
  name: string;
  location: string;
  description: string;
  rating?: number;
  operating_hours: {
    opening_time: string;
    closing_time: string;
  };
  amenities: string[];
  courts: Array<{
    id: string;
    name: string;
    icon: string;
    sport_type: string;
  }>;
}

export default function PublicVenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const loadVenue = async () => {
      try {
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("*")
          .eq("id", id)
          .single();

        if (venueError) throw venueError;

        const { data: courtsData, error: courtsError } = await supabase
          .from("courts")
          .select("id, name, icon, sport_type")
          .eq("venue_id", id);

        if (courtsError) throw courtsError;

        setVenue({ ...venueData, courts: courtsData || [] });
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading venue:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      loadVenue();
    }
  }, [id]);

  const handleBookNow = () => {
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
          <div className="text-lg font-medium">Loading venue details...</div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Venue not found</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6 pb-32">
        {/* Venue Header */}
        <VenueHeader
          name={venue.name}
          location={venue.location}
          rating={venue.rating}
        />

        {/* Description */}
        <VenueDescription description={venue.description} />

        {/* Operating Hours */}
        <VenueOperatingHours
          openingTime={venue.operating_hours.opening_time}
          closingTime={venue.operating_hours.closing_time}
        />

        {/* Amenities */}
        <VenueAmenities amenities={venue.amenities || []} />

        {/* Courts */}
        <VenueCourtsList courts={venue.courts || []} />
      </main>

      {/* Share Sheet */}
      <VenueShareSheet
        isOpen={shareSheetOpen}
        onOpenChange={setShareSheetOpen}
        shareUrl={shareUrl}
      />

      {/* Fixed Footer with Book Now Button */}
      <AppFooter>
        <div className="flex gap-3">
          <Button
            onClick={handleBookNow}
            size="lg"
            className="flex-1 h-12"
          >
            Book Now
          </Button>
          <Button
            onClick={() => setShareSheetOpen(true)}
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0"
          >
            <ShareIcon sx={{ fontSize: 20 }} />
          </Button>
        </div>
      </AppFooter>
    </div>
  );
}
