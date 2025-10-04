import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VenueDescriptionProps {
  description: string;
}

export function VenueDescription({ description }: VenueDescriptionProps) {
  if (!description) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
