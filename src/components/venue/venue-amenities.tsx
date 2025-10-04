import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VenueAmenitiesProps {
  amenities: string[];
}

export function VenueAmenities({ amenities }: VenueAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <Badge key={amenity} variant="outline">
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
