import { Card, CardContent } from "@/components/ui/card";

interface StatCard {
  label: string;
  value: string | number;
}

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
