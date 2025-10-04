import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTimeRange } from "@/lib/time";

interface Court {
  id: string;
  name: string;
  icon: string;
}

interface MatchCourtDateTimeProps {
  court: Court;
  sportType: string;
  date: Date;
  timeSlots: string[];
  isRecurring?: boolean;
}

export function MatchCourtDateTime({
  court,
  sportType,
  date,
  timeSlots,
  isRecurring = false
}: MatchCourtDateTimeProps) {
  return (
    <>
      {/* Court, Sport, Date & Time */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              {court.icon && <span className="text-3xl">{court.icon}</span>}
            </div>
            <div>
              <p className="font-bold text-lg">{court.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{sportType}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <CalendarTodayIcon sx={{ fontSize: 28 }} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg">
                {date.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  weekday: 'short'
                })}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <AccessTimeIcon sx={{ fontSize: 28 }} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg tracking-wider">
                {formatTimeRange(timeSlots)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Badge */}
      {isRecurring && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <RepeatIcon sx={{ fontSize: 28 }} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Recurring Match</p>
                <p className="text-sm text-muted-foreground">This match repeats regularly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
