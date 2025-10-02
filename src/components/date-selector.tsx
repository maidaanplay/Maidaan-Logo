"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  date: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function DateSelector({ date, onPrevious, onNext }: DateSelectorProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-lg border">
      <Button variant="ghost" size="icon" onClick={onPrevious}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="text-center">
        <div className="text-sm font-medium">{date}</div>
      </div>
      <Button variant="ghost" size="icon" onClick={onNext}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
