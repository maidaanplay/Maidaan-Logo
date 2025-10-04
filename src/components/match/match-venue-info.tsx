interface MatchVenueInfoProps {
  venueName: string;
  venueLocation: string;
}

export function MatchVenueInfo({ venueName, venueLocation }: MatchVenueInfoProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">{venueName}</h2>
      <p className="text-muted-foreground mt-1">{venueLocation}</p>
    </div>
  );
}
