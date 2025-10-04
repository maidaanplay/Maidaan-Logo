"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ShareIcon from '@mui/icons-material/Share';
import { Button } from "@/components/ui/button";
import { useVenueStore } from "@/lib/stores/venue";
import { VenueHeader } from "@/components/venue/venue-header";
import { VenueDescription } from "@/components/venue/venue-description";
import { VenueOperatingHours } from "@/components/venue/venue-operating-hours";
import { VenueAmenities } from "@/components/venue/venue-amenities";
import { VenueCourtsList } from "@/components/venue/venue-courts-list";
import { VenueShareSheet } from "@/components/venue/venue-share-sheet";
import AppFooter from "@/components/layout/app-footer";

export default function PlayerVenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedVenue, loadVenueById } = useVenueStore();
  const [isLoading, setIsLoading] = useState(true);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/venue/${id}` : '';

  useEffect(() => {
    const loadVenue = async () => {
      if (id) {
        const venue = await loadVenueById(id);
        if (venue) {
          // Manually set the selected venue since loadVenueById doesn't do it
          const { setSelectedVenue } = useVenueStore.getState();
          setSelectedVenue(venue);
        }
        setIsLoading(false);
      }
    };
    loadVenue();
  }, [id, loadVenueById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!selectedVenue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Venue not found</p>
          <p className="text-muted-foreground">This venue may have been removed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Venue Header */}
      <VenueHeader
        name={selectedVenue.name}
        location={selectedVenue.location}
        rating={selectedVenue.rating}
      />

      {/* Description */}
      {selectedVenue.description && (
        <VenueDescription description={selectedVenue.description} />
      )}

      {/* Operating Hours */}
      <VenueOperatingHours
        openingTime={selectedVenue.operating_hours.opening_time}
        closingTime={selectedVenue.operating_hours.closing_time}
      />

      {/* Amenities */}
      <VenueAmenities amenities={selectedVenue.amenities || []} />

      {/* Courts */}
      <VenueCourtsList courts={selectedVenue.courts || []} />

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
            onClick={() => router.push(`/players/venues/${id}/book`)}
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
