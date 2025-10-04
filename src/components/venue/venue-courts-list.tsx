import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Court {
  id: string;
  name: string;
  icon: string;
  sport_type: string;
}

interface VenueCourtsListProps {
  courts: Court[];
}

export function VenueCourtsList({ courts }: VenueCourtsListProps) {
  if (!courts || courts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Courts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {courts.map((court) => (
            <div
              key={court.id}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <span className="text-2xl">{court.icon}</span>
              <div>
                <p className="font-medium">{court.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {court.sport_type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
