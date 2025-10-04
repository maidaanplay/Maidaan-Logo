import { MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VenueHeaderProps {
  name: string;
  location: string;
  rating?: number;
}

export function VenueHeader({ name, location, rating }: VenueHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
