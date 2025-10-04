import PersonIcon from '@mui/icons-material/Person';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Player {
  name: string;
}

interface MatchPlayersListProps {
  bookerName: string;
  playersList: Player[];
}

export function MatchPlayersList({ bookerName, playersList }: MatchPlayersListProps) {
  const totalPlayers = (playersList?.length || 0) + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players ({totalPlayers})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Match Owner */}
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
          <div className="bg-primary/20 p-2 rounded-full">
            <PersonIcon sx={{ fontSize: 20 }} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{bookerName}</p>
            <p className="text-xs text-muted-foreground">Match Owner</p>
          </div>
        </div>

        {/* Other Players */}
        {playersList && playersList.length > 0 ? (
          playersList.map((player, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                <PersonIcon sx={{ fontSize: 20 }} />
              </div>
              <p className="font-medium">{player.name || "Player"}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No other players yet</p>
        )}
      </CardContent>
    </Card>
  );
}
