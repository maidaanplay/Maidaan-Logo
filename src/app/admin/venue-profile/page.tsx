"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit } from "lucide-react";
import ShareIcon from '@mui/icons-material/Share';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";
import { VenueHeader } from "@/components/venue/venue-header";
import { VenueDescription } from "@/components/venue/venue-description";
import { VenueOperatingHours } from "@/components/venue/venue-operating-hours";
import { VenueAmenities } from "@/components/venue/venue-amenities";
import { VenueCourtsList } from "@/components/venue/venue-courts-list";
import { VenueShareSheet } from "@/components/venue/venue-share-sheet";
import AppFooter from "@/components/layout/app-footer";

export default function VenueProfilePage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { selectedVenue, loadAdminVenue } = useVenueStore();
  const [isLoading, setIsLoading] = useState(true);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' && selectedVenue
    ? `${window.location.origin}/venue/${selectedVenue.id}`
    : '';

  useEffect(() => {
    if (profile && profile.profile_type === "admin") {
      loadAdminVenue(profile.id).finally(() => setIsLoading(false));
    }
  }, [profile, loadAdminVenue]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-6">
          <div className="relative w-48 h-20 mx-auto">
            <Image
              src="/maidaan_black.png"
              alt="Maidaan Logo"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/maidaan_white.png"
              alt="Maidaan Logo"
              fill
              className="object-contain hidden dark:block"
            />
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading venue profile...
          </div>
        </div>
      </div>
    );
  }

  if (!selectedVenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Venue Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You haven&apos;t set up a venue yet.
          </p>
          <Button onClick={() => router.push("/admin")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 pb-32">
      {/* Venue Header */}
      <VenueHeader
        name={selectedVenue.name}
        location={selectedVenue.location}
        rating={selectedVenue.rating}
      />

      {/* Description */}
      <VenueDescription description={selectedVenue.description} />

      {/* Operating Hours */}
      <VenueOperatingHours
        openingTime={selectedVenue.operating_hours.opening_time}
        closingTime={selectedVenue.operating_hours.closing_time}
      />

      {/* Courts */}
      <VenueCourtsList courts={selectedVenue.courts || []} />

      {/* Amenities */}
      <VenueAmenities amenities={selectedVenue.amenities || []} />

      {/* Pricing Rules Card */}
      {selectedVenue.pricing_rules && selectedVenue.pricing_rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedVenue.pricing_rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {rule.time_period} • {rule.day_type}
                    </p>
                  </div>
                  <p className="text-lg font-bold">₹{rule.price_per_hour}/hr</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancellation Cutoff</span>
              <span className="text-sm text-muted-foreground">
                {selectedVenue.cancellation_cutoff_hours} hours before
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Sheet */}
      <VenueShareSheet
        isOpen={shareSheetOpen}
        onOpenChange={setShareSheetOpen}
        shareUrl={shareUrl}
      />

      {/* Fixed Footer with Edit Button */}
      <AppFooter>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/admin/venue-profile/edit")}
            size="lg"
            className="flex-1 h-12"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Venue
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
