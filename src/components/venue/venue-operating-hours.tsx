import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VenueOperatingHoursProps {
  openingTime: string;
  closingTime: string;
}

export function VenueOperatingHours({ openingTime, closingTime }: VenueOperatingHoursProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operating Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">
            {openingTime} - {closingTime}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
