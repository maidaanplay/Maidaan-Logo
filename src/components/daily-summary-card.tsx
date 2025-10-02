"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailySummaryCardProps {
  date: string;
  bookingCount: number;
  revenue: number;
  onClick?: () => void;
  className?: string;
}

export default function DailySummaryCard({
  date,
  bookingCount,
  revenue,
  onClick,
  className,
}: DailySummaryCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2">{date}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Bookings:</span>
                  <span className="font-bold text-foreground">{bookingCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
