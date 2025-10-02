"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Clock, Star, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfileStore } from "@/lib/stores/profile";
import { useVenueStore } from "@/lib/stores/venue";

export default function VenueProfilePage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { selectedVenue, loadAdminVenue } = useVenueStore();
  const [isLoading, setIsLoading] = useState(true);

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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Venue Profile</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Venue Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selectedVenue.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{selectedVenue.location}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{selectedVenue.rating || "0.0"}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Rating
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        {selectedVenue.description && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedVenue.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Operating Hours Card */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">
                {formatTime(selectedVenue.operating_hours.opening_time)} -{" "}
                {formatTime(selectedVenue.operating_hours.closing_time)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Courts Card */}
        <Card>
          <CardHeader>
            <CardTitle>Courts ({selectedVenue.courts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {selectedVenue.courts?.map((court) => (
                <div
                  key={court.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{court.icon}</span>
                    <div>
                      <p className="font-medium">{court.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {court.sport_type}
                      </p>
                    </div>
                  </div>
                  <Badge variant={court.is_active ? "default" : "secondary"}>
                    {court.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amenities Card */}
        {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedVenue.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity.replace("-", " ").toUpperCase()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedVenue.cancellation_cutoff_hours} hours before
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
