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
              variant={selected ? "default" : "outline"}
              onClick={() => isClickable && onTimeClick(time)}
              disabled={disabled}
              className={cn("w-full justify-center tracking-wider text-xs sm:text-sm border-2", {
                // Selected slots (subtle blue background)
                "bg-blue-100 dark:bg-blue-950 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900": selected,
                // Booked slots (green background)
                "bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900": booked && !selected && isClickable,
                "cursor-pointer": booked && !selected && isClickable,
                // Past/disabled slots (red/gray background)
                "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 border-dashed": disabled && !booked && !selected,
                "cursor-not-allowed": disabled && !booked && !selected,
                // Booked + disabled (for player view - red background)
                "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 cursor-not-allowed hover:bg-red-100 dark:hover:bg-red-950": disabled && booked && !selected,
                // Available slots keep default outline styling
              })}
            >
              {formatTimeRange([time])}
            </Button>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-2">
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" /> Morning
                </h3>
                <div className="flex flex-col gap-3">
                    {timeSlots.Morning.map(renderSlotButton)}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                    <Sunset className="h-5 w-5 text-orange-500" /> Afternoon
                </h3>
                <div className="flex flex-col gap-3">
                    {timeSlots.Afternoon.map(renderSlotButton)}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" /> Evening
                </h3>
                <div className="flex flex-col gap-3">
                    {timeSlots.Evening.map(renderSlotButton)}
                </div>
            </div>
        </div>
    );
}
