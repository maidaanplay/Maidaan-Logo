'use client';

import { Sun, Sunset, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeRange } from "@/lib/time";

interface TimeSlotsProps {
    timeSlots: {
        Morning: string[];
        Afternoon: string[];
        Evening: string[];
    };
    isBooked: (time: string) => boolean;
    isDisabled: (time: string) => boolean;
    onTimeClick: (time: string) => void;
    selectedTimes?: string[];
}


export default function TimeSlots({ timeSlots, isBooked, isDisabled, onTimeClick, selectedTimes = [] }: TimeSlotsProps) {

    const renderSlotButton = (time: string) => {
        const booked = isBooked(time);
        const disabled = isDisabled(time);
        const selected = selectedTimes.includes(time);

        // Player view should not be able to click on booked slots at all.
        // Admin view can click on booked slots to see match details.
        const isClickable = !disabled || (booked && !selectedTimes.length);

        return (
            <Button
              key={time}
              variant={selected ? "default" : booked ? "secondary" : "outline"}
              onClick={() => isClickable && onTimeClick(time)}
              disabled={disabled}
              className={cn("w-full justify-center tracking-wider text-xs sm:text-sm", {
                "bg-muted/50 text-muted-foreground hover:bg-muted/80": booked && !selected && isClickable,
                "cursor-pointer": booked && !selected && isClickable,
                "border-dashed text-muted-foreground/50": disabled && !booked,
                "cursor-not-allowed": disabled && !booked,
                "bg-muted text-muted-foreground/70 cursor-not-allowed hover:bg-muted": disabled && booked, // Player view for booked slots
              })}
            >
              {formatTimeRange([time])}
            </Button>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" /> Morning
                </h3>
                <div className="flex flex-col gap-2">
                    {timeSlots.Morning.map(renderSlotButton)}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                    <Sunset className="h-5 w-5 text-orange-500" /> Afternoon
                </h3>
                <div className="flex flex-col gap-2">
                    {timeSlots.Afternoon.map(renderSlotButton)}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" /> Evening
                </h3>
                <div className="flex flex-col gap-2">
                    {timeSlots.Evening.map(renderSlotButton)}
                </div>
            </div>
        </div>
    );
}
