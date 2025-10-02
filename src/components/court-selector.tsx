"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Court {
  id: string;
  name: string;
  sport?: string;
}

interface CourtSelectorProps {
  courts: Court[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CourtSelector({ courts, value, onChange, placeholder = "Select Court" }: CourtSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-900">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {courts.map((court) => (
          <SelectItem key={court.id} value={court.id}>
            {court.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
