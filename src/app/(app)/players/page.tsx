"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock } from "lucide-react";
import { Venue } from "@/lib/data";

export default function PlayersPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVenues() {
      try {
        const response = await fetch('/api/venue');
        const result = await response.json();
        setVenues(result.venues || []);
      } catch (error) {
        console.error('Error loading venues:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, []);

  return (
    <div className="space-y-6">

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No venues available yet</p>
            <p className="text-sm text-muted-foreground">Check back later for new venues</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card
              key={venue.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/players/venues/${venue.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{venue.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {venue.location}
                    </CardDescription>
                  </div>
                  {venue.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{venue.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {venue.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {venue.description}
                  </p>
                )}

                {/* Operating Hours */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>
                    {venue.operating_hours.opening_time} - {venue.operating_hours.closing_time}
                  </span>
                </div>

                {/* Sports Available */}
                {venue.courts && venue.courts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.from(new Set(venue.courts.map(c => c.sport_type))).map(sport => (
                      <Badge key={sport} variant="secondary" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Number of Courts */}
                <div className="text-sm text-muted-foreground mb-4">
                  {venue.courts?.length || 0} {venue.courts?.length === 1 ? 'Court' : 'Courts'} Available
                </div>

                {/* Amenities */}
                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {venue.amenities.slice(0, 3).map(amenity => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <Button className="w-full" variant="default">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
